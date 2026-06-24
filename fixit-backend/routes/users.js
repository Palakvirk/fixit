const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Register a new driver
router.post('/', async (req, res) => {
  const { name, phone, email, password_hash, emergency_contact_phone } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (name, phone, email, password_hash, emergency_contact_phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, phone, email, password_hash, emergency_contact_phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, phone, email, created_at FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
