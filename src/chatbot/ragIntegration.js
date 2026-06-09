// RAG Backend Integration for Pakistan Railway Chatbot
// Connects frontend to the RAG API backend

// RAG Backend Configuration
const RAG_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL,
  endpoints: {
    chat: "/chat/ask",
    health: "/health",
    stats: "/stats",
  },
};

// API Request Function
export async function callRagAPI(question, sessionId = null) {
  try {
    const response = await fetch(
      `${RAG_CONFIG.baseUrl}${RAG_CONFIG.endpoints.chat}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          session_id: sessionId,
          precision_mode: true,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `RAG API Error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return {
      success: true,
      answer: data.answer,
      sources: data.sources || [],
      sessionId: data.session_id,
      confidence: data.confidence || 0.0,
    };
  } catch (error) {
    console.error("RAG API Error:", error);
    return {
      success: false,
      error: error.message,
      fallbackResponse:
        "I apologize, but I'm having trouble connecting to our intelligent system. Please try again or contact Pakistan Railway helpline at 117 for immediate assistance.",
    };
  }
}

// Health Check Function
export async function checkRagHealth() {
  try {
    const response = await fetch(
      `${RAG_CONFIG.baseUrl}${RAG_CONFIG.endpoints.health}`,
    );

    if (!response.ok) {
      return { healthy: false, error: "Health check failed" };
    }

    const data = await response.json();
    return { healthy: true, status: data.status };
  } catch (error) {
    console.error("Health check error:", error);
    return { healthy: false, error: error.message };
  }
}

// Enhanced Chat Handler with RAG Integration
export async function handleChatWithRAG(userInput, sessionId = null) {
  // First try RAG backend
  const ragResult = await callRagAPI(userInput, sessionId);

  if (ragResult.success) {
    return {
      type: "rag",
      response: ragResult.answer,
      sources: ragResult.sources,
      confidence: ragResult.confidence,
      sessionId: ragResult.sessionId,
      metadata: {
        backend: "rag",
        responseTime: new Date().toISOString(),
        confidence: ragResult.confidence,
      },
    };
  }

  // Fallback to local responses if RAG fails
  return {
    type: "fallback",
    response: ragResult.fallbackResponse,
    sources: [],
    confidence: 0.0,
    sessionId: sessionId || `fallback_${Date.now()}`,
    metadata: {
      backend: "fallback",
      error: ragResult.error,
    },
  };
}

// Batch Question Processing for Multiple Queries
export async function processBatchQuestions(questions) {
  const results = [];

  for (const question of questions) {
    const result = await callRagAPI(question.text);
    results.push({
      question: question.text,
      result: result,
    });
  }

  return results;
}

// RAG Backend Status Monitor
export async function getRagStatus() {
  try {
    const healthResult = await checkRagHealth();
    const statsResponse = await fetch(
      `${RAG_CONFIG.baseUrl}${RAG_CONFIG.endpoints.stats}`,
    );

    let stats = {};
    if (statsResponse.ok) {
      stats = await statsResponse.json();
    }

    return {
      backend: "RAG",
      healthy: healthResult.healthy,
      stats: stats,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      backend: "RAG",
      healthy: false,
      error: error.message,
      lastChecked: new Date().toISOString(),
    };
  }
}

// Integration Helper Functions
export const RAG_HELPERS = {
  // Format sources for display
  formatSources: (sources) => {
    if (!sources || sources.length === 0) {
      return "No specific sources available";
    }
    return sources.join(", ");
  },

  // Get confidence level
  getConfidenceLevel: (confidence) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    if (confidence >= 0.4) return "Low";
    return "Very Low";
  },

  // Check if response is from RAG or fallback
  isRagResponse: (response) => {
    return response.metadata && response.metadata.backend === "rag";
  },
};

// Error Handling
export const RAG_ERROR_HANDLER = {
  handleNetworkError: (error) => {
    console.error("Network Error:", error);
    return {
      type: "error",
      message:
        "Network connection failed. Please check your internet connection and try again.",
      action: "retry",
    };
  },

  handleTimeoutError: () => {
    return {
      type: "error",
      message:
        "Request timed out. The system is taking longer than expected. Please try again.",
      action: "retry",
    };
  },
};

console.log("RAG Integration Module Loaded");
console.log(`Backend URL: ${RAG_CONFIG.baseUrl}`);
