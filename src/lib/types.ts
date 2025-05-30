
export type UserRole = 'admin' | 'student' | 'staff';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  children?: NavItem[];
}

// Student Dashboard Specific Types
export interface StudentProfile {
  name: string;
  avatarUrl: string;
  studentId: string;
  classSection: string;
}

export interface PendingFee {
  amount: string;
  dueDate: string;
  status: 'pending' | 'none' | 'overdue';
}

export interface NextClass {
  subject: string;
  time: string;
  teacher: string;
}

export interface StudentNotification {
  id: number;
  type: 'circular' | 'fee' | 'report' | 'event' | 'general';
  title: string;
  date: string;
  href: string;
  read?: boolean;
}

export interface QuickLink {
  title: string;
  href: string;
  icon: React.ElementType; // LucideIcon
  description: string;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  pendingFees: PendingFee;
  nextClass: NextClass;
  notifications: StudentNotification[];
}

// Add more shared types here as needed
