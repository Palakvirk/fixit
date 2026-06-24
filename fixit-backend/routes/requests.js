const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

const RADIUS_KM = 15;
const CANDIDATE_LIMIT = 5;

// Create a service request, return ranked nearby mechanic candidates
router.post('/', async (req, res) => {
  const { driver_id, problem_type, lat, lng } = req.body;

  try {
    // 1. Save the request itself
    const requestResult = await pool.query(
      `INSERT INTO service_requests (driver_id, problem_type, lat, lng)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [driver_id, problem_type, lat, lng]
    );
    const request = requestResult.rows[0];

    // 2. Find nearby, available, specialization-matching mechanics
    const candidatesResult = await pool.query(
      `SELECT m.id, m.name, m.rating_avg, m.id_verified, sub.distance_km
       FROM (
         SELECT id,
           (6371 * acos(
              cos(radians($1)) * cos(radians(current_lat)) *
              cos(radians(current_lng) - radians($2)) +
              sin(radians($1)) * sin(radians(current_lat))
           )) AS distance_km
         FROM mechanics
         WHERE available = true
           AND current_lat IS NOT NULL
           AND current_lng IS NOT NULL
       ) sub
       JOIN mechanics m ON m.id = sub.id
       WHERE sub.distance_km <= $3
         AND EXISTS (
           SELECT 1 FROM mechanic_specializations ms
           WHERE ms.mechanic_id = m.id
             AND (ms.problem_type = $4 OR ms.problem_type = 'OTHER')
         )
       ORDER BY sub.distance_km ASC
       LIMIT $5`,
      [lat, lng, RADIUS_KM, problem_type, CANDIDATE_LIMIT]
    );

    res.status(201).json({
      request,
      candidates: candidatesResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM service_requests WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
