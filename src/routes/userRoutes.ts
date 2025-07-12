import {
  getAllUsersController,
  getUserByUuidController,
  updateUserController,
  deleteUserController,
} from "../controllers/userController";

import express from "express";

const router = express.Router();

router.get("/get-all", getAllUsersController); // get all
router.get("/:user_uuid", getUserByUuidController); // get by id
router.put("/:user_uuid", updateUserController); // update user
router.delete("/:user_uuid", deleteUserController); //delete user

export default router;
