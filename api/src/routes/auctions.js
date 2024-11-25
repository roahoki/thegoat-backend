// PENDIENTE CHECKEAR EN TODAS ESTAS RUTAS SI ES ADMIN O NO

const Router = require("koa-router");
const { AuctionOffer, AdminRequest } = require("../models");
const { v4: uuidv4 } = require('uuid');
const mqtt = require('mqtt');
const router = new Router();
const { Op } = require("sequelize");

const dotenv = require('dotenv');
// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Configuración de conexión MQTT
const mqttClient = mqtt.connect({
  host: process.env.BROKER_HOST,
  port: process.env.BROKER_PORT,
  username: process.env.BROKER_USER,
  password: process.env.BROKER_PASSWORD
});

mqttClient.on("error", (err) => {
    console.log(err);
    mqttClient.end();
});


// Guardar todas las ofertas de subasta, de todos los grupos
router.post("/offers", async (ctx) => {
    const {
        auction_id,
        proposal_id,
        fixture_id,
        league_name,
        round,
        result,
        quantity,
        group_id,
        type,
    } = ctx.request.body;

    try {
        if (type !== "offer") {
            ctx.status = 400;
            ctx.body = { error: "Invalid type for offer" };
            return;
        }

        if (group_id == "15") {
            ctx.status = 200;
            console.log("Our offer coming back")
            return;
        }

        const newOffer = await AuctionOffer.create({
            auction_id,
            proposal_id,
            fixture_id,
            league_name,
            round,
            result,
            quantity,
            group_id,
            type
        });

        ctx.status = 201;
        ctx.body = { message: "Offer saved successfully", offer: newOffer };
    } catch (error) {
        console.error("Error saving auction offer:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to save auction offer" };
    }
});

// Obtener ofertas de subasta
router.get("/offers", async (ctx) => {
    try {
        const offers = await AuctionOffer.findAll({
            where: {
                type: "offer",
            },
        });
        ctx.status = 200;
        ctx.body = { offers };
    } catch (error) {
        console.error("Error fetching auction offers:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to fetch auction offers" };
    }
});


// Poner un bono en subasta
router.post("/:bondId", async (ctx) => {
    const { bondId } = ctx.params;

    try {
        const bond = await AdminRequest.findByPk(bondId);

        if (!bond) {
            ctx.status = 404;
            ctx.body = { error: "Bond not found" };
            return;
        }

        if (bond.status === "available") {
            ctx.status = 400;
            ctx.body = { error: "Bond is available for users, remove it before auctioning it" };
            return;
        }

        if (bond.status === "on auction") {
            ctx.status = 200;
            console.log("Our offer coming back")
            return;
        }

        // Update the bond status to "on auction"
        bond.status = "on auction";
        await bond.save();

        // Generate auction data
        const auctionId = uuidv4();
        const auctionMessage = {
            auction_id: auctionId,
            fixture_id: bond.fixture_id,
            league_name: bond.league_name,
            round: bond.round,
            result: bond.result,
            quantity: bond.quantity,
            group_id: 15, 
            type: "offer"
        };

        // Save to AuctionOffer table
        await AuctionOffer.create(auctionMessage);

        // Publish to MQTT
        mqttClient.publish("fixtures/auctions", JSON.stringify(auctionMessage));

        ctx.status = 200;
        ctx.body = { message: "Bond put on auction successfully", auction: auctionMessage };
    } catch (error) {
        console.error("Error putting bond on auction:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to put bond on auction" };
    }
});


router.post('/:auctionId/offer', async (ctx) => {
    const { auctionId } = ctx.params;
    const { bondId, request_id, fixture_id, league_name, round, result, quantity } = ctx.request.body;

    try {
        // Verificar que el bono ofrecido exista y tenga cantidad suficiente
        const bond = await AdminRequest.findByPk(bondId);
        if (!bond || bond.quantity < quantity) {
            ctx.status = 400;
            ctx.body = { error: 'Invalid bond or insufficient quantity.' };
            return;
        }

        // Verificar que la subasta exista
        const auction = await AuctionOffer.findOne({ where: { auction_id: auctionId } });
        if (!auction) {
            ctx.status = 404;
            ctx.body = { error: 'Auction not found.' };
            return;
        }

        const proposalId = uuidv4();

        // Crear el mensaje de oferta
        const offerMessage = {
            auction_id: auctionId,
            proposal_id: proposalId,
            fixture_id: fixture_id, // Datos del bono ofrecido
            league_name: league_name,
            round: round,
            result: result,
            quantity: quantity,
            group_id: 15, // ID del grupo que hace la oferta
            type: 'proposal',
            request_id: request_id
        };

        // Guardar la propuesta en la base de datos
        await AuctionOffer.create({
            auction_id: auctionId,
            proposal_id: proposalId,
            fixture_id: fixture_id,
            league_name: league_name,
            round: round,
            result: result,
            quantity: quantity,
            group_id: 15, // ID del grupo que hace la oferta
            type: 'proposal',
            request_id: request_id
        });

        // Publicar la oferta en el canal MQTT
        mqttClient.publish('fixtures/auctions', JSON.stringify(offerMessage));

        ctx.status = 200;
        ctx.body = { message: 'Offer made successfully', offer: offerMessage };

    } catch (error) {
        console.error('Error making an offer:', error);
        ctx.status = 500;
        ctx.body = { error: 'Failed to make an offer.' };
    }
});


// Obtener propuestas que el admin ha hecho, junto con su estado
router.get("/my-offers", async (ctx) => {
    const { userId } = ctx.query;

    try {
        const userOffers = await AuctionOffer.findAll({
            where: {
                group_id: 15,
                type: {
                    [Op.or]: ["proposal", "accepted", "rejected"],
                },
            },
        });
        ctx.status = 200;
        ctx.body = { offers: userOffers };
    } catch (error) {
        console.error("Error fetching user offers:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to fetch user offers." };
    }
});

// Endpoint para guardar propuestas de los otros grupos a mis subastas
router.post("/proposals", async (ctx) => {
    try {
        const proposalData = ctx.request.body;

        // Buscar la subasta correspondiente al auction_id
        const auction = await AuctionOffer.findOne({
            where: {
                auction_id: proposalData.auction_id,
                group_id: 15, 
                type: "offer", 
            },
        });

        // Si no se encuentra la subasta o no pertenece a mi grupo, ignorar la propuesta
        if (!auction) {
            ctx.status = 400; // Bad Request
            ctx.body = { error: "This auction does not belong to your group." };
            return;
        }

        // Crear la propuesta si la subasta pertenece a mi grupo
        await AuctionOffer.create({
            auction_id: proposalData.auction_id,
            proposal_id: proposalData.proposal_id,
            fixture_id: proposalData.fixture_id,
            league_name: proposalData.league_name,
            round: proposalData.round,
            result: proposalData.result,
            quantity: proposalData.quantity,
            group_id: proposalData.group_id,
            type: "proposal",
        });

        ctx.status = 201;
        ctx.body = { message: "Proposal saved successfully." };
    } catch (error) {
        console.error("Error saving proposal:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to save proposal." };
    }
});


// Endpoint para manejar respuestas a propuestas que yo hice (me aceptan o rechazan mediante el listener)
router.patch("/proposals/responce", async (ctx) => {
    const transaction = await sequelize.transaction();

    try {
        const { auction_id, proposal_id, type } = ctx.request.body;

        // propuesta que yo hice
        const proposal = await AuctionOffer.findOne({
            where: { auction_id, proposal_id, type: "proposal" },
        });

        if (!proposal) {
            ctx.status = 404;
            ctx.body = { error: "Proposal not found." };
            return;
        }

        if (type === "acceptance") {
            // Buscar la oferta inicial correspondiente a la que yo propuse el intercambio
            const auction = await AuctionOffer.findOne({
                where: { auction_id, type: "offer" },
            });

            if (!auction) {
                ctx.status = 404;
                ctx.body = { error: "Auction not found." };
                return;
            }

            // Eliminar la oferta inicial y el bono que yo ofreci
            await auction.destroy({ transaction });

            // Eliminar el bono ofrecido por el usuario actual
            const offeredBond = await AdminRequest.findByPk(proposal.request_id);

            if (!offeredBond) {
                ctx.status = 404;
                ctx.body = { error: "Offered bond not found." };
                return;
            }

            await offeredBond.destroy({ transaction });

            // Transferir los bonos ofrecidos en la subasta al usuario
            await AdminRequest.create({
                fixture_id: auction.fixture_id,
                league_name: auction.league_name,
                round: auction.round,
                date: auction.date,
                result: auction.result,
                quantity: proposal.quantity,
                seller: "15",
                status: "accepted",
                wallet: true,
            }, { transaction });
        }

        // Actualizar el tipo de la propuesta (accepted o rejected)
        proposal.type = type === "acceptance" ? "accepted" : "rejected";
        await proposal.save({ transaction });

        // Confirmar la transacción
        await transaction.commit();

        ctx.status = 200;
        ctx.body = { message: `Proposal ${type} successfully.` };
    } catch (error) {
        console.error("Error handling proposal response:", error);

        // Revertir cambios si ocurre un error
        await transaction.rollback();

        ctx.status = 500;
        ctx.body = { error: "Failed to handle proposal response." };
    }
});


// Get las propuestas que han hecho a mis auctions
router.get("/proposals", async (ctx) => {
    try {
        // Obtener todas las ofertas del administrador
        const adminOffers = await AuctionOffer.findAll({
            where: {
                group_id: 15, // Grupo del administrador
                type: "offer",
            },
        });

        // Extraer los IDs de subasta (auction_id) de las ofertas del administrador
        const adminAuctionIds = adminOffers.map((offer) => offer.auction_id);

        // Buscar todas las propuestas relacionadas con esas subastas
        const proposals = await AuctionOffer.findAll({
            where: {
                auction_id: adminAuctionIds,
                type: "proposal",
            },
        });

        ctx.status = 200;
        ctx.body = { proposals };
    } catch (error) {
        console.error("Error fetching proposals:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to fetch proposals." };
    }
});

router.patch("/proposals/respond", async (ctx) => {
    try {
        const { proposal_id, type } = ctx.request.body;
        console.log(proposal_id, type);

        const proposal = await AuctionOffer.findOne({
            where: { proposal_id, type: "proposal" },
        });

        if (!proposal) {
            ctx.status = 404;
            ctx.body = { error: "Proposal not found." };
            return;
        }

        // Actualizar tipo de la propuesta
        proposal.type = type === "acceptance" ? "accepted" : "rejected";
        await proposal.save();

        // Configuración del mensaje para el canal MQTT
        const responseMessage = {
            auction_id: proposal.auction_id,
            proposal_id: proposal.proposal_id,
            fixture_id: proposal.fixture_id,
            league_name: proposal.league_name,
            round: proposal.round,
            result: proposal.result,
            quantity: proposal.quantity,
            group_id: 15, 
            type: type, 
        };

        if (type === "acceptance") {
            // Manejar intercambio de bonos
            const offeredBond = await AdminRequest.findByPk(proposal.request_id); // Bono ofrecido
            const auctionBond = await AuctionOffer.findOne({
                where: {
                    auction_id: proposal.auction_id,
                    type: "offer",
                },
            });

            if (!offeredBond || !auctionBond) {
                ctx.status = 400;
                ctx.body = { error: "Bond details not found." };
                return;
            }

            await auctionBond.destroy();

            await offeredBond.destroy();

            // Crear registro de nuevos bonos del admin
            await AdminRequest.create({
                fixture_id: offeredBond.fixture_id,
                league_name: offeredBond.league_name,
                round: offeredBond.round,
                date: offeredBond.date,
                result: offeredBond.result,
                quantity: proposal.quantity,
                status: "accepted",
                wallet: offeredBond.wallet,
                group_id: 15,
                datetime: offeredBond.datetime
            });
        }

        // Enviar mensaje al canal MQTT
        mqttClient.publish("fixtures/auctions", JSON.stringify(responseMessage));

        ctx.status = 200;
        ctx.body = { message: `Proposal ${type} successfully.` };
    } catch (error) {
        console.error("Error handling proposal response:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to handle proposal response." };
    }
});


module.exports = router;
