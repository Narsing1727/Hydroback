const express = require("express");
const postRouter = express.Router();
const postController = require('../controllers/postController')
const AuthMiddleware = require("../middlewares/authmiddleware");
const upload = require("../middlewares/multerConfig");
postRouter.post('/add-post' ,AuthMiddleware.IsAuth ,upload.single("image") ,postController.addPost)
postRouter.get('/get-post'  ,postController.getAllPost);

module.exports = postRouter;