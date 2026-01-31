import React, { useState } from 'react';
import { User, UserRole, Club } from '../types';
import { db } from '../services/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, Star, ArrowRight, Check, X, Bell, TrendingUp, Activity, ListChecks, ShieldCheck, ClipboardCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

// --- SUB-COMPONENTS FOR DASHBOARD ROLES ---

const StudentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const allEvents = db.events.getAll();
  const allClubs = db.clubs.getAll();
  
  // General Upcoming Events (excluding ones user is already going to, or just generic top 3)
  const upcomingEvents = allEvents
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // User's Registered Events
  const myRegisteredEvents = allEvents
    .filter(e => e.attendees.includes(user.id) && new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const myClubs = allClubs.filter(c => user.joinedClubs.includes(c.id));
  const suggestedClubs = allClubs.filter(c => !user.joinedClubs.includes(c.id)).slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-indigo-100">You are a {user.studentYear} student in {user.department || 'General'}. Ready to explore?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
            {/* My Registered Events - Only show if there are any */}
            {myRegisteredEvents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                        <Calendar className="mr-2 text-emerald-600" size={20}/> My Schedule
                        </h2>
                        <Link to="/events" className="text-sm text-emerald-600 hover:underline font-medium">Manage</Link>
                    </div>
                    <div className="space-y-3">
                        {myRegisteredEvents.map(e => (
                        <div key={e.id} className="flex gap-4 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                            <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                <span className="text-xs font-bold uppercase">{new Date(e.date).toLocaleDateString('en-US', {month: 'short'})}</span>
                                <span className="text-lg font-bold leading-none">{new Date(e.date).getDate()}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-1 text-sm">{e.title}</h3>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <span className="mr-3">{new Date(e.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span className="flex items-center"><MapPin size={10} className="mr-1"/> {e.location}</span>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Events (General) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <TrendingUp className="mr-2 text-primary" size={20}/> Campus Events
                </h2>
                <Link to="/events" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
                {upcomingEvents.map(e => (
                <div key={e.id} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-primary">
                        <span className="text-xs font-bold uppercase">{new Date(e.date).toLocaleDateString('en-US', {month: 'short'})}</span>
                        <span className="text-xl font-bold">{new Date(e.date).getDate()}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 line-clamp-1">{e.title}</h3>
                        <p className="text-xs text-gray-500">{e.location}</p>
                        <Link to="/events" className="text-xs text-primary font-medium mt-1 inline-block">Register &rarr;</Link>
                    </div>
                </div>
                ))}
                {upcomingEvents.length === 0 && <p className="text-gray-400 text-sm">No upcoming events.</p>}
            </div>
            </div>
        </div>

        {/* My Clubs & Suggestions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="mr-2 text-emerald-500" size={20}/> My Clubs
             </h2>
             {myClubs.length > 0 ? (
               <div className="flex gap-2 overflow-x-auto pb-2">
                 {myClubs.map(c => (
                   <Link key={c.id} to={`/clubs/${c.id}`} className="flex-shrink-0 w-24 text-center group">
                      <img src={c.image} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover border-2 border-transparent group-hover:border-primary transition-all" alt={c.name} />
                      <p className="text-xs font-medium text-gray-700 truncate">{c.name}</p>
                   </Link>
                 ))}
               </div>
             ) : (
               <div className="text-center py-4 bg-gray-50 rounded-lg">
                 <p className="text-sm text-gray-500">You haven't joined any clubs yet.</p>
                 <Link to="/clubs" className="text-sm font-bold text-primary mt-2 inline-block">Browse Clubs</Link>
               </div>
             )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Star className="mr-2 text-yellow-500" size={20}/> Recommended for You
            </h2>
            <div className="space-y-3">
              {suggestedClubs.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                      <img src={c.image} alt="" className="w-full h-full object-cover"/>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.category}</p>
                    </div>
                  </div>
                  <Link to={`/clubs/${c.id}`} className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full font-medium hover:bg-gray-100">View</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeadDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [clubs, setClubs] = useState(db.clubs.getAll());
  const myManagedClub = clubs.find(c => c.leadId === user.id) || clubs[0]; 
  
  // Data Calculation
  const pendingUserIds = myManagedClub?.pendingMembers || [];
  const pendingUsers = db.users.getAll().filter(u => pendingUserIds.includes(u.id));
  const memberIds = myManagedClub?.members || [];
  const members = db.users.getAll().filter(u => memberIds.includes(u.id));
  const myEvents = db.events.getAll().filter(e => e.clubId === myManagedClub?.id);

  // Department Stats (Bar Chart)
  const departments: Record<string, number> = {};
  members.forEach(m => {
      const dept = m.department || 'General';
      departments[dept] = (departments[dept] || 0) + 1;
  });
  // Add fake data for visualization if empty
  if (members.length < 5) {
      departments['Computer Science'] = 15;
      departments['Physics'] = 8;
      departments['Arts'] = 12;
      departments['Business'] = 5;
  }
  const deptData = Object.keys(departments).map(k => ({ name: k, value: departments[k] }));

  const handleApprove = (userId: string) => {
    db.clubs.approveMember(myManagedClub.id, userId);
    setClubs(db.clubs.getAll());
  };

  const handleReject = (userId: string) => {
    db.clubs.rejectMember(myManagedClub.id, userId);
    setClubs(db.clubs.getAll());
  };

  if (!myManagedClub) return <div>You are not assigned to any club yet.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{myManagedClub.name} Dashboard</h1>
          <p className="text-gray-500">Managing: <span className="font-semibold text-primary">{myManagedClub.category}</span></p>
        </div>
        <Link to={`/clubs/${myManagedClub.id}`} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
          View Public Page
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Users size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Calendar size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Events</p>
                <p className="text-2xl font-bold text-gray-900">{myEvents.length}</p>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                <Bell size={24} />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals Widget */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-gray-900 flex items-center">
               <ListChecks className="mr-2 text-gray-400" size={20}/> Membership Requests
             </h2>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-96">
            {pendingUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <img src={u.avatar} className="w-10 h-10 rounded-full bg-gray-200" alt="" />
                  <div>
                    <p className="font-bold text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.studentYear} • {u.department}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleApprove(u.id)}
                    className="flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-200 transition-colors" title="Approve">
                    <Check size={14} className="mr-1" /> Approve
                  </button>
                  <button 
                    onClick={() => handleReject(u.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" title="Reject">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
            {pendingUsers.length === 0 && (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CheckCircleIcon size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No pending membership requests.</p>
              </div>
            )}
          </div>
        </div>

        {/* Member Demographics Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="mr-2 text-gray-400" size={20} /> Member Demographics
          </h2>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10}} />
                    <Tooltip cursor={{fill: '#F3F4F6'}} />
                    <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
               </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Distribution by Department</p>
        </div>
      </div>
      
      {/* Quick Event Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-gray-900">Upcoming Club Events</h2>
             <Link to="/events" className="text-primary text-sm font-bold hover:underline">Manage Events</Link>
          </div>
          {myEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myEvents.map(e => (
                      <div key={e.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors bg-gray-50">
                          <div className="text-xs font-bold text-primary uppercase mb-1">{new Date(e.date).toLocaleDateString()}</div>
                          <h3 className="font-bold text-gray-900">{e.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{e.attendees.length} Attendees registered</p>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No upcoming events scheduled. <Link to="/events" className="text-primary underline">Create one now.</Link>
              </div>
          )}
      </div>
    </div>
  );
};

const FacultyDashboard: React.FC<{ user: User }> = ({ user }) => {
  const clubs = db.clubs.getAll();
  // Find clubs that are pending approval
  const pendingClubs = clubs.filter(c => c.status === 'PENDING');
  // Find the club this faculty mentors
  const mentoredClub = clubs.find(c => c.name === user.mentoredClub);
  const mentoredEvents = mentoredClub ? db.events.getAll().filter(e => e.clubId === mentoredClub.id) : [];

  // Metrics
  const totalStudents = db.users.getAll().filter(u => u.role === UserRole.STUDENT).length;
  const totalClubs = clubs.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold mb-2">Faculty Overview</h1>
           <p className="text-gray-300">Welcome, {user.name}. Here is your university activity summary.</p>
        </div>
        <Link to="/admin" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold backdrop-blur-sm transition-colors flex items-center border border-white/10">
           <ShieldCheck size={18} className="mr-2" />
           Admin Management
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-2">
                 <h3 className="text-gray-500 text-sm font-medium uppercase">Pending Approvals</h3>
                 <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><ClipboardCheck size={20}/></div>
             </div>
             <p className="text-3xl font-bold text-gray-900">{pendingClubs.length}</p>
             <Link to="/admin" className="text-sm text-primary hover:underline mt-2 inline-block">Review Requests &rarr;</Link>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-2">
                 <h3 className="text-gray-500 text-sm font-medium uppercase">Total Students</h3>
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20}/></div>
             </div>
             <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
             <p className="text-sm text-gray-400 mt-2">Active on platform</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-2">
                 <h3 className="text-gray-500 text-sm font-medium uppercase">Active Clubs</h3>
                 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Star size={20}/></div>
             </div>
             <p className="text-3xl font-bold text-gray-900">{totalClubs}</p>
             <Link to="/clubs" className="text-sm text-primary hover:underline mt-2 inline-block">View Directory &rarr;</Link>
          </div>
      </div>

      {/* Mentored Club Detail */}
      {mentoredClub ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 text-lg flex items-center">
                    <TrendingUp className="mr-2 text-primary" size={20} />
                    Your Mentored Club: <span className="ml-2 text-primary">{mentoredClub.name}</span>
                </h3>
                <Link to={`/clubs/${mentoredClub.id}`} className="text-sm text-gray-600 hover:text-gray-900 font-medium">View Public Page</Link>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">{mentoredClub.members.length}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Club Lead</p>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                             {db.users.get(mentoredClub.leadId)?.name?.charAt(0) || 'L'}
                        </div>
                        <p className="font-medium text-gray-900">{db.users.get(mentoredClub.leadId)?.name || 'Unknown'}</p>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Upcoming Events</p>
                    <p className="text-2xl font-bold text-gray-900">{mentoredEvents.length}</p>
                </div>
             </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <p className="text-gray-500">You are not currently mentoring any club.</p>
        </div>
      )}

      {/* Recent Activities / System Health */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent System Activity</h2>
            <div className="space-y-4">
               {pendingClubs.length > 0 && (
                   <div className="flex items-center p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100">
                        <Bell size={16} className="mr-2" />
                        <span>There are <strong>{pendingClubs.length} new club requests</strong> waiting for approval.</span>
                        <Link to="/admin" className="ml-auto font-bold hover:underline">Review</Link>
                   </div>
               )}
               <div className="flex items-center p-3 bg-gray-50 rounded-lg text-sm border border-gray-100">
                    <Activity size={16} className="mr-2 text-gray-400" />
                    <span className="text-gray-600">System operating normally. Last database backup: 2 hours ago.</span>
               </div>
            </div>
      </div>
    </div>
  );
};

// --- Helper Icon ---
const CheckCircleIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

// --- MAIN COMPONENT ---

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  if (user.role === UserRole.STUDENT) return <StudentDashboard user={user} />;
  if (user.role === UserRole.CLUB_LEAD) return <LeadDashboard user={user} />;
  return <FacultyDashboard user={user} />;
};
