const express = require('express');
const pool = require('./db/pool');
const mechanicsRouter = require('./routes/mechanics');

const app = express();
app.use(express.json());

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

const requestsRouter = require('./routes/requests');
app.use('/requests', requestsRouter);

app.get('/', (req, res) => {
  res.send('Fixit backend is alive');
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ dbTime: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.use('/mechanics', mechanicsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Fixit backend running on http://localhost:${PORT}`);
});