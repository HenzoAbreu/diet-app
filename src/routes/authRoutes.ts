import {
  signinController,
  signupController,
} from "../controllers/authController";
import express from "express";

const router = express.Router();

router.post("/register", signupController);
router.post("/login", signinController);

export default router;
