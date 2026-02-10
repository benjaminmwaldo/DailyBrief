"use client";

import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { TopicActionCard } from "@/components/chat/topic-action-card";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface ToolResult {
  name: string;
  result: {
    success: boolean;
    topicName?: string;
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch("/api/chat/history");
        if (response.ok) {
          const data = await response.json();
          setMessages(
            data.messages.map((msg: { id: string; role: string; content: string; createdAt: string }) => ({
              ...msg,
              createdAt: new Date(msg.createdAt),
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadHistory();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSendMessage = async (message: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingContent("");
    setToolResults([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let assistantContent = "";
      const receivedToolResults: ToolResult[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.type === "text") {
              assistantContent += data.text;
              setStreamingContent(assistantContent);
            } else if (data.type === "tool_result") {
              receivedToolResults.push({
                name: data.name,
                result: data.result,
              });
              setToolResults([...receivedToolResults]);
            } else if (data.type === "done") {
              // Add final assistant message
              const assistantMessage: Message = {
                id: `msg-${Date.now()}`,
                role: "assistant",
                content: assistantContent,
                createdAt: new Date(),
              };
              setMessages((prev) => [...prev, assistantMessage]);
              setStreamingContent("");
            } else if (data.type === "error") {
              console.error("Chat error:", data.message);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Could add error message to UI here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold">Chat with Brief</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tell me about your interests and I&apos;ll help you set up your daily briefing.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <MessageList messages={messages} />

          {/* Streaming message */}
          {streamingContent && (
            <div className="flex justify-start px-4">
              <div className="max-w-[70%] rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-800">
                <div className="whitespace-pre-wrap break-words">{streamingContent}</div>
              </div>
            </div>
          )}

          {/* Tool results */}
          {toolResults.map((tool, index) => {
            if (tool.name === "subscribe_topic" && tool.result.success && tool.result.topicName) {
              return (
                <div key={index} className="px-4">
                  <TopicActionCard action="subscribed" topicName={tool.result.topicName} />
                </div>
              );
            }
            if (tool.name === "unsubscribe_topic" && tool.result.success) {
              return (
                <div key={index} className="px-4">
                  <TopicActionCard action="unsubscribed" topicName="the topic" />
                </div>
              );
            }
            return null;
          })}

          {/* Loading indicator */}
          {isLoading && !streamingContent && (
            <div className="flex justify-start px-4">
              <div className="max-w-[70%] rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-800">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:0.2s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <MessageInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
