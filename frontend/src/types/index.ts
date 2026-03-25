/** Employee entity */
export interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/** Asset entity (rooms, equipment, vehicles) */
export interface Asset {
  id: string;
  code: string;
  name: string;
  type: string;
  location: string;
  department: string;
  capacity: number;
  status: string;
  created_at: string;
  updated_at: string;
}

/** Meeting room booking */
export interface Booking {
  id: string;
  room_id: string;
  room_name: string;
  title: string;
  organizer: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  note: string;
  created_at: string;
}

/** Dashboard aggregate stats — computed entirely server-side from real DB data */
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  totalAssets: number;
  meetingRooms: number;
  todayBookings: number;
  thisWeekBookings: number;
  thisMonthBookings: number;
  pendingApprovals: number;
  totalBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  readyAssets: number;
  inUseAssets: number;
  maintenanceAssets: number;
  departmentBreakdown: BreakdownItem[];
  assetTypeBreakdown: BreakdownItem[];
  roleBreakdown: BreakdownItem[];
  recentBookings: RecentBooking[];
}

/** Generic name/count pair for chart breakdowns */
export interface BreakdownItem {
  name: string;
  count: number;
}

/** Upcoming booking summary for dashboard */
export interface RecentBooking {
  id: string;
  title: string;
  organizer: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

/** Authenticated user profile */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
}

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T;
  total?: number;
  error?: string;
  message?: string;
}

/** Employee form data for create/edit */
export interface EmployeeFormData {
  name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  status: string;
}

/** Asset form data for create/edit */
export interface AssetFormData {
  name: string;
  type: string;
  location: string;
  department: string;
  capacity: number;
  status: string;
}

/** Booking form data */
export interface BookingFormData {
  room_id: string;
  title: string;
  organizer: string;
  date: string;
  start_time: string;
  end_time: string;
  note: string;
}
