export enum UserRole {
  STUDENT = 'STUDENT',
  CLUB_LEAD = 'CLUB_LEAD',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  joinedClubs: string[]; // Club IDs
  studentYear?: string; // '1st Year', '2nd Year', etc.
  department?: string;
  mentoredClub?: string; // For Faculty
}

export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  leadId: string;
  image: string;
  members: string[]; // User IDs (Approved)
  pendingMembers: string[]; // User IDs (Waiting for approval)
  status: 'PENDING' | 'APPROVED';
}

export interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: string[]; // User IDs
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  date: string;
  read: boolean;
}
