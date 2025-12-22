import { Router } from "express";
import { handleChat } from "../controllers/chat.controller.js";
import { listChats } from "../controllers/chat.list.controller.js";
import { getMessages } from "../controllers/chat.messages.controller.js";
const router = Router();

router.post("/", handleChat);
router.get("/list", listChats);
router.get("/:conversationId/messages", getMessages);

export default router;