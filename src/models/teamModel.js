const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true, 
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true, 
    }],
    score: {
        type: Number,
        default: 0, 
    },
}, {
    timestamps: true, 
});


module.exports = mongoose.model('Team', teamSchema);