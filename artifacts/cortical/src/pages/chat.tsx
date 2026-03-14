import React, { useState, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { AuthModal } from "@/components/chat/AuthModal";
import { BackgroundBubble } from "@/components/animations/BackgroundBubble";
import { GeometricLoader } from "@/components/animations/GeometricLoader";
import { useAuth } from "@/hooks/use-auth";
import { useGetMessages, useCreateChat } from "@workspace/api-client-react";
import { useCorticalApi } from "@/hooks/use-cortical-api";
import { X, Save, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

const GREETINGS = [
  "W czym mogę dziś pomóc?",
  "Witaj w Cortical. Co chcesz zrobić?",
  "Hej! Jak mogę Ci dzisiaj pomóc?",
  "Gotowy do działania. Czego potrzebujesz?",
  "Co masz na myśli? Chętnie pomogę.",
  "Twój asystent AI czeka. Zacznijmy!",
  "Cześć! Co chcesz dziś osiągnąć?",
  "Jestem do Twojej dyspozycji. Pytaj śmiało.",
  "Jak mogę Ci pomóc tego dnia?",
  "Prime gotowy. Powiedz, co chcesz zrobić.",
  "Zaczynamy? Napisz coś, a ja pomogę.",
  "Witaj. Mam dla Ciebie pełne możliwości.",
  "Co Cię dziś interesuje?",
  "Dobry pomysł, żeby tu zajrzeć. Czym mogę służyć?",
  "Twoje pytania, moje odpowiedzi. Zaczynajmy!"
];

export default function ChatPage() {
  const [match, params] = useRoute("/chat/:id");
  const chatId = match ? params.id : null;
  const [, setLocation] = useLocation();
  const { getUserId, isLoading: authLoading, shouldShowAuthModal, loginAsGuest, dismissAuthModal } = useAuth();
  const userId = getUserId();

  const [input, setInput] = useState("");
  const [model, setModel] = useState<"lite" | "max">("lite");
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [greeting, setGreeting] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading: loadingMessages } = useGetMessages(chatId || "", {
    query: { enabled: !!chatId }
  });

  const createChat = useCreateChat();
  const corticalApi = useCorticalApi();

  useEffect(() => {
    if (!sessionStorage.getItem("cortical_greeting")) {
      sessionStorage.setItem("cortical_greeting", GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    }
    setGreeting(sessionStorage.getItem("cortical_greeting")!);
  }, []);

  useEffect(() => {
    // Show auth modal if needed
    if (shouldShowAuthModal && !authLoading) {
      setShowAuthModal(true);
    }
  }, [shouldShowAuthModal, authLoading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, corticalApi.isPending]);

  // Allow guests to continue, don't redirect
  useEffect(() => {
    if (!authLoading && !userId && !shouldShowAuthModal) {
      // Show auth modal on initial visit
      setShowAuthModal(true);
    }
  }, [userId, authLoading, shouldShowAuthModal]);

  if (authLoading) return null;
  if (!userId && !showAuthModal) return null;

  const handleSubmit = async () => {
    if (!input.trim() || corticalApi.isPending) return;

    const currentInput = input;
    setInput("");

    let activeChatId = chatId;

    // Create chat if it doesn't exist
    if (!activeChatId) {
      const newChat = await createChat.mutateAsync({
        data: {
          userId,
          title: currentInput.slice(0, 30) + (currentInput.length > 30 ? "..." : ""),
          model,
          systemPrompt
        }
      });
      activeChatId = newChat.id;
      // Change URL silently without full reload
      window.history.pushState(null, "", `${import.meta.env.BASE_URL}chat/${activeChatId}`);
    }

    // Call API
    corticalApi.mutate({
      chatId: activeChatId,
      payload: {
        prompt: currentInput,
        model,
        sessionID: activeChatId,
        userID: userId,
        system: systemPrompt
      }
    });
  };

  const handleNewChat = () => {
    setLocation("/");
    setInput("");
    setSystemPrompt("");
    setModel("lite");
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => {
          if (userId) {
            setShowAuthModal(false);
          }
        }}
        onGuestContinue={() => {
          loginAsGuest();
          setShowAuthModal(false);
        }}
      />
      <BackgroundBubble />
      <Sidebar 
        currentChatId={chatId} 
        onNewChat={handleNewChat}
        onShowAuthModal={() => setShowAuthModal(true)}
      />
      <main className="flex-1 flex flex-col relative min-w-0">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-smooth pb-32"
        >
          {!chatId || messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl text-center space-y-4"
              >
                <h1 className="md:text-4xl font-semibold text-foreground tracking-tight text-[48px]">
                  {greeting}
                </h1>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full pt-16 md:pt-8 pb-4 flex flex-col">
              {messages.map((msg, idx) => (
                <ChatMessage key={msg.id || idx} role={msg.role as any} content={msg.content} />
              ))}
              
              {corticalApi.isPending && (
                <div className="px-4 md:px-0 py-6">
                  <GeometricLoader model={model} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent pt-10">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            model={model}
            onModelChange={setModel}
            onCustomizeClick={() => setIsSystemPromptOpen(true)}
            isLoading={corticalApi.isPending}
          />
        </div>
      </main>
      {/* System Prompt Drawer/Modal */}
      <AnimatePresence>
        {isSystemPromptOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSystemPromptOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-card border shadow-2xl rounded-3xl z-50 overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b flex justify-between items-center border-t-[#ffffff] border-r-[#ffffff] border-b-[#ffffff] border-l-[#ffffff] bg-[#ffffff]">
                <h3 className="font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                  Dostosuj Prime (System Prompt)
                </h3>
                <button onClick={() => setIsSystemPromptOpen(false)} className="p-1 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 text-[#171717] border-t-[transparent] border-r-[transparent] border-b-[transparent] border-l-[transparent] bg-[#ffffff]">
                <p className="text-sm text-muted-foreground mb-4">
                  Podaj instrukcje, jak AI powinno się zachowywać w tym czacie. Będzie to wysyłane przy każdym prompcie.
                </p>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Np. Jesteś ekspertem od programowania, odpowiadaj krótko i konkretnie..."
                  className="w-full h-40 bg-background border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none border-t-[#fafafa] border-r-[#fafafa] border-b-[#fafafa] border-l-[#fafafa]"
                />
              </div>
              <div className="px-6 py-4 border-t flex justify-end border-t-[transparent] border-r-[transparent] border-b-[transparent] border-l-[transparent] bg-[#ffffff]">
                <button
                  onClick={() => setIsSystemPromptOpen(false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Zapisz
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
