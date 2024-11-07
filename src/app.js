require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express'); 
const YAML = require('yamljs');
const path = require('path'); 
const authRoutes = require("../src/routes/authRoutes");
const userRoutes = require("../src/routes/userRoutes");
const gameRoutes = require("../src/routes/gameRoutes");
const chatRoutes = require("../src/routes/chatRoutes");
const teamRoutes = require("../src/routes/teamRoutes");
const swaggerDocument = YAML.load(path.join(__dirname, '../src/utils/swagger.yaml'));

const app = express();

// Middleware
app.use(express.static("public"));
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);  
app.use("/api/games", gameRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/teams", teamRoutes);

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Main Route
app.get("/", (req, res) => {
  res.send("Alias Game API");
});

// Middleware error-handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
