import { Router } from "express";

import { authUser } from "../../middlewares/auth.js";

import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    getAuthMe,
    logoutUser,
    getUsersPG,
    createUserPG,
    updateUserPG,
    deleteUserPG,
    loginUserPG,
    getAuthMePG,
    logoutUserPG,
} from "../../modules/users/users.v2.controller.js";

export const router = Router();

// mongoDB api/v2

router.get("/", getUsers);

router.post("/", createUser);

// login >> check auth user >> logout
// ==================================
router.post("/login", loginUser);
router.get("/auth/me", authUser, getAuthMe);
router.post("/auth/logout", authUser, logoutUser);
// ==================================

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

// Supabase / PostgreSQL routes (/api/v2/users/pg)
// Password is excluded from SELECT.

router.get("/pg", getUsersPG);

router.post("/pg", createUserPG);

// login >> check auth user >> logout | PG
// ==================================
router.post("/pg/login", loginUserPG);
router.get("/pg/auth/me", authUser, getAuthMePG);
router.post("/pg/auth/logout", authUser, logoutUserPG);
// ==================================

router.put("/pg/:id", updateUserPG);

router.delete("/pg/:id", deleteUserPG);
