const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const helmet = require("helmet");
// const morgan = require("morgan");
const multer = require("multer");
const cors = require("cors")
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const router = express.Router();
const path = require("path");

// console.log(process.env.MONGOURL);

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true)

mongoose.connect(
  process.env.MONGOURL, {useNewUrlParser: true},
  () => {
    console.log("Connected to MongoDB");
  }
);


app.use("/images", express.static(path.join(__dirname, "public/images")));

const corsOptions = {
  origin: "*",
}

//middleware
app.use(cors(corsOptions))
app.use(express.json());

// app.use(helmet());
// app.use(morgan("common"));

const port = 8800;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

app.listen(port, () => {
  console.log(`Backend server is running on ${port}`);
});
