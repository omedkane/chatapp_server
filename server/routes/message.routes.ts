import express from "express";
import controller from "../controllers/message.controller";

const router = express.Router();

router.route("/:userId/").post(controller.sendToUser);

export default router;
