import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Club } from '../types';
import { Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { db } from '../services/mockData';

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  
  // Role Specific Fields
  const [studentYear, setStudentYear] = useState('1st Year');
  const [department, setDepartment] = useState('');
  
  // Lead Fields
  const [clubName, setClubName] = useState('');
  const [clubCategory, setClubCategory] = useState('Technology');
  
  // Faculty Fields
  const [mentoredClub, setMentoredClub] = useState('');
  const [availableClubs, setAvailableClubs] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Load clubs available for mentorship (Max 2 mentors rule)
  useEffect(() => {
    const clubs = db.clubs.getAll();
    const available = clubs.filter(c => {
      const count = db.users.getMentorCountForClub(c.name);
      return count < 2;
    }).map(c => c.name);
    
    setAvailableClubs(available);
    if (available.length > 0) setMentoredClub(available[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      // Pack extra data into a generic object to pass to Supabase metadata
      let extraData: any = {};
      
      if (role === UserRole.STUDENT) {
        extraData = { studentYear, department };
      } else if (role === UserRole.CLUB_LEAD) {
        extraData = { clubName, clubCategory, studentYear, department }; 
      } else if (role === UserRole.ADMIN) {
        extraData = { mentoredClub, department };
      }

      const { error, session } = await signUp(email, password, name, role, extraData);
      
      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('Too many requests')) {
          setError("Email rate limit exceeded (Supabase Free Tier). Please use the 'Demo Access' buttons on the Login page to test the app features without signing up.");
        } else {
          setError(error.message);
        }
      } else {
        // --- MOCK DATA SYNC ---
        // If Role is Club Lead, immediately create the club in mock DB
        // Status is PENDING so Faculty can approve it
        if (role === UserRole.CLUB_LEAD && session?.user) {
            const newClub: Club = {
                id: `c-${Date.now()}`,
                name: clubName,
                description: `Official club for ${clubCategory} enthusiasts.`,
                category: clubCategory,
                leadId: session.user.id,
                image: `https://picsum.photos/seed/${clubName}/800/400`,
                members: [session.user.id],
                pendingMembers: [],
                status: 'PENDING' 
            };
            db.clubs.add(newClub);
        }

        if (!session) {
          setSuccessMsg("Account created! Please check your email.");
          setEmail('');
          setPassword('');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Join UniClubs</h1>
          <p className="mt-2 text-gray-600">Find your community on campus</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            <div className="flex items-start">
              <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">{error}</p>
                {error.includes('rate limit') && (
                  <Link to="/login" className="mt-2 inline-flex items-center text-red-700 underline hover:text-red-800">
                    Go to Login for Demo Access <ArrowRight size={14} className="ml-1" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                placeholder="John Doe"
              />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                  placeholder="e.g. Computer Science"
                />
              </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
              placeholder="student@uni.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {[UserRole.STUDENT, UserRole.CLUB_LEAD, UserRole.ADMIN].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                    role === r 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {r === 'ADMIN' ? 'Faculty' : r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Fields based on Role */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4 animate-fade-in">
            {role === UserRole.STUDENT && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <select
                  value={studentYear}
                  onChange={(e) => setStudentYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
            )}

            {role === UserRole.CLUB_LEAD && (
              <>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <select
                      value={studentYear}
                      onChange={(e) => setStudentYear(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                  <input
                    type="text"
                    required
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                    placeholder="e.g. The Coding Club"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={clubCategory}
                    onChange={(e) => setClubCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Arts">Arts</option>
                    <option value="Singing">Singing</option>
                    <option value="Films">Films</option>
                    <option value="Dance">Dance</option>
                  </select>
                </div>
              </>
            )}

            {role === UserRole.ADMIN && (
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club to Mentor</label>
                  {availableClubs.length > 0 ? (
                    <select
                        value={mentoredClub}
                        onChange={(e) => setMentoredClub(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white text-gray-900"
                    >
                        {availableClubs.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                  ) : (
                    <div className="p-2 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
                        No clubs currently need mentors or all slots are full.
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Select an existing club. Max 2 mentors per club.</p>
                </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors flex justify-center items-center disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
