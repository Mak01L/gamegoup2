import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Feedback {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  user_email: string;
  created_at: string;
  admin_notes?: string;
}

const AdminPanel: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    loadFeedback();
  }, [filter]);

  const loadFeedback = async () => {
    try {
      let query = supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading feedback:', error);
      } else {
        setFeedback(data || []);
      }
    } catch (error) {
      console.error('Exception loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('user_feedback')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
      } else {
        setFeedback(prev => 
          prev.map(item => 
            item.id === id ? { ...item, status } : item
          )
        );
      }
    } catch (error) {
      console.error('Exception updating status:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'game': return '🎮';
      case 'feature': return '✨';
      case 'improvement': return '🔧';
      default: return '💬';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-100';
      case 'high': return 'text-orange-500 bg-orange-100';
      case 'medium': return 'text-yellow-500 bg-yellow-100';
      case 'low': return 'text-green-500 bg-green-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🎮 GameGoUp Admin Panel
          </h1>
          <p className="text-gray-600">
            Manage user feedback, bug reports, and feature requests
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Feedback', count: feedback.length },
              { id: 'bug', label: '🐛 Bugs', count: feedback.filter(f => f.type === 'bug').length },
              { id: 'game', label: '🎮 Games', count: feedback.filter(f => f.type === 'game').length },
              { id: 'feature', label: '✨ Features', count: feedback.filter(f => f.type === 'feature').length },
              { id: 'improvement', label: '🔧 Improvements', count: feedback.filter(f => f.type === 'improvement').length },
              { id: 'other', label: '💬 Other', count: feedback.filter(f => f.type === 'other').length }
            ].map(filterOption => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterOption.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedback.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-medium rounded border-0 ${getStatusColor(item.status)}`}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.user_email || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedFeedback(item)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {feedback.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500 text-lg">
              No feedback found for the selected filter.
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {getTypeIcon(selectedFeedback.type)} {selectedFeedback.title}
                </h3>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedFeedback.priority)}`}>
                    Priority: {selectedFeedback.priority.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(selectedFeedback.status)}`}>
                    Status: {selectedFeedback.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <strong>User:</strong> {selectedFeedback.user_email || 'Anonymous'}
                </div>
                
                <div>
                  <strong>Date:</strong> {new Date(selectedFeedback.created_at).toLocaleString()}
                </div>
                
                <div>
                  <strong>Description:</strong>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                    {selectedFeedback.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;