const router = require("express").Router();

const UserController = require("../controllers/UserController");

// middlewares
const verifyToken = require("../helpers/verify_token");
// const { imageUpload } = require("../helpers/image-upload");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/checkuser", UserController.userCheck);
router.get("/:id", UserController.getUserById);
router.patch("/edit/:id",verifyToken,UserController.editUser);
// router.patch("/edit/:id",verifyToken,imageUpload.single("image"),UserController.editUser);

module.exports = router;