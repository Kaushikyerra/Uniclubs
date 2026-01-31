import React, { useState } from 'react';
import { Event, User, UserRole } from '../types';
import { db } from '../services/mockData';
import { MapPin, Calendar as CalIcon, Users, X, Check, Plus, Save, Eye, User as UserIcon } from 'lucide-react';

interface EventsProps {
  user: User;
}

export const Events: React.FC<EventsProps> = ({ user }) => {
  const [events, setEvents] = useState(db.events.getAll());
  
  // Registration State
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegForm, setShowRegForm] = useState(false);
  const [dietaryReq, setDietaryReq] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Attendee View State (Lead Only)
  const [showAttendeeModal, setShowAttendeeModal] = useState(false);
  const [currentAttendees, setCurrentAttendees] = useState<User[]>([]);
  const [viewingEventTitle, setViewingEventTitle] = useState('');

  // Create Event State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
      title: '',
      description: '',
      date: '',
      time: '',
      location: ''
  });

  // --- Helper: Show Success Toast ---
  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // --- Registration Logic ---

  const handleRegisterClick = (event: Event) => {
    setSelectedEvent(event);
    setShowRegForm(true);
    setDietaryReq('');
  };

  const confirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (selectedEvent.attendees.includes(user.id)) {
        setShowRegForm(false);
        return;
    }

    const updatedEvent = { ...selectedEvent, attendees: [...selectedEvent.attendees, user.id] };

    // Update local state
    setEvents(events.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev));
    
    // In real app, persist this
    db.events.update(updatedEvent);
    
    setShowRegForm(false);
    triggerSuccess(`Successfully registered for ${selectedEvent.title}!`);
    setSelectedEvent(null);
  };

  // --- Lead: View Attendees Logic ---
  const handleViewAttendees = (event: Event) => {
    const allUsers = db.users.getAll();
    const attendees = allUsers.filter(u => event.attendees.includes(u.id));
    setCurrentAttendees(attendees);
    setViewingEventTitle(event.title);
    setShowAttendeeModal(true);
  };

  // --- Create Event Logic (Club Lead) ---

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find club managed by this lead
    const myClub = db.clubs.getAll().find(c => c.leadId === user.id);
    if (!myClub) {
        alert("You must lead a club to post an event.");
        return;
    }

    const fullDate = new Date(`${newEvent.date}T${newEvent.time}`);

    const eventToCreate: Event = {
        id: `e-${Date.now()}`,
        clubId: myClub.id,
        title: newEvent.title,
        description: newEvent.description,
        date: fullDate.toISOString(),
        location: newEvent.location,
        attendees: []
    };

    db.events.add(eventToCreate);
    setEvents(db.events.getAll());
    setShowCreateForm(false);
    setNewEvent({ title: '', description: '', date: '', time: '', location: '' });
    triggerSuccess("Event created successfully!");
  };

  return (
    <div className="space-y-8 relative">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-bounce-in">
          <CheckCircleIcon className="mr-2" size={20} />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Campus Events</h1>
            <p className="text-gray-500">Don't miss out on what's happening around you.</p>
        </div>
        {user.role === UserRole.CLUB_LEAD && (
            <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
            >
                <Plus size={18} />
                <span>Create Event</span>
            </button>
        )}
      </div>

      <div className="space-y-4">
        {events.map(event => {
          const isRegistered = event.attendees.includes(user.id);
          const club = db.clubs.getAll().find(c => c.id === event.clubId);
          // Check if current user is the lead of this specific event's club
          const isLeadForThisEvent = user.role === UserRole.CLUB_LEAD && club?.leadId === user.id;

          return (
            <div key={event.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-24 bg-primary/5 rounded-lg border border-primary/10 py-4 md:py-0">
                 <span className="text-primary font-bold text-xl">{new Date(event.date).getDate()}</span>
                 <span className="text-primary/70 text-sm uppercase font-semibold">{new Date(event.date).toLocaleDateString('en-US', {month: 'short'})}</span>
              </div>
              
              <div className="flex-1 space-y-2">
                 <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">{club?.name || 'Unknown Club'}</span>
                    {isRegistered && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Registered</span>}
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                 <p className="text-gray-600 text-sm">{event.description}</p>
                 <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                    <div className="flex items-center"><CalIcon size={14} className="mr-1.5"/> {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="flex items-center"><MapPin size={14} className="mr-1.5"/> {event.location}</div>
                    <div className="flex items-center"><Users size={14} className="mr-1.5"/> {event.attendees.length} attending</div>
                 </div>
              </div>

              <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                 <button 
                  onClick={() => !isRegistered && handleRegisterClick(event)}
                  disabled={isRegistered}
                  className={`w-full px-6 py-2.5 rounded-lg font-medium transition-all ${
                    isRegistered 
                    ? 'bg-gray-100 text-gray-400 cursor-default' 
                    : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30'
                  }`}
                 >
                   {isRegistered ? 'Registered' : 'Register Now'}
                 </button>

                 {/* View Attendees Button (Only for the Lead of this club) */}
                 {isLeadForThisEvent && (
                    <button 
                        onClick={() => handleViewAttendees(event)}
                        className="w-full px-6 py-2 rounded-lg font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center text-sm"
                    >
                        <Eye size={16} className="mr-2" /> Attendees
                    </button>
                 )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal Form */}
      {showRegForm && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="text-lg font-bold text-gray-900">Event Registration</h3>
               <button onClick={() => setShowRegForm(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={20} />
               </button>
            </div>
            
            <form onSubmit={confirmRegistration} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Event</label>
                  <div className="text-gray-900 font-bold text-lg">{selectedEvent.title}</div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Participant</label>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">{user.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Year</label>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700">{user.studentYear || 'N/A'}</div>
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Requirements (Optional)</label>
                 <input 
                    type="text" 
                    value={dietaryReq}
                    onChange={(e) => setDietaryReq(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900" 
                    placeholder="e.g. Vegetarian, Gluten-free"
                 />
               </div>

               <div className="flex items-start space-x-2 pt-2">
                 <input type="checkbox" required id="agree" className="mt-1" />
                 <label htmlFor="agree" className="text-xs text-gray-500">I agree to the event code of conduct.</label>
               </div>

               <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 mt-4 flex justify-center items-center">
                 <Check size={18} className="mr-2" /> Confirm Registration
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal (Leads Only) */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="text-lg font-bold text-gray-900">Create New Event</h3>
               <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                    <input 
                        type="text" 
                        required 
                        value={newEvent.title}
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900" 
                        placeholder="e.g. Weekly Workshop"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                        required 
                        value={newEvent.description}
                        onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900 h-24 resize-none" 
                        placeholder="Details about the event..."
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input 
                            type="date" 
                            required 
                            value={newEvent.date}
                            onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input 
                            type="time" 
                            required 
                            value={newEvent.time}
                            onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900" 
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                        type="text" 
                        required 
                        value={newEvent.location}
                        onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900" 
                        placeholder="e.g. Room 304, Main Hall"
                    />
                </div>

                <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 mt-4 flex justify-center items-center">
                    <Save size={18} className="mr-2" /> Publish Event
                </button>
            </form>
          </div>
        </div>
      )}

      {/* View Attendees Modal */}
      {showAttendeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <div>
                   <h3 className="text-lg font-bold text-gray-900">Registered Attendees</h3>
                   <p className="text-xs text-gray-500">{viewingEventTitle}</p>
               </div>
               <button onClick={() => setShowAttendeeModal(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={20} />
               </button>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1">
                {currentAttendees.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No registrations yet.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {currentAttendees.map(attendee => (
                            <div key={attendee.id} className="p-4 flex items-center space-x-3 hover:bg-gray-50">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    {attendee.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{attendee.name}</p>
                                    <p className="text-xs text-gray-500">{attendee.email}</p>
                                    <p className="text-xs text-gray-400">{attendee.studentYear} • {attendee.department}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button onClick={() => setShowAttendeeModal(false)} className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                    Close List
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
