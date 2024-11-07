const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team', 
        required: true, 
    }],
    rounds: {
        type: Number,
        required: true, 
    },
    currentRound: {
        type: Number,
        default: 1, 
    },
    status: {
        type: String,
        enum: ['waiting', 'in progress', 'finished'], 
        default: 'waiting', 
    },
    currentTurnTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team', 
        required: true, 
    },
    currentDescriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true, 
    },
    describerIndices: { 
        team1: { type: Number, default: 0 }, 
        team2: { type: Number, default: 0 }  
    },
    currentWord: {
        type: String,
        required: true, 
    }, 
}, {
    timestamps: true, 
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
