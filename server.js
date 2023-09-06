require("dotenv").config();

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "kjsdhfksjhfaçshfçslfhasºçlasbncasçkcbnasçcahpcçiouwbcçksjbcçscjbwçpb";

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Log successful connection
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

const app = express();
app.use("/", express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());

app.post("/api/change-password", async (req, res) => {
  const { token, newpassword } = req.body;

  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid Password" });
  }

  // Verifique o comprimento da senha após a desestruturação
  if (plainTextPassword.length < 6) {
    return res.json({
      status: "error",
      error: "Password is Too Short, Should Be At Least 6 Characters",
    });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    const _id = user.id;

    const password = await bcrypt.hash(plainTextPassword, 10);
    await User.updateOne(
      { _id },
      {
        $set: { password },
      }
    );
    res.json({ status: "ok" });
  } catch (error) {}
  console.log("JWT Decoder:", user);
  res.json({ status: "ok" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).lean();

  if (!user) {
    return res.json({ status: "error", error: "Invalid Username/Password" });
  }

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET);

  res.json({ status: "ok", data: token });
});

app.post("/api/register", async (req, res) => {
  const { username, password: plainTextPassword } = req.body;

  if (!username || typeof username !== "string") {
    return res.json({ status: "error", error: "Invalid Username" });
  }

  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid Password" });
  }

  // Verifique o comprimento da senha após a desestruturação
  if (plainTextPassword.length < 6) {
    return res.json({
      status: "error",
      error: "Password is Too Short, Should Be At Least 6 Characters",
    });
  }

  try {
    const password = await bcrypt.hash(plainTextPassword, 10);

    const response = await User.create({
      username,
      password,
    });
    console.log("User Created Successfully: ", response);
    res.json({ status: "ok" });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicated Key
      return res.json({
        status: "error",
        error: "Username Already In Use",
      });
    }
    throw error;
  }
});

app.listen(9999, () => {
  console.log("server up at 9999");
});
