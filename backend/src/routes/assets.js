const express = require('express');
const { v4: uuidv4 } = require('uuid');

/**
 * Asset management routes (MySQL async).
 * Full CRUD with search/filter + separate rooms endpoint for booking.
 */
function createAssetRoutes(pool) {
  const router = express.Router();

  // GET /api/assets — List with optional search/filter
  router.get('/', async (req, res) => {
    try {
      const { search, type, status } = req.query;
      let query = 'SELECT * FROM assets WHERE 1=1';
      const params = [];

      if (search) {
        query += ' AND (name LIKE ? OR code LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term);
      }
      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY code ASC';
      const [rows] = await pool.execute(query, params);
      res.json({ data: rows, total: rows.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/assets/types — Distinct asset type list for filters
  router.get('/types', async (_req, res) => {
    try {
      const [rows] = await pool.execute('SELECT DISTINCT type FROM assets ORDER BY type');
      res.json({ data: rows.map(r => r.type) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/assets/rooms — Meeting rooms only (for booking forms)
  router.get('/rooms', async (_req, res) => {
    try {
      const [rows] = await pool.execute("SELECT * FROM assets WHERE type = 'Phòng họp' ORDER BY code ASC");
      res.json({ data: rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/assets/:id
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM assets WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy tài sản' });
      res.json({ data: rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/assets — Create
  router.post('/', async (req, res) => {
    try {
      const { name, type, location, department, capacity, status } = req.body;
      if (!name || !type || !location || !department) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      }

      const prefix = type === 'Phòng họp' ? 'MR' : type === 'Thiết bị' ? 'TB' : 'PT';
      const [lastRows] = await pool.execute('SELECT code FROM assets WHERE code LIKE ? ORDER BY code DESC LIMIT 1', [`${prefix}%`]);
      const nextNum = lastRows.length > 0 ? parseInt(lastRows[0].code.replace(prefix, '')) + 1 : 1;
      const code = `${prefix}${String(nextNum).padStart(3, '0')}`;

      const id = uuidv4();
      await pool.execute(
        'INSERT INTO assets (id, code, name, type, location, department, capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, code, name, type, location, department, capacity || 0, status || 'Sẵn sàng']
      );

      const [created] = await pool.execute('SELECT * FROM assets WHERE id = ?', [id]);
      res.status(201).json({ data: created[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/assets/:id — Update
  router.put('/:id', async (req, res) => {
    try {
      const [existing] = await pool.execute('SELECT * FROM assets WHERE id = ?', [req.params.id]);
      if (existing.length === 0) return res.status(404).json({ error: 'Không tìm thấy tài sản' });

      const old = existing[0];
      const { name, type, location, department, capacity, status } = req.body;
      await pool.execute(
        'UPDATE assets SET name=?, type=?, location=?, department=?, capacity=?, status=? WHERE id=?',
        [name || old.name, type || old.type, location || old.location, department || old.department, capacity !== undefined ? capacity : old.capacity, status || old.status, req.params.id]
      );

      const [updated] = await pool.execute('SELECT * FROM assets WHERE id = ?', [req.params.id]);
      res.json({ data: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/assets/:id
  router.delete('/:id', async (req, res) => {
    try {
      const [existing] = await pool.execute('SELECT * FROM assets WHERE id = ?', [req.params.id]);
      if (existing.length === 0) return res.status(404).json({ error: 'Không tìm thấy tài sản' });

      await pool.execute('DELETE FROM assets WHERE id = ?', [req.params.id]);
      res.json({ message: 'Đã xóa tài sản thành công' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = { createAssetRoutes };
