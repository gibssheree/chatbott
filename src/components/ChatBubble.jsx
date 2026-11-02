import React from "react";
import logobot from "../hermes.png";
import logouser from "../user.png";

// Response data uses literal "<br>" as a line-break convention. We split on
// that exact delimiter and insert real <br /> elements ourselves - this is
// NOT the same as dangerouslySetInnerHTML (no HTML parsing of arbitrary
// content happens), so it doesn't reopen the XSS this component was built to
// close.
function renderWithLineBreaks(text) {
  const parts = String(text).split(/<br\s*\/?>/gi);
  return parts.map((part, index) => (
    <React.Fragment key={index}>
      {index > 0 && <br />}
      {part}
    </React.Fragment>
  ));
}

// Renders chat messages as JSX (React escapes text content automatically),
// replacing the old dangerouslySetInnerHTML + string-concatenated HTML approach.
const ChatBubble = ({ sender, text, prob, time }) => {
  const isUser = sender === "user";

  return (
    <div className={`chat-row ${isUser ? "chat-row-user" : "chat-row-bot"}`}>
      <img
        src={isUser ? logouser : logobot}
        alt={isUser ? "You" : "Hermes"}
        className="chat-avatar"
      />
      <div className="chat-bubble">
        <p className="chat-text">{renderWithLineBreaks(text)}</p>
        <div className="chat-meta">
          {typeof prob !== "undefined" && prob !== null && (
            <span className="chat-prob">{prob}%</span>
          )}
          <span className="chat-time">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
