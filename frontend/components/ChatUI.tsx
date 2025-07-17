"use client";
import { useEffect, useState } from "react";
import api from "../lib/axios";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/chat/")
      .then((res) => setMessages(res.data))
      .catch(console.error);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat/", { content: input });
      const botReply = res.data.reply;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botReply },
      ]);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <div className="border p-4 rounded h-96 overflow-y-auto bg-gray-100">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 ${
              msg.role === "user"
                ? "text-right text-blue-600"
                : "text-left text-green-600"
            }`}
          >
            <span>{msg.content}</span>
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 text-left">The bot is typing...</div>
        )}
      </div>

      <div className="flex mt-4 gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
