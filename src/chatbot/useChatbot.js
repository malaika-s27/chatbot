import { useState, useRef } from "react";
import {
  MAIN_MENU,
  SUBMENU,
  RESPONSES,
  REAL_TIME_MSG,
  HELPLINE_FULL,
  FALLBACK_MSG,
  KEYWORD_RULES,
} from "./chatbotData";

const CHAT_API_URL =
  import.meta.env.VITE_RAG_API_URL || "/_/backend/chat/ask";

function resolveKeyword(text) {
  const lower = text.toLowerCase();
  const highMatches = [];
  let lowMatch = null;

  for (const rule of KEYWORD_RULES) {
    const hit = rule.keywords.some((kw) => lower.includes(kw));
    if (!hit) continue;

    if (rule.priority === "high") {
      if (rule.special === "realtime") return REAL_TIME_MSG;
      highMatches.push(RESPONSES[rule.responseId]);
    } else if (rule.priority === "low" && !lowMatch) {
      lowMatch = rule.responseId;
    }
  }

  if (highMatches.length === 1) return highMatches[0];

  if (highMatches.length > 1) {
    return {
      text: highMatches.map((r) => r.text).join("\n\n-------------\n\n"),
      helpline: highMatches.some((r) => r.helpline),
    };
  }

  if (lowMatch) return RESPONSES[lowMatch];

  return FALLBACK_MSG;
}

const initialEmbeddedMessages = [
  {
    type: "bot",
    text: "Welcome to Railway Automated Help & Intelligence!\n\nI can help you with tickets, refunds, policies, and more.",
  },
  {
    type: "bot",
    text: "What can I help you with today? Please choose a category:",
    menu: true,
  },
];

export const useChatbot = ({ embedded = false } = {}) => {
  const [open, setOpen] = useState(embedded);
  const [started, setStarted] = useState(embedded);
  const [messages, setMessages] = useState(
    embedded ? initialEmbeddedMessages : [],
  );
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const bodyRef = useRef(null);

  const handleScroll = () => {
    if (bodyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setShowScrollButton(!isAtBottom);
    }
  };

  const scrollToBottom = () => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({
        top: bodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const addMsg = (msg) => setMessages((prev) => [...prev, msg]);
  const removeTyping = (list) => list.filter((m) => m.type !== "typing");

  const showMainMenu = () => {
    addMsg({
      type: "bot",
      text: "What can I help you with today? Please choose a category:",
      menu: true,
    });

    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTo({
          top: bodyRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);
  };

  const openChat = () => {
    setOpen(true);
    if (!started) {
      setStarted(true);
      setTimeout(() => {
        addMsg({
          type: "bot",
          text: "Welcome to Railway Automated Help & Intelligence!\n\nI can help you with tickets, refunds, policies, and more.",
        });
        setTimeout(showMainMenu, 600);
      }, 400);
    }
  };

  const toggleOpen = () => (open ? setOpen(false) : openChat());

  const disableMenu = (list) =>
    list.map((m) => (m.menu ? { ...m, menu: false } : m));

  const removeLastSubmenuMessage = (list) => {
    const lastSubmenuIdx = list.findLastIndex((m) => m.submenu);
    if (lastSubmenuIdx !== -1) {
      return list.filter((_, idx) => idx !== lastSubmenuIdx);
    }
    return list;
  };

  const handleMenuClick = (id) => {
    setMessages((prev) => disableMenu(prev));

    if (id === "status") {
      addMsg({ type: "user", text: "Train Status & Delays" });
      setTimeout(() => addMsg({ type: "bot", ...REAL_TIME_MSG }), 600);
      setTimeout(showMainMenu, 1400);
      return;
    }

    if (id === "helpline") {
      addMsg({ type: "user", text: "Contact & Helpline" });
      setTimeout(
        () => addMsg({ type: "bot", ...HELPLINE_FULL, backButton: true }),
        600,
      );
      return;
    }

    const sub = SUBMENU[id];
    const item = MAIN_MENU.find((m) => m.id === id);
    if (!item) return;

    addMsg({ type: "user", text: `${item.icon} ${item.label}` });
    setTimeout(() => {
      if (sub) {
        addMsg({
          type: "bot",
          text: `Here are topics under "${item.label}". Pick one:`,
          submenu: sub,
        });
      } else {
        addMsg({
          type: "bot",
          ...HELPLINE_FULL,
          backButton: true,
        });
      }

      setTimeout(() => {
        if (bodyRef.current) {
          bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
      }, 100);
    }, 500);
  };

  const handleSubClick = (id, label) => {
    setMessages((prev) => removeLastSubmenuMessage(prev));
    addMsg({ type: "user", text: label });
    addMsg({ type: "typing" });

    setTimeout(() => {
      const userMsgIndex = messages.findIndex(
        (m) => m.type === "user" && m.text === label,
      );
      const userMsgElement = bodyRef.current?.children[userMsgIndex];
      if (userMsgElement) {
        userMsgElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }, 100);

    setTimeout(() => {
      const resp = RESPONSES[id] || {
        text: "I don't have specific info on that yet. Please contact our helpline.",
        helpline: true,
      };
      setMessages((prev) => [
        ...removeTyping(prev),
        { type: "bot", ...resp, backButton: true },
      ]);
    }, 900);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput("");
    addMsg({ type: "user", text });
    addMsg({ type: "typing" });

    setTimeout(() => {
      const allChildren = Array.from(bodyRef.current?.children || []);
      const userMessages = allChildren.filter(
        (child) =>
          child.classList && child.classList.contains("pr-bubble--user"),
      );
      const lastUserMsg = userMessages[userMessages.length - 1];

      if (lastUserMsg) {
        lastUserMsg.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }, 100);

    setTimeout(async () => {
      try {
        const response = await fetch(CHAT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: text,
            session_id: null,
            precision_mode: true,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setMessages((prev) => [
            ...removeTyping(prev),
            {
              type: "bot",
              text: data.answer,
              sources: data.sources || [],
              confidence: data.confidence || 0.0,
              sessionId: data.session_id,
              backButton: true,
            },
          ]);
          setTimeout(handleScroll, 100);
        } else {
          const resp = resolveKeyword(text);
          setMessages((prev) => [
            ...removeTyping(prev),
            { type: "bot", ...resp, backButton: true },
          ]);
          setTimeout(handleScroll, 100);
        }
      } catch (error) {
        console.error("RAG API Error:", error);
        const resp = resolveKeyword(text);
        setMessages((prev) => [
          ...removeTyping(prev),
          { type: "bot", ...resp, backButton: true },
        ]);
        setTimeout(handleScroll, 100);
      }
    }, 900);
  };

  const handleBack = () => {
    setMessages((prev) => {
      return prev
        .map((m) => {
          if (m.submenu) return null;
          if (m.backButton && m.type === "bot") {
            return { ...m, backButton: false };
          }
          return m;
        })
        .filter(Boolean);
    });
    setTimeout(showMainMenu, 300);
  };

  const handleInputKey = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return {
    open,
    started,
    messages,
    input,
    bodyRef,
    setInput,
    toggleOpen,
    handleMenuClick,
    handleSubClick,
    handleBack,
    handleSend,
    handleInputKey,
    showMainMenu,
    showScrollButton,
    handleScroll,
    scrollToBottom,
  };
};
