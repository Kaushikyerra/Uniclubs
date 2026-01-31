import React, { useState } from 'react';
import { db } from '../services/mockData';
import { Club, User } from '../types';
import { Check, X, Shield, Search, Trash2, AlertTriangle, Send } from 'lucide-react';

export const AdminManagement: React.FC = () => {
  const [clubs, setClubs] = useState(db.clubs.getAll());
  const [users, setUsers] = useState(db.users.getAll());
  const [activeTab, setActiveTab] = useState<'approvals' | 'users' | 'announcements'>('approvals');
  const [searchTerm, setSearchTerm] = useState('');
  const [announcement, setAnnouncement] = useState('');

  const pendingClubs = clubs.filter(c => c.status === 'PENDING');

  const handleApproveClub = (club: Club) => {
    const updated = { ...club, status: 'APPROVED' as const };
    db.clubs.update(updated);
    setClubs(db.clubs.getAll());
  };

  const handleRejectClub = (clubId: string) => {
    // In a real app we might delete or mark rejected. 
    // Since mockData doesn't fully support delete cleanly, we used our new remove method
    db.clubs.remove(clubId);
    setClubs(db.clubs.getAll());
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
              <p className="text-gray-500">System control panel for University Faculty.</p>
          </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
           <button
             onClick={() => setActiveTab('approvals')}
             className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
               activeTab === 'approvals' 
                 ? 'border-primary text-primary' 
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             Club Approvals
             {pendingClubs.length > 0 && (
               <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">{pendingClubs.length}</span>
             )}
           </button>
           <button
             onClick={() => setActiveTab('users')}
             className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'users' 
                 ? 'border-primary text-primary' 
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             User Directory
           </button>
           <button
             onClick={() => setActiveTab('announcements')}
             className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
               activeTab === 'announcements' 
                 ? 'border-primary text-primary' 
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             Announcements
           </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'approvals' && (
           <div className="space-y-4">
              {pendingClubs.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                      <p className="text-gray-500">No pending club requests at this time.</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 gap-4">
                      {pendingClubs.map(club => (
                          <div key={club.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                              <div className="flex items-start space-x-4">
                                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                      <img src={club.image} className="w-full h-full object-cover" alt="" />
                                  </div>
                                  <div>
                                      <h3 className="text-lg font-bold text-gray-900">{club.name}</h3>
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">{club.category}</span>
                                      <p className="text-gray-600 text-sm mt-2">{club.description}</p>
                                      <p className="text-xs text-gray-500 mt-2">
                                        Proposed by: <span className="font-medium text-gray-700">{db.users.get(club.leadId)?.name || 'Unknown'}</span>
                                      </p>
                                  </div>
                              </div>
                              <div className="flex items-center space-x-3 self-end md:self-center">
                                  <button 
                                    onClick={() => handleRejectClub(club.id)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center"
                                  >
                                      <X size={18} className="mr-2"/> Reject
                                  </button>
                                  <button 
                                    onClick={() => handleApproveClub(club)}
                                    className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-sm flex items-center"
                                  >
                                      <Check size={18} className="mr-2"/> Approve Club
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
           </div>
        )}

        {activeTab === 'users' && (
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search by name or email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full bg-gray-300" src={user.avatar} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'CLUB_LEAD' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.department || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        Active
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'announcements' && (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                        <Send size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Post System Announcement</h3>
                        <p className="text-sm text-gray-500">Notify all students and club leads.</p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <textarea 
                        className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none h-32 resize-none"
                        placeholder="Type your message here..."
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                    ></textarea>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded">
                            <AlertTriangle size={14} className="mr-1" />
                            This will appear on everyone's dashboard.
                        </div>
                        <button 
                            disabled={!announcement}
                            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            onClick={() => {
                                alert("Announcement posted (Mock)");
                                setAnnouncement('');
                            }}
                        >
                            Post Message
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
