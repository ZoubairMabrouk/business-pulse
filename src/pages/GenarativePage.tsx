import React, {
  useEffect,
  useRef,
} from "react";

import { Bot } from "lucide-react";

import { useChat } from "@/hooks/useChat";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { EmptyState } from "@/components/chat/EmptyState";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingDots } from "@/components/chat/TypingDots";

export const GenerativePage: React.FC = () => {
  const {
    conversations,
    activeConversation,
    activeId,
    setActiveId,
    loading,
    sendMessage,
    createConversation,
    deleteConversation,
  } = useChat();

  const endRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    activeConversation?.messages,
    loading,
  ]);

  const isEmpty =
    !activeConversation ||
    activeConversation.messages.length === 0;

  return (
    <div className="-m-6 h-[calc(100vh-4rem)] flex bg-background">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNewConversation={
          createConversation
        }
        onDeleteConversation={
          deleteConversation
        }
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
            {isEmpty ? (
              <EmptyState
                onSelectSuggestion={
                  sendMessage
                }
              />
            ) : (
              <>
                {activeConversation.messages.map(
                  (message) => (
                    <MessageBubble
                      key={message.id}
                      msg={message}
                    />
                  )
                )}

                {/* Typing */}
                {loading && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>

                    <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3 flex items-center">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <ChatComposer
          loading={loading}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
};