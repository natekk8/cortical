import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isGuest: boolean;
  guestId: string | null;
  shouldShowAuthModal: boolean;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isGuest: false,
    guestId: null,
    shouldShowAuthModal: false,
  });

  useEffect(() => {
    // Check if guest is set and track visit count
    const storedGuestId = localStorage.getItem("cortical_guest_id");
    const isFirstVisit = !localStorage.getItem("cortical_visitor");
    let guestVisitCount = parseInt(localStorage.getItem("cortical_guest_visit_count") || "0", 10);
    
    // Show modal on first visit from non-logged-in users
    let shouldShowModal = isFirstVisit && !storedGuestId;

    // Mark as visited
    if (isFirstVisit) {
      localStorage.setItem("cortical_visitor", "true");
    }

    // If user is guest, increment visit count and check if should show modal
    if (storedGuestId && !isFirstVisit) {
      guestVisitCount += 1;
      localStorage.setItem("cortical_guest_visit_count", guestVisitCount.toString());
      // Show modal every 5 visits
      if (guestVisitCount % 5 === 0) {
        shouldShowModal = true;
      }
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isGuest: !!storedGuestId && !session,
        guestId: storedGuestId,
        shouldShowAuthModal: shouldShowModal && !session,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        isGuest: prev.guestId !== null && !session,
        shouldShowAuthModal: false,
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAsGuest = () => {
    let id = localStorage.getItem("cortical_guest_id");
    if (!id) {
      id = `guest_${uuidv4()}`;
      localStorage.setItem("cortical_guest_id", id);
      localStorage.setItem("cortical_guest_visit_count", "1");
    }
    setState((prev) => ({ ...prev, isGuest: true, guestId: id, shouldShowAuthModal: false }));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("cortical_guest_id");
    localStorage.removeItem("cortical_guest_visit_count");
    setState({
      user: null,
      session: null,
      isLoading: false,
      isGuest: false,
      guestId: null,
      shouldShowAuthModal: false,
    });
  };

  const dismissAuthModal = () => {
    setState((prev) => ({ ...prev, shouldShowAuthModal: false }));
  };

  const getUserId = () => {
    if (state.user) return state.user.id;
    if (state.isGuest) return state.guestId;
    return null;
  };

  return { ...state, loginAsGuest, logout, getUserId, dismissAuthModal };
}
