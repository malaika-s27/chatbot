import React, { useEffect } from "react";
import { MAIN_MENU } from "./chatbotData";
import ScrollToBottom from "./ScrollToBottom";
import "./chatbot.css";

// ─────────────────────────────────────────────
//  HELPLINE CARD  (shown when msg.helpline = true)
// ─────────────────────────────────────────────
export function HelplineCard() {
  return (
    <div className="pr-helpline-card mt-2">
      <div className="fw-bold mb-1">📞 Pakistan Railways Helpline</div>
      <div>
        Call: <a href="tel:117">117</a> (UAN)
      </div>
      <div>
        Email: <a href="mailto:info@pakrail.gov.pk">info@pakrail.gov.pk</a>
      </div>
      <div className="mt-1 text-muted" style={{ fontSize: "12px" }}>
        Available: 24/7
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  TYPING INDICATOR
// ─────────────────────────────────────────────
export function TypingBubble() {
  return (
    <div className="pr-bubble pr-bubble--bot">
      <div className="pr-typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  SINGLE MESSAGE ROW
// ─────────────────────────────────────────────
export function Message({
  msg,
  onMenuClick,
  onSubClick,
  onBack,
  onShowMainMenu,
}) {
  if (msg.type === "user") {
    return <div className="pr-bubble pr-bubble--user">{msg.text}</div>;
  }

  if (msg.type === "typing") return <TypingBubble />;

  return (
    <div className="pr-bot-row">
      {/* Text bubble */}
      <div
        className="pr-bubble pr-bubble--bot"
        style={{ whiteSpace: "pre-line" }}
      >
        {msg.text}
      </div>

      {/* RAG Response Indicators */}
      {msg.sources && msg.sources.length > 0 && (
        <div className="pr-sources mt-1">
          <small className="text-muted">
            Sources: {msg.sources.join(", ")}
          </small>
        </div>
      )}

      {/* Optional helpline card */}
      {msg.helpline && <HelplineCard />}

      {/* Optional back button */}
      {msg.backButton && (
        <div className="pr-quick-replies mt-2">
          <button className="pr-qr-btn pr-qr-btn--back" onClick={onBack}>
            ← Back to Main Menu
          </button>
        </div>
      )}

      {/* Main menu grid */}
      {msg.menu && (
        <div className="pr-menu-grid mt-2">
          {MAIN_MENU.map((m) => (
            <div
              key={m.id}
              className="pr-menu-card"
              onClick={() => onMenuClick(m.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onMenuClick(m.id)}
            >
              <span className="pr-menu-card__icon">{m.icon}</span>
              <span className="pr-menu-card__label">{m.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Submenu quick-reply buttons */}
      {msg.submenu && (
        <div className="pr-quick-replies mt-2">
          {msg.submenu.map((s) => (
            <button
              key={s.id}
              className="pr-qr-btn"
              onClick={() => onSubClick(s.id, s.label)}
            >
              {s.label}
            </button>
          ))}
          <button className="pr-qr-btn pr-qr-btn--back" onClick={onBack}>
            Back
          </button>
        </div>
      )}

      {/* Main menu button for responses */}
      {msg.showMainMenuButton && (
        <div className="pr-quick-replies mt-2">
          <button
            className="pr-qr-btn pr-qr-btn--back"
            onClick={onShowMainMenu}
          >
            Show Main Menu
          </button>
        </div>
      )}

      {/* {msg.followUp && (
        <div className="pr-quick-replies mt-2">
          {msg.followUp.map((btn) => (
            <button
              key={btn.id}
              className="pr-qr-btn"
              onClick={() => onSubClick(btn.id, btn.label)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )} */}
    </div>
  );
}

// ─────────────────────────────────────────────
//  CHAT WINDOW
// ─────────────────────────────────────────────
export function ChatWindow({
  open,
  messages,
  input,
  bodyRef,
  setInput,
  onMenuClick,
  onSubClick,
  onBack,
  onSend,
  onInputKey,
  onClose,
  onShowMainMenu,
  showScrollButton,
  scrollToBottom,
}) {
  return (
    <div className={`pr-chat-window ${open ? "" : "pr-chat-window--hidden"}`}>
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        
        {/* Messages */}
        <div className="pr-chat-body" ref={bodyRef}>
          {messages.map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              onMenuClick={onMenuClick}
              onSubClick={onSubClick}
              onBack={onBack}
              onShowMainMenu={onShowMainMenu}
            />
          ))}
        </div>

     
        {showScrollButton && <ScrollToBottom onClick={scrollToBottom} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  FAB  (floating action button)
// ─────────────────────────────────────────────
export function ChatFAB({ open, onClick }) {
  return (
    <button
      className="pr-chat-fab"
      onClick={onClick}
      title="Chat with us"
      aria-label="Open chatbot"
    >
      {open ? (
        <svg viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
//  ROOT CHATBOT COMPONENT  (compose everything)
// ─────────────────────────────────────────────
import { useChatbot } from "./useChatbot";

export default function Chatbot() {
  const {
  messages,
  input,
  bodyRef,
  setInput,
  handleMenuClick,
  handleSubClick,
  handleBack,
  handleSend,
  handleInputKey,
  showMainMenu,
  showScrollButton,
  handleScroll,
  scrollToBottom,
} = useChatbot();

  // Add scroll event listener
  useEffect(() => {
    const bodyElement = bodyRef.current;
    if (bodyElement) {
      bodyElement.addEventListener("scroll", handleScroll);
      return () => {
        bodyElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [bodyRef, handleScroll]);

  return (
    <>
     return (
  <>
    <ChatWindow
      open={true}
      messages={messages}
      input={input}
      bodyRef={bodyRef}
      setInput={setInput}
      onMenuClick={handleMenuClick}
      onSubClick={handleSubClick}
      onBack={handleBack}
      onSend={handleSend}
      onInputKey={handleInputKey}
      onClose={() => {}}
      onShowMainMenu={showMainMenu}
      showScrollButton={showScrollButton}
      scrollToBottom={scrollToBottom}
    />
  </>
);
}
