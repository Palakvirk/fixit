const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Triggered when a driver taps the panic button during an active job.
// For now this just confirms the emergency contact is on file and logs
// the event — wiring this to an actual SMS send is a Phase 8 task.
router.post('/', async (req, res) => {
  const { driver_id, request_id } = req.body;
  try {
    const result = await pool.query(
      'SELECT emergency_contact_phone FROM users WHERE id = $1',
      [driver_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    const contact = result.rows[0].emergency_contact_phone;

    console.log(`PANIC ALERT: driver ${driver_id}, request ${request_id}, notifying ${contact || 'NO CONTACT ON FILE'}`);

    res.json({
      alerted: !!contact,
      message: contact
        ? 'Emergency contact would be notified here (SMS integration pending).'
        : 'No emergency contact on file for this driver.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
