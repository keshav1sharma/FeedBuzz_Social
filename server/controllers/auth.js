import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const register = async (req, res) => {

  try {
    // we get a req from user and use its body
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    // after that we hash the password and then store it 

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await cloudinary.uploader.upload(req.file.path);
    console.log(result.secure_url);
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath: result.secure_url,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    // we save the user 
    const savedUser = await newUser.save();
    res.status(201)
    .json(savedUser);

  } catch (err) {
    res.status(500)
    .json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    // we take out the passowrd from the body of req and also the password that stored in db
    // and we can check if they both match or not 

    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });
    // jwt sign ( here we create a token)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    // because we donot want this password to be send to database
    delete user.password;
    res.status(200)
    // and we sent the token and the user without the password
    
    .json({ token, user });

  } catch (err) {
    res.status(500)
    .json({ error: err.message });
  }
};