module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // The driver's app calls this once, right after a mechanic accepts,
    // to start listening for that specific job's location updates only.
    socket.on('join-request', (requestId) => {
      socket.join(`request-${requestId}`);
      console.log(`${socket.id} joined request-${requestId}`);
    });

    // The mechanic's app calls this every few seconds while EN_ROUTE.
    socket.on('location-update', ({ requestId, lat, lng }) => {
      // Broadcast only to whoever joined this specific request's room —
      // not to every connected client. This is the part that keeps it
      // from being a "shout to everyone" broadcast as more jobs run at once.
      io.to(`request-${requestId}`).emit('location-update', { lat, lng });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
