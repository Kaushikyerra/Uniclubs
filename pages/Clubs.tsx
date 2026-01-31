import React, { useState } from 'react';
import { Club, User } from '../types';
import { db } from '../services/mockData';
import { Search, Plus, Tag, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClubsProps {
  user: User;
}

export const Clubs: React.FC<ClubsProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const clubs = db.clubs.getAll();
  
  const categories = ['All', ...Array.from(new Set(clubs.map(c => c.category)))];

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">University Clubs</h1>
          <p className="text-gray-500 mt-1">Discover communities that share your passion.</p>
        </div>
        {user.role === 'ADMIN' && (
          <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
            <Plus size={18} />
            <span>Approve New Club</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search clubs..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map(club => (
          <Link key={club.id} to={`/clubs/${club.id}`} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={club.image} 
                alt={club.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-bold text-primary shadow-sm uppercase tracking-wide">
                  {club.category}
                </span>
              </div>
              {club.status === 'PENDING' && (
                 <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow-sm">
                   PENDING
                 </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{club.name}</h3>
              <p className="text-gray-500 text-sm mt-2 line-clamp-2 h-10">{club.description}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-sm">
                <div className="flex items-center text-gray-500">
                  <Users size={16} className="mr-1" />
                  <span>{club.members.length} Members</span>
                </div>
                {user.joinedClubs.includes(club.id) ? (
                  <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">Joined</span>
                ) : (
                  <span className="text-primary font-medium group-hover:translate-x-1 transition-transform inline-block">View Details &rarr;</span>
                )}
              </div>
            </div>
          </Link>
        ))}
        {filteredClubs.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No clubs found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};