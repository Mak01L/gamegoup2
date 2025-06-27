import React from 'react';
import BackgroundParticles from '../components/BackgroundParticles';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#6D28D9] via-[#A78BFA] font-inter text-white p-8 relative">
      <BackgroundParticles />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-200 mb-8">Privacy Policy</h1>
        <div className="bg-[#281e46]/[0.55] rounded-2xl p-8 space-y-6">
          
          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed">
              GameGoUp collects information you provide when creating an account, including email address and username. 
              We also collect usage data to improve our gaming room matching service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">How We Use Your Information</h2>
            <ul className="text-gray-300 space-y-2">
              <li>• To provide and maintain our gaming room service</li>
              <li>• To facilitate connections between gamers</li>
              <li>• To improve user experience and platform functionality</li>
              <li>• To communicate important updates about our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Advertising</h2>
            <p className="text-gray-300 leading-relaxed">
              We use Google AdSense to display advertisements. Google may use cookies and other technologies 
              to serve ads based on your interests. You can opt out of personalized advertising by visiting 
              Google's Ad Settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement appropriate security measures to protect your personal information. 
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at privacy@gamegoup.studio
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

export default PrivacyPolicy;