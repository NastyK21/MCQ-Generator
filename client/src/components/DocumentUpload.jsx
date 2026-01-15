import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import api from "../api.js";

export default function DocumentUpload({ onQuestionsGenerated }) {
  const { user, token } = useAuth();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success", "error", "info"
  const [docId, setDocId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("mixed");

  const handleTestUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      setMessageType("error");
      return;
    }

    setIsUploading(true);
    setMessage("");
    setMessageType("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/test", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(`✅ Test upload successful! File: ${res.data.filename}, Content length: ${res.data.contentLength}`);
      setMessageType("success");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || "Test upload failed. Please try again.";
      setMessage(`❌ ${errorMessage}`);
      setMessageType("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      setMessageType("error");
      return;
    }

    // Debug authentication state
    console.log("Auth state:", { user, token, isAuthenticated: !!token });
    
    if (!token) {
      setMessage("Please log in to upload documents.");
      setMessageType("error");
      return;
    }

    // Check if we have a valid user object or at least a token
    if (!user || !user.id) {
      console.log("User object is empty, but token exists. Trying to upload with token only.");
    }

    setIsUploading(true);
    setMessage("");
    setMessageType("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      setMessage(`✅ Upload successful! Document ID: ${res.data.id}`);
      setMessageType("success");
      setDocId(res.data.id);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || "Upload failed. Please try again.";
      setMessage(`❌ ${errorMessage}`);
      setMessageType("error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateMCQs = async () => {
    if (!docId) {
      setMessage("Please upload a document first.");
      setMessageType("error");
      return;
    }

    setIsGenerating(true);
    setMessage("");
    setMessageType("");

    try {
      const requestData = {
        difficulty: selectedDifficulty === "mixed" ? null : selectedDifficulty
      };

      const res = await api.post(`/generate-mcq/${docId}`, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.data.mcqs && res.data.mcqs.length > 0) {
        const difficultyText = selectedDifficulty === "mixed" ? "mixed difficulty" : selectedDifficulty;
        setMessage(`✅ Generated ${res.data.mcqs.length} ${difficultyText} MCQs successfully!`);
        setMessageType("success");
        
        // Call the callback to pass questions to parent component
        if (onQuestionsGenerated) {
          onQuestionsGenerated(res.data.mcqs);
        }
      } else {
        setMessage("No MCQs generated from this document.");
        setMessageType("error");
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to generate MCQs. Please try again.";
      setMessage(`❌ ${errorMessage}`);
      setMessageType("error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage("");
    setMessageType("");
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
  };

  const getMessageStyles = () => {
    switch (messageType) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getDifficultyBadgeClass = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      case "mixed":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Document Upload</h2>
          <p className="text-gray-600">Upload your document to generate multiple-choice questions</p>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">Choose a file</span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
            </div>
            {file && (
              <div className="text-sm text-gray-600">
                Selected: <span className="font-medium">{file.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Upload Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={handleTestUpload}
            disabled={!file || isUploading}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              !file || isUploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
            }`}
          >
            {isUploading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing...
              </div>
            ) : (
              "Test Upload"
            )}
          </button>
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              !file || isUploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {isUploading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </div>
            ) : (
              "Upload Document"
            )}
          </button>
        </div>

        {/* Difficulty Selection and Generate MCQs Button */}
        {docId && (
          <div className="space-y-4">
            {/* Difficulty Selection */}
            <div className="flex flex-col items-center space-y-3">
              <label className="text-sm font-medium text-gray-700">Select Difficulty Level:</label>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedDifficulty}
                  onChange={handleDifficultyChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="mixed">Mixed Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                
                {/* Difficulty Badge */}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyBadgeClass(selectedDifficulty)}`}>
                  {selectedDifficulty === "mixed" ? "Mixed" : selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                </span>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                onClick={handleGenerateMCQs}
                disabled={isGenerating}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isGenerating
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating MCQs...
                  </div>
                ) : (
                  `Generate ${selectedDifficulty === "mixed" ? "" : selectedDifficulty + " "}MCQs`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg border ${getMessageStyles()}`}>
            <div className="flex items-center">
              {messageType === "success" && (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {messageType === "error" && (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Section */}
      {/* The MCQQuiz component is now passed as a prop and will render itself */}
    </div>
  );
}
