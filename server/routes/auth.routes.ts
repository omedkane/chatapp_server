import express from "express";
import controller from "../controllers/auth.controller";

const router = express.Router();

router.route('/signin').post(controller.signIn);
router.route('/signout').post(controller.signOut);

export default router;