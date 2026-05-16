const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mosstfa1239@gmail.com",
    pass: "gzpw ndwn zlmh csaw",
  }
});

const refCode =
  Math.floor(10000 + Math.random() * 90000) +
  String.fromCharCode(65 + Math.floor(Math.random()*26));

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// 👤 User
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,

  firstName: String,
  lastName: String,
  birthDate: String,

  phone: String,
  country: String,
  address: String,

  referralCode: String,
  referredBy: String,

  verifyCode: Number,
  verified: Boolean,

  balance: { type: Number, default: 0 },  // 👈 لازم فاصلة هون

  tasks: { type: [String], default: [] }   // 👈 تمام
});

const User = mongoose.model("User", UserSchema);
// 🧩 Task
const TaskSchema = new mongoose.Schema({
  title: String,
  cost: Number,
  reward: Number
});
const Task = mongoose.model("Task", TaskSchema);

const WithdrawSchema = new mongoose.Schema({
  userId: String,
  wallet: String,
  amount: Number,
  status: { type: String, default: "pending" },
  date: { type: Date, default: Date.now }
});

const Withdraw = mongoose.model("Withdraw", WithdrawSchema);

const Message = mongoose.model("Message", {
  userId: String,
  userName: String,
  text: String,
  reply: String
});


// 📥 تسجيل
app.post("/register", async (req, res) => {

  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    country,
    address,
    referralCode
  } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const code = Math.floor(100000 + Math.random() * 900000);

  const myRef =
    Math.floor(10000 + Math.random() * 90000) +
    String.fromCharCode(65 + Math.floor(Math.random()*26));

  try {
    await transporter.sendMail({
      from: "mosstfa1239@gmail.com",
      to: email,
      subject: "Verify your account",
      text: "Your code is: " + code
    });
  } catch(err){
    console.log("MAIL ERROR:", err);
  }

  const user = await User.create({
    email,
    password: hashed,
    firstName,
    lastName,
    phone,
    country,
    address,
    referralCode: myRef,
    referredBy: referralCode || "",
    verifyCode: code,
    verified: true, // مؤقت
    balance: 0,
    tasks: []
  });

  res.json({
  msg: "registered",
  user
});

});

// 🔐 تسجيل دخول (حطه هون 👇

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if(!user){
    return res.json({ error: "email not found" });
  }

  // 🔐 مقارنة الباسورد
  const match = await bcrypt.compare(password, user.password);

  if(!match){
    return res.json({ error: "wrong password" });
  }

  // ❗ تأكد من التفعيل (إذا مفعل النظام)
  if(!user.verified){
    return res.json({ error: "verify your email first" });
  }

  res.json(user);
});

// 📋 عرض المهام
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// 🛒 شراء مهمة
app.post("/buy-task", async (req, res) => {
  const { userId, taskId } = req.body;

  const user = await User.findById(userId);
  const task = await Task.findById(taskId);

  if (!user || !task)
    return res.json({ error: "not found" });

  if (user.balance < task.cost)
    return res.json({ error: "no balance" });

  user.balance -= task.cost;
  user.tasks.push(taskId);

  await user.save();

  res.json({ msg: "bought", balance: user.balance });
});

app.get("/user", async (req, res) => {
  try {
    const { userId } = req.query;

    if(!userId){
      return res.json({ error: "no userId" });
    }

    const user = await User.findById(userId);

    if(!user){
      return res.json({ error: "not found" });
    }

    res.json(user);

  } catch(err){
    console.log("USER ERROR:", err);
    res.status(500).json({ error: "server error" });
  }
});

// ✅ تنفيذ المهمة
app.get("/complete-task", async (req, res) => {
  const { userId, taskId } = req.query;

  const user = await User.findById(userId);
  const task = await Task.findById(taskId);

  if (!user || !task)
    return res.json({ error: "not found" });

  if (!user.tasks.includes(taskId))
    return res.json({ error: "not owned" });

    user.balance += task.reward;

    user.tasks = user.tasks.filter(t => t !== taskId);

    await user.save();

  res.json({ msg: "done", balance: user.balance });
});

app.get("/cards", (req, res) => {
  res.json([
    {
      title: {
        ar: "مهمة 1",
        en: "Task 1",
        ku: "ئەرک 1",
        fr: "Tâche 1"
      },
      text: {
        ar: "ربح 5%",
        en: "Profit 5%",
        ku: "قازانج 5%",
        fr: "Gain 5%"
      }
    },
    {
      title: {
        ar: "مهمة 2",
        en: "Task 2",
        ku: "ئەرک 2",
        fr: "Tâche 2"
      },
      text: {
        ar: "ربح 10%",
        en: "Profit 10%",
        ku: "قازانج 10%",
        fr: "Gain 10%"
      }
    }
  ]);
});

app.post("/withdraw", async (req, res) => {
  const { userId, wallet, amount } = req.body;

  const user = await User.findById(userId);

  if(!user){
    return res.json({ error: "user not found" });
  }

  if(amount > user.balance){
    return res.json({ error: "insufficient balance" });
  }

  // خصم الرصيد
  user.balance -= amount;
  await user.save();

  // تسجيل الطلب
  await Withdraw.create({
    userId,
    wallet,
    amount
  });

  res.json({ msg: "withdraw request sent", balance: user.balance });
});

app.get("/withdraws", async (req, res) => {
  const data = await Withdraw.find().sort({ date: -1 });
  res.json(data);
});

app.get("/admin/withdraws", async (req, res) => {
  const data = await Withdraw.find().sort({ date: -1 });
  res.json(data);
});

app.post("/admin/approve", async (req, res) => {
  const { id } = req.body;

  await Withdraw.findByIdAndUpdate(id, { status: "approved" });

  res.json({ msg: "approved" });
});

app.post("/admin/reject", async (req, res) => {
  const { id } = req.body;

  const w = await Withdraw.findById(id);

  // رجع الرصيد للمستخدم
  const user = await User.findById(w.userId);
  user.balance += w.amount;
  await user.save();

  await Withdraw.findByIdAndUpdate(id, { status: "rejected" });

  res.json({ msg: "rejected" });
});

app.get("/leaderboard", async (req, res) => {
  const users = await User.find().sort({ balance: -1 }).limit(5);
  res.json(users);
});

app.post("/send-message", async (req, res) => {
  const { userId, userName, text } = req.body;

  await Message.create({
    userId,
    userName,
    text
  });

  res.json({ msg: "sent" });
});

app.get("/messages", async (req, res) => {
  const msgs = await Message.find().sort({ _id: -1 });
  res.json(msgs);
});

app.post("/reply", async (req, res) => {
  const { id, text } = req.body;

  await Message.findByIdAndUpdate(id, { reply: text });

  res.json({ msg: "replied" });
});

app.post("/verify", async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if(user.verifyCode == code){
    user.verified = true;
    await user.save();

    res.json({ msg: "verified" });
  } else {
    res.json({ error: "wrong code" });
  }
});

// 👥 الفريق
app.get("/team", async (req, res) => {

  const { code } = req.query;

  const users = await User.find({
    referredBy: code
  });

  res.json(users);
});

app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/admin.html");
});

// 🚀 تشغ
mongoose.connect("mongodb+srv://admin:123123123@cluster0.esh32ir.mongodb.net/trading")
.then(() => {

  console.log("DB Connected 🔥");

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });

})
.catch(err => console.log(err));

