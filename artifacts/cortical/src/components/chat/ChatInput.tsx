import React, { useRef, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUp, Settings2, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  model: "lite" | "max";
  onModelChange: (model: "lite" | "max") => void;
  onCustomizeClick: () => void;
  isLoading: boolean;
}

export function ChatInput({ 
  value, 
  onChange, 
  onSubmit, 
  model, 
  onModelChange, 
  onCustomizeClick,
  isLoading 
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto w-full px-4 pb-6">
      <motion.div 
        layout
        className="bg-card border border-border/60 rounded-3xl shadow-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all p-3 flex flex-col gap-2"
      >
        <TextareaAutosize
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Wyślij wiadomość do Prime..."
          className="w-full bg-transparent resize-none outline-none max-h-[200px] text-foreground placeholder:text-muted-foreground px-2 py-1 text-[15px] leading-relaxed"
          minRows={1}
          maxRows={8}
        />
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {/* Model Selector with Glow Effects */}
            <div className="flex bg-secondary/50 rounded-xl p-1 relative">
              {/* Glow effect for active model */}
              {model === "lite" && (
                <motion.div
                  layoutId="model-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg pointer-events-none"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              {model === "max" && (
                <motion.div
                  layoutId="model-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-accent/20 to-accent/10 rounded-lg pointer-events-none"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <motion.button
                onClick={() => onModelChange("lite")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative z-10",
                  model === "lite" 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    boxShadow: model === "lite" 
                      ? ["0 0 0 0 rgba(var(--primary), 0.4)", "0 0 0 8px rgba(var(--primary), 0)"]
                      : "0 0 0 0 rgba(var(--primary), 0)"
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </motion.div>
                Prime Lite
              </motion.button>

              <motion.button
                onClick={() => onModelChange("max")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative z-10",
                  model === "max"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    boxShadow: model === "max"
                      ? ["0 0 0 0 rgba(var(--accent), 0.4)", "0 0 0 8px rgba(var(--accent), 0)"]
                      : "0 0 0 0 rgba(var(--accent), 0)"
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                </motion.div>
                Prime Max
              </motion.button>
            </div>

            <button
              onClick={onCustomizeClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dostosuj Prime</span>
            </button>
          </div>

          <button
            onClick={() => value.trim() && !isLoading && onSubmit()}
            disabled={!value.trim() || isLoading}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              value.trim() && !isLoading
                ? "bg-primary text-primary-foreground shadow-md hover:-translate-y-0.5 active:translate-y-0"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>
      <div className="text-center mt-3 text-[11px] text-muted-foreground">
        AI może popełniać błędy. Sprawdzaj ważne informacje.
      </div>
    </div>
  );
}
