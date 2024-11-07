require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const { socketSetup, getIO } = require("../src/sockets/socket");
//const seedDatabase = require("../src/utils/seed"); 

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const app = require("../src/app");


// Connect MongoDB
const startServer = async () => {
  try {
  
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Call the seed function to populate the database with initial data
    //await seedDatabase();

    // Create server
    const server = http.createServer(app);

    // Setup socket.io
    socketSetup(server);

    // Start the server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB or starting the server:", err);
  }
};

//call the startServer function
startServer();
  
module.exports = { getIO };
