import { User, Club, Event, UserRole, Notification } from '../types';

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Alice Student',
    email: 'alice@uni.edu',
    role: UserRole.STUDENT,
    avatar: 'https://picsum.photos/id/64/100/100',
    joinedClubs: ['c1'],
    studentYear: '2nd Year',
    department: 'Computer Science'
  },
  {
    id: 'u2',
    name: 'Bob Lead',
    email: 'bob@uni.edu',
    role: UserRole.CLUB_LEAD,
    avatar: 'https://picsum.photos/id/65/100/100',
    joinedClubs: ['c1'],
    studentYear: '3rd Year',
    department: 'Arts'
  },
  {
    id: 'u3',
    name: 'Dr. Carol Admin',
    email: 'carol@uni.edu',
    role: UserRole.ADMIN,
    avatar: 'https://picsum.photos/id/66/100/100',
    joinedClubs: [],
    mentoredClub: 'Tech Innovators'
  },
  {
    id: 'u4',
    name: 'David Freshman',
    email: 'david@uni.edu',
    role: UserRole.STUDENT,
    avatar: 'https://picsum.photos/id/70/100/100',
    joinedClubs: [],
    studentYear: '1st Year',
    department: 'Physics'
  }
];

const MOCK_CLUBS: Club[] = [
  {
    id: 'c1',
    name: 'Tech Innovators',
    description: 'A community for coding enthusiasts and hackathon lovers.',
    category: 'Technology',
    leadId: 'u2',
    image: 'https://picsum.photos/id/0/800/400',
    members: ['u1', 'u2'],
    pendingMembers: ['u4'], // Pending request
    status: 'APPROVED'
  },
  {
    id: 'c2',
    name: 'Uni Photography',
    description: 'Capture the moments that matter. Workshops every week.',
    category: 'Arts',
    leadId: 'u99', 
    image: 'https://picsum.photos/id/250/800/400',
    members: [],
    pendingMembers: [],
    status: 'APPROVED'
  },
  {
    id: 'c3',
    name: 'Rhythm Soul',
    description: 'For those who love to move. Contemporary and classical dance.',
    category: 'Dance',
    leadId: 'u5',
    image: 'https://picsum.photos/id/158/800/400',
    members: [],
    pendingMembers: [],
    status: 'APPROVED'
  },
  {
    id: 'c4',
    name: 'Future Entrepreneurs',
    description: 'Networking and startup pitching sessions.',
    category: 'Business',
    leadId: 'u_temp', 
    image: 'https://picsum.photos/id/20/800/400',
    members: ['u_temp'],
    pendingMembers: [],
    status: 'PENDING'
  }
];

const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    clubId: 'c1',
    title: 'Semester Hackathon',
    description: '24-hour coding challenge. Prizes up to $500.',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    location: 'Main Auditorium',
    attendees: ['u1']
  },
  {
    id: 'e2',
    clubId: 'c2',
    title: 'Campus Photo Walk',
    description: 'Guided tour around campus to find the best spots.',
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    location: 'North Gate',
    attendees: []
  }
];

// LocalStorage Keys
const KEYS = {
  USERS: 'uniclubs_users',
  CLUBS: 'uniclubs_clubs',
  EVENTS: 'uniclubs_events',
  CURRENT_USER: 'uniclubs_current_user'
};

// Initialize Data if empty
export const initializeData = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
    localStorage.setItem(KEYS.CLUBS, JSON.stringify(MOCK_CLUBS));
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(MOCK_EVENTS));
  }
};

// Data Access Layer
export const getData = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const setData = <T,>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const db = {
  users: {
    getAll: () => getData<User>(KEYS.USERS),
    get: (id: string) => getData<User>(KEYS.USERS).find(u => u.id === id),
    // Helper to count how many mentors a club has
    getMentorCountForClub: (clubName: string) => {
      const users = getData<User>(KEYS.USERS);
      return users.filter(u => u.role === UserRole.ADMIN && u.mentoredClub === clubName).length;
    }
  },
  clubs: {
    getAll: () => getData<Club>(KEYS.CLUBS),
    add: (club: Club) => {
        const clubs = getData<Club>(KEYS.CLUBS);
        clubs.push(club);
        setData(KEYS.CLUBS, clubs);
    },
    update: (updatedClub: Club) => {
      const clubs = getData<Club>(KEYS.CLUBS);
      const index = clubs.findIndex(c => c.id === updatedClub.id);
      if (index >= 0) {
        clubs[index] = updatedClub;
        setData(KEYS.CLUBS, clubs);
      } else {
        clubs.push(updatedClub);
        setData(KEYS.CLUBS, clubs);
      }
    },
    remove: (clubId: string) => {
      let clubs = getData<Club>(KEYS.CLUBS);
      clubs = clubs.filter(c => c.id !== clubId);
      setData(KEYS.CLUBS, clubs);
    },
    joinRequest: (clubId: string, userId: string) => {
      const clubs = getData<Club>(KEYS.CLUBS);
      const club = clubs.find(c => c.id === clubId);
      if (club && !club.members.includes(userId) && !club.pendingMembers.includes(userId)) {
        club.pendingMembers.push(userId);
        setData(KEYS.CLUBS, clubs);
        return true;
      }
      return false;
    },
    approveMember: (clubId: string, userId: string) => {
      const clubs = getData<Club>(KEYS.CLUBS);
      const club = clubs.find(c => c.id === clubId);
      if (club) {
        club.pendingMembers = club.pendingMembers.filter(id => id !== userId);
        club.members.push(userId);
        setData(KEYS.CLUBS, clubs);
        
        // Update user joinedClubs
        const users = getData<User>(KEYS.USERS);
        const user = users.find(u => u.id === userId);
        if (user) {
          if (!user.joinedClubs.includes(clubId)) user.joinedClubs.push(clubId);
          setData(KEYS.USERS, users);
        }
        return true;
      }
      return false;
    },
    rejectMember: (clubId: string, userId: string) => {
      const clubs = getData<Club>(KEYS.CLUBS);
      const club = clubs.find(c => c.id === clubId);
      if (club) {
        club.pendingMembers = club.pendingMembers.filter(id => id !== userId);
        setData(KEYS.CLUBS, clubs);
        return true;
      }
      return false;
    }
  },
  events: {
    getAll: () => getData<Event>(KEYS.EVENTS),
    add: (event: Event) => {
      const events = getData<Event>(KEYS.EVENTS);
      events.push(event);
      setData(KEYS.EVENTS, events);
    },
    update: (updatedEvent: Event) => {
      const events = getData<Event>(KEYS.EVENTS);
      const index = events.findIndex(e => e.id === updatedEvent.id);
      if (index >= 0) {
        events[index] = updatedEvent;
        setData(KEYS.EVENTS, events);
      }
    }
  },
  currentUser: {
    get: () => {
      const u = localStorage.getItem(KEYS.CURRENT_USER);
      return u ? JSON.parse(u) : null;
    },
    set: (user: User | null) => {
      if (user) localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      else localStorage.removeItem(KEYS.CURRENT_USER);
    }
  }
};
