import React, { useState, KeyboardEvent } from "react";
import { Loader2, Send } from "lucide-react";

type Props = {
  loading: boolean;
  onSend: (message: string) => void;
};

export const ChatComposer: React.FC<Props> = ({
  loading,
  onSend,
}) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;

    onSend(input);

    setInput("");
  };

  const onKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card/30 backdrop-blur p-4 shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 p-2 rounded-2xl glass-card focus-within:ring-2 focus-within:ring-primary/30 transition-all">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Posez votre question analytique..."
            className="flex-1 resize-none bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-muted-foreground max-h-40"
            style={{ minHeight: 40 }}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="h-10 w-10 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-2">
          L'IA peut commettre des erreurs.
        </p>
      </div>
    </div>
  );
};