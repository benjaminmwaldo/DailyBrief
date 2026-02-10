"use client";

import { Button } from "@/components/ui/button";
import { useState, KeyboardEvent } from "react";

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const maxLength = 5000;

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-white p-4 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="flex space-x-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Brief about topics you'd like to follow..."
            disabled={isLoading}
            rows={3}
            maxLength={maxLength}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <div className="flex flex-col space-y-2">
            <Button onClick={handleSend} disabled={!message.trim() || isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </Button>
            <div className="text-xs text-gray-500">
              {message.length}/{maxLength}
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
