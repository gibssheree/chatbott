import React, { useState } from "react";
import { SlArrowRight } from "react-icons/sl";
import { FiX } from "react-icons/fi";
import logobot from "./hermesAI.png";

const Sidebar = ({
  sessions = [],
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}) => {
  const [open, setOpen] = useState(false);

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
          <NavItem title="New Chat" isPrimary onClick={onNewChat} />
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
            {sessions.length === 0 ? (
              <p className="chat-history-empty">Belum ada riwayat chat</p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`chat-history-item ${
                    session.id === activeSessionId ? "active" : ""
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <span className="chat-history-title">{session.title}</span>
                  <button
                    type="button"
                    className="chat-history-delete"
                    aria-label={`Hapus chat "${session.title}"`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                  >
                    <FiX />
                  </button>
                </div>
              ))
            )}
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

const NavItem = ({ title, isPrimary, onClick }) => (
  <div className="item">
    <button
      className="style"
      style={isPrimary ? { backgroundColor: "#383434" } : {}}
      onClick={onClick}
    >
      <span>{title}</span>
    </button>
  </div>
);

export default Sidebar;
