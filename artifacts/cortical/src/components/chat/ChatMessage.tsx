import React from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "group w-full px-4 py-3",
        isUser ? "flex justify-end" : "flex justify-start"
      )}
    >
      {isUser ? (
        <div className="max-w-[75%] bg-secondary text-foreground px-5 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="max-w-2xl w-full prose dark:prose-invert prose-sm md:prose-base prose-p:leading-relaxed prose-pre:bg-secondary prose-pre:border prose-pre:border-border/50 prose-headings:font-semibold text-[15px]">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </motion.div>
  );
}
