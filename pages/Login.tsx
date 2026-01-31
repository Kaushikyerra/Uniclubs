import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { GraduationCap, Loader2, AlertCircle, Shield, User, Users } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, loginWithDemo, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      // Always redirect to Dashboard first for all roles (including Admin/Faculty)
      // to show the overview. Management is accessed via sidebar.
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } 
    // Navigation is handled by useEffect
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">UniClubs</h1>
          <p className="mt-2 text-gray-600">Sign in to your university account</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center text-sm">
            <AlertCircle size={16} className="mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors flex justify-center items-center disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/signup" className="text-primary font-bold hover:underline">
            Sign Up
          </Link>
        </div>

        {/* Demo Access Section - To bypass Supabase Rate Limits */}
        <div className="pt-6 mt-6 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase text-center mb-4">
            Developer / Demo Access
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => loginWithDemo(UserRole.STUDENT)}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <User size={20} className="text-blue-500 mb-1" />
              <span className="text-xs font-medium text-gray-600">Student</span>
            </button>
            <button 
               onClick={() => loginWithDemo(UserRole.CLUB_LEAD)}
               className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <Users size={20} className="text-emerald-500 mb-1" />
              <span className="text-xs font-medium text-gray-600">Lead</span>
            </button>
            <button 
               onClick={() => loginWithDemo(UserRole.ADMIN)}
               className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <Shield size={20} className="text-purple-500 mb-1" />
              <span className="text-xs font-medium text-gray-600">Faculty</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};