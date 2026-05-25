const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const axios = require("axios");
const crypto = require("crypto");

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
  resetCode: String,

  balance: { type: Number, default: 0 },  // 👈 لازم فاصلة هون

  tasks: { type: [String], default: [] }   // 👈 تمام
});

const User = mongoose.model("User", UserSchema);
// 🧩 Task
const TaskSchema = new mongoose.Schema({

  title: String,

  price: Number,

  profit: Number,

  image: String

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
    verified: false,
    balance: 0,

tasks: [],

dailyTasks: {
  type: Number,
  default: 30
},

vipLevel: {
  type: Number,
  default: 1
},

lastTaskReset: String,

  });

  res.json({
  msg: "registered",
  user
});

});

app.post("/verify", async (req, res) => {

  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if(!user){
    return res.json({ error: "user not found" });
  }

  if(user.verifyCode !== code){
    return res.json({ error: "wrong code" });
  }

  user.verified = true;
  await user.save();

  await transporter.sendMail({
  from: "mosstfa1239@gmail.com",
  to: email,
  subject: "Verification Code",
  text: "Your code is: " + verifyCode
});

  res.json({ message: "verified" });
});

app.post("/forgot-password", async (req, res) => {

  const { email } = req.body;

  const user = await User.findOne({ email });

  if(!user){
    return res.json({
      error: "email not found"
    });
  }

  const resetCode =
    Math.floor(100000 + Math.random() * 900000).toString();

  user.resetCode = resetCode;

  await user.save();

  await transporter.sendMail({

    from: "mosstfa1239@gmail.com",

    to: email,

    subject: "Reset Password",

    text: "Your reset code is: " + resetCode
  });

  res.json({
    msg: "code sent"
  });
});

app.post("/reset-password", async (req, res) => {

  const { email, code, newPassword } = req.body;

  const user = await User.findOne({ email });

  if(!user){
    return res.json({
      error: "user not found"
    });
  }

  if(user.resetCode != code){
    return res.json({
      error: "wrong code"
    });
  }

  const hashed =
    await bcrypt.hash(newPassword, 10);

  user.password = hashed;

  await user.save();

  res.json({
    msg: "password changed"
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

  console.log(user);
res.json(user);
});

// 📋 عرض المهام
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.get("/generate-tasks", async (req, res) => {

  await Task.deleteMany({});

  const demoTasks = [

    {
      title: "Nike Shoes",
      price: 10,
      profit: 0.6,
      image:
      "https://i.imgur.com/GzQ9pza.png"
    },

    {
      title: "iPhone Case",
      price: 20,
      profit: 1.2,
      image:
      "https://i.imgur.com/8Km9tLL.png"
    },

    {
      title: "Gaming Mouse",
      price: 35,
      profit: 2
    },

    {
      title: "Bluetooth Speaker",
      price: 50,
      profit: 3
    }

  ];

  await Task.insertMany(demoTasks);

  res.send("Tasks Generated");
});

app.get("/daily-tasks", async (req, res) => {

  const { userId } = req.query;

  const user = await User.findById(userId);

  if(!user){
    return res.json([]);
  }

  const today =
    new Date().toDateString();

  // ✅ تصفير يومي
  if(user.lastTaskReset !== today){

    user.dailyTasks =
      user.vipLevel * 30;

    user.lastTaskReset = today;

    await user.save();
  }

  const tasks =
    await Task.find().limit(user.dailyTasks);

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
app.post("/complete-task", async (req, res) => {

  const { userId, taskId } = req.body;

  const user = await User.findById(userId);

  const task = await Task.findById(taskId);

  if(!user || !task){

    return res.json({
      error: "invalid"
    });
  }

  if(user.dailyTasks <= 0){

    return res.json({
      error: "no tasks left"
    });
  }

  if(user.balance < task.price){

    return res.json({
      error: "low balance"
    });
  }

  // خصم
  user.balance -= task.price;

  // ربح
  user.balance +=
    task.price + task.profit;

  // إنقاص المهام
  user.dailyTasks -= 1;

  await user.save();

  res.json({

    msg: "task completed",

    balance: user.balance,

    dailyTasks: user.dailyTasks
  });
});

app.get("/cards", (req, res) => {

  res.json([
    {
      title: "Trade 10$",
      cost: 10,
      reward: 15
    },
    {
      title: "Trade 50$",
      cost: 50,
      reward: 70
    },
    {
      title: "Trade 100$",
      cost: 100,
      reward: 150
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

app.post("/deposit", async (req, res) => {

  const { amount, userId } = req.body;

  try {

    const response = await axios.post(
      "https://api.nowpayments.io/v1/invoice",

      {
        price_amount: amount,
        price_currency: "usd",
        order_id: userId,
        ipn_callback_url: "https://trading-app-1-1xpc.onrender.com/payment-webhook"
      },

      {
        headers: {
          "x-api-key": "A1VW7PH-JWAMTKS-HYW0YEA-W01FGAD"
        }
      }
    );

    res.json({
      invoice_url: response.data.invoice_url
    });

  } catch (err) {

    console.log(err.response?.data || err);

    res.json({
      error: "payment failed"
    });

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

app.post("/payment-webhook", async (req, res) => {

  try {

    console.log("PAYMENT:", req.body);

    const payment = req.body;

    // ✅ الدفع ناجح
    if(payment.payment_status === "finished") {

      const userId = payment.order_id;

      const user = await User.findById(userId);

      if(user){

        user.balance += Number(payment.price_amount);

        await user.save();

        console.log("BALANCE UPDATED");
      }
    }

    res.sendStatus(200);

  } catch(err){

    console.log("WEBHOOK ERROR:", err);

    res.sendStatus(500);
  }
});

app.post("/admin/add-task", async (req, res) => {

  const { title, reward } = req.body;

  await Task.create({
    title,
    reward
  });

  res.json({
    msg: "task added"
  });
});

app.post("/admin/add-balance", async (req, res) => {

  try {

    const { email, balance } = req.body;

    const user =
      await User.findOne({ email });

    if(!user){

      return res.json({
        error: "user not found"
      });
    }

    user.balance += Number(balance);

    await user.save();

    res.json({
      msg: "balance updated"
    });

  } catch(err){

    console.log(err);

    res.json({
      error: "server error"
    });
  }
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

