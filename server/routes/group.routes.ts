import express from "express";
import controller from "../controllers/group.controller";
import messageController from "../controllers/message.controller";
const router = express.Router();

// router.all("*", authController.requireSignIn);
router.param("groupId", controller.isGroupMember);

router.route("/").post(controller.create);
router.route("/:groupId").delete(controller.isAdministrator, controller.remove);

router
  .route("/:groupId/members")
  .post(controller.isAdministrator, controller.addMembers)
  .delete(controller.isAdministrator, controller.removeMembers);
router
  .route("/:groupId/admins")
  .post(controller.isAdministrator, controller.addAdministrator)
  .delete(controller.isAdministrator, controller.removeAdministrator);

router
  .route("/:groupId/messages")
  .post(controller.isGroupMember, messageController.sendToGroup);

router
  .route("/:groupId/messages/:messageId")
  .delete(
    controller.isGroupMember,
    messageController.deleteGroupMessage,
    messageController.deleteMessage
  );

// router.param("targetUserId", controller.isAdministrator);

export default router;
