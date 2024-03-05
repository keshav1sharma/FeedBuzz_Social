import Post from "../models/Post.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    let result = undefined ;
    //console.log(req.file.path);
    if (req.file && req.file.path) {
      result = await cloudinary.uploader.upload(req.file.path).catch(err => {
        console.error('Error uploading file to Cloudinary:', err);
        res.status(500).json({ message: 'Error uploading file to Cloudinary' });
        return;
      });
    }
    //console.log(result.secure_url);

    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath: result ? result.secure_url : picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();

    const post = await Post.find();
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      });
    }
    res.status(201).json(post);
  } catch (err) {
    console.log("Error end of block : "+ err.message);
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; // Assuming id is the post ID
    const { userId, comment } = req.body; // Assuming userId and comment are sent in the request body

    // Find the post by ID
    const post = await Post.findById(id);

    // Add the comment to the post's comments array
    post.comments.push(
      comment
     // You can also include a timestamp for when the comment was created
    );

    // Save the updated post
    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
