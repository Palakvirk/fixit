const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./db/pool');

const mechanicsRouter = require('./routes/mechanics');
const usersRouter = require('./routes/users');
const requestsRouter = require('./routes/requests');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

require('./sockets/tracking')(io);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Fixit backend is alive');
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ dbTime: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/mechanics', mechanicsRouter);
app.use('/users', usersRouter);
app.use('/requests', requestsRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Fixit backend running on http://localhost:${PORT}`);
});
