import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { register } from "./controllers/auth.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import { createPost } from "./controllers/posts.js";
import { verify } from "./midlleware/auth.js";
import postRoutes from "./routes/posts.js";
import {v2 as cloudinary} from "cloudinary";

// middlewar
// use to get the file url
const __filename = fileURLToPath(import.meta.url);
// to get the dirname of the given filename
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());

// we have to know the use of helmet
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(
  bodyParser.json({
    limit: "30mb",
    extended: true,
  })
);

app.use(bodyParser.urlencoded({
    limit:"30mb",
    extended:true
}));
app.use(cors());
let paths = path.join(__dirname, 'public/assets');
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));
//console.log(paths)


// file storage 

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,paths);
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
});

const upload = multer({storage});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECERT,
});

//const result = await cloudinary.uploader.upload("public/assets/logo.png");

app.get("/", (req, res) => {
  res.send(`Server is running`);
});
// routes with files
app.post("/auth/register",upload.single("picture"),register);
app.post("/posts", upload.single("picture"), createPost);


// baki sab bina file ke routes wale folder m 
app.use("/auth", authRouter);
// user routes 
app.use("/users",userRouter);
// post routes
app.use("/posts", postRoutes);
// database setup 
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT} && connected to database`));
  })
  .catch((error) => console.log(`${error} did not connect`));


