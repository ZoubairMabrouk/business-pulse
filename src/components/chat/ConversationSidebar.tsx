import React from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Conversation } from "@/services/chat.types";

type Props = {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
};

export const ConversationSidebar: React.FC<Props> = ({
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  onDeleteConversation,
}) => {
  return (
    <aside className="w-64 border-r border-border bg-card/30 backdrop-blur flex flex-col shrink-0 hidden md:flex">
      <div className="p-3 border-b border-border">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouvelle discussion
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Historique
        </p>

        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "group flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition-colors",
              conv.id === activeId
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />

            <span className="flex-1 truncate text-xs">
              {conv.title}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();

                onDeleteConversation(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
};