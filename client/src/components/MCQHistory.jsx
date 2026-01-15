import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../api.js';

export default function MCQHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/mcq-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch MCQ history:', error);
      setError('Failed to load quiz history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">No quiz history found</div>
          <p className="text-gray-500">Complete some quizzes to see your history here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quiz History</h1>
          <p className="mt-2 text-gray-600">Your performance across all quizzes</p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {history.map((item, index) => (
              <li key={item.id || index} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.question}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Your Answer:</span>
                        <p className="text-sm text-gray-900">{item.userAnswer}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Correct Answer:</span>
                        <p className="text-sm text-gray-900">{item.correctAnswer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Questions</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{history.length}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Correct Answers</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  {history.filter(item => item.isCorrect).length}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Accuracy</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">
                  {Math.round((history.filter(item => item.isCorrect).length / history.length) * 100)}%
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 