import express from "express";
import authController from "../controllers/auth.controller";
import controller from "../controllers/user.controller";
import multer from "multer";
import { __srcDir } from "../core/constants/directories";

const upload = multer({
  dest: __srcDir + "/uploads/users/avatars/tmp",
});

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

router
  .route("/:userId/avatar")
  .get(controller.getAvatar)
  .post(
    authController.requireSignIn,
    authController.hasAuthorization,
    upload.single("avatar"),
    controller.updateAvatar
  );

router.param("userId", controller.userById);

export default router;
