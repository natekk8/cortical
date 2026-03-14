import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { chatsTable, messagesTable, insertChatSchema, insertMessageSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

router.get("/chats", async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: "userId is required" });
    return;
  }
  const chats = await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.userId, userId))
    .orderBy(desc(chatsTable.updatedAt));
  res.json(chats);
});

router.post("/chats", async (req, res) => {
  const parsed = insertChatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const [chat] = await db.insert(chatsTable).values(parsed.data).returning();
  res.status(201).json(chat);
});

router.delete("/chats/:chatId", async (req, res) => {
  const { chatId } = req.params;
  await db.delete(messagesTable).where(eq(messagesTable.chatId, chatId));
  await db.delete(chatsTable).where(eq(chatsTable.id, chatId));
  res.json({ success: true });
});

router.get("/chats/:chatId/messages", async (req, res) => {
  const { chatId } = req.params;
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId))
    .orderBy(messagesTable.createdAt);
  res.json(messages);
});

router.post("/chats/:chatId/messages", async (req, res) => {
  const { chatId } = req.params;
  const schema = insertMessageSchema.omit({ chatId: true });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  const [message] = await db
    .insert(messagesTable)
    .values({ ...parsed.data, chatId })
    .returning();

  await db
    .update(chatsTable)
    .set({ updatedAt: new Date() })
    .where(eq(chatsTable.id, chatId));

  res.status(201).json(message);
});

export default router;
