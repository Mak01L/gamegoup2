import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';

interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const { authUser } = useUser();
  const [type, setType] = useState('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const feedbackTypes = [
    { id: 'bug', label: '🐛 Bug Report', color: 'text-red-400' },
    { id: 'game', label: '🎮 Request Game', color: 'text-blue-400' },
    { id: 'feature', label: '✨ Feature Request', color: 'text-green-400' },
    { id: 'improvement', label: '🔧 Improvement', color: 'text-yellow-400' },
    { id: 'other', label: '💬 Other Feedback', color: 'text-purple-400' }
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: 'text-green-400' },
    { id: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { id: 'high', label: 'High', color: 'text-orange-400' },
    { id: 'critical', label: 'Critical', color: 'text-red-400' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: submitError } = await supabase.from('user_feedback').insert({
        user_id: authUser?.id || null,
        type,
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'open',
        user_email: authUser?.email || null,
        created_at: new Date().toISOString()
      });

      if (submitError) {
        setError('Failed to submit feedback: ' + submitError.message);
      } else {
        setSuccess('✅ Feedback submitted successfully! Thank you for helping improve GameGoUp.');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholderText = () => {
    switch (type) {
      case 'bug':
        return 'Describe the bug:\n\n1. What were you doing when it happened?\n2. What did you expect to happen?\n3. What actually happened?\n4. Can you reproduce it?';
      case 'game':
        return 'Which game would you like to see added?\n\nGame name:\nWhy should we add it:\nHow popular is it:';
      case 'feature':
        return 'Describe the new feature:\n\n1. What should it do?\n2. How would it help users?\n3. Where should it be located?';
      case 'improvement':
        return 'What could be improved?\n\n1. Current situation:\n2. Suggested improvement:\n3. Expected benefit:';
      default:
        return 'Share your thoughts, suggestions, or any other feedback...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#18122B]/95 backdrop-blur-md rounded-2xl w-full max-w-2xl shadow-2xl text-white border border-purple-400/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-400/30">
          <div>
            <h2 className="text-2xl font-bold text-purple-200">Send Feedback</h2>
            <p className="text-sm text-purple-300 mt-1">Help us improve GameGoUp</p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-3">
              What type of feedback is this? *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {feedbackTypes.map((feedbackType) => (
                <label
                  key={feedbackType.id}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    type === feedbackType.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-purple-700 hover:border-purple-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={feedbackType.id}
                    checked={type === feedbackType.id}
                    onChange={(e) => setType(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`text-lg ${feedbackType.color}`}>
                    {feedbackType.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-3">
              Priority Level
            </label>
            <div className="flex gap-3">
              {priorities.map((priorityLevel) => (
                <label
                  key={priorityLevel.id}
                  className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                    priority === priorityLevel.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-purple-700 hover:border-purple-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priorityLevel.id}
                    checked={priority === priorityLevel.id}
                    onChange={(e) => setPriority(e.target.value)}
                    className="sr-only"
                  />
                  <span className={`text-sm font-medium ${priorityLevel.color}`}>
                    {priorityLevel.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your feedback..."
              className="w-full px-4 py-3 rounded-lg bg-[#221b3a] border border-purple-700 text-white placeholder-purple-400 focus:border-purple-500 focus:outline-none"
              maxLength={100}
            />
            <div className="text-xs text-purple-400 mt-1">{title.length}/100</div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-purple-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={getPlaceholderText()}
              className="w-full px-4 py-3 rounded-lg bg-[#221b3a] border border-purple-700 text-white placeholder-purple-400 focus:border-purple-500 focus:outline-none resize-none"
              rows={8}
              maxLength={1000}
            />
            <div className="text-xs text-purple-400 mt-1">{description.length}/1000</div>
          </div>

          {/* Contact Info */}
          <div className="bg-purple-900/20 rounded-lg p-4">
            <p className="text-sm text-purple-300">
              📧 We'll use your account email ({authUser?.email}) to follow up if needed.
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-purple-600 text-purple-300 hover:bg-purple-600/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !description.trim()}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;