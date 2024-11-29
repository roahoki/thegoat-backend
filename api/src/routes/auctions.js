const Router = require("koa-router");
const { AuctionOffer, AdminRequest, Fixture } = require("../models");
const { v4: uuidv4 } = require('uuid');
const mqtt = require('mqtt');
const checkAdmin = require('../config/checkAdmin');
const router = new Router();
const { Op } = require("sequelize");
const { sequelize } = require('../models');
const { User } = require("../models");
const dotenv = require('dotenv');
// Cargar variables de entorno desde el archivo .env
dotenv.config();


const getUserById = async (userId) => {
    return await User.findOne({
        where: { id: userId },
        attributes: ["id", "isAdmin"], // Selecciona solo las columnas necesarias
    });
};

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


// Guardar todas las ofertas de subasta, de todos los grupos, lo llama solo el listener, no protegido
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
    const { userId } = ctx.request.query;

    try {
        // Verificar si el usuario es administrador
        const user = await getUserById(userId);
        if (!user || !user.isAdmin) {
            ctx.status = 403;
            ctx.body = { error: "Access denied. Admins only." };
            return;
        }

        // Buscar las ofertas de subasta
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

// Endpoint para guardar propuestas de los otros grupos a mis subastas, lo llama el listener
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

// Poner un bono en subasta
router.post("/:bondId", async (ctx) => {
    const { bondId } = ctx.params;
    const { userId } = ctx.request.body; // Suponiendo que el frontend envía el userId en el body

    try {
        // Verificar si el usuario es administrador
        const user = await getUserById(userId);
        if (!user || !user.isAdmin) {
            ctx.status = 403;
            ctx.body = { error: "Access denied. Admins only." };
            return;
        }

        // Obtener el bond
        const bond = await AdminRequest.findByPk(bondId);
        if (!bond) {
            ctx.status = 404;
            ctx.body = { error: "Bond not found" };
            return;
        }

        // Verificar el estado del bond
        if (bond.status === "available") {
            ctx.status = 400;
            ctx.body = { error: "Bond is available for users, remove it before auctioning it" };
            return;
        }

        if (bond.status === "on auction") {
            ctx.status = 200;
            ctx.body = { message: "Bond is already on auction" };
            console.log("Our offer coming back");
            return;
        }

        // Actualizar el estado del bond
        bond.status = "on auction";
        await bond.save();

        // Generar datos de la subasta
        const auctionId = uuidv4();
        const auctionMessage = {
            auction_id: auctionId,
            proposal_id: "",
            fixture_id: bond.fixture_id,
            league_name: bond.league_name,
            round: bond.round,
            result: bond.result,
            quantity: bond.quantity,
            group_id: 15,
            type: "offer",
        };

        // Guardar en la tabla AuctionOffer
        await AuctionOffer.create(auctionMessage);

        // Publicar en el canal MQTT
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
    const { userId, bondId, request_id, fixture_id, league_name, round, result, quantity } = ctx.request.body;

    try {
        // Verificar si el usuario es administrador
        const user = await getUserById(userId);
        if (!user || !user.isAdmin) {
            ctx.status = 403;
            ctx.body = { error: 'Access denied. Admins only.' };
            return;
        }

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
            fixture_id: fixture_id,
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
            group_id: 15,
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
        // Validar si el userId está presente
        if (!userId) {
            ctx.status = 400;
            ctx.body = { error: "userId query parameter is required." };
            return;
        }

        // Verificar si el usuario existe y es administrador
        const user = await getUserById(userId);
        if (!user || !user.isAdmin) {
            ctx.status = 403;
            ctx.body = { error: "Access denied. Admins only." };
            return;
        }

        // Obtener las ofertas del usuario
        const userOffers = await AuctionOffer.findAll({
            where: {
                group_id: 15, // Cambia a userId si es necesario
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

            const fixture = await Fixture.findOne({
                where: { id: auction.fixture_id },
                attributes: ['date', 'datetime'], 
                transaction
            });
            
            if (!fixture) {
                console.log(`Fixture con id ${auction.fixture_id} no encontrado.`);
            }

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
                group_id: "15",
                date: fixture.date,
                datetime: fixture.datetime,
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
    const { userId } = ctx.query;

    try {
        // Validar si el userId está presente
        if (!userId) {
            ctx.status = 400;
            ctx.body = { error: "userId query parameter is required." };
            return;
        }

        // Verificar si el usuario existe y es administrador
        const user = await getUserById(userId);
        if (!user || !user.isAdmin) {
            ctx.status = 403;
            ctx.body = { error: "Access denied. Admins only." };
            return;
        }

        // Obtener todas las ofertas del administrador
        const adminOffers = await AuctionOffer.findAll({
            where: {
                group_id: 15, // Cambia esto a `userId` si cada administrador tiene un grupo único
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

// Endpoint que llama el front para responder a propuestas de otros grupos
router.patch("/proposals/respond", async (ctx) => {
    try {
        const { userId } = ctx.query; // Obtener el userId desde los query params
        const { proposal_id, type } = ctx.request.body;

        console.log("Proposal ID:", proposal_id, "Type:", type, "User ID:", userId);

        // Validar si el userId está presente
        if (!userId) {
            ctx.status = 400;
            ctx.body = { error: "userId query parameter is required." };
            return;
        }

        // Verificar si el usuario existe y es administrador
        const user = await getUserById(userId);
        if (!user || !user.isAdmin) {
            ctx.status = 403;
            ctx.body = { error: "Access denied. Admins only." };
            return;
        }

        // Buscar la propuesta
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

        // Enviar mensaje al canal MQTT
        mqttClient.publish("fixtures/auctions", JSON.stringify(responseMessage));
        console.log("message published:", responseMessage);

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
                datetime: offeredBond.datetime,
            });

            await offeredBond.destroy();
        }

        ctx.status = 200;
        ctx.body = { message: `Proposal ${type} successfully.` };
    } catch (error) {
        console.error("Error handling proposal response:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to handle proposal response." };
    }
});



module.exports = router;
