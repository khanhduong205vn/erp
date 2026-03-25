const express = require('express');
const { v4: uuidv4 } = require('uuid');

/**
 * Meeting room booking routes (MySQL async).
 * CRUD + approval/reject workflow + time conflict detection.
 */
function createBookingRoutes(pool) {
  const router = express.Router();

  // GET /api/bookings — List with optional date/room/status filters
  router.get('/', async (req, res) => {
    try {
      const { date, room_id, status } = req.query;
      let query = 'SELECT * FROM meeting_bookings WHERE 1=1';
      const params = [];

      if (date) {
        query += ' AND date = ?';
        params.push(date);
      }
      if (room_id) {
        query += ' AND room_id = ?';
        params.push(room_id);
      }
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY date ASC, start_time ASC';
      const [rows] = await pool.execute(query, params);
      res.json({ data: rows, total: rows.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/bookings/:id
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM meeting_bookings WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy lịch đặt phòng' });
      res.json({ data: rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/bookings — Create with conflict detection
  router.post('/', async (req, res) => {
    try {
      const { room_id, title, organizer, date, start_time, end_time, note } = req.body;
      if (!room_id || !title || !organizer || !date || !start_time || !end_time) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      }

      // Check time conflict
      const [conflicts] = await pool.execute(
        `SELECT * FROM meeting_bookings
         WHERE room_id = ? AND date = ? AND status != 'Đã hủy'
         AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))`,
        [room_id, date, end_time, start_time, end_time, start_time, start_time, end_time]
      );

      if (conflicts.length > 0) {
        return res.status(409).json({ error: 'Phòng đã được đặt trong khung giờ này' });
      }

      const [rooms] = await pool.execute('SELECT name FROM assets WHERE id = ?', [room_id]);
      if (rooms.length === 0) return res.status(404).json({ error: 'Không tìm thấy phòng họp' });

      const id = uuidv4();
      await pool.execute(
        'INSERT INTO meeting_bookings (id, room_id, room_name, title, organizer, date, start_time, end_time, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, room_id, rooms[0].name, title, organizer, date, start_time, end_time, 'Chờ duyệt', note || '']
      );

      const [created] = await pool.execute('SELECT * FROM meeting_bookings WHERE id = ?', [id]);
      res.status(201).json({ data: created[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/bookings/:id — Update details
  router.put('/:id', async (req, res) => {
    try {
      const [existing] = await pool.execute('SELECT * FROM meeting_bookings WHERE id = ?', [req.params.id]);
      if (existing.length === 0) return res.status(404).json({ error: 'Không tìm thấy lịch đặt phòng' });

      const old = existing[0];
      const { title, organizer, date, start_time, end_time, note } = req.body;
      await pool.execute(
        'UPDATE meeting_bookings SET title=?, organizer=?, date=?, start_time=?, end_time=?, note=? WHERE id=?',
        [title || old.title, organizer || old.organizer, date || old.date, start_time || old.start_time, end_time || old.end_time, note !== undefined ? note : old.note, req.params.id]
      );

      const [updated] = await pool.execute('SELECT * FROM meeting_bookings WHERE id = ?', [req.params.id]);
      res.json({ data: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/bookings/:id/approve
  router.put('/:id/approve', async (req, res) => {
    try {
      const [existing] = await pool.execute('SELECT * FROM meeting_bookings WHERE id = ?', [req.params.id]);
      if (existing.length === 0) return res.status(404).json({ error: 'Không tìm thấy lịch đặt phòng' });

      await pool.execute("UPDATE meeting_bookings SET status = 'Đã duyệt' WHERE id = ?", [req.params.id]);
      const [updated] = await pool.execute('SELECT * FROM meeting_bookings WHERE id = ?', [req.params.id]);
      res.json({ data: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/bookings/:id/reject
  router.put('/:id/reject', async (req, res) => {
    try {
      const [existing] = await pool.execute('SELECT * FROM meeting_bookings WHERE id = ?', [req.params.id]);
      if (existing.length === 0) return res.status(404).json({ error: 'Không tìm thấy lịch đặt phòng' });

      await pool.execute("UPDATE meeting_bookings SET status = 'Đã hủy' WHERE id = ?", [req.params.id]);
      const [updated] = await pool.execute('SELECT * FROM meeting_bookings WHERE id = ?', [req.params.id]);
      res.json({ data: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/bookings/:id
  router.delete('/:id', async (req, res) => {
    try {
      const [existing] = await pool.execute('SELECT * FROM meeting_bookings WHERE id = ?', [req.params.id]);
      if (existing.length === 0) return res.status(404).json({ error: 'Không tìm thấy lịch đặt phòng' });

      await pool.execute('DELETE FROM meeting_bookings WHERE id = ?', [req.params.id]);
      res.json({ message: 'Đã xóa lịch đặt phòng thành công' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = { createBookingRoutes };
