import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Club, User, UserRole } from '../types';
import { db } from '../services/mockData';
import { generateClubDescription } from '../services/geminiService';
import { Users, Calendar, Mail, Edit3, Wand2, Check, Save, Clock } from 'lucide-react';

interface ClubDetailProps {
  user: User;
}

export const ClubDetail: React.FC<ClubDetailProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const foundClub = db.clubs.getAll().find(c => c.id === id);
    if (foundClub) {
      setClub(foundClub);
      setEditDesc(foundClub.description);
    } else {
      navigate('/clubs');
    }
  }, [id, navigate]);

  if (!club) return null;

  const isLead = user.id === club.leadId || user.role === UserRole.ADMIN;
  const isMember = club.members.includes(user.id);
  const isPending = club.pendingMembers?.includes(user.id);

  const handleJoin = () => {
    if (isMember || isPending) return;
    
    // Send request logic
    db.clubs.joinRequest(club.id, user.id);
    
    // Update local state to show pending immediately
    const updatedClub = { ...club, pendingMembers: [...(club.pendingMembers || []), user.id] };
    setClub(updatedClub);
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    const newDesc = await generateClubDescription(club.name, club.category, "university students, fun, learning");
    setEditDesc(newDesc);
    setIsGenerating(false);
  };

  const saveDescription = () => {
    const updatedClub = { ...club, description: editDesc };
    setClub(updatedClub);
    db.clubs.update(updatedClub);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-sm">
        <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
          <div className="text-white w-full flex justify-between items-end">
            <div>
              <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded uppercase mb-2 inline-block">
                {club.category}
              </span>
              <h1 className="text-4xl font-bold">{club.name}</h1>
            </div>
            {!isLead && !isMember && !isPending && (
              <button 
                onClick={handleJoin}
                className="px-6 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Request to Join
              </button>
            )}
            {!isLead && isPending && (
              <button disabled className="px-6 py-3 bg-yellow-400 text-yellow-900 font-bold rounded-lg cursor-default flex items-center">
                <Clock size={18} className="mr-2" /> Pending Approval
              </button>
            )}
             {!isLead && isMember && (
              <button disabled className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg cursor-default flex items-center">
                <Check size={18} className="mr-2" /> Member
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">About Us</h2>
              {isLead && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-primary text-sm font-medium flex items-center hover:underline">
                  <Edit3 size={14} className="mr-1" /> Edit
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                 <textarea 
                   className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                   value={editDesc}
                   onChange={(e) => setEditDesc(e.target.value)}
                 />
                 <div className="flex space-x-2">
                    <button 
                      onClick={saveDescription}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium flex items-center"
                    >
                      <Save size={14} className="mr-2" /> Save
                    </button>
                    <button 
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium flex items-center hover:bg-purple-200"
                    >
                      {isGenerating ? <span className="animate-spin mr-2">⏳</span> : <Wand2 size={14} className="mr-2" />}
                      Generate with AI
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700"
                    >
                      Cancel
                    </button>
                 </div>
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed">{club.description}</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Members</h2>
            <div className="flex items-center space-x-2">
               <div className="flex -space-x-2">
                  {club.members.slice(0, 5).map((m, i) => (
                    <img key={i} src={`https://picsum.photos/seed/${m}/40/40`} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" alt="member" />
                  ))}
               </div>
               <span className="text-gray-500 text-sm ml-2">
                 {club.members.length > 5 ? `+${club.members.length - 5} others` : 'are part of this club'}
               </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Club Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                 <Users className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                 <div>
                   <span className="block text-sm font-medium text-gray-900">Lead</span>
                   <span className="text-sm text-gray-500">{db.users.get(club.leadId)?.name || 'Unknown'}</span>
                 </div>
              </li>
              <li className="flex items-start">
                 <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                 <div>
                   <span className="block text-sm font-medium text-gray-900">Contact</span>
                   <span className="text-sm text-gray-500">contact@{club.name.replace(/\s/g, '').toLowerCase()}.uni.edu</span>
                 </div>
              </li>
              <li className="flex items-start">
                 <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                 <div>
                   <span className="block text-sm font-medium text-gray-900">Founded</span>
                   <span className="text-sm text-gray-500">Sept 2023</span>
                 </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
