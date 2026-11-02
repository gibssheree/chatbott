import React from "react";
import logobot from "../hermes.png";

// Shown while the bot is "thinking" (model prediction / simulated delay)
const TypingIndicator = () => (
  <div className="chat-row chat-row-bot">
    <img src={logobot} alt="Hermes" className="chat-avatar" />
    <div className="chat-bubble typing-bubble" aria-label="Hermes is typing">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  </div>
);

export default TypingIndicator;
