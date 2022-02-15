import express from "express";
import authController from "../controllers/auth.controller";
import controller from "../controllers/user.controller";

const router = express.Router();

router.route("/").get(controller.list).post(controller.create);
router
  .route("/:userId")
  .get(authController.requireSignIn, controller.read)
  .put(
    authController.requireSignIn,
    authController.hasAuthorization,
    controller.update
  )
  .delete(
    authController.requireSignIn,
    authController.hasAuthorization,
    controller.remove
  );

router.param("userId", controller.userById);

export default router;
