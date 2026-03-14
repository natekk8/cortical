import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getGetMessagesQueryKey } from "@workspace/api-client-react";
import { saveMessage } from "@workspace/api-client-react";

type CorticalPayload = {
  prompt: string;
  model: "lite" | "max";
  sessionID: string;
  userID: string;
  system: string;
};

type CorticalResponse = {
  output: string;
};

export function useCorticalApi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chatId,
      payload,
    }: {
      chatId: string;
      payload: CorticalPayload;
    }) => {
      // 1. Save user message locally
      await saveMessage(chatId, { role: "user", content: payload.prompt });
      
      // Invalidate to show user message immediately
      queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(chatId) });

      // 2. Build query URL with parameters
      const queryParams = new URLSearchParams({
        prompt: payload.prompt,
        model: payload.model,
        sessionID: payload.sessionID,
        userID: payload.userID,
        system: payload.system,
      });
      
      const webhookUrl = `https://natekkz-n8n-free.hf.space/webhook/cortical-api?${queryParams.toString()}`;

      // 3. Call n8n webhook with query parameters
      const res = await fetch(webhookUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to get response from Cortical AI");
      }

      const data: CorticalResponse = await res.json();

      // 4. Save assistant message locally
      await saveMessage(chatId, { role: "assistant", content: data.output });

      return data;
    },
    onSuccess: (data, variables) => {
      // Final invalidation to show AI message
      queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(variables.chatId) });
    },
  });
}
