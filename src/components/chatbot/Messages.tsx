import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MessageList,
  Message,
  TypingIndicator,
  Avatar,
} from "@chatscope/chat-ui-kit-react";
import styless from "./chat.module.css";

const Messages = ({ messages, loading, errors }: any) => {
  const handleCopy = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const selectedText = window.getSelection()?.toString() ?? "";
    e.clipboardData?.setData("text/plain", selectedText);
  };

  return (
    <div className={styless["messages-container"]}>
      <MessageList
        autoScrollToBottom={false}
        typingIndicator={
          loading && (
            <TypingIndicator
              content="generating response"
              className={styless["typing-indicator"]}
            />
          )
        }
      >
        {messages?.map((message: any, index: number) => (
          <Message
            key={index}
            model={message}
            className={`${styless["message-box"]} ${
              errors.includes(message.message) && styless["error-msg"]
            } `}
            onCopy={(e: React.ClipboardEvent<HTMLDivElement>) => handleCopy(e)}
          >
            <Avatar
              name={message.sender}
              src={
                message.sender === "system"
                  ? "https://res.cloudinary.com/cr07/image/upload/v1712217203/ai-bot_bbdtsd.png"
                  : "https://chatscope.io/storybook/react/assets/zoe-E7ZdmXF0.svg"
              }
              style={{ pointerEvents: "none" }}
            />
          </Message>
        ))}
      </MessageList>
    </div>
  );
};

export default Messages;
