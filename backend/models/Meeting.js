const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);
