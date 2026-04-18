import React, { useState } from "react";
import { ChatWindow } from "../ChatWindow";

export const DiscussionBull: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton flottant pour ouvrir/fermer le chat */}
      <button
        onClick={toggleChat}
        className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition"
      >
        {isOpen ? "Fermer" : "Chat"}
      </button>

      {/* Fenêtre de discussion */}
      {isOpen && (
        <div className="mt-2 w-80 h-96 bg-white shadow-xl rounded-lg overflow-hidden flex flex-col">
          <ChatWindow />
        </div>
      )}
    </div>
  );
};