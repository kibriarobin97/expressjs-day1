import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();

// create user --- POST method
router.post("/", userController.createUser);

// get all users --- GET method
router.get(
  "/",
  auth(USER_ROLE.admin, USER_ROLE.agent),
  userController.getAllUsers,
);

// get single user --- GET method
router.get("/:id", userController.getSingleUser);

// update user --- PUT method
router.put("/:id", userController.updateUser);

// delete user ---- DELETE method
router.delete("/:id", userController.deleteUser);

export const userRoute = router;
