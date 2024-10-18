const app = require('./app.js');
const db = require('./models');
const orm = require('./models');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3000;

db.sequelize
.authenticate()
.then(() => {
  console.log('Connection has been established successfully.');
  app.listen(PORT, (err) => {
    if (err) {
      return console.error('Error starting the server: ', err);
    }
    // console.log(f`Server is running on as ${API_URL}`);
    return app;
    });
})
.catch((err) => {
  console.error('Unable to connect to the database:', err);
});