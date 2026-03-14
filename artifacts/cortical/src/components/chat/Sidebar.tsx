import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Trash2, Moon, Sun, LogOut, LogIn, Menu, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useGetChats, useDeleteChat } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetChatsQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { isToday, isYesterday, subDays, isAfter } from "date-fns";

export function Sidebar({ currentChatId, onNewChat, onShowAuthModal }: { currentChatId: string | null, onNewChat: () => void, onShowAuthModal?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { getUserId, logout, isGuest, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const userId = getUserId();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: chats } = useGetChats({ userId: userId || "" }, { query: { enabled: !!userId } });

  const deleteMutation = useDeleteChat({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetChatsQueryKey({ userId: userId || "" }) });
      }
    }
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate({ chatId: id });
    if (currentChatId === id) setLocation("/");
  };

  const groupedChats = React.useMemo(() => {
    if (!chats) return [];
    const today: typeof chats = [];
    const yesterday: typeof chats = [];
    const previous7Days: typeof chats = [];
    const older: typeof chats = [];
    const sevenDaysAgo = subDays(new Date(), 7);

    chats.forEach(chat => {
      const date = new Date(chat.createdAt);
      if (isToday(date)) today.push(chat);
      else if (isYesterday(date)) yesterday.push(chat);
      else if (isAfter(date, sevenDaysAgo)) previous7Days.push(chat);
      else older.push(chat);
    });

    return [
      { label: "Dzisiaj", items: today },
      { label: "Wczoraj", items: yesterday },
      { label: "Poprzednie 7 dni", items: previous7Days },
      { label: "Starsze", items: older },
    ].filter(g => g.items.length > 0);
  }, [chats]);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-xl shadow-sm border"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <span className="font-semibold text-base tracking-tight">Cortical</span>
          <div className="flex items-center gap-1">
            {/* Dark/Light toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title={theme === "dark" ? "Włącz jasny motyw" : "Włącz ciemny motyw"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={toggleSidebar} className="md:hidden p-2 text-muted-foreground hover:text-foreground">
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-3 pb-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-secondary/60 text-foreground hover:bg-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nowy czat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-5 py-1 scrollbar-thin">
          {groupedChats.length === 0 ? (
            <div className="px-2 py-10 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <MessageSquare className="w-6 h-6 opacity-20" />
              <p>Brak historii czatów</p>
            </div>
          ) : (
            groupedChats.map(group => (
              <div key={group.label}>
                <h3 className="px-3 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-1">
                  {group.label}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map(chat => (
                    <div key={chat.id} className="group relative">
                      <Link href={`/chat/${chat.id}`}>
                        <div
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer truncate",
                            currentChatId === chat.id
                              ? "bg-secondary text-foreground font-medium"
                              : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                          )}
                          onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                        >
                          <span className="truncate">{chat.title || "Nowa rozmowa"}</span>
                        </div>
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, chat.id)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded transition-all"
                        title="Usuń czat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border/40">
          <div className="flex items-center justify-between px-1 py-2 rounded-xl">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="truncate">
                <p className="text-xs font-medium truncate leading-tight">
                  {isGuest ? "Tryb gościa" : (user?.email?.split("@")[0] || "Użytkownik")}
                </p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight">
                  {isGuest ? "Dane nie są zapisywane" : user?.email}
                </p>
              </div>
            </div>

            {isGuest ? (
              <button
                onClick={() => {
                  if (onShowAuthModal) {
                    onShowAuthModal();
                  } else {
                    setLocation("/auth");
                  }
                }}
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                title="Zaloguj się"
              >
                <LogIn className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={logout}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                title="Wyloguj"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
