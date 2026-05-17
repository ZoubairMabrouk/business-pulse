import { useState } from "react";

import { AnalyticsService } from "@/services/AnalyticsService";

import {
  Conversation,
  Message,
} from "@/services/chat.types";

const uid = () =>
  Math.random()
    .toString(36)
    .slice(2, 10);

export const useChat = () => {
  // ─────────────────────────────────────
  // Initial conversation
  // ─────────────────────────────────────
  const initialConversation: Conversation =
    {
      id: uid(),
      title: "Nouvelle conversation",
      messages: [],
      createdAt: Date.now(),
    };

  // ─────────────────────────────────────
  // States
  // ─────────────────────────────────────
  const [conversations, setConversations] =
    useState<Conversation[]>([
      initialConversation,
    ]);

  const [activeId, setActiveId] =
    useState(initialConversation.id);

  const [loading, setLoading] =
    useState(false);

  // ─────────────────────────────────────
  // Active conversation
  // ─────────────────────────────────────
  const activeConversation =
    conversations.find(
      (c) => c.id === activeId
    ) || conversations[0];

  // ─────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────
  const updateConversation = (
    updater: (
      conv: Conversation
    ) => Conversation
  ) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeId
          ? updater(conv)
          : conv
      )
    );
  };

  // ─────────────────────────────────────
  // Create conversation
  // ─────────────────────────────────────
  const createConversation = () => {
    const newConversation: Conversation =
      {
        id: uid(),
        title: "Nouvelle conversation",
        messages: [],
        createdAt: Date.now(),
      };

    setConversations((prev) => [
      newConversation,
      ...prev,
    ]);

    setActiveId(newConversation.id);
  };

  // ─────────────────────────────────────
  // Delete conversation
  // ─────────────────────────────────────
  const deleteConversation = (
    id: string
  ) => {
    setConversations((prev) => {
      const updated =
        prev.filter(
          (c) => c.id !== id
        );

      // If no conversations remain
      if (updated.length === 0) {
        const fallback: Conversation =
          {
            id: uid(),
            title:
              "Nouvelle conversation",
            messages: [],
            createdAt: Date.now(),
          };

        setActiveId(fallback.id);

        return [fallback];
      }

      // If current active deleted
      if (id === activeId) {
        setActiveId(updated[0].id);
      }

      return updated;
    });
  };

  // ─────────────────────────────────────
  // Send message
  // ─────────────────────────────────────
  const sendMessage = async (
    prompt: string
  ) => {
    if (
      !prompt.trim() ||
      loading ||
      !activeConversation
    ) {
      return;
    }

    const userMessage: Message = {
      id: uid(),
      from: "user",
      text: prompt,
      ts: Date.now(),
    };

    // Add user message
    updateConversation((conv) => ({
      ...conv,
      title:
        conv.messages.length === 0
          ? prompt.slice(0, 40)
          : conv.title,
      messages: [
        ...conv.messages,
        userMessage,
      ],
    }));

    setLoading(true);

    try {
      const data =
        await AnalyticsService.ask(
          prompt
        );

      const botMessage: Message =
        Array.isArray(data)
          ? {
              id: uid(),
              from: "bot",
              tableData: data,
              ts: Date.now(),
            }
          : {
              id: uid(),
              from: "bot",
              text: "Aucun résultat trouvé.",
              ts: Date.now(),
            };

      updateConversation((conv) => ({
        ...conv,
        messages: [
          ...conv.messages,
          botMessage,
        ],
      }));
    } catch (error) {
      updateConversation((conv) => ({
        ...conv,
        messages: [
          ...conv.messages,
          {
            id: uid(),
            from: "bot",
            text:
              "Erreur de connexion aux services IA.",
            ts: Date.now(),
          },
        ],
      }));
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────
  // Exposed API
  // ─────────────────────────────────────
  return {
    conversations,
    activeConversation,

    activeId,
    setActiveId,

    loading,

    sendMessage,

    createConversation,
    deleteConversation,

    setConversations,
  };
};