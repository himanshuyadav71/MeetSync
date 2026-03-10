const { Server } = require("socket.io");

let io;

function initSignaling(server) {
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust in production
            methods: ["GET", "POST"]
        }
    });

    const activeRooms = {}; // Track participants in rooms

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join-room', (roomId, userId, username) => {
            socket.join(roomId);
            
            if (!activeRooms[roomId]) {
                activeRooms[roomId] = [];
            }
            
            const user = { socketId: socket.id, userId, username };
            activeRooms[roomId].push(user);

            // Notify others in the room
            socket.to(roomId).emit('user-connected', userId, username, socket.id);

            // PeerJS handles WebRTC underlying signaling automatically.
            // Leaving custom features only below:

            // Features: Chat
            socket.on('chat-message', (message) => {
                io.to(roomId).emit('chat-message', { ...message, senderId: userId, senderName: username });
            });

            // Features: Host Controls
            socket.on('mute-participant', (targetSocketId) => {
                io.to(targetSocketId).emit('muted-by-host');
            });

            socket.on('remove-participant', (targetSocketId) => {
                io.to(targetSocketId).emit('removed-by-host');
                // Could forcibly disconnect their socket
            });

            // Handle Disconnect
            socket.on('disconnect', () => {
                activeRooms[roomId] = activeRooms[roomId]?.filter(u => u.socketId !== socket.id);
                socket.to(roomId).emit('user-disconnected', userId, socket.id);
                if (activeRooms[roomId]?.length === 0) {
                    delete activeRooms[roomId];
                }
            });
        });
    });
}

module.exports = { initSignaling };
