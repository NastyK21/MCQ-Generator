import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import DocumentUpload from './components/DocumentUpload';
import MCQQuiz from './components/mcqQuiz';
import MCQHistory from './components/MCQHistory';
import Login from './components/Login';
import Register from './components/Register';
import Navigation from './components/Navigation';

function AppContent() {
  const [currentView, setCurrentView] = useState('upload');
  const [showAuth, setShowAuth] = useState('login'); // 'login' or 'register'
  const [questions, setQuestions] = useState(null);
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        {showAuth === 'login' ? (
          <Login onSwitchToRegister={() => setShowAuth('register')} />
        ) : (
          <Register onSwitchToLogin={() => setShowAuth('login')} />
        )}
      </div>
    );
  }

  // If we have questions, show the quiz
  if (questions) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation currentView="quiz" onViewChange={setCurrentView} />
        <div className="pt-16">
          <MCQQuiz 
            questions={questions} 
            onQuizComplete={() => {
              setQuestions(null);
              setCurrentView('history');
            }}
          />
        </div>
      </div>
    );
  }

  // Main authenticated view
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <div className="pt-16">
        {currentView === 'upload' && (
          <DocumentUpload onQuestionsGenerated={setQuestions} />
        )}
        {currentView === 'history' && <MCQHistory />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
