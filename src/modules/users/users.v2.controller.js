import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "./user.model.js";
import { supabase } from "../../config/supabase.js";

// import { authUser } from "../../middlewares/auth.js"; // เรียกใช้ที่ routes

// MongoDB

const userResponse = (doc) => {
    const user = doc.toObject();
    delete user.password;
    return user;
};

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        return res.status(200).json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
};

export const createUser = async (req, res, next) => {
    const { username, email, password, role } = req.body || {};

    if (!username || !email || !password) {
        const err = new Error("username and email are required");
        err.name = "validationError";
        err.status = 400;
        return res.status(400).json({ success: false, error: err });
    }

    try {
        // create
        // const hashPassword = await bcrypt.hash(password, 8);
        // const doc = await User.create({
        //     username,
        //     email,
        //     password,
        //     role,
        // });
        // โชว์ log of hashPassword ตอนยิง POST on REST Client
        // console.log("hashed password แล้วจ้า", hashPassword);

        //save
        const newUser = new User({
            username,
            email,
            password,
            role,
        });
        const doc = await newUser.save();
        return res.status(201).json({ success: true, data: userResponse(doc) });
    } catch (err) {
        // return res.status(400).json({ success: false, error: err });
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    // เขียนใหม่ หลัง มี pre save ใน schema
    // const { username, email, password, role } = req.body || {};
    // const updates = {};

    // if (username !== undefined) updates.username = username;
    // if (email !== undefined) updates.email = email;

    // if (password !== undefined) updates.password = password;

    // if (role !== undefined) updates.role = role;

    // if (Object.keys(updates).length === 0) {
    //     return res.status(400).json({
    //         success: false,
    //         error: "At least one field is required to update",
    //     });
    // }

    // try {
    //     const doc = await User.findByIdAndUpdate(req.params.id, updates, {
    //         // new: true,
    //         returnDocument: "after",
    //         runValidators: true,
    //     });

    //     if (!doc) {
    //         return res
    //             .status(404)
    //             .json({ success: false, error: "Use not found" });
    //     }

    //     return res.status(200).json({ success: true, data: doc });

    const { username, email, password, role } = req.body || {};

    // check first มีส่งอะไรมาอัปเดตไหม
    if (
        username === undefined &&
        email === undefined &&
        password === undefined &&
        role === undefined
    ) {
        return res.status(400).json({
            success: false,
            error: "At least one field is required to update",
        });
    }

    try {
        // ค้นหา User ตัวนั้นออกมาก่อน
        const user = await User.findById(req.params.id);

        if (!user) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }

        // อัปเดตฟิลด์ที่มีการส่งค่ามา
        if (username !== undefined) user.username = username;
        if (email !== undefined) user.email = email;
        if (password !== undefined) user.password = password; // ใส่ password ดิบเข้าไป
        if (role !== undefined) user.role = role;

        // สั่ง save() เพื่อให้ pre("save") hook ทำงาน
        const doc = await user.save();

        return res.status(200).json({ success: true, data: userResponse(doc) });
    } catch (err) {
        // return res.status(400).json({ success: false, error: err });
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const doc = await User.findByIdAndDelete(req.params.id);

        if (!doc) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }

        return res.status(200).json({ success: true, data: doc });
    } catch (err) {
        // return res.status(400).json({ success: false, error: err });
        next(err);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "400:bad request: don't have email or password",
            });
        }

        const userInDB = await User.findOne({ email }).select("+password");

        // user ของเราในที่นี้คือ email
        if (!userInDB) {
            return res.status(401).json({
                success: false,
                message: "401:bad-authen: wrong email",
            });
        }

        const isMatched = await bcrypt.compare(password, userInDB.password);

        if (isMatched === false) {
            return res.status(401).json({
                success: false,
                message: "401:bad-authen: wrong password",
            });
        } else {
            const token = jwt.sign(
                { userId: userInDB._id },
                process.env.JWT_SECRET,
                { expiresIn: "1h" },
            ); // 1 hour expiration

            const isProd = process.env.NODE_ENV === "production";

            res.cookie("accessToken", token, {
                httpOnly: true,
                secure: isProd, // only send over HTTPS on production
                sameSite: isProd ? "none" : "lax",
                path: "/",
                maxAge: 60 * 60 * 1000, // 1 hour
            });

            return res.status(200).json({
                success: true,
                message: "200 login done!",
                userInDB: {
                    _id: userInDB._id,
                    username: userInDB.username,
                    email: userInDB.email,
                    role: userInDB.role,
                },
            });

            // const userResponse = userInDB.toObject();
            // delete userResponse.password;

            // return res.status(200).json({
            //     success: true,
            //     message: "200 login done!",
            //     data: userResponse,
            // });
        }
    } catch (err) {
        next(err);
    }
};

// Check user session/token
export const getAuthMe = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const currentUser = await User.findById(userId);

        if (!currentUser) {
            return res
                .status(401)
                .json({ success: false, message: "user not found" });
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: currentUser._id,
                username: currentUser.username,
                email: currentUser.email,
                role: currentUser.role,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const logoutUser = (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "none",
    });

    res.status(200).json({ success: true, message: "logged out successfully" });
};

// Supabase / PostgreSQL routes (/api/v2/users/pg)
// Password is excluded from SELECT.

const PG_SELECT = "id, username, email, role, created_at, updated_at";

export const getUsersPG = async (req, res, next) => {
    try {
        const { data, error } = await supabase.from("users").select(PG_SELECT);

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (err) {
        // return res.status(400).json({ success: false, error: error.message });
        next(err);
    }
};

export const createUserPG = async (req, res, next) => {
    const { username, email, password, role } = req.body || {};

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            error: "username, email, and password are required",
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 8);

        const { data, error } = await supabase
            .from("users")
            .insert({
                username,
                email,
                password: hashedPassword,
                role: role || "user",
            })
            .select(PG_SELECT)
            .single();

        if (error) throw error;

        return res.status(201).json({ success: true, data });
    } catch (err) {
        // return res.status(400).json({ success: false, error: error.message });
        next(err);
    }
};

export const updateUserPG = async (req, res, next) => {
    const { id } = req.params;

    const { username, email, password, role } = req.body || {};

    const updates = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;

    if (password !== undefined) {
        updates.password = await bcrypt.hash(password, 8);
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            error: "At least one field is required to update",
        });
    }

    try {
        const { data, error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", id) // const { id } = req.params; ln.118
            .select(PG_SELECT)
            .single();

        if (error) throw error;

        if (!data || data === 0) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }

        return res.status(200).json({ success: true, data: data });
    } catch (err) {
        // return res.status(400).json({ success: false, error: error.message });
        next(err);
    }
};

export const deleteUserPG = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from("users")
            .delete()
            .eq("id", req.params.id)
            .select("id, username, email, role");

        if (error) throw error;

        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }
        return res.status(200).json({ success: true, data: data[0] });
    } catch (err) {
        // return res.status(400).json({ success: false, error: error.message });
        next(err);
    }
};

// Auth Supabase

export const loginUserPG = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "400:bad request: don't have email or password",
            });
        }

        const { data: userInDB, error } = await supabase
            .from("users")
            .select("id, username, email, password, role")
            .eq("email", email)
            .single();

        if (error || !userInDB) {
            return res.status(401).json({
                success: false,
                message: "401:bad-authen: wrong email or user not found",
            });
        }

        const isMatched = await bcrypt.compare(password, userInDB.password);

        if (isMatched === false) {
            return res.status(401).json({
                success: false,
                message: "401:bad-authen: wrong password",
            });
        }

        const token = jwt.sign(
            { userId: userInDB.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
        );

        const isProd = process.env.NODE_ENV === "production";

        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            path: "/",
            maxAge: 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "200 login PG done!",
            userInDB: {
                id: userInDB.id,
                username: userInDB.username,
                email: userInDB.email,
                role: userInDB.role,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getAuthMePG = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const { data: currentUser, error } = await supabase
            .from("users")
            .select(PG_SELECT)
            .eq("id", userId)
            .single();

        if (error || !currentUser) {
            return res
                .status(401)
                .json({ success: false, message: "user not found in PG" });
        }

        return res.status(200).json({
            success: true,
            data: currentUser,
        });
    } catch (err) {
        next(err);
    }
};

export const logoutUserPG = (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "none",
    });

    res.status(200).json({
        success: true,
        message: "logged out PG successfully",
    });
};
