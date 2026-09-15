import React, { useState, useEffect } from "react";

interface FeedbackComponentProps {
  question: string;
  answer: string;
  onFeedbackReceived: (feedback: {
    rating: number;
    feedbackText: string;
  }) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}
const cleanJsonResponse = (responseText: string) => {
  let cleanText = responseText.trim();
  cleanText = cleanText.replace(/(json|```|`)/g, "");
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    throw new Error("Invalid JSON format: " + (error as Error)?.message);
  }
};

async function getGeminiFeedback(
  question: string,
  answer: string
): Promise<{ rating: number; feedbackText: string }> {
  const prompt =
  `Question: ${question}
  User Answer: ${answer}
  Please compare the user's answer to the ideal response and provide a rating (1-10). If the answer is relevant, rate the response based on accuracy, depth, and clarity. If the answer is irrelevant, rate it as 1 and include feedback: "Answer is not relevant."
  Provide a short, constructive feedback to help improve the answer.

  Return the result in JSON format with only the fields "ratings" (number) and "feedback" (string). Do not include any extra text before or after the JSON object.

  Example Output:
  {
    "ratings": 7,
    "feedback": "The answer is mostly correct, but it could use more detail about X."
  }`;

  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || `HTTP error! status: ${response.status}`);
    }

    const parsedResult: AIResponse = cleanJsonResponse(data.text);

    const rating = parsedResult ? parsedResult.ratings : 1;
    const feedbackText = parsedResult
      ? parsedResult.feedback
      : "No detailed feedback available.";

    return { rating, feedbackText };
  } catch (error) {
    console.error("Error fetching Gemini feedback:", error);
    return {
      rating: 1,
      feedbackText: `Reponse was not clear: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({
  question,
  answer,
  onFeedbackReceived,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        const { rating, feedbackText } = await getGeminiFeedback(
          question,
          answer
        );
        onFeedbackReceived({ rating, feedbackText });
      } catch (error) {
        onFeedbackReceived({
          rating: 5,
          feedbackText: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [question, answer, onFeedbackReceived]);

  return (
    <div className="text-center">
      {loading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-indigo-600">Generating feedback...</span>
        </div>
      )}
    </div>
  );
};

export default FeedbackComponent;
