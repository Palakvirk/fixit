const { io } = require('socket.io-client');

const driver = io('http://localhost:3000');
const mechanic = io('http://localhost:3000');

driver.on('connect', () => {
  console.log('Driver connected, joining request-1 room');
  driver.emit('join-request', 1);
});

driver.on('location-update', (data) => {
  console.log('Driver received live location:', data);
});

mechanic.on('connect', () => {
  console.log('Mechanic connected, sending location in 1s...');
  setTimeout(() => {
    mechanic.emit('location-update', { requestId: 1, lat: 28.616, lng: 77.216 });
  }, 1000);
});
