"use client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[70%] rounded-lg px-4 py-3 ${
              message.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            }`}
          >
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
            <div
              className={`mt-2 text-xs ${
                message.role === "user" ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
