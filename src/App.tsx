import "regenerator-runtime";
import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";

function App() {
  const [query, setQuery] = useState<string>("");
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Speech recognition is not supported.</span>;
  }

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error(error);
      alert("Error accessing microphone");
    }
  };

  const toggleListening = () => {
    if (!listening) {
      requestMicrophonePermission().then(() => {
        // resetTranscript();
        SpeechRecognition.startListening();
      });
    } else {
      SpeechRecognition.stopListening();
    }
  };

  useEffect(() => {
    if (transcript) {
      // Update state with the recognized speech (transcript)
      setQuery(transcript);
    }
  }, [transcript]);

  return (
    <>
      <h2>Speech To Text</h2>
      <div className="container">
        <button onClick={toggleListening}>
          {listening ? "listening" : "speak"}
        </button>
        <div className="transcript">
          <p>
            <strong>You said:</strong> {query}
          </p>
        </div>
        <button
          onClick={() => {
            resetTranscript();
            setQuery("");
          }}
        >
          Clear Transcript
        </button>
      </div>
    </>
  );
}

export default App;
