const express = require("express");
const { CreateCategory, updateCategory, deleteCategory, GetAllCategory, ReadCategory } = require("../Controller/category.controller");
const { isAuthUser, authorizeRoles } = require("../MiddlerWare/Auth");
const router = express.Router();

router.post("/create-category", isAuthUser,  authorizeRoles("admin"), CreateCategory);
router.put("/update-category/:id", isAuthUser, authorizeRoles("admin"), updateCategory);
router.delete("/delete-category/:id", isAuthUser, authorizeRoles("admin"), deleteCategory);
router.get("/get-category", GetAllCategory);
router.get("/Read-category/:id", ReadCategory);



module.exports = router;