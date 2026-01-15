import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../api.js";

export default function MCQQuiz({ questions, onQuizComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { token } = useAuth();

  const currentQuestionRaw = questions[currentIndex];
  const currentQuestion = normalizeQuestion(currentQuestionRaw);

  const saveToHistory = async (question, userAnswer, correctAnswer, isCorrect) => {
    if (!token) return; // Don't save if user is not authenticated
    
    try {
      await api.post('/api/mcq-history', {
        question,
        userAnswer,
        correctAnswer,
        isCorrect
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to save to history:', error);
      // Don't show error to user, just log it
    }
  };

  const handleOptionClick = async (option) => {
    if (showAnswer) return; // Prevent multiple clicks

    setSelectedOption(option);
    setShowAnswer(true);

    const isCorrect = option === currentQuestion.answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Save to history
    await saveToHistory(
      currentQuestion.question,
      option,
      currentQuestion.answer,
      isCorrect
    );
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowAnswer(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
      // Call the callback when quiz is completed
      if (onQuizComplete) {
        onQuizComplete();
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    return (
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
          <p className="text-gray-600 mb-4">Great job completing the quiz</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{score}</div>
            <div className="text-gray-600">out of {questions.length} questions</div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(score / questions.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {Math.round((score / questions.length) * 100)}% correct
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-all duration-200"
        >
          Take Quiz Again
        </button>
      </div>
    );
  }

  const { label: difficultyLabel, badgeClass } = getDifficultyMeta(currentQuestion.difficulty);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Multiple Choice Quiz</h2>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>•</span>
          <span>Score: {score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-800 mr-4">{currentQuestion.question}</h3>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
            {difficultyLabel}
          </span>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isCorrect = option === currentQuestion.answer;
            const isSelected = option === selectedOption;
            const isAnswered = showAnswer;

            let optionStyles = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 font-medium";
            
            if (isAnswered) {
              if (isCorrect) {
                optionStyles += " bg-green-50 border-green-300 text-green-800";
              } else if (isSelected && !isCorrect) {
                optionStyles += " bg-red-50 border-red-300 text-red-800";
              } else {
                optionStyles += " bg-gray-50 border-gray-200 text-gray-600";
              }
            } else {
              optionStyles += " bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer";
            }

            return (
              <button
                key={idx}
                className={optionStyles}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-3 text-sm font-bold">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{option}</span>
                  {isAnswered && isCorrect && (
                    <svg className="ml-auto w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <svg className="ml-auto w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback Message */}
        {showAnswer && (
          <div className={`mt-6 p-4 rounded-lg ${
            selectedOption === currentQuestion.answer 
              ? "bg-green-50 border border-green-200 text-green-800" 
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            <div className="flex items-center">
              {selectedOption === currentQuestion.answer ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Correct!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Incorrect. The correct answer is: {currentQuestion.answer}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      {showAnswer && (
        <div className="text-center">
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-all duration-200"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </button>
        </div>
      )}
    </div>
  );
}

function normalizeQuestion(q) {
  const difficulty = (q?.difficulty || "medium").toLowerCase();
  return {
    ...q,
    difficulty: ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "medium",
  };
}

function getDifficultyMeta(difficulty) {
  switch (difficulty) {
    case "easy":
      return {
        label: "Easy",
        badgeClass:
          "bg-green-100 text-green-800 border border-green-200",
      };
    case "hard":
      return {
        label: "Hard",
        badgeClass: "bg-red-100 text-red-800 border border-red-200",
      };
    case "medium":
    default:
      return {
        label: "Medium",
        badgeClass: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      };
  }
}
