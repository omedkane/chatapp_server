import express from "express";
import chatController from "../controllers/chat.controller";
import messageController from "../controllers/message.controller";

const router = express.Router();

router.route("/").post(messageController.sendToUser);
router.route("/:chatId").delete(chatController.remove);

router.route("/:chatId/messages").post(messageController.sendToChat);

router
  .route("/:chatId/messages/:messageId")
  .delete(messageController.deleteChatMessage, messageController.deleteMessage);

export default router;
