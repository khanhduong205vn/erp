const express = require('express');
const { v4: uuidv4 } = require('uuid');

/**
 * Employee management routes (MySQL async).
 * Full CRUD with search/filter by department and role.
 */
function createEmployeeRoutes(pool) {
  const router = express.Router();

  // GET /api/employees — List with optional search/filter
  router.get('/', async (req, res) => {
    try {
      const { search, department, role } = req.query;
      let query = 'SELECT * FROM employees WHERE 1=1';
      const params = [];

      if (search) {
        query += ' AND (name LIKE ? OR email LIKE ? OR code LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term);
      }
      if (department) {
        query += ' AND department = ?';
        params.push(department);
      }
      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }

      query += ' ORDER BY code ASC';
      const [rows] = await pool.execute(query, params);
      res.json({ data: rows, total: rows.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/employees/departments — Distinct department list
  router.get('/departments', async (_req, res) => {
    try {
      const [rows] = await pool.execute('SELECT DISTINCT department FROM employees ORDER BY department');
      res.json({ data: rows.map(r => r.department) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/employees/:id
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
      res.json({ data: rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/employees — Create
  router.post('/', async (req, res) => {
    try {
      const { name, email, department, position, role, status } = req.body;
      if (!name || !email || !department || !position) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      }

      // Auto-generate next employee code
      const [lastRows] = await pool.execute('SELECT code FROM employees ORDER BY code DESC LIMIT 1');
      const nextNum = lastRows.length > 0 ? parseInt(lastRows[0].code.replace('NV', '')) + 1 : 1;
      const code = `NV${String(nextNum).padStart(3, '0')}`;

      const id = uuidv4();
      await pool.execute(
        'INSERT INTO employees (id, code, name, email, department, position, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, code, name, email, department, position, role || 'Nhân viên', status || 'Hoạt động']
      );

      const [created] = await pool.execute('SELECT * FROM employees WHERE id = ?', [id]);
      res.status(201).json({ data: created[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/employees/:id — Update
  router.put('/:id', async (req, res) => {
    try {
      const [existing] = await pool.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
      if (existing.length === 0) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });

      const old = existing[0];
      const { name, email, department, position, role, status } = req.body;
      await pool.execute(
        'UPDATE employees SET name=?, email=?, department=?, position=?, role=?, status=? WHERE id=?',
        [name || old.name, email || old.email, department || old.department, position || old.position, role || old.role, status || old.status, req.params.id]
      );

      const [updated] = await pool.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
      res.json({ data: updated[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/employees/:id
  router.delete('/:id', async (req, res) => {
    try {
      const [existing] = await pool.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
      if (existing.length === 0) return res.status(404).json({ error: 'Không tìm thấy nhân viên' });

      await pool.execute('DELETE FROM employees WHERE id = ?', [req.params.id]);
      res.json({ message: 'Đã xóa nhân viên thành công' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = { createEmployeeRoutes };
