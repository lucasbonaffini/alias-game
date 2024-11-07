const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    currentGame: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    role: { type: String, enum: ['player', 'admin'], default: 'player' }
});

module.exports = mongoose.model('User', userSchema);
