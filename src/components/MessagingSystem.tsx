import React from 'react';
import ShinyText from './ShinyText';

const MessagingSystem: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#18122B] rounded-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden border border-purple-400/30">
        {/* Header */}
        <div className="w-full flex flex-col">
          <div className="p-4 border-b border-purple-400/30">
            <div className="flex justify-between items-center mb-4">
              <ShinyText text="Messages" className="text-xl font-bold" />
              <button onClick={onClose} className="text-purple-400 hover:text-purple-200">
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <ShinyText text="Coming Soon!" className="text-2xl mb-4" />
              <p className="text-purple-300">
                We're working on this feature and it will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;