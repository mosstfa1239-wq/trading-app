const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// مؤقتًا (ما رح يشتغل MongoDB الآن)
// mongoose.connect("mongodb://127.0.0.1:27017/trading");
// 👤 Users
const User = mongoose.model("User", {
  username: String,
  password: String,
  balance: { type: Number, default: 0 }
});

// 📊 Tasks
const Task = mongoose.model("Task", {
  title: String,
  price: Number,
  rate: Number
});

// اختبار السيرفر
app.get("/", (req, res) => {
  res.send("Server is working ✅");
});

// جلب المهام
app.get("/tasks", async (req, res) => {
  res.json(await Task.find());
});

// شراء مهمة
app.post("/buy", async (req, res) => {
  let { userId, taskId } = req.body;

  let user = await User.findById(userId);
  let task = await Task.findById(taskId);

  if (!user || !task) return res.json({ error: "Invalid data" });

  if (user.balance < task.price)
    return res.json({ error: "No balance" });

  user.balance -= task.price;

  let profit = task.price * task.rate;
  user.balance += task.price + profit;

  await user.save();

  res.json({
    message: "Success",
    profit,
    balance: user.balance
  });
});
// إنشاء مستخدم
app.get("/create-user", async (req, res) => {
  let user = new User({
    username: "test",
    password: "1234",
    balance: 100
  });

  await user.save();
  res.send("User created");
});

// إنشاء مهمة
app.get("/create-task", async (req, res) => {
  let task = new Task({
    title: "Task 1",
    price: 10,
    rate: 0.006
  });

  await task.save();
  res.send("Task created");
});
// تشغيل السيرفر
app.listen(3000, () => {
  console.log("Server running");
});
