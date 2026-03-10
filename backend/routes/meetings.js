const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// @route   POST api/meetings
// @desc    Create a new meeting room
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const roomId = uuidv4();
        const meeting = new Meeting({
            roomId,
            hostId: req.user.id
        });
        await meeting.save();
        res.status(201).json({ roomId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/meetings/:roomId
// @desc    Validate a meeting room
// @access  Private
router.get('/:roomId', auth, async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ roomId: req.params.roomId });
        if (!meeting || !meeting.isActive) {
            return res.status(404).json({ msg: 'Meeting not found or inactive' });
        }
        res.json(meeting);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
