"use client";

import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Send, Square, Trash } from "lucide-react";
import { cn } from "~/lib/utils";
import { Spinner } from "~/components/spinner";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop, setMessages } = useChat();
  return (
    <div className="stretch mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-between px-5 pt-12 pb-4">
      <div>
        <h1 className="mb-5 text-2xl font-semibold">
          ASI1 x NextJS x Vercel AI SDK
        </h1>

        <div className="max-h-[calc(100vh-200px)] w-full overflow-y-auto">
          <div className="mb-5 flex w-full items-start justify-start gap-3 whitespace-pre-wrap">
            <Image
              src={"/images/logos/asi-logo.png"}
              alt="ASI Logo"
              title="ASI Logo"
              width={225}
              height={255}
              className="h-auto w-9 rounded-md"
            />

            <p>Hello, I am an ASI:One Assistant. How may I assist you today?</p>
          </div>

          <div className="flex w-full flex-col items-center justify-start gap-7">
            {messages.map(({ id, parts, role }) => (
              <div
                key={id}
                className={cn(
                  "flex w-full items-start justify-start gap-3 whitespace-pre-wrap",
                  role === "user" ? "flex-row-reverse" : "",
                )}
              >
                {role === "user" ? (
                  <User />
                ) : (
                  <Image
                    src={"/images/logos/asi-logo.png"}
                    alt="ASI Logo"
                    title="ASI Logo"
                    width={225}
                    height={255}
                    className="h-auto w-9 rounded-md"
                  />
                )}

                <div>
                  {parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Markdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p(props) {
                                return <p className="block" {...props} />;
                              },
                              a(props) {
                                return (
                                  <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cursor-pointer font-semibold text-blue-600 underline"
                                    {...props}
                                  />
                                );
                              },
                              ul(props) {
                                return (
                                  <ul
                                    className="flex flex-col items-start justify-center gap-4"
                                    {...props}
                                  />
                                );
                              },
                              ol(props) {
                                return (
                                  <ol
                                    className="flex flex-col items-start justify-center gap-4"
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

          {status === "submitted" ? (
            <div className="mb-5 flex w-full items-center justify-start gap-3 whitespace-pre-wrap">
              <Image
                src={"/images/logos/asi-logo.png"}
                alt="ASI Logo"
                title="ASI Logo"
                width={225}
                height={255}
                className="h-auto w-9 rounded-md"
              />

              <div className="flex items-center justify-start gap-3">
                <Spinner />
                <p>Loading...</p>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>

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
        className="mt-6 flex w-full items-center gap-3"
      >
        <input
          className="w-full max-w-3xl rounded border p-2 shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={(e) => setInput(e.currentTarget.value)}
          disabled={status === "submitted" || status === "streaming"}
        />
        <button
          className="flex cursor-pointer items-center rounded bg-[#111111] px-4 py-2 font-semibold text-white shadow-lg transition-all hover:opacity-80"
          type="submit"
        >
          {status === "submitted" || status === "streaming" ? (
            <Square fill="currentColor" />
          ) : (
            <Send />
          )}
        </button>
        <button
          disabled={status === "submitted" || status === "streaming"}
          className="flex cursor-pointer items-center rounded bg-[#111111] px-4 py-2 font-semibold text-white shadow-lg transition-all hover:opacity-80"
          type="button"
        >
          <Trash
            onClick={() => {
              setInput("");
              setMessages([]);
            }}
          />
        </button>
      </form>
    </div>
  );
}
