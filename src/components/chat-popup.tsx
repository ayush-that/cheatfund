"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  User,
  Send,
  Square,
  Trash,
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Spinner } from "~/components/spinner";

export function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop, setMessages } = useChat();

  const togglePopup = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizePopup = () => {
    setIsMinimized(true);
  };

  const maximizePopup = () => {
    setIsMinimized(false);
  };

  const closePopup = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={togglePopup}
          className="bg-primary text-primary-foreground fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:opacity-80"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div
          className={cn(
            "bg-card border-border fixed right-6 bottom-6 z-50 flex flex-col rounded-lg border shadow-2xl transition-all duration-300",
            isMinimized ? "h-14 w-80" : "h-96 w-80 md:h-[500px] md:w-96",
          )}
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground flex flex-shrink-0 items-center justify-between rounded-t-lg p-3">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h3 className="text-sm font-semibold">ChitFund Support</h3>
            </div>
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <button
                  onClick={minimizePopup}
                  className="hover:bg-primary/80 rounded p-1 transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minimize2 size={16} />
                </button>
              )}
              {isMinimized && (
                <button
                  onClick={maximizePopup}
                  className="hover:bg-primary/80 rounded p-1 transition-colors"
                  aria-label="Maximize chat"
                >
                  <Maximize2 size={16} />
                </button>
              )}
              <button
                onClick={closePopup}
                className="hover:bg-primary/80 rounded p-1 transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages Area - This will take remaining space */}
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {/* Welcome Message */}
                <div className="mb-4 flex items-start gap-2 text-sm">
                  <div className="bg-primary mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                    <MessageCircle
                      size={12}
                      className="text-primary-foreground"
                    />
                  </div>
                  <p className="text-muted-foreground">
                    Welcome to ChitFund! I'm here to help you with chit funds,
                    savings groups, and platform features. How can I assist you
                    today?
                  </p>
                </div>

                {/* Chat Messages */}
                <div className="space-y-3">
                  {messages.map(({ id, parts, role }) => (
                    <div
                      key={id}
                      className={cn(
                        "flex items-start gap-2 text-sm",
                        role === "user" ? "flex-row-reverse" : "",
                      )}
                    >
                      {role === "user" ? (
                        <div className="bg-secondary mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                          <User
                            size={12}
                            className="text-secondary-foreground"
                          />
                        </div>
                      ) : (
                        <div className="bg-primary mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                          <MessageCircle
                            size={12}
                            className="text-primary-foreground"
                          />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg p-2",
                          role === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {parts.map((part, i) => {
                          switch (part.type) {
                            case "text":
                              return (
                                <Markdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p(props) {
                                      return (
                                        <p
                                          className="text-xs leading-relaxed"
                                          {...props}
                                        />
                                      );
                                    },
                                    a(props) {
                                      return (
                                        <a
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 underline"
                                          {...props}
                                        />
                                      );
                                    },
                                    ul(props) {
                                      return (
                                        <ul
                                          className="ml-4 list-disc space-y-1 text-xs"
                                          {...props}
                                        />
                                      );
                                    },
                                    ol(props) {
                                      return (
                                        <ol
                                          className="ml-4 list-decimal space-y-1 text-xs"
                                          {...props}
                                        />
                                      );
                                    },
                                  }}
                                  key={`${id}-${i}`}
                                >
                                  {part.text}
                                </Markdown>
                              );
                          }
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Loading State */}
                {status === "submitted" && (
                  <div className="mt-3 flex items-start gap-2 text-sm">
                    <div className="bg-primary mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                      <MessageCircle
                        size={12}
                        className="text-primary-foreground"
                      />
                    </div>
                    <div className="bg-muted flex items-center gap-2 rounded-lg p-2">
                      <Spinner />
                      <p className="text-muted-foreground text-xs">Typing...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className="border-border flex-shrink-0 border-t p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (status === "streaming" || status === "submitted") {
                      stop();
                    } else {
                      if (!input.trim()) return;
                      sendMessage({ text: input });
                      setInput("");
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring flex-1 rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                    value={input}
                    placeholder="Ask about chit funds, savings, or platform features..."
                    onChange={(e) => setInput(e.currentTarget.value)}
                    disabled={status === "submitted" || status === "streaming"}
                  />
                  <div className="flex gap-1">
                    <button
                      className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:opacity-80 disabled:opacity-50"
                      type="submit"
                      disabled={
                        status === "submitted" || status === "streaming"
                      }
                    >
                      {status === "submitted" || status === "streaming" ? (
                        <Square fill="currentColor" size={14} />
                      ) : (
                        <Send size={14} />
                      )}
                    </button>
                    <button
                      disabled={
                        status === "submitted" || status === "streaming"
                      }
                      className="bg-secondary text-secondary-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:opacity-80 disabled:opacity-50"
                      type="button"
                      onClick={() => {
                        setInput("");
                        setMessages([]);
                      }}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
