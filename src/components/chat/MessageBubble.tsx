import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Bot,
  Check,
  Copy,
  Sparkles,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Message } from "@/services/chat.types";
import { DynamicChart } from "../DynamicChart";
import { DynamicTable } from "../DynamicTable";

type Props = {
  msg?: Message;
};

export const MessageBubble: React.FC<Props> = ({
  msg,
}) => {
  // Protection
  if (!msg) return null;

  const isUser = msg.from === "user";

  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!msg.text) return;

    await navigator.clipboard.writeText(
      msg.text
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <div
      className={cn(
        "flex gap-3 group animate-slide-up",
        isUser
          ? "flex-row-reverse"
          : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
          isUser
            ? "bg-muted"
            : "gradient-primary"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-primary-foreground" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 min-w-0 max-w-[85%]",
          isUser &&
            "flex flex-col items-end"
        )}
      >
        {msg.tableData ? (
          <div className="space-y-3 w-full">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent" />
              Résultat analytique généré
            </div>

            <DynamicChart
              data={msg.tableData}
            />

            <DynamicTable
              data={msg.tableData}
            />
          </div>
        ) : (
          <div
            className={cn(
              "relative rounded-2xl px-4 py-3 text-sm leading-relaxed",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-sm shadow-md"
                : "glass-card rounded-tl-sm"
            )}
          >
            <div className="markdown-body text-[13.5px] leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
              >
                {msg.text || ""}
              </ReactMarkdown>
            </div>

            {!isUser && msg.text && (
              <button
                onClick={copy}
                className="absolute -bottom-2 -right-2 w-6 h-6 rounded-md bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-muted"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};