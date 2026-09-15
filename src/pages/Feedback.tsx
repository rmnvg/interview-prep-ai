import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FeedbackComponent from "./GenAI";
import LoaderPage from "./Loader.tsx";

interface FeedbackItem {
  question: string;
  answer: string;
  rating: number;
  feedback: string;
  loading: boolean;
}

interface LocationState {
  answers: Record<string, string>;
  profile: string;
  questions: string[];
  name: string;
  email: string;
  cheating: Violation;
}

interface Violation {
  multipleFaces: boolean;
  lookingAway: boolean;
  usingDevice: boolean;
}

const FeedbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiKey, setApiKey] = useState<string>(""); // Add API key state
  const multiface = state?.cheating.multipleFaces;
  const lookaway = state?.cheating.lookingAway;
  const device = state?.cheating.usingDevice;

  useEffect(() => {
    // Validate state and questions
    if (!state || !state.questions.length || !state.answers) {
      navigate("/");
      return;
    }

    const { answers, questions } = state;

    // Initialize feedback items with default values
    const initialFeedbacks = questions.map((question) => ({
      question,
      answer: answers[question] || "",
      rating: 0, // Default rating
      feedback:
        "Automated feedback not available. Please review your answer carefully.",
      loading: true, // Set to true to trigger feedback generation
    }));

    setFeedbacks(initialFeedbacks);
    setIsLoading(false);

    // This is just a placeholder - use environment variables or secure key management
    // setApiKey('AIzaSyDoLCgKy2fjjs3f3aZNTkfSiQ6Ap8PibWM');
    setApiKey("AIzaSyDj6yzjeGEL0VZJNuFbfQ48zrXcu4vAXLA");
  }, [state, navigate]);

  const handleFeedbackReceived =
    (index: number) => (feedback: { rating: number; feedbackText: string }) => {
      setFeedbacks((prev) => {
        const updatedFeedbacks = [...prev];
        updatedFeedbacks[index] = {
          ...updatedFeedbacks[index],
          rating: feedback.rating,
          feedback: feedback.feedbackText,
          loading: false,
        };

        // Recalculate overall score
        const newOverallScore = Math.round(
          updatedFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) /
            updatedFeedbacks.length
        );
        setOverallScore(newOverallScore);

        return updatedFeedbacks;
      });
    };

  const handleBack = () => {
    navigate("/");
  };

  // Error handling
  if (!state) {
    return (
      <div className="text-center text-red-500 mt-10">
        Invalid state. Redirecting...
      </div>
    );
  }

  const { profile, name } = state;

  return isLoading ? (
    <LoaderPage />
  ) : (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="header-gradient-bg text-white p-4">
          <h1 className="text-xl font-bold">
            {profile} Interview Feedback for {name}
          </h1>
          <div className="mt-2">
            <span className="text-lg">Overall Score: </span>
            <span className="text-2xl font-bold">{overallScore}/10</span>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <button
            onClick={handleBack}
            className="mb-4 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Back to Interview
          </button>

          <div className="space-y-6">
            {feedbacks.map((feedback, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 border border-gray-200 rounded-lg shadow-sm"
              >
                <h3 className="text-lg font-medium text-gray-800">
                  {feedback.question}
                </h3>

                <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                  <p className="text-gray-600">{feedback.answer}</p>
                </div>

                {/* Conditionally render FeedbackComponent if loading */}
                {feedback.loading && apiKey && (
                  <FeedbackComponent
                    question={feedback.question}
                    answer={feedback.answer}
                    apiKey={apiKey}
                    onFeedbackReceived={handleFeedbackReceived(index)}
                  />
                )}

                <div className="mt-4 flex items-center">
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${
                        feedback.rating >= 8
                          ? "bg-green-100 text-green-600"
                          : feedback.rating >= 5
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {feedback.rating}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Rating: {feedback.rating}/10
                    </h4>
                    <p className="text-sm text-gray-500">{feedback.feedback}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-yellow-100 border border-yellow-300 text-yellow-800 p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-xl mb-4">Surveillance Report</h3>
            <div className="space-y-2">
              {multiface && (
                <div className="flex items-center space-x-2">
                  <span className="text-xl">⚠️</span>
                  <span>Multiple faces detected</span>
                </div>
              )}
              {lookaway && (
                <div className="flex items-center space-x-2">
                  <span className="text-xl">⚠️</span>
                  <span>Looking away</span>
                </div>
              )}
              {device && (
                <div className="flex items-center space-x-2">
                  <span className="text-xl">⚠️</span>
                  <span>Device detected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
