import React from "react";
import { Bot } from "lucide-react";

export const ChatHeader: React.FC = () => {
  return (
    <div className="h-14 border-b border-border flex items-center gap-3 px-5 shrink-0">
      <div className="relative">
        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>

        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-background" />
      </div>

      <div className="flex-1">
        <h2 className="text-sm font-semibold leading-tight">
          Assistant Analytique IA
        </h2>

        <p className="text-[10px] text-muted-foreground">
          Connecté · Powered by OLAP + LLM
        </p>
      </div>
    </div>
  );
};