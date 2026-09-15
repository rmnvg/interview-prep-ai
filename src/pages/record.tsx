import { useState, useEffect } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import { Mic, CircleStop, RefreshCw, Save, Loader } from "lucide-react";

interface RecordAnswerProps {
  onSaveAnswer: (answer: string) => void;
  value: string;
}
export const RecordAnswer: React.FC<RecordAnswerProps> = ({
  onSaveAnswer,
  value,
}) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState<string>("");

  const recordUserAnswer = () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer(""); // Clear the previous answer
    stopSpeechToText();
    startSpeechToText();
  };

  useEffect(() => {
    const combinedTranscript = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");
    setUserAnswer(combinedTranscript);
    onSaveAnswer(combinedTranscript);
  }, [results, onSaveAnswer]);

  useEffect(() => {
    setUserAnswer("");
  }, [value]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-8">
      <div className="w-full max-w-3xl bg-white p-6 rounded-lg ">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={recordUserAnswer}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className="flex items-center justify-center p-2 rounded-md bg-blue-400 text-white hover:bg-blue-600"
          >
            {isRecording ? (
              <CircleStop className="min-w-6 min-h-6" />
            ) : (
              <Mic className="min-w-6 min-h-6" />
            )}
            <span className="ml-2">
              {isRecording ? "Stop Recording" : "Start Recording"}
            </span>
          </button>

          <button
            onClick={recordNewAnswer}
            aria-label="Record again"
            className="flex items-center justify-center p-2 rounded-md bg-green-500 text-white hover:bg-green-600"
          >
            <RefreshCw className="min-w-6 min-h-6" />
            <span className="ml-2">Record Again</span>
          </button>

          <button
            onClick={() => {
              console.log("answer_saved");
            }}
            disabled={!userAnswer}
            aria-label="Save answer"
            className="flex items-ce
            nter justify-center p-2 rounded-md bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300"
          >
            {isRecording ? (
              <Loader className="min-w-6 min-h-6 animate-spin" />
            ) : (
              <Save className="min-w-6 min-h-6" />
            )}
            <span className="ml-2">Save Answer</span>
          </button>
        </div>

        <div className="border rounded-md p-4 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Your Answer:</h2>
          <p className="text-sm text-gray-700 mt-2">
            {userAnswer || "Record Your Answer Through Voice "}
          </p>

          {interimResult && (
            <p className="text-sm text-gray-500 mt-2">
              <strong>Current Speech:</strong> {interimResult}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
