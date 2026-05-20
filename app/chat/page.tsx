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
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* AUTO SCROLL */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* 🔊 + 📳 EMERGENCY EFFECTS */
  function triggerEmergencyEffects(text: string) {
    try {
      if (navigator.vibrate) {
        navigator.vibrate([300, 200, 300, 200, 500]);
      }

      if ("speechSynthesis" in window) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;
        window.speechSynthesis.speak(speech);
      }
    } catch (err) {
      console.log("Emergency effects failed:", err);
    }
  }

  /* OFFLINE FALLBACK RESPONSE */
  function getOfflineResponse(message: string) {
    return {
      level: "UNKNOWN",
      condition: "Offline mode active. Limited emergency guidance available.",
      steps: [
        "Stay calm and assess situation",
        "Move to a safe location if possible",
        "Seek nearby human assistance",
        "Reconnect to network when available",
      ],
    };
  }

  /* SEND MESSAGE */
  async function handleSend() {
    if (!input.trim() || loading) return;

    const currentInput = input;

    const userMessage: Message = {
      role: "user",
      content: currentInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let data;

      /* 🌐 OFFLINE MODE CHECK */
      if (offlineMode || !navigator.onLine) {
        data = { response: getOfflineResponse(currentInput) };
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: currentInput }),
        });

        data = await res.json();
      }

      const response = data.response;

      /* 🚨 EMERGENCY TRIGGER */
      if (response.level === "HIGH") {
        setEmergencyMode(true);
        triggerEmergencyEffects(response.condition);
      }

      const aiMessage: Message = {
        role: "ai",
        content: `
Emergency Level: ${response.level}

Condition:
${response.condition}

Steps:
${response.steps.map((s: string) => `• ${s}`).join("\n")}
        `,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);

      const fallback = {
        role: "ai" as const,
        content: `
Emergency Level: UNKNOWN

Condition:
System error occurred. Switching to safe mode.

Steps:
• Check internet connection
• Retry request
• Use offline emergency procedures
        `,
      };

      setMessages((prev) => [...prev, fallback]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col relative">

      {/* 🚨 EMERGENCY OVERLAY */}
      {emergencyMode && (
        <div className="fixed inset-0 z-50 bg-red-950/90 animate-pulse flex items-center justify-center">
          <div className="text-center p-6">
            <h1 className="text-4xl font-black text-red-400">
              EMERGENCY MODE
            </h1>

            <p className="mt-4 text-gray-200">
              Follow instructions carefully
            </p>

            <button
              onClick={() => setEmergencyMode(false)}
              className="mt-6 px-6 py-3 bg-black rounded-xl"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Guardian AI</h1>

          <p className="text-sm text-gray-400 mt-1">
            Emergency Assistant • Built by Jalixon
          </p>

          {/* OFFLINE TOGGLE */}
          <button
            onClick={() => setOfflineMode(!offlineMode)}
            className={`mt-2 px-3 py-1 rounded-lg text-sm border ${
              offlineMode
                ? "bg-yellow-600 border-yellow-500"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            {offlineMode ? "Offline Mode ON" : "Offline Mode OFF"}
          </button>
        </div>
      </header>

      {/* CHAT AREA */}
      <section className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

          {messages.length === 0 && (
            <div className="border border-gray-800 bg-gray-900 rounded-2xl p-6 text-gray-400">
              <h2 className="text-xl font-semibold text-white mb-3">
                Emergency Assistant Ready
              </h2>
              <p>
                Describe your emergency situation clearly to receive structured guidance.
              </p>
            </div>
          )}

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
              <p className="text-xs text-gray-500 mb-2">Guardian AI</p>
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
            placeholder="Describe your emergency..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold"
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </footer>

    </main>
  );
}