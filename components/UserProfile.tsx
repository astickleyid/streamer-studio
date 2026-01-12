import React, { useState } from 'react';
import { Edit3, Plus, Image, Grid, Heart, Film } from 'lucide-react';

const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('POSTS');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'New User',
    handle: '@username',
    bio: "No bio yet. Click 'Edit Profile' to add one."
  });

  return (
    <div className="flex-1 h-full overflow-y-auto bg-black scrollbar-hide">
      {/* Banner */}
      <div className="h-40 md:h-64 w-full bg-zinc-900 relative group overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1504384308090-c54be3855833?q=80&w=2562&auto=format&fit=crop" 
          alt="Banner" 
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative pb-20">
        {/* Profile Info Header */}
        <div className="-mt-12 md:-mt-20 mb-6 md:mb-8 flex items-end justify-between">
          <div className="relative">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-full bg-zinc-800 border-4 border-black overflow-hidden relative group">
               <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-500">
                 U
               </div>
               {/* Edit Avatar Overlay */}
               <button className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <Edit3 className="text-white" />
               </button>
            </div>
            <button className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-indigo-600 text-white p-1.5 md:p-2 rounded-full border-2 md:border-4 border-black hover:bg-indigo-500 transition-colors">
              <Edit3 size={12} className="md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        {/* User Details */}
        <div className="mb-8">
          {isEditing ? (
            <div className="space-y-4 max-w-md">
              <input 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="text-2xl md:text-3xl font-bold bg-zinc-900 border border-zinc-800 rounded px-2 py-1 w-full text-white focus:outline-none focus:border-indigo-500"
              />
              <input 
                value={profile.handle}
                onChange={(e) => setProfile({...profile, handle: e.target.value})}
                className="text-zinc-400 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 w-full focus:outline-none focus:border-indigo-500"
              />
              <textarea 
                value={profile.bio}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500"
                rows={3}
              />
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-indigo-600 text-white px-4 py-2 rounded font-bold text-sm"
              >
                Save Profile
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{profile.name}</h1>
              <p className="text-zinc-500 mb-4">{profile.handle}</p>
              <p className="text-zinc-300 max-w-2xl text-sm md:text-lg leading-relaxed mb-6">
                {profile.bio}
              </p>
            </>
          )}

          <div className="flex gap-6 text-sm font-medium text-zinc-400 mb-8">
            <span className="hover:text-white cursor-pointer"><strong className="text-white">0</strong> Following</span>
            <span className="hover:text-white cursor-pointer"><strong className="text-white">0</strong> Followers</span>
          </div>

          <div className="flex flex-wrap gap-3 md:gap-4">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20 text-sm md:text-base">
              <Plus size={18} /> Create Post
            </button>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-6 py-2.5 rounded-lg font-bold transition-all text-sm md:text-base"
            >
              <Edit3 size={18} /> {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-zinc-800 mb-8 overflow-x-auto">
          <div className="flex gap-6 md:gap-8 min-w-max">
            {[
              { id: 'POSTS', label: 'Posts', icon: Grid },
              { id: 'LIKES', label: 'Likes', icon: Heart },
              { id: 'MEDIA', label: 'Media', icon: Film }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 flex items-center gap-2 font-bold transition-all border-b-2 text-sm md:text-base ${
                  activeTab === tab.id 
                    ? 'text-white border-indigo-500' 
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State / Content Area */}
        <div className="min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/50 mb-12">
           <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
             {activeTab === 'POSTS' && <Grid size={32} />}
             {activeTab === 'LIKES' && <Heart size={32} />}
             {activeTab === 'MEDIA' && <Film size={32} />}
           </div>
           <p className="text-lg font-medium">No {activeTab.toLowerCase()} yet</p>
           <p className="text-sm mt-2">When you create content, it will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;