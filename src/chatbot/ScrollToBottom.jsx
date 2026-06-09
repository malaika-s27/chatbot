import React from "react";

const ScrollToBottom = ({ onClick }) => {
  return (
    <div
      className="scroll-to-bottom-button"
      onClick={onClick}
      style={{
        position: "absolute",
        bottom: "60px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        backgroundColor: "#f0f0f0",
        border: "1px solid #d0d0d0",
        backdropFilter: "blur(10px)",
        borderRadius: "50%",
        width: "35px",
        height: "35px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#e0e0e0";
        e.currentTarget.style.transform = "translateX(-50%) scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#f0f0f0";
        e.currentTarget.style.transform = "translateX(-50%) scale(1)";
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: "#666666" }}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  );
};

export default ScrollToBottom;
