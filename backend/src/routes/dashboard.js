const express = require('express');

/**
 * Dashboard stats route (MySQL async).
 * Returns comprehensive aggregated stats for the ERP dashboard overview.
 * All metrics are computed server-side from real database data.
 */
function createDashboardRoutes(pool) {
  const router = express.Router();

  router.get('/stats', async (_req, res) => {
    try {
      // Run all aggregate queries in parallel for performance
      const [
        [[empTotal]],
        [[empActive]],
        [[empInactive]],
        [[assetTotal]],
        [[rooms]],
        [[todayB]],
        [[pending]],
        [[totalB]],
        [[approvedB]],
        [[rejectedB]],
        [[ready]],
        [[inUse]],
        [[maintenance]],
        [deptBreakdown],
        [assetTypeBreakdown],
        [roleBreakdown],
        [recentBookings],
        [[thisWeekBookings]],
        [[thisMonthBookings]],
      ] = await Promise.all([
        // Employee counts
        pool.execute('SELECT COUNT(*) as count FROM employees'),
        pool.execute("SELECT COUNT(*) as count FROM employees WHERE status = 'Hoạt động'"),
        pool.execute("SELECT COUNT(*) as count FROM employees WHERE status = 'Nghỉ việc'"),

        // Asset counts
        pool.execute('SELECT COUNT(*) as count FROM assets'),
        pool.execute("SELECT COUNT(*) as count FROM assets WHERE type = 'Phòng họp'"),

        // Booking counts
        pool.execute('SELECT COUNT(*) as count FROM meeting_bookings WHERE date = CURDATE()'),
        pool.execute("SELECT COUNT(*) as count FROM meeting_bookings WHERE status = 'Chờ duyệt'"),
        pool.execute('SELECT COUNT(*) as count FROM meeting_bookings'),
        pool.execute("SELECT COUNT(*) as count FROM meeting_bookings WHERE status = 'Đã duyệt'"),
        pool.execute("SELECT COUNT(*) as count FROM meeting_bookings WHERE status = 'Từ chối'"),

        // Asset status breakdown
        pool.execute("SELECT COUNT(*) as count FROM assets WHERE status = 'Sẵn sàng'"),
        pool.execute("SELECT COUNT(*) as count FROM assets WHERE status = 'Đang sử dụng'"),
        pool.execute("SELECT COUNT(*) as count FROM assets WHERE status = 'Bảo trì'"),

        // Department employee distribution (top departments)
        pool.execute(`
          SELECT department, COUNT(*) as count
          FROM employees
          WHERE status = 'Hoạt động'
          GROUP BY department
          ORDER BY count DESC
          LIMIT 6
        `),

        // Asset type distribution
        pool.execute(`
          SELECT type, COUNT(*) as count
          FROM assets
          GROUP BY type
          ORDER BY count DESC
        `),

        // Employee role distribution
        pool.execute(`
          SELECT role, COUNT(*) as count
          FROM employees
          WHERE status = 'Hoạt động'
          GROUP BY role
          ORDER BY count DESC
        `),

        // Recent/upcoming bookings (today + future, limit 5)
        pool.execute(`
          SELECT id, title, organizer, room_name, date, start_time, end_time, status
          FROM meeting_bookings
          WHERE date >= CURDATE()
          ORDER BY date ASC, start_time ASC
          LIMIT 5
        `),

        // This week bookings count
        pool.execute(`
          SELECT COUNT(*) as count FROM meeting_bookings
          WHERE YEARWEEK(date, 1) = YEARWEEK(CURDATE(), 1)
        `),

        // This month bookings count
        pool.execute(`
          SELECT COUNT(*) as count FROM meeting_bookings
          WHERE YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())
        `),
      ]);

      res.json({
        data: {
          // Core counts
          totalEmployees: empTotal.count,
          activeEmployees: empActive.count,
          inactiveEmployees: empInactive.count,
          totalAssets: assetTotal.count,
          meetingRooms: rooms.count,

          // Booking stats
          todayBookings: todayB.count,
          thisWeekBookings: thisWeekBookings.count,
          thisMonthBookings: thisMonthBookings.count,
          pendingApprovals: pending.count,
          totalBookings: totalB.count,
          approvedBookings: approvedB.count,
          rejectedBookings: rejectedB.count,

          // Asset status
          readyAssets: ready.count,
          inUseAssets: inUse.count,
          maintenanceAssets: maintenance.count,

          // Breakdowns for charts/visualizations
          departmentBreakdown: deptBreakdown.map(r => ({
            name: r.department,
            count: r.count,
          })),
          assetTypeBreakdown: assetTypeBreakdown.map(r => ({
            name: r.type,
            count: r.count,
          })),
          roleBreakdown: roleBreakdown.map(r => ({
            name: r.role,
            count: r.count,
          })),

          // Recent/upcoming bookings
          recentBookings: recentBookings.map(b => ({
            id: b.id,
            title: b.title,
            organizer: b.organizer,
            roomName: b.room_name,
            date: b.date,
            startTime: b.start_time,
            endTime: b.end_time,
            status: b.status,
          })),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = { createDashboardRoutes };
