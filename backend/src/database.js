const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

/**
 * Create MySQL connection pool and initialize schema + seed data.
 * Uses mysql2/promise for async/await support.
 */
async function initDatabase(config) {
  // First connect without database to create it if needed
  const tempPool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    waitForConnections: true,
  });

  await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await tempPool.end();

  // Connect to the target database
  const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
  });

  await createTables(pool);
  await seedData(pool);

  return pool;
}

/** Create all required tables if they don't exist */
async function createTables(pool) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'Nhân viên',
      status VARCHAR(50) NOT NULL DEFAULT 'Hoạt động',
      avatar MEDIUMTEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Ensure avatar column exists and uses MEDIUMTEXT for base64 images (TEXT max ~64KB is too small)
  try {
    await pool.execute('ALTER TABLE users ADD COLUMN avatar MEDIUMTEXT DEFAULT NULL');
  } catch (_) {
    // Column already exists — ensure it's MEDIUMTEXT, not TEXT
    try {
      await pool.execute('ALTER TABLE users MODIFY COLUMN avatar MEDIUMTEXT DEFAULT NULL');
    } catch (_) { /* Already correct type */ }
  }

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS employees (
      id VARCHAR(36) PRIMARY KEY,
      code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      department VARCHAR(255) NOT NULL,
      position VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'Nhân viên',
      status VARCHAR(50) NOT NULL DEFAULT 'Hoạt động',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS assets (
      id VARCHAR(36) PRIMARY KEY,
      code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      location VARCHAR(255) NOT NULL,
      department VARCHAR(255) NOT NULL,
      capacity INT DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'Sẵn sàng',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS meeting_bookings (
      id VARCHAR(36) PRIMARY KEY,
      room_id VARCHAR(36) NOT NULL,
      room_name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      organizer VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      start_time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Chờ duyệt',
      note TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES assets(id) ON DELETE CASCADE
    )
  `);
}

/** Seed default admin user and sample data if tables are empty */
async function seedData(pool) {
  // Seed default admin user
  const [adminRows] = await pool.execute('SELECT COUNT(*) as count FROM users');
  if (adminRows[0].count === 0) {
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    await pool.execute(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      ['admin-001', 'Admin', 'admin@gmail.com', hashedPassword, 'Quản trị viên']
    );
    console.log('✅ Default admin created: admin@gmail.com / admin@123');
  }

  // Seed employees
  const [empRows] = await pool.execute('SELECT COUNT(*) as count FROM employees');
  if (empRows[0].count === 0) {
    const employees = [
      ['e1', 'NV001', 'Nguyễn Văn An', 'an.nguyen@company.com', 'Phòng Hành chính', 'Giám đốc Hành chính', 'Quản trị viên', 'Hoạt động'],
      ['e2', 'NV002', 'Trần Thị Bình', 'binh.tran@company.com', 'Phòng Kinh doanh', 'Trưởng phòng Kinh doanh', 'Quản lý', 'Hoạt động'],
      ['e3', 'NV003', 'Lê Minh Cường', 'cuong.le@company.com', 'Phòng Kinh doanh', 'Nhân viên Kinh doanh', 'Nhân viên', 'Hoạt động'],
      ['e4', 'NV004', 'Phạm Thu Dung', 'dung.pham@company.com', 'Phòng Kinh doanh', 'Nhân viên Marketing', 'Nhân viên', 'Hoạt động'],
      ['e5', 'NV005', 'Hoàng Văn Em', 'em.hoang@company.com', 'Phòng Hành chính', 'Nhân viên Hành chính', 'Nhân viên', 'Hoạt động'],
      ['e6', 'NV006', 'Đặng Thị Giang', 'giang.dang@company.com', 'Phòng Kỹ thuật', 'Trưởng phòng Kỹ thuật', 'Quản lý', 'Hoạt động'],
      ['e7', 'NV007', 'Vũ Minh Hải', 'hai.vu@company.com', 'Phòng Kỹ thuật', 'Lập trình viên Senior', 'Nhân viên', 'Hoạt động'],
      ['e8', 'NV008', 'Ngô Thị Lan', 'lan.ngo@company.com', 'Phòng Nhân sự', 'Trưởng phòng Nhân sự', 'Quản lý', 'Hoạt động'],
      ['e9', 'NV009', 'Bùi Văn Khoa', 'khoa.bui@company.com', 'Phòng Kỹ thuật', 'Lập trình viên Junior', 'Nhân viên', 'Hoạt động'],
      ['e10', 'NV010', 'Đinh Thị Mai', 'mai.dinh@company.com', 'Phòng Kế toán', 'Kế toán trưởng', 'Quản lý', 'Hoạt động'],
      ['e11', 'NV011', 'Lý Văn Nam', 'nam.ly@company.com', 'Phòng Kỹ thuật', 'DevOps Engineer', 'Nhân viên', 'Hoạt động'],
      ['e12', 'NV012', 'Trương Thị Oanh', 'oanh.truong@company.com', 'Phòng Hành chính', 'Thư ký', 'Nhân viên', 'Hoạt động'],
    ];
    for (const emp of employees) {
      await pool.execute(
        'INSERT INTO employees (id, code, name, email, department, position, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        emp
      );
    }
  }

  // Seed assets
  const [assetRows] = await pool.execute('SELECT COUNT(*) as count FROM assets');
  if (assetRows[0].count === 0) {
    const assets = [
      ['a1', 'MR001', 'Phòng họp A - Tầng 1', 'Phòng họp', 'Tầng 1', 'Chung', 30, 'Sẵn sàng'],
      ['a2', 'MR002', 'Phòng họp B - Tầng 2', 'Phòng họp', 'Tầng 2', 'Chung', 15, 'Sẵn sàng'],
      ['a3', 'MR003', 'Phòng họp C - Tầng 2', 'Phòng họp', 'Tầng 2', 'Chung', 8, 'Sẵn sàng'],
      ['a4', 'MR004', 'Phòng họp D - Tầng 3', 'Phòng họp', 'Tầng 3', 'Chung', 12, 'Sẵn sàng'],
      ['a5', 'TB001', 'Máy chiếu Epson EB-X51', 'Thiết bị', 'Tầng 1', 'Phòng Kỹ thuật', 0, 'Sẵn sàng'],
      ['a6', 'TB002', 'Laptop Dell Latitude 5540', 'Thiết bị', 'Tầng 2', 'Phòng Kỹ thuật', 0, 'Đang sử dụng'],
      ['a7', 'TB003', 'Máy in HP LaserJet Pro', 'Thiết bị', 'Tầng 1', 'Phòng Hành chính', 0, 'Sẵn sàng'],
      ['a8', 'PT001', 'Xe ô tô Toyota Camry', 'Phương tiện', 'Bãi xe', 'Chung', 0, 'Sẵn sàng'],
      ['a9', 'PT002', 'Xe ô tô Honda CR-V', 'Phương tiện', 'Bãi xe', 'Chung', 0, 'Đang sử dụng'],
    ];
    for (const asset of assets) {
      await pool.execute(
        'INSERT INTO assets (id, code, name, type, location, department, capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        asset
      );
    }
  }

  // Seed bookings
  const [bookingRows] = await pool.execute('SELECT COUNT(*) as count FROM meeting_bookings');
  if (bookingRows[0].count === 0) {
    const bookings = [
      ['b1', 'a1', 'Phòng họp A - Tầng 1', 'Họp kế hoạch Q2', 'Nguyễn Văn An', '2026-03-25', '09:00', '10:30', 'Đã duyệt', 'Chuẩn bị slide'],
      ['b2', 'a2', 'Phòng họp B - Tầng 2', 'Review dự án X', 'Đặng Thị Giang', '2026-03-25', '14:00', '15:00', 'Đã duyệt', ''],
      ['b3', 'a3', 'Phòng họp C - Tầng 2', 'Phỏng vấn ứng viên', 'Ngô Thị Lan', '2026-03-26', '10:00', '11:00', 'Chờ duyệt', ''],
      ['b4', 'a1', 'Phòng họp A - Tầng 1', 'Đào tạo nhân viên mới', 'Trần Thị Bình', '2026-03-26', '13:30', '16:00', 'Chờ duyệt', 'Cần máy chiếu'],
      ['b5', 'a4', 'Phòng họp D - Tầng 3', 'Stand-up hàng tuần', 'Vũ Minh Hải', '2026-03-24', '08:30', '09:00', 'Đã duyệt', ''],
      ['b6', 'a2', 'Phòng họp B - Tầng 2', 'Họp team Marketing', 'Phạm Thu Dung', '2026-03-27', '09:00', '10:00', 'Đã duyệt', ''],
      ['b7', 'a1', 'Phòng họp A - Tầng 1', 'Tổng kết tháng 3', 'Nguyễn Văn An', '2026-03-28', '09:00', '11:00', 'Đã duyệt', ''],
    ];
    for (const booking of bookings) {
      await pool.execute(
        'INSERT INTO meeting_bookings (id, room_id, room_name, title, organizer, date, start_time, end_time, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        booking
      );
    }
  }
}

module.exports = { initDatabase };
