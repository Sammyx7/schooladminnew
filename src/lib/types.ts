
export type UserRole = 'admin' | 'student' | 'staff';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  children?: NavItem[];
}

// Add more shared types here as needed
