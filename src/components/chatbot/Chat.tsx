import "regenerator-runtime";
import { useState, useEffect } from "react";
import { renderToString } from "react-dom/server";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { MessageInput } from "@chatscope/chat-ui-kit-react";
import Messages from "./Messages";
import styless from "./chat.module.css";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { IconAlertTriangle, IconMicrophone } from "@tabler/icons-react";
import { IntlProvider } from "react-intl";
import SelectField from "@commercetools-uikit/select-field";
import { fetchProductDetails } from "../../apis/fetchProductDetails";

export type IMessage = {
  sender: string;
  message: string;
  direction: string;
};

export const Chat = () => {
  const [query, setQuery] = useState<string>("");
  const [queryDataType, setQueryDataType] = useState<
    string | string[] | null | undefined
  >("");

  const [messages, setMessages] = useState<IMessage[]>([
    {
      sender: "system",
      message: `Hello! How can I help you today?
      <br></br>
      Please select the type of data you wish to query from the dropdown menu.<br></br>
      Please provide the query in the below format <br></br>
      Example Query: give me color of #wallet`,
      direction: "incoming",
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrorBorder, setShowErrorBorder] = useState<boolean>(false);

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
      console.error("Error accessing microphone:", error);
    }
  };

  const toggleListening = () => {
    if (!listening) {
      requestMicrophonePermission().then(() => {
        resetTranscript();
        SpeechRecognition.startListening();
      });
    } else {
      SpeechRecognition.stopListening();
    }
  };

  useEffect(() => {
    if (transcript) {
      // Update chatbot state with the recognized speech (transcript)
      setQuery(transcript);
    }
  }, [transcript]);

  const handleMessageSend = async () => {
    setMessages([
      ...messages,
      {
        sender: "user",
        message: query,
        direction: "outgoing",
      },
    ]);
    setQuery("");
    try {
      setLoading(true);
      const finalQuery = `${queryDataType}: ${query}`;
      const formattedMessage = await fetchProductDetails(finalQuery);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "system",
          message: formattedMessage,
          direction: "incoming",
        },
      ]);
      // setErrors([])
    } catch (error: any) {
      setShowErrorBorder(true);
      setErrors((prevErrors) => [
        ...prevErrors,
        renderToString(
          <div>
            <IconAlertTriangle color="red" size={18} stroke={3} />
            &nbsp;{error.response.data.message}
          </div>
        ),
      ]);
      setMessages((prevMessages: any) => [
        ...prevMessages,
        {
          sender: "system",
          message: renderToString(
            <div>
              <IconAlertTriangle color="red" size={18} stroke={3} />
              &nbsp;{error.response.data.message}
            </div>
          ),
          direction: "incoming",
        },
      ]);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  const handlePaste = (e: any) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    setQuery(query + text);
  };

  return (
    <IntlProvider locale="en">
      <div className={styless.container}>
        <div className={styless["messages-wrapper"]}>
          <Messages
            messages={messages}
            setMessages={setMessages}
            loading={loading}
            errors={errors}
          />
        </div>

        <div className={styless["input-box"]}>
          <SelectField
            title=""
            horizontalConstraint={4}
            value={queryDataType}
            isMulti={false}
            options={[
              { value: "customers", label: "Customers" },
              { value: "products", label: "Products" },
              { value: "orders", label: "Orders" },
            ]}
            onFocus={() => setShowErrorBorder(false)}
            containerId={
              queryDataType === "" && showErrorBorder
                ? styless["select-data"]
                : ""
            }
            onChange={(e) => setQueryDataType(e.target.value)}
          />

          <MessageInput
            autoFocus
            placeholder={listening ? "Listening.." : "Type your message…"}
            attachButton={false}
            value={query}
            onChange={(val: string) => setQuery(val)}
            onSend={handleMessageSend}
            onPaste={handlePaste}
            style={{ flexGrow: 1 }}
            className={styless.messageInput}
          />

          <button
            className={`${styless["mic-button"]} ${
              listening ? styless["ripple"] : ""
            }`}
            onClick={toggleListening}
          >
            <IconMicrophone color="#9ba9be" stroke={2} />
          </button>
        </div>
      </div>
    </IntlProvider>
  );
};
