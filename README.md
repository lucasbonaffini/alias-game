# Node.js-Based Game "Alias" with Chat and Word Checking

## Content

1. [Overview](#overview)
2. [Game Description](#game-description)
3. [System Requirements](#System-Requirements)
4. [Core Modules](#Core-Modules)
5. [Setup and Installation](#Setup-and-Installation)
6. [Base URL](#base-url)
7. [API Documentation](#API-Documentation)
8. [Database Schema](#Database-Schema)
9. [Security](#Security)
10. [Testing](#Testing)
11. [Deployment](#Deployment)
12. [Future Enhancements](#Future-Enhancements)

---

## Overview

This document outlines the Alias game, a multiplayer game built with Node.js. It includes chat functionality and a feature to check for similar words.

## Game Description

Alias is a word-guessing game where players form teams. Each team takes turns where one member describes a word and others guess it. The game includes a chat for players to communicate and a system to check for similar words.

### Objective

Teams try to guess as many words as possible from their teammates' descriptions.

### Turns

Each turn is timed. Describers cannot use the word or its derivatives.

### Scoring

Points are awarded for each correct guess. Similar words are checked for validation.

### End Game

The game concludes after a predetermined number of rounds, with the highest-scoring team winning.

## System Requirements

- **Backend**: Node.js
- **Web application framework**: Express.js
- **Database**: MongoDB
- **Testing**: Jest
- **Docker**

## Core Modules

1. **User Authentication**
   - Login and registration
   - Session management
2. **Game Lobby**
   - Room creation and joining
   - Team selection
3. **Game Mechanics**
   - Word generation
   - Turn management
4. **Chat System**
   - Real-time messaging
   - Chat history
5. **Word Checking**
   - Similarity algorithm
   - Word validation

## Setup and Installation

   ### Prerequisites
   - **Node.js v18.18.0**: [Download Node.js](https://nodejs.org/en/download/)
   - **Docker**: Make sure Docker is installed. [Get Docker](https://docs.docker.com/get-docker/)
   - **Git**: optional, for cloning the repository

   ### Installation Steps

   1. **Clone the Repository**:
      ```bash
      git clone https://github.com/Megas-MDN/alias-game.git
      cd alias-game
      ```

   2. **Create .env File**:
      You need to create a  `.env` file at the root of the project directory. This file should contain the necessary environment variables for connecting to the database and JWT configuration.
      Copy the `.env.example` file to create a `.env` file. Update the values in the .env file as needed

   3. **Install dependencies**:
      ```sh
      npm install
      ```

   4. **Build Docker images and start containers:**
      ```sh
      docker-compose up --build
      ```

   ### Server Setup
   The backend uses Node.js and Express, with the following key components:

   - Mongoose: For connecting to MongoDB and managing database schemas.
   - Socket.io: For real-time communication between clients and the server.

   ### Database Setup
   MongoDB is used as the database, and its connection is established with Mongoose.
   Default database connection strings (modifiable in `.env`):
   - For development: mongodb://mongo:27017/aliasgame
   - For testing: mongodb://localhost:27017/aliasgame

   ### Seeding Initial Data
The database is seeded automatically when the server starts, using the `seedDatabase` function in `index.js`.

## Base URL
`http://localhost:3001`


## API Documentation

The API endpoints are documented in **Swagger**. 
You can view the full documentation by running the project locally at: 
- `GET /api-docs`: Access the Swagger UI with detailed API documentation.

## Database Schema
See all the details of the database schema in the Swagger documentation.

- **User Model**: Stores user details, authentication tokens, and team association.
- **Game Model**: Represents an Alias game with players, teams, rounds, current turn details, and scores.
- **Team Model**: Holds team-specific information, including players and scores.
- **Chat Model**: Used to store chat messages sent by players during the game.

## Security

- **JWT Authentication**: The application uses JSON Web Tokens (JWT) for secure authentication and session management.
- **Password Encryption**: All user passwords are securely encrypted before being stored in the database.
- **User Roles**: 
  - Users can have one of two roles: **player** or **admin**.
  - Admins have access to additional features and management functions that are not available to regular players.


## Testing

This project uses **Jest** as the testing framework.
To execute the tests, run the following command:
   ```sh
   npm run test
   ```

The tests are organized into the following directories:

- tests/unit: Contains unit tests that focus on individual functions and components. Each test verifies the behavior of a specific unit of code in isolation.
- tests/integration: Contains integration tests that check how different modules and components interact with each other. These tests ensure that the system works as expected when different parts are combined.


## Deployment

To run the application in a Docker container, ensure Docker is installed on your system. Execute the following commands:

1. **Build the Docker images and start the containers:**
    ```sh
    docker-compose up --build
    ```

2. **Access the API:**
    - The API will be available at `http://localhost:3001`.

## Future Enhancements

1. **Custom Game Settings**:
   - Enable users to create games with customizable rules, such as time limits, number of rounds, or categories of words.

2. **Admin Panel**:
   - Develop an admin panel for managing users, monitoring games, and resolving disputes.

3. **Analytics Dashboard**:
   - Implement an analytics dashboard for players to track their performance over time, including win rates and average scores.
