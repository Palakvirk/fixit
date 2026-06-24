const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Register a new mechanic
router.post('/', async (req, res) => {
  const { name, phone, vehicle_number, specializations } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO mechanics (name, phone, vehicle_number)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, phone, vehicle_number]
    );
    const mechanic = result.rows[0];

    // Insert each specialization as its own row
    if (specializations && specializations.length > 0) {
      for (const type of specializations) {
        await pool.query(
          `INSERT INTO mechanic_specializations (mechanic_id, problem_type)
           VALUES ($1, $2)`,
          [mechanic.id, type]
        );
      }
    }

    res.status(201).json(mechanic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// List all mechanics (just for us to sanity-check data while building)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mechanics');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a mechanic's live location
router.patch('/:id/location', async (req, res) => {
  const { lat, lng } = req.body;
  try {
    const result = await pool.query(
      `UPDATE mechanics SET current_lat = $1, current_lng = $2 WHERE id = $3 RETURNING *`,
      [lat, lng, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle availability on/off
router.patch('/:id/availability', async (req, res) => {
  const { available } = req.body;
  try {
    const result = await pool.query(
      `UPDATE mechanics SET available = $1 WHERE id = $2 RETURNING *`,
      [available, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a mechanic's ID as verified. In production this sits behind an
// actual review step (document upload + manual or third-party check) —
// this is just the on/off switch the matching query checks.
router.patch('/:id/verify', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE mechanics SET id_verified = true WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
