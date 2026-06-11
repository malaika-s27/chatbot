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
  messages,
  input,
  bodyRef,
  setInput,
  onMenuClick,
  onSubClick,
  onBack,
  onSend,
  onInputKey,
  onShowMainMenu,
  showScrollButton,
  scrollToBottom,
}) {
  return (
    <div className="pr-chat-window">
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="pr-chat-header">
          <div className="pr-chat-header__info">
            <h6>Pakistan Railways</h6>
            <span>
              <span className="pr-online-dot" />
              RAHI 117
            </span>
          </div>
        </div>

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

        {/* Input */}
        <div className="pr-chat-footer">
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onInputKey}
            aria-label="Chat input"
          />
          <button
            className="pr-send-btn"
            onClick={onSend}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </div>
        {showScrollButton && <ScrollToBottom onClick={scrollToBottom} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  FAB  (floating action button)
// ─────────────────────────────────────────────
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
    <ChatWindow
      messages={messages}
      input={input}
      bodyRef={bodyRef}
      setInput={setInput}
      onMenuClick={handleMenuClick}
      onSubClick={handleSubClick}
      onBack={handleBack}
      onSend={handleSend}
      onInputKey={handleInputKey}
      onShowMainMenu={showMainMenu}
      showScrollButton={showScrollButton}
      scrollToBottom={scrollToBottom}
    />
  );
}
