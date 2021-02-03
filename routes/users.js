const express = require("express");
const { protect, authorize } = require('../middleware/protect');

const {
    register,
    login,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword,
    logout
  } = require("../controller/users");


  const { getUserComments } = require('../controller/comment')

  const {
    getUserBooks
  } = require("../controller/books");
const { route } = require("./categories");

  const router = express.Router();



// /api/v1/users/login
router.route("/login").post(login);
router.route("/register").post(register);
router.route("/forget-password").post(forgotPassword); 
router.route("/reset-password").post(resetPassword);
router.route("/logout").get(logout);

router.use(protect);

  // /api/v1/users
  router.route("/")
    .post(authorize("admin"),createUser)
    .get(authorize("admin"),getUsers);

// /api/v1/users/:id
router.route('/:id')
.get(authorize("admin"), getUser)
.put(authorize("admin"), updateUser)
.delete(authorize("admin"), deleteUser);

router.route("/:id/books").get(authorize("admin","operator","user"),getUserBooks);

router.route('/:id/comments').get(getUserComments);

module.exports = router;