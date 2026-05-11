"use client";

import { useState } from "react";

type Message = {
  role: "user" | "ai";
  content: string;
};

type AIResponse = {
  level?: string;
  condition?: string;
  steps?: string[];
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  async function handleSend() {
    if (!input.trim()) return;

    // 1. Add user message immediately
    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");

    try {
      // 2. Call backend API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await res.json();

      // 3. Safety check (prevents crashes)
      if (!data?.response) {
        console.error("Invalid AI response:", data);
        return;
      }

      const response: AIResponse = data.response;

      // 4. Safe formatting (NO CRASH POSSIBLE)
      const aiMessage: Message = {
        role: "ai",
        content: `
Emergency Level: ${response.level ?? "UNKNOWN"}

Condition: ${response.condition ?? "Not identified"}

Steps:
${(response.steps ?? [])
  .map((s) => "- " + s)
  .join("\n")}
        `,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "⚠ Error connecting to emergency system. Try again.",
        },
      ]);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* HEADER */}
      <header className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Guardian AI - Emergency Chat</h1>
        <p className="text-sm text-gray-400">
          Structured emergency assistance system
        </p>
      </header>

      {/* CHAT AREA */}
      <section className="flex-1 p-4 space-y-4 overflow-y-auto">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border ${
              msg.role === "user"
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-900 border-red-800"
            }`}
          >
            <p className="text-sm text-gray-400">
              {msg.role === "user" ? "You" : "Guardian AI"}
            </p>
            <p className="mt-1 whitespace-pre-line">{msg.content}</p>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-gray-500 text-center mt-10">
            Describe your emergency situation to get help.
          </div>
        )}

      </section>

      {/* INPUT AREA */}
      <footer className="p-4 border-t border-gray-800 flex gap-2">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-3 rounded-lg bg-gray-900 border border-gray-700"
          placeholder="Describe your emergency..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
        >
          Send
        </button>

      </footer>

    </main>
  );
}