import { create } from "zustand";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hi there 👋 I'm Stella, the support assistant for St Stephens Therapy Centre.",
};

export const useChatStore = create((set, get) => ({
  messages: [INITIAL_MESSAGE],

  loading: false,

  retrying: false,

  sendMessage: async (text) => {
    if (!text?.trim()) return;

    const userMessage = {
      role: "user",
      content: text.trim(),
    };

    const updatedMessages = [
      ...get().messages,
      userMessage,
    ];

    set({
      messages: updatedMessages,
      loading: true,
      retrying: false,
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`api_${response.status}`);
      }

      const data = await response.json();

      set({
        messages: [
          ...updatedMessages,
          {
            role: "assistant",
            content: data.reply,
          },
        ],
      });
    } catch (err) {
      const isRateLimit =
        err.message === "api_429";

      set({
        retrying: isRateLimit,

        messages: [
          ...updatedMessages,
          {
            role: "assistant",
            isError: true,
            content: isRateLimit
              ? "I'm receiving a lot of messages right now. Please try again shortly."
              : "Something went wrong. Please try again.",
          },
        ],
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  clearChat: () => {
    set({
      messages: [INITIAL_MESSAGE],
    });
  },
}));