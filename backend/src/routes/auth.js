const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Authentication routes — login, register, profile.
 * JWT-based stateless auth with bcrypt password hashing.
 */
function createAuthRoutes(pool) {
  const router = express.Router();
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
  const TOKEN_EXPIRY = '24h';

  // POST /api/auth/login — Authenticate and return JWT
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
      }

      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
      }

      const user = rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      res.json({
        data: {
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/auth/register — Create new user account
  router.post('/register', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      }

      // Check if email already exists
      const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Email đã tồn tại trong hệ thống' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const id = uuidv4();
      await pool.execute(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [id, name, email, hashedPassword, role || 'Nhân viên']
      );

      const token = jwt.sign(
        { id, email, role: role || 'Nhân viên', name },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      res.status(201).json({
        data: {
          token,
          user: { id, name, email, role: role || 'Nhân viên' }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/auth/me — Get current user profile from JWT
  router.get('/me', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const [rows] = await pool.execute('SELECT id, name, email, role, status, avatar FROM users WHERE id = ?', [decoded.id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      }

      res.json({ data: rows[0] });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/auth/avatar — Upload avatar as base64 image
  router.put('/avatar', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const { avatar } = req.body;

      // avatar must be explicitly present in body (can be empty string or null for removal)
      if (avatar === undefined) {
        return res.status(400).json({ error: 'Thiếu dữ liệu avatar' });
      }

      // Normalize: empty string or null → NULL in DB (removal)
      const avatarValue = avatar || null;

      // Only validate size for actual uploads
      if (avatarValue && avatarValue.length > 2_800_000) {
        return res.status(413).json({ error: 'Ảnh quá lớn, tối đa 2MB' });
      }

      await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatarValue, decoded.id]);
      res.json({ data: { avatar: avatarValue }, message: 'Cập nhật avatar thành công' });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token không hợp lệ' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

/**
 * JWT authentication middleware.
 * Attaches decoded user info to req.user for downstream routes.
 */
function authMiddleware(req, res, next) {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

module.exports = { createAuthRoutes, authMiddleware };
