import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#18122B] via-[#6D28D9] to-[#A78BFA]">
      <div className="bg-[#231942] rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-purple-300 mb-6 text-center">Profile</h2>
        {/* Profile details and edit form will go here */}
        <div className="text-gray-400 text-center">Coming soon...</div>
      </div>
    </div>
  );
};

export default Profile;
