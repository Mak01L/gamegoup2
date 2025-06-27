import React from 'react';
import BackgroundParticles from '../components/BackgroundParticles';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#6D28D9] via-[#A78BFA] font-inter text-white p-8 relative">
      <BackgroundParticles />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-200 mb-8">Terms of Service</h1>
        <div className="bg-[#281e46]/[0.55] rounded-2xl p-8 space-y-6">
          
          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using GameGoUp, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Use License</h2>
            <p className="text-gray-300 leading-relaxed">
              Permission is granted to temporarily use GameGoUp for personal, non-commercial transitory viewing only. 
              This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">User Conduct</h2>
            <ul className="text-gray-300 space-y-2">
              <li>• Be respectful to other users</li>
              <li>• Do not share inappropriate content</li>
              <li>• Do not spam or harass other users</li>
              <li>• Follow gaming community guidelines</li>
              <li>• Report any violations to our moderation team</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Gaming Rooms</h2>
            <p className="text-gray-300 leading-relaxed">
              Users can create and join gaming rooms to connect with other players. 
              Room creators are responsible for maintaining appropriate conduct within their rooms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Disclaimer</h2>
            <p className="text-gray-300 leading-relaxed">
              GameGoUp is provided "as is" without any representations or warranties. 
              We do not guarantee uninterrupted or error-free service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              For questions about these Terms of Service, please contact us at legal@gamegoup.studio
            </p>
          </section>

          <div className="text-sm text-gray-400 pt-4 border-t border-purple-800">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;