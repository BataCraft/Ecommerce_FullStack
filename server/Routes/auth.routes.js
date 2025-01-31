const express = require("express");
const router = express.Router();
const{registerUser, loginUser, logout, verifyEmail, GetUSer, forgetPassword, ResetPassword} = require("../Controller/Auth.controller");
const { isAuthUser } = require("../MiddlerWare/Auth");

router.post("/register", registerUser)
router.post("/login",  loginUser)
router.delete("/logout", isAuthUser, logout)
router.post("/verify-email", verifyEmail);
router.get("/get-user", isAuthUser, GetUSer);
router.post("/forgot-password", forgetPassword);
router.put("/reset/password/:token", ResetPassword);



module.exports = router