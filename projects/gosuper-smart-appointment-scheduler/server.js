const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database (Use writable /tmp on Vercel serverless functions)
const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const dbPath = isVercel ? '/tmp/scheduler.db' : path.join(__dirname, 'scheduler.db');

if (isVercel && fs.existsSync(path.join(__dirname, 'scheduler.db')) && !fs.existsSync(dbPath)) {
  try {
    fs.copyFileSync(path.join(__dirname, 'scheduler.db'), dbPath);
  } catch (copyErr) {
    console.warn('Could not copy seed db to /tmp:', copyErr.message);
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});

// Setup Schema & Seed Default Data
db.serialize(() => {
  // Appointments Table
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      service_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database tables initialized.');
});

// Helper to generate 30-min slots between 9:00 AM and 5:00 PM
function getStandardSlots() {
  const slots = [];
  let currentHour = 9;
  let currentMin = 0;

  while (currentHour < 17) {
    const startHourStr = currentHour < 10 ? `0${currentHour}` : `${currentHour}`;
    const startMinStr = currentMin === 0 ? '00' : '30';
    
    let nextHour = currentHour;
    let nextMin = currentMin + 30;
    if (nextMin >= 60) {
      nextHour++;
      nextMin = 0;
    }
    const endHourStr = nextHour < 10 ? `0${nextHour}` : `${nextHour}`;
    const endMinStr = nextMin === 0 ? '00' : '30';

    slots.push(`${startHourStr}:${startMinStr} - ${endHourStr}:${endMinStr}`);

    currentHour = nextHour;
    currentMin = nextMin;
  }
  return slots;
}

// ---------------- REST API ROUTES ---------------- //

// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'GoSuper Smart Appointment Scheduler', timestamp: new Date() });
});

// GET /api/slots?date=YYYY-MM-DD - Get available slots and booking counts for a given date
app.get('/api/slots', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const standardSlots = getStandardSlots();

  const query = `
    SELECT time_slot, COUNT(*) as booking_count 
    FROM appointments 
    WHERE booking_date = ? 
    GROUP BY time_slot
  `;

  db.all(query, [date], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }

    const countsMap = {};
    rows.forEach(row => {
      countsMap[row.time_slot] = row.booking_count;
    });

    const slotsResult = standardSlots.map(slot => {
      const booked = countsMap[slot] || 0;
      const maxCapacity = 3;
      return {
        slot,
        booked,
        maxCapacity,
        available: booked < maxCapacity,
        spotsRemaining: maxCapacity - booked
      };
    });

    res.json({
      date,
      totalSlots: slotsResult.length,
      slots: slotsResult
    });
  });
});

// GET /api/appointments - List all booked appointments (filter by date optional)
app.get('/api/appointments', (req, res) => {
  const date = req.query.date;
  let query = `SELECT * FROM appointments ORDER BY booking_date ASC, time_slot ASC`;
  let params = [];

  if (date) {
    query = `SELECT * FROM appointments WHERE booking_date = ? ORDER BY time_slot ASC`;
    params = [date];
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database fetch failed', details: err.message });
    }
    res.json({ count: rows.length, appointments: rows });
  });
});

// POST /api/appointments - Create a new appointment
app.post('/api/appointments', (req, res) => {
  const { customer_name, customer_email, customer_phone, booking_date, time_slot, service_notes } = req.body;

  // Form Validation
  if (!customer_name || !customer_email || !customer_phone || !booking_date || !time_slot) {
    return res.status(400).json({ error: 'Missing required fields: customer_name, customer_email, customer_phone, booking_date, time_slot' });
  }

  // Verify Slot Capacity (Max 3 appointments per 30-min slot)
  const capacityCheckQuery = `SELECT COUNT(*) as current_bookings FROM appointments WHERE booking_date = ? AND time_slot = ?`;
  
  db.get(capacityCheckQuery, [booking_date, time_slot], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Capacity verification failed', details: err.message });
    }

    if (row.current_bookings >= 3) {
      return res.status(400).json({ 
        error: 'Slot Full', 
        message: `The time slot ${time_slot} on ${booking_date} has reached its maximum capacity of 3 appointments.` 
      });
    }

    // Insert Appointment
    const insertQuery = `
      INSERT INTO appointments (customer_name, customer_email, customer_phone, booking_date, time_slot, service_notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(insertQuery, [customer_name, customer_email, customer_phone, booking_date, time_slot, service_notes || ''], function (insertErr) {
      if (insertErr) {
        return res.status(500).json({ error: 'Failed to create appointment', details: insertErr.message });
      }

      res.status(201).json({
        message: 'Appointment booked successfully!',
        appointment: {
          id: this.lastID,
          customer_name,
          customer_email,
          customer_phone,
          booking_date,
          time_slot,
          service_notes
        }
      });
    });
  });
});

// PUT /api/appointments/:id - Update an existing appointment
app.put('/api/appointments/:id', (req, res) => {
  const id = req.params.id;
  const { customer_name, customer_email, customer_phone, booking_date, time_slot, service_notes } = req.body;

  if (!customer_name || !customer_email || !customer_phone || !booking_date || !time_slot) {
    return res.status(400).json({ error: 'Missing required fields for update.' });
  }

  const updateQuery = `
    UPDATE appointments 
    SET customer_name = ?, customer_email = ?, customer_phone = ?, booking_date = ?, time_slot = ?, service_notes = ?
    WHERE id = ?
  `;

  db.run(updateQuery, [customer_name, customer_email, customer_phone, booking_date, time_slot, service_notes || '', id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update appointment', details: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    res.json({ message: 'Appointment updated successfully.', id: parseInt(id) });
  });
});

// DELETE /api/appointments/:id - Cancel/Delete an appointment
app.delete('/api/appointments/:id', (req, res) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM appointments WHERE id = ?`;

  db.run(deleteQuery, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to cancel appointment', details: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    res.json({ message: 'Appointment cancelled successfully.', id: parseInt(id) });
  });
});

// Serve Single Page Application UI
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GoSuper Smart Appointment Scheduler server running on port ${PORT}`);
});
