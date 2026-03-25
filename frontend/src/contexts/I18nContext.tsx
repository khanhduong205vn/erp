import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Locale = 'vi' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const STORAGE_KEY = 'erp_locale';
const I18nContext = createContext<I18nContextType | null>(null);

/** Lightweight i18n provider — inline dictionaries, no external library needed */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'vi';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback((key: string): string => {
    const dict = locale === 'vi' ? vi : en;
    return dict[key] ?? key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/** Hook to access i18n — must be used within I18nProvider */
export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

/* ===== Translation dictionaries ===== */

const vi: Record<string, string> = {
  // Sidebar nav
  'nav.dashboard': 'Tổng quan',
  'nav.employees': 'Nhân sự',
  'nav.assets': 'Tài sản',
  'nav.meetings': 'Phòng họp',
  'nav.collapse': 'Thu gọn',
  'nav.logout': 'Đăng xuất',
  'nav.profile': 'Hồ sơ cá nhân',

  // Header
  'header.search': 'Tìm kiếm...',

  // Dashboard
  'dashboard.title': 'Tổng quan hệ thống',
  'dashboard.desc': 'Quản lý nhân sự, tài sản và phòng họp',
  'dashboard.totalEmployees': 'Tổng nhân viên',
  'dashboard.totalAssets': 'Tổng tài sản',
  'dashboard.todayBookings': 'Lịch hôm nay',
  'dashboard.pending': 'Chờ duyệt',
  'dashboard.working': 'đang làm việc',
  'dashboard.meetingRooms': 'phòng họp',
  'dashboard.weekBookings': 'lịch tuần này',
  'dashboard.totalBookings': 'tổng lịch đặt',
  'dashboard.quickActions': 'Thao tác nhanh',
  'dashboard.addEmployee': 'Thêm nhân viên',
  'dashboard.addAsset': 'Thêm tài sản',
  'dashboard.bookRoom': 'Đặt phòng họp',
  'dashboard.utilization': 'Tình hình sử dụng',
  'dashboard.live': 'Trực tiếp',
  'dashboard.activeEmployees': 'Nhân viên hoạt động',
  'dashboard.assetsInUse': 'Tài sản đang sử dụng',
  'dashboard.roomsToday': 'Phòng họp hôm nay',
  'dashboard.pendingApprovals': 'Yêu cầu chờ duyệt',
  'dashboard.kpiTitle': 'Chỉ số tổng hợp',
  'dashboard.activityRate': 'Tỷ lệ hoạt động',
  'dashboard.assetUtil': 'Sử dụng tài sản',
  'dashboard.approvalRate': 'Duyệt đặt phòng',
  'dashboard.monthBookings': 'Lịch tháng này',
  'dashboard.thisWeek': 'tuần này',
  'dashboard.assetStatus': 'Trạng thái tài sản',
  'dashboard.ready': 'Sẵn sàng',
  'dashboard.inUse': 'Đang dùng',
  'dashboard.maintenance': 'Bảo trì',
  'dashboard.deptBreakdown': 'Phân bổ nhân sự',
  'dashboard.departments': 'phòng ban',
  'dashboard.noData': 'Chưa có dữ liệu',
  'dashboard.roleBreakdown': 'Phân bổ vai trò',
  'dashboard.upcomingMeetings': 'Lịch họp sắp tới',
  'dashboard.viewAll': 'Xem tất cả',
  'dashboard.noUpcoming': 'Không có lịch họp sắp tới',
  'dashboard.today': 'Hôm nay',
  'dashboard.tomorrow': 'Ngày mai',

  // Employees
  'employees.title': 'Quản lý nhân sự',
  'employees.desc': 'Quản lý thông tin nhân viên và phân quyền',
  'employees.add': 'Thêm nhân viên',
  'employees.list': 'Danh sách nhân viên',
  'employees.total': 'nhân viên',
  'employees.search': 'Tìm kiếm theo tên, email...',
  'employees.allDepts': 'Tất cả phòng ban',
  'employees.allRoles': 'Tất cả vai trò',
  'employees.code': 'Mã NV',
  'employees.name': 'Họ tên',
  'employees.department': 'Phòng ban',
  'employees.position': 'Chức vụ',
  'employees.role': 'Vai trò',
  'employees.status': 'Trạng thái',
  'employees.actions': 'Thao tác',
  'employees.email': 'Email',
  'employees.noResults': 'Không tìm thấy nhân viên nào',
  'employees.tryDifferent': 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.',
  'employees.addTitle': 'Thêm nhân viên mới',
  'employees.editTitle': 'Chỉnh sửa nhân viên',
  'employees.deleteTitle': 'Xóa nhân viên',
  'employees.deleteMsg': 'Bạn có chắc chắn muốn xóa nhân viên này?',
  'employees.addSuccess': 'Đã thêm nhân viên thành công',
  'employees.editSuccess': 'Đã cập nhật nhân viên thành công',
  'employees.deleteSuccess': 'Đã xóa nhân viên thành công',

  // Assets
  'assets.title': 'Quản lý tài sản',
  'assets.desc': 'Theo dõi thiết bị, phương tiện & phòng họp',
  'assets.add': 'Thêm tài sản',
  'assets.list': 'Danh sách tài sản',
  'assets.total': 'tài sản',
  'assets.search': 'Tìm kiếm tài sản...',
  'assets.allTypes': 'Tất cả loại',
  'assets.allStatus': 'Tất cả trạng thái',
  'assets.code': 'Mã TS',
  'assets.name': 'Tên tài sản',
  'assets.type': 'Loại',
  'assets.location': 'Vị trí',
  'assets.department': 'Phòng ban',
  'assets.status': 'Trạng thái',
  'assets.actions': 'Thao tác',
  'assets.noResults': 'Không tìm thấy tài sản nào',
  'assets.tryDifferent': 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.',
  'assets.addTitle': 'Thêm tài sản mới',
  'assets.editTitle': 'Chỉnh sửa tài sản',
  'assets.deleteTitle': 'Xóa tài sản',
  'assets.deleteMsg': 'Bạn có chắc chắn muốn xóa tài sản này?',
  'assets.addSuccess': 'Đã thêm tài sản thành công',
  'assets.editSuccess': 'Đã cập nhật tài sản thành công',
  'assets.deleteSuccess': 'Đã xóa tài sản thành công',

  // Meeting rooms
  'meetings.title': 'Quản lý phòng họp',
  'meetings.desc': 'Đặt lịch và quản lý phòng họp doanh nghiệp',
  'meetings.book': 'Đặt phòng họp',
  'meetings.rooms': 'Phòng họp',
  'meetings.totalBookings': 'Tổng lịch đặt',
  'meetings.calendarTab': 'Lịch đặt phòng',
  'meetings.roomsTab': 'Danh sách phòng',
  'meetings.approvalsTab': 'Chờ duyệt',
  'meetings.selectDate': 'Chọn ngày',
  'meetings.noBookings': 'Không có lịch đặt phòng',
  'meetings.noBookingsDesc': 'Ngày này chưa có cuộc họp nào được đặt.',
  'meetings.allApproved': 'Tất cả đã được duyệt',
  'meetings.noApprovals': 'Không có yêu cầu nào đang chờ duyệt.',
  'meetings.approve': 'Duyệt',
  'meetings.reject': 'Từ chối',
  'meetings.bookTitle': 'Đặt phòng họp',
  'meetings.meetingTitle': 'Tiêu đề cuộc họp',
  'meetings.room': 'Phòng họp',
  'meetings.organizer': 'Người tổ chức',
  'meetings.date': 'Ngày',
  'meetings.startTime': 'Bắt đầu',
  'meetings.endTime': 'Kết thúc',
  'meetings.note': 'Ghi chú',
  'meetings.deleteTitle': 'Xóa lịch đặt phòng',
  'meetings.deleteMsg': 'Bạn có chắc chắn muốn xóa lịch đặt phòng này?',
  'meetings.bookSuccess': 'Đã đặt phòng họp thành công',
  'meetings.deleteSuccess': 'Đã xóa lịch đặt phòng',
  'meetings.approveSuccess': 'Đã duyệt yêu cầu',
  'meetings.rejectSuccess': 'Đã từ chối yêu cầu',
  'meetings.capacity': 'Sức chứa',
  'meetings.roomCode': 'Mã phòng',
  'meetings.roomName': 'Tên phòng',

  // Login
  'login.welcome': 'Chào mừng trở lại',
  'login.subtitle': 'Đăng nhập để truy cập hệ thống quản lý',
  'login.email': 'Email',
  'login.password': 'Mật khẩu',
  'login.rememberMe': 'Ghi nhớ đăng nhập',
  'login.forgotPassword': 'Quên mật khẩu?',
  'login.submit': 'Đăng nhập',
  'login.loading': 'Đang xử lý...',
  'login.failed': 'Đăng nhập thất bại',
  'login.footer': 'Hệ thống quản lý doanh nghiệp v1.0',

  // Logout
  'logout.title': 'Đăng xuất thành công',
  'logout.message': 'Bạn đã đăng xuất khỏi hệ thống. Hẹn gặp lại!',
  'logout.redirect': 'Đang chuyển hướng...',

  // Profile
  'profile.title': 'Hồ sơ cá nhân',
  'profile.desc': 'Xem thông tin tài khoản của bạn',
  'profile.info': 'Thông tin cá nhân',
  'profile.name': 'Họ tên',
  'profile.email': 'Email',
  'profile.role': 'Vai trò',
  'profile.department': 'Phòng ban',
  'profile.position': 'Chức vụ',
  'profile.status': 'Trạng thái',
  'profile.employeeCode': 'Mã nhân viên',
  'profile.joinDate': 'Ngày tham gia',
  'profile.lastUpdate': 'Cập nhật cuối',
  'profile.accountInfo': 'Thông tin tài khoản',
  'profile.systemRole': 'Quyền hệ thống',
  'profile.security': 'Bảo mật',
  'profile.passwordHint': 'Mật khẩu đã được mã hóa bảo mật',
  'profile.changeAvatar': 'Đổi ảnh',
  'profile.removeAvatar': 'Xóa ảnh đại diện',
  'profile.avatarSuccess': 'Cập nhật ảnh đại diện thành công',
  'profile.avatarRemoved': 'Đã xóa ảnh đại diện',
  'profile.avatarTooLarge': 'Ảnh quá lớn, tối đa 2MB',
  'profile.avatarInvalidType': 'Vui lòng chọn file ảnh',

  // Common
  'common.save': 'Lưu',
  'common.cancel': 'Hủy',
  'common.edit': 'Sửa',
  'common.delete': 'Xóa',
  'common.close': 'Đóng',
  'common.loading': 'Đang tải...',
  'common.error': 'Có lỗi xảy ra',
  'common.people': 'người',
  'common.bookings': 'lịch đặt',
  'common.admin': 'Quản trị viên',
};

const en: Record<string, string> = {
  // Sidebar nav
  'nav.dashboard': 'Dashboard',
  'nav.employees': 'Employees',
  'nav.assets': 'Assets',
  'nav.meetings': 'Meetings',
  'nav.collapse': 'Collapse',
  'nav.logout': 'Logout',
  'nav.profile': 'My Profile',

  // Header
  'header.search': 'Search...',

  // Dashboard
  'dashboard.title': 'System Overview',
  'dashboard.desc': 'HR, asset, and meeting room management',
  'dashboard.totalEmployees': 'Total Employees',
  'dashboard.totalAssets': 'Total Assets',
  'dashboard.todayBookings': "Today's Schedule",
  'dashboard.pending': 'Pending',
  'dashboard.working': 'active',
  'dashboard.meetingRooms': 'meeting rooms',
  'dashboard.weekBookings': 'this week',
  'dashboard.totalBookings': 'total bookings',
  'dashboard.quickActions': 'Quick Actions',
  'dashboard.addEmployee': 'Add Employee',
  'dashboard.addAsset': 'Add Asset',
  'dashboard.bookRoom': 'Book Room',
  'dashboard.utilization': 'Resource Utilization',
  'dashboard.live': 'Live',
  'dashboard.activeEmployees': 'Active Employees',
  'dashboard.assetsInUse': 'Assets In Use',
  'dashboard.roomsToday': 'Rooms Booked Today',
  'dashboard.pendingApprovals': 'Pending Approvals',
  'dashboard.kpiTitle': 'Key Metrics',
  'dashboard.activityRate': 'Activity Rate',
  'dashboard.assetUtil': 'Asset Utilization',
  'dashboard.approvalRate': 'Approval Rate',
  'dashboard.monthBookings': 'Monthly Bookings',
  'dashboard.thisWeek': 'this week',
  'dashboard.assetStatus': 'Asset Status',
  'dashboard.ready': 'Ready',
  'dashboard.inUse': 'In Use',
  'dashboard.maintenance': 'Maintenance',
  'dashboard.deptBreakdown': 'Staff Distribution',
  'dashboard.departments': 'departments',
  'dashboard.noData': 'No data available',
  'dashboard.roleBreakdown': 'Role Distribution',
  'dashboard.upcomingMeetings': 'Upcoming Meetings',
  'dashboard.viewAll': 'View all',
  'dashboard.noUpcoming': 'No upcoming meetings',
  'dashboard.today': 'Today',
  'dashboard.tomorrow': 'Tomorrow',

  // Employees
  'employees.title': 'Employee Management',
  'employees.desc': 'Manage staff information and permissions',
  'employees.add': 'Add Employee',
  'employees.list': 'Employee List',
  'employees.total': 'employees',
  'employees.search': 'Search by name, email...',
  'employees.allDepts': 'All Departments',
  'employees.allRoles': 'All Roles',
  'employees.code': 'Code',
  'employees.name': 'Full Name',
  'employees.department': 'Department',
  'employees.position': 'Position',
  'employees.role': 'Role',
  'employees.status': 'Status',
  'employees.actions': 'Actions',
  'employees.email': 'Email',
  'employees.noResults': 'No employees found',
  'employees.tryDifferent': 'Try changing filters or search terms.',
  'employees.addTitle': 'Add New Employee',
  'employees.editTitle': 'Edit Employee',
  'employees.deleteTitle': 'Delete Employee',
  'employees.deleteMsg': 'Are you sure you want to delete this employee?',
  'employees.addSuccess': 'Employee added successfully',
  'employees.editSuccess': 'Employee updated successfully',
  'employees.deleteSuccess': 'Employee deleted successfully',

  // Assets
  'assets.title': 'Asset Management',
  'assets.desc': 'Track equipment, vehicles & meeting rooms',
  'assets.add': 'Add Asset',
  'assets.list': 'Asset List',
  'assets.total': 'assets',
  'assets.search': 'Search assets...',
  'assets.allTypes': 'All Types',
  'assets.allStatus': 'All Status',
  'assets.code': 'Code',
  'assets.name': 'Asset Name',
  'assets.type': 'Type',
  'assets.location': 'Location',
  'assets.department': 'Department',
  'assets.status': 'Status',
  'assets.actions': 'Actions',
  'assets.noResults': 'No assets found',
  'assets.tryDifferent': 'Try changing filters or search terms.',
  'assets.addTitle': 'Add New Asset',
  'assets.editTitle': 'Edit Asset',
  'assets.deleteTitle': 'Delete Asset',
  'assets.deleteMsg': 'Are you sure you want to delete this asset?',
  'assets.addSuccess': 'Asset added successfully',
  'assets.editSuccess': 'Asset updated successfully',
  'assets.deleteSuccess': 'Asset deleted successfully',

  // Meeting rooms
  'meetings.title': 'Meeting Room Management',
  'meetings.desc': 'Schedule and manage corporate meeting rooms',
  'meetings.book': 'Book Room',
  'meetings.rooms': 'Rooms',
  'meetings.totalBookings': 'Total Bookings',
  'meetings.calendarTab': 'Calendar',
  'meetings.roomsTab': 'Room List',
  'meetings.approvalsTab': 'Approvals',
  'meetings.selectDate': 'Select Date',
  'meetings.noBookings': 'No bookings found',
  'meetings.noBookingsDesc': 'No meetings scheduled for this date.',
  'meetings.allApproved': 'All approved',
  'meetings.noApprovals': 'No pending approval requests.',
  'meetings.approve': 'Approve',
  'meetings.reject': 'Reject',
  'meetings.bookTitle': 'Book Meeting Room',
  'meetings.meetingTitle': 'Meeting Title',
  'meetings.room': 'Room',
  'meetings.organizer': 'Organizer',
  'meetings.date': 'Date',
  'meetings.startTime': 'Start',
  'meetings.endTime': 'End',
  'meetings.note': 'Note',
  'meetings.deleteTitle': 'Delete Booking',
  'meetings.deleteMsg': 'Are you sure you want to delete this booking?',
  'meetings.bookSuccess': 'Room booked successfully',
  'meetings.deleteSuccess': 'Booking deleted',
  'meetings.approveSuccess': 'Request approved',
  'meetings.rejectSuccess': 'Request rejected',
  'meetings.capacity': 'Capacity',
  'meetings.roomCode': 'Room Code',
  'meetings.roomName': 'Room Name',

  // Login
  'login.welcome': 'Welcome Back',
  'login.subtitle': 'Sign in to access the management system',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.rememberMe': 'Remember me',
  'login.forgotPassword': 'Forgot password?',
  'login.submit': 'Sign in',
  'login.loading': 'Processing...',
  'login.failed': 'Login failed',
  'login.footer': 'Enterprise Resource Planning v1.0',

  // Logout
  'logout.title': 'Logged Out Successfully',
  'logout.message': 'You have been signed out. See you again!',
  'logout.redirect': 'Redirecting...',

  // Profile
  'profile.title': 'My Profile',
  'profile.desc': 'View your account information',
  'profile.info': 'Personal Information',
  'profile.name': 'Full Name',
  'profile.email': 'Email',
  'profile.role': 'Role',
  'profile.department': 'Department',
  'profile.position': 'Position',
  'profile.status': 'Status',
  'profile.employeeCode': 'Employee Code',
  'profile.joinDate': 'Join Date',
  'profile.lastUpdate': 'Last Updated',
  'profile.accountInfo': 'Account Information',
  'profile.systemRole': 'System Role',
  'profile.security': 'Security',
  'profile.passwordHint': 'Password is securely encrypted',
  'profile.changeAvatar': 'Change',
  'profile.removeAvatar': 'Remove avatar',
  'profile.avatarSuccess': 'Avatar updated successfully',
  'profile.avatarRemoved': 'Avatar removed',
  'profile.avatarTooLarge': 'Image too large, max 2MB',
  'profile.avatarInvalidType': 'Please select an image file',

  // Common
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.close': 'Close',
  'common.loading': 'Loading...',
  'common.error': 'An error occurred',
  'common.people': 'people',
  'common.bookings': 'bookings',
  'common.admin': 'Administrator',
};
