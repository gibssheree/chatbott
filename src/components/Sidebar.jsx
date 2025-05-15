import React, { useState } from "react";
import { SlArrowRight } from "react-icons/sl";
import logobot from "./hermesAI.png";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    "How to use React hooks",
    "Best practices for CSS",
    "Project discussion",
    "Performance optimization",
  ]);

  const toggleSidebar = () => setOpen((prev) => !prev);

  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      <button
        onClick={toggleSidebar}
        className="toggle"
        aria-label="toggle sidebar"
      >
        <SlArrowRight className="text-white" />
      </button>
      <div className="sidebar-content">
        <div className="top-sidebar">
          <img src={logobot} alt="Hermes AI" className="logo" />
        </div>
        <div className="items">
          <NavItem title="New Chat" isPrimary />
          <div className="chat-history">
            <h4
              style={{
                color: "rgba(255,255,255,0.5)",
                padding: "0 15px",
                marginBottom: "10px",
              }}
            >
              Chat History
            </h4>
            {chatHistory.map((chat, index) => (
              <div key={index} className="chat-history-item">
                {chat}
              </div>
            ))}
          </div>
        </div>
        <p className="font">
          Hermes V1 <br />
          ReactJS
        </p>
      </div>
    </div>
  );
};

const NavItem = ({ title, isPrimary }) => (
  <div className="item">
    <button
      className="style"
      style={isPrimary ? { backgroundColor: "#383434" } : {}}
    >
      <span>{title}</span>
    </button>
  </div>
);

export default Sidebar;
