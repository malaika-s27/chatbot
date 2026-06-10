import { useState, useRef, useEffect } from "react";
import {
  MAIN_MENU,
  SUBMENU,
  RESPONSES,
  REAL_TIME_MSG,
  HELPLINE_FULL,
  FALLBACK_MSG,
  KEYWORD_RULES,
} from "./chatbotData";

// ─────────────────────────────────────────────
//  HELPER: resolve a free-text message to a response
// ─────────────────────────────────────────────
// function resolveKeyword(text) {
//   const lower = text.toLowerCase();
//   for (const rule of KEYWORD_RULES) {
//     if (rule.keywords.some((kw) => lower.includes(kw))) {
//       if (rule.special === 'realtime') return REAL_TIME_MSG;
//       return RESPONSES[rule.responseId] || FALLBACK_MSG;
//     }
//   }
//   return FALLBACK_MSG;
// }
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

  // High-priority hits found
  if (highMatches.length === 1) return highMatches[0];

  // Multiple specific responses (e.g. user typed "eticket and paper refund")
  if (highMatches.length > 1) {
    return {
      text: highMatches.map((r) => r.text).join("\n\n─────────────\n\n"),
      helpline: highMatches.some((r) => r.helpline),
    };
  }

  // Only a generic/low-priority match
  if (lowMatch) return RESPONSES[lowMatch];

  return FALLBACK_MSG;
}

// ─────────────────────────────────────────────
//  CUSTOM HOOK
// ─────────────────────────────────────────────
export const useChatbot = () => {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const bodyRef = useRef(null);
  // const lastMessageCount = useRef(0);

  const scrollToLatest = () => {
  requestAnimationFrame(() => {
    if (!bodyRef.current) return;

    const lastMessage = bodyRef.current.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
};

  // ── Scroll position detection ──────────────────────
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

  // ── Low-level helpers ──────────────────────
  
  const addMsg = (msg) => setMessages((prev) => [...prev, { ...msg, id: Date.now() + Math.random() }]);
  const removeTyping = (list) => list.filter((m) => m.type !== "typing");

  // ── Show main menu ─────────────────────────
  const showMainMenu = () => {
    addMsg({
      type: "bot",
      text: "What can I help you with today? Please choose a category:",
      menu: true,
    });
    // Auto-scroll to bottom when main menu is displayed with smooth transition
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTo({
          top: bodyRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);
  };

  // ── Open chat (first time greet) ───────────
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

  // ── Disable menu/submenu on a message ─────
  const disableMenu = (list) =>
    list.map((m) => (m.menu ? { ...m, menu: false } : m));
  const disableSubmenu = (messages) => {
    const lastBotIdx = messages.findLastIndex(
      (m) => m.type === "bot" && m.submenu,
    );
    if (lastBotIdx !== -1) {
      const newMsgs = [...messages];
      delete newMsgs[lastBotIdx].submenu;
      return newMsgs;
    }
    return messages;
  };

  const removeSubmenuMessages = (messages) => {
    return messages.filter((m) => !m.submenu);
  };

  // Remove only the last submenu message (not main menu)
  const removeLastSubmenuMessage = (messages) => {
    const lastSubmenuIdx = messages.findLastIndex((m) => m.submenu);
    if (lastSubmenuIdx !== -1) {
      return messages.filter((_, idx) => idx !== lastSubmenuIdx);
    }
    return messages;
  };

  // ── Handle main menu card click ────────────
  const handleMenuClick = (id) => {
    setMessages((prev) => disableMenu(prev));

    if (id === "status") {
      addMsg({ type: "user", text: "🚆 Train Status & Delays" });
      setTimeout(() => addMsg({ type: "bot", ...REAL_TIME_MSG }), 600);
      setTimeout(showMainMenu, 1400);
      return;
    }

    if (id === "helpline") {
      addMsg({ type: "user", text: "📞 Contact & Helpline" });
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
        // For helpline (no submenu), show direct response with back button
        addMsg({
          type: "bot",
          ...HELPLINE_FULL,
          backButton: true,
        });
      }
      // Auto-scroll to bottom when submenu is displayed (simple instant scroll)
      setTimeout(() => {
        if (bodyRef.current) {
          bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
      }, 100);
    }, 500);
  };

  // ── Handle submenu quick-reply click ───────
  const handleSubClick = (id, label) => {
    addMsg({ type: "user", text: label });
    addMsg({ type: "typing" });

    // Scroll to user question when submenu option is clicked
    // setTimeout(() => {
    //   const userMsgIndex = messages.findIndex(
    //     (m) => m.type === "user" && m.text === label,
    //   );
    //   const userMsgElement = bodyRef.current?.children[userMsgIndex];
    //   if (userMsgElement) {
    //     // Scroll to the very top of the viewport like ChatGPT
    //     userMsgElement.scrollIntoView({
    //       behavior: "smooth",
    //       block: "start",
    //       inline: "nearest",
    //     });
    //   }
    // }, 100);

    // setTimeout(() => {
    //   const resp = RESPONSES[id] || {
    //     text: "I don't have specific info on that yet. Please contact our helpline.",
    //     helpline: true,
    //   };
    //   setMessages((prev) => [
    //     ...removeTyping(prev),
    //     { type: "bot", ...resp, backButton: true },
    //   ]);
    // }, 900);

    setTimeout(() => {
    const resp = RESPONSES[id] || {
      text: "I don't have specific info on that yet. Please contact our helpline.",
      helpline: true,
    };

    setMessages((prev) => {
    const updated = [
      ...removeTyping(prev),
      { type: "bot", ...resp, backButton: true },
    ];

    // ✅ SCROLL ONLY WHEN BOT MESSAGE IS ADDED
    setTimeout(() => {
      scrollToLatest();
    }, 0);

    return updated;
    });
   }, 800);

    // Scroll to newest bot response after 1000ms with 5px offset
    // setTimeout(() => {
    //   const allBotMessages = Array.from(bodyRef.current?.children || [])
    //     .filter(child => child.classList?.contains('pr-bot-row'));
    //   const lastBotMsg = allBotMessages[allBotMessages.length - 1];
    //   if (lastBotMsg) {
    //     lastBotMsg.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    //     bodyRef.current.scrollTop -= 5; // 5px offset from top
    //   }
    // }, 1000);
  };

  // ── Response Precision Function ────────────
  const makeResponsePrecise = (response) => {
    if (!response || typeof response !== "string") return response;

    let preciseResponse = response;

    // Remove unnecessary phrases but keep greetings
    const unnecessaryPhrases = [
      /I'm glad you're looking to\s+/gi,
      /According to our context,\s+/gi,
      /According to the information provided,\s+/gi,
      /Based on the context,\s+/gi,
      /As per the available information,\s+/gi,
      /It's essential to\s+/gi,
      /Please note that\s+/gi,
      /Some key things to note about\s+/gi,
      /If you're unable to visit\s+/gi,
      /If you have any further questions or need assistance, feel free to ask!/gi,
      /Feel free to ask if you have any questions!/gi,
      /Let me help you with that\.\s*/gi,
      /I'd be happy to help you\.\s*/gi,
      /Thank you for asking\.\s*/gi,
      /This will help you\s+/gi,
      /These offices are equipped with\s+/gi,
      /In Pakistan Railways,?\s+/gi,
    ];

    // Remove unnecessary phrases
    unnecessaryPhrases.forEach((phrase) => {
      preciseResponse = preciseResponse.replace(phrase, "");
    });

    // Fix specific grammatical patterns BEFORE general cleanup
    preciseResponse = preciseResponse.replace(
      /\butilize your\b/g,
      "To use your",
    );
    preciseResponse = preciseResponse.replace(
      /\bcarry the military discount voucher\b/g,
      "Carry the military discount voucher",
    );
    preciseResponse = preciseResponse.replace(
      /\bprovides services for booking and managing\b/g,
      "handles booking and managing",
    );
    preciseResponse = preciseResponse.replace(
      /\bwhere passengers can visit in person to book their tickets\b/g,
      "where passengers can book tickets",
    );
    preciseResponse = preciseResponse.replace(
      /\balthough the operating hours may be limited\b/g,
      "",
    );
    preciseResponse = preciseResponse.replace(
      /\bcan provide assistance with booking and answer any questions you may have about\b/g,
      "can assist with",
    );

    // Convert numbered lists to bullet points for clarity
    preciseResponse = preciseResponse.replace(/(\d+)\.\s+/g, "• ");

    // Clean up spacing and fix grammar
    preciseResponse = preciseResponse.replace(/\s+/g, " ").trim();

    // Fix sentence fragments and capitalization
    preciseResponse = preciseResponse.replace(/\s*\.\s*([a-z])/g, ". $1");
    preciseResponse = preciseResponse.replace(
      /^\s*([a-z])/g,
      (match, firstChar) => firstChar.toUpperCase(),
    );

    // Fix common grammar fragments
    preciseResponse = preciseResponse.replace(
      /\bthe necessary technology and staff\b/g,
      "with necessary technology and staff",
    );
    preciseResponse = preciseResponse.replace(
      /\breservation offices are typically located\b/g,
      "Reservation offices are typically located",
    );
    preciseResponse = preciseResponse.replace(
      /\bThey are also available at smaller stations,\.\s*\b/g,
      "They are also available at smaller stations. ",
    );
    preciseResponse = preciseResponse.replace(
      /\ba reservation office in person\b/g,
      "If you cannot visit a reservation office in person",
    );

    // Fix URL spacing issues
    preciseResponse = preciseResponse.replace(
      /Pakrail\.\s*gov\.\s*pk/g,
      "Pakrail.gov.pk",
    );

    // Clean up spacing and fix grammar
    preciseResponse = preciseResponse.replace(/\s+/g, " ").trim();

    // Capitalize first letter after greeting
    preciseResponse = preciseResponse.replace(
      /(Assalam-u-Alaikum!)\s*(\w)/,
      (match, greeting, firstChar) => {
        return greeting + " " + firstChar.toUpperCase();
      },
    );

    // Fix bullet point formatting - ensure proper line breaks
    preciseResponse = preciseResponse.replace(/•\s+/g, "\n• ");
    preciseResponse = preciseResponse.replace(/\s*•\s*/g, "\n• ");
    preciseResponse = preciseResponse.replace(/([.!?])\s*•/g, "$1\n\n•");
    preciseResponse = preciseResponse.replace(/(\w)\s*•/g, "$1\n\n•");

    // Final bullet point formatting - ensure they're on separate lines
    preciseResponse = preciseResponse.replace(/•\s*/g, "\n• ");
    preciseResponse = preciseResponse.replace(/\n\s*\n•/g, "\n• ");
    preciseResponse = preciseResponse.replace(/(\w)\n•/g, "$1\n\n•");

    // Add proper punctuation at the end if missing
    if (!preciseResponse.match(/[.!?]$/)) {
      preciseResponse += ".";
    }

    return preciseResponse;
  };

  // ── Handle free-text send ──────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMsg({ type: "user", text });
    addMsg({ type: "typing" });

    // Scroll to user question when RAG question is sent
    setTimeout(() => {
      // Find the last user message element (more reliable than text matching)
      const allChildren = Array.from(bodyRef.current?.children || []);
      const userMessages = allChildren.filter(
        (child) =>
          child.classList && child.classList.contains("pr-bubble--user"),
      );
      const lastUserMsg = userMessages[userMessages.length - 1];

      if (lastUserMsg) {
        // Scroll to very top of viewport like ChatGPT
        lastUserMsg.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }, 100);

    setTimeout(async () => {
      // Try RAG backend first for free-text input
      try {
        const response = await fetch(
          "https://pak-railway-chatbot-backend-gqzd.onrender.com/chat/ask",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: text,
              session_id: null,
              precision_mode: true, // Enable precision mode for concise responses
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          // setMessages((prev) => [
          //   ...removeTyping(prev),
          //   {
          //     type: "bot",
          //     text: data.answer, // Backend now handles precision processing
          //     sources: data.sources || [],
          //     confidence: data.confidence || 0.0,
          //     sessionId: data.session_id,
          //     backButton: true,
          //   },
          // ]);
          setMessages((prev) => {
          const updated = [
            ...removeTyping(prev),
            {
              type: "bot",
              text: data.answer,
              sources: data.sources || [],
              confidence: data.confidence || 0.0,
              sessionId: data.session_id,
              backButton: true,
           },
         ];

  setTimeout(() => {
    scrollToLatest();
  }, 0);

  return updated;
});
          // Check scroll position after RAG response to update button visibility
          setTimeout(handleScroll, 100);
        } else {
          // Fallback to keyword matching if RAG fails
          const resp = resolveKeyword(text);
          // setMessages((prev) => [
          //   ...removeTyping(prev),
          //   { type: "bot", ...resp, backButton: true },
          // ]);
          setMessages((prev) => {
            const updated = [
              ...removeTyping(prev),
              { type: "bot", ...resp, backButton: true },
            ];

            setTimeout(() => {
              scrollToLatest();
            }, 0);

            return updated;
          });
          // Check scroll position after fallback response to update button visibility
          setTimeout(handleScroll, 100);
        }
      } catch (error) {
        console.error("RAG API Error:", error);
        // Fallback to keyword matching on error
        const resp = resolveKeyword(text);
        setMessages((prev) => [
          ...removeTyping(prev),
          { type: "bot", ...resp, backButton: true },
        ]);
        // Check scroll position after error fallback response to update button visibility
        setTimeout(handleScroll, 100);
      }
    }, 900);
  };

  const handleBack = () => {
    console.log("handleBack called - removing submenu and back button only");
    setMessages((prev) => {
      const result = prev
        .map((m) => {
          // Remove submenu messages
          if (m.submenu) return null;
          // Remove backButton property from bot messages (keep the response)
          if (m.backButton && m.type === "bot") {
            return { ...m, backButton: false };
          }
          // Keep all other messages
          return m;
        })
        .filter(Boolean); // Remove null values
      console.log("handleBack - filtered result:", result);
      return result;
    });
    setTimeout(showMainMenu, 300);
  };

  const handleInputKey = (e) => {
    if (e.key === "Enter") handleSend();
  };
  
//  useEffect(() => {
//   if (!bodyRef.current) return;

//   if (messages.length <= lastMessageCount.current) {
//     console.log("No new messages, skipping scroll");
//     return;
//   }

//   lastMessageCount.current = messages.length;

//   const lastMessage = messages[messages.length - 1];

//   if (lastMessage?.type !== "bot"){ 
//     console.log("Last message is not a bot message, skipping scroll");
//     return;}

//   setTimeout(() => {
//     const rows = bodyRef.current.querySelectorAll(".pr-bot-row");
// console.log("Found bot rows:", rows.length);
//     if (!rows.length) return;

//     const newestBotRow = rows[rows.length - 1];

//     newestBotRow.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     });
//     console.log("Scrolling to newest bot row");
//     setTimeout(() => {
//       if (bodyRef.current) {
//         bodyRef.current.scrollTop -= 5;
//         console.log("Scroll adjusted by 5px");
//       }
//     }, 500);
//   }, 1000);
// }, [messages]);

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
