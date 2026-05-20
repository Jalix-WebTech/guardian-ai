"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* SEND MESSAGE */
  async function handleSend() {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");

    // ✅ Add user message ONCE
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
    ]);

    /* -----------------------------
       OFFLINE MODE (FAST RESPONSE)
    ------------------------------*/
    if (offlineMode) {
      const offlineReply: Message = {
        role: "ai",
        content: `Emergency Level: UNKNOWN

Condition:
Offline mode active. Limited emergency guidance available.

Steps:
• Stay calm
• Move to a safe location
• Seek human assistance if possible`,
      };

      setMessages((prev) => [...prev, offlineReply]);
      return; // ❗ NO loading state in offline mode
    }

    /* -----------------------------
       ONLINE MODE
    ------------------------------*/
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();

      const aiMessage: Message = {
        role: "ai",
        content: `
Emergency Level: ${data?.response?.level ?? "UNKNOWN"}

Condition:
${data?.response?.condition ?? "No response received"}

Steps:
${(data?.response?.steps ?? [])
  .map((s: string) => `• ${s}`)
  .join("\n")}
        `,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat API Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Emergency Level: UNKNOWN

Condition:
Unable to reach Guardian AI servers.

Steps:
• Check internet connection
• Retry request
• Use offline mode if needed`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* HEADER */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">Guardian AI</h1>
            <p className="text-sm text-gray-400 mt-1">
              AI Emergency Assistant • From Jalixon
            </p>
          </div>

          {/* OFFLINE TOGGLE */}
          <button
            onClick={() => setOfflineMode((p) => !p)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
              offlineMode
                ? "bg-yellow-600 text-black"
                : "bg-gray-800 text-white"
            }`}
          >
            {offlineMode ? "Offline ON" : "Online Mode"}
          </button>

        </div>
      </header>

      {/* CHAT */}
      <section className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

          {/* EMPTY STATE */}
          {messages.length === 0 && (
            <div className="border border-gray-800 bg-gray-900 rounded-2xl p-6 text-gray-400">
              <h2 className="text-xl font-semibold text-white mb-3">
                Emergency Assistant Ready
              </h2>
              <p>
                Describe your emergency situation clearly to receive guidance.
              </p>
            </div>
          )}

          {/* MESSAGES */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`rounded-2xl p-5 border whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-gray-800 border-gray-700 ml-auto max-w-2xl"
                  : "bg-gray-900 border-red-900 max-w-3xl"
              }`}
            >
              <p className="text-xs uppercase text-gray-500 mb-2">
                {msg.role === "user" ? "You" : "Guardian AI"}
              </p>
              <p>{msg.content}</p>
            </div>
          ))}

          {/* LOADING */}
          {loading && (
            <div className="bg-gray-900 border border-red-900 rounded-2xl p-5 max-w-xs">
              <p className="text-xs uppercase text-gray-500 mb-3">
                Guardian AI
              </p>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </section>

      {/* INPUT */}
      <footer className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-5xl mx-auto p-4 flex gap-3">

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              offlineMode
                ? "Offline mode active..."
                : "Describe your emergency..."
            }
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-red-600"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl font-semibold transition"
          >
            {loading ? "Thinking..." : "Send"}
          </button>

        </div>
      </footer>
    </main>
  );
}