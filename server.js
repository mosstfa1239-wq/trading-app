const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const crypto = require("crypto");
const { Resend } = require("resend");

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const refCode =
  Math.floor(10000 + Math.random() * 90000) +
  String.fromCharCode(65 + Math.floor(Math.random()*26));

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const Withdraw = mongoose.model("Withdraw", {

  userId:String,

  amount:Number,

  wallet:String,

  status:{
    type:String,
    default:"pending"
  },

  date:{
    type:Date,
    default:Date.now
  }

});

const Finance = mongoose.model("Finance",{

  platformProfit:{
    type:Number,
    default:0
  }

});

const Deposit = mongoose.model("Deposit",{

  userId:String,

  amount:Number,

  transactionId:String,

  status:{
    type:String,
    default:"pending"
  },

  date:{
    type:Date,
    default:Date.now
  }

});

const Payment = mongoose.model("Payment",{

  paymentId:String,

  userId:String,

  amount:Number

});

const Notification = mongoose.model("Notification",{

  userId:String,

  text:String,

  read:{
    type:Boolean,
    default:false
  },

  date:{
    type:Date,
    default:Date.now
  }

});

const Announcement = mongoose.model("Announcement",{

  text:String,

  date:{
    type:Date,
    default:Date.now
  }

});

// 👤 User
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,

  firstName: String,
  lastName: String,
  birthDate: String,

  adminMessage: String,

  phone: String,
  country: String,
  address: String,

walletAddress: String,
walletLocked: Boolean,

  referralCode: String,
  referredBy: String,
  userMessage: String,

  verifyCode: String,
verified: { type: Boolean, default: true },
  resetCode: String,

  balance: { type: Number, default: 0 },  // 👈 لازم فاصلة هون


  tasks: { type: [String], default: [] },   // 👈 تمام

vip: {
  type: Number,
  default: 0
},

dailyTasks: {
  type: Number,
  default: 5
},

lastTaskReset: {
  type: String,
  default: ""
}

});

const User = mongoose.model("User", UserSchema);

const Setting = mongoose.model("Setting", {

  totalVipSales:{
    type:Number,
    default:0
  },

  totalDeposits:{
    type:Number,
    default:0
  },

  totalWithdraws:{
    type:Number,
    default:0
  },

blocked:{
  type:Boolean,
  default:false
},

});

// 🧩 Task
const TaskSchema = new mongoose.Schema({

  title: String,

  price: Number,

  profit: Number,

  image: String

});

const Task = mongoose.model("Task", TaskSchema);

const Message = mongoose.model("Message", {
  userId: String,
  userName: String,
  text: String,
  reply: String
});

const History = mongoose.model("History", {
  userId: String,
  type: String,
  amount: Number,
  text: String,
  date: {
    type: Date,
    default: Date.now
  }
});

app.delete("/admin/task/:id", async (req,res)=>{

  await Task.findByIdAndDelete(
    req.params.id
  );

  res.json({
    msg:"Task Deleted"
  });

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

  const code =
Math.floor(
100000 +
Math.random() * 900000
).toString();

console.log("VERIFY CODE:", code);

  const myRef =
    Math.floor(10000 + Math.random() * 90000) +
    String.fromCharCode(65 + Math.floor(Math.random()*26));

console.log("BEFORE SENDMAIL");

try {

  const result = await resend.emails.send({

  from: "onboarding@resend.dev",

  to: email,

  subject: "Reset Password",

  text: "Your verification code is: " + code

});

  console.log("EMAIL SENT");
  console.log(result);

} catch(err){

  console.log("MAIL ERROR:");
  console.log(err);

}

console.log("AFTER SENDMAIL");

const exists = await User.findOne({ email });

if(exists){
  return res.json({
    error:"Email already exists"
  });
}

  //انشاء مستخدم

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
  resetCode: "",
   balance: 0,

  tasks: [],

  dailyTasks: 30,

  vipLevel: 1,

  lastTaskReset: ""

});

console.log("SAVED PASSWORD:", user.password);

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

if(user.blocked){

  return res.json({
    error:"Account blocked"
  });

}

if(!user.verified){

  return res.json({
    error:"Please verify your email first"
  });

}

console.log("EMAIL:", email);
console.log("PASSWORD FROM LOGIN:", password);
console.log("HASH IN DB:", user.password);

  // 🔐 مقارنة الباسورد
  const match = await bcrypt.compare(password, user.password);

  console.log("MATCH:", match);

  if(!match){
    return res.json({ error: "wrong password" });
  }

console.log("LOGIN SUCCESS:", user.email);

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

function getVipTasks(vip){

  if(vip === 0) return 5;

  if(vip === 1) return 10;

  if(vip === 2) return 20;

  if(vip === 3) return 35;

  if(vip === 4) return 50;

  return 5;
}

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
  getVipTasks(user.vip);

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

console.log("COMPLETE TASK START");
console.log("USER ID:", userId);
console.log("TASK ID:", taskId);

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

console.log("COMPLETE TASK START");
console.log("USER ID:", userId);
console.log("TASK ID:", taskId);

  const user = await User.findById(userId);

  const task = await Task.findById(taskId);

console.log("USER FOUND:", !!user);
console.log("TASK FOUND:", !!task);

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

if(user.tasks.includes(taskId)){
  return res.json({
    error: "task already completed"
  });
}

  // خصم
  user.balance -= task.price;

  // ربح
  user.balance +=
    task.price + task.profit;

  // إنقاص المهام
  user.dailyTasks -= 1;

user.tasks.push(taskId);

console.log("BEFORE SAVE");

  await user.save();

console.log("AFTER SAVE");

try {

  await History.create({
    userId,
    type: "profit",
    amount: task.profit,
    text: "Task Profit"
  });

console.log("HISTORY SAVED");

  console.log("HISTORY SAVED:", userId);

} catch(err){

  console.log("HISTORY ERROR:", err);

}
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

await History.create({
  userId,
  type: "withdraw",
  amount: amount,
  text: "Withdraw Request"
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

//نجاح السحب
app.post("/admin/approve", async (req, res) => {

  const { id } = req.body;

  const w = await Withdraw.findById(id);

  await Withdraw.findByIdAndUpdate(id, {
    status: "approved"
  });

  await Notification.create({

    userId:w.userId,

    text:"✅ Your withdrawal request has been approved"

  });

  res.json({
    msg:"approved"
  });

});

// رفض السحب 
app.post("/admin/reject", async (req, res) => {
  const { id } = req.body;

  const w = await Withdraw.findById(id);

  // رجع الرصيد للمستخدم
  const user = await User.findById(w.userId);
  user.balance += w.amount;
  await user.save();

  await Withdraw.findByIdAndUpdate(id, { status: "rejected" });

await Notification.create({

  userId:w.userId,

  text:"❌ Your withdrawal request has been rejected"

});

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

app.get("/team-count", async(req,res)=>{

  const { code } = req.query;

  const count =
  await User.countDocuments({
    referredBy: code
  });

  res.json({
    count
  });

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

const exists =
await Payment.findOne({
  paymentId: payment.payment_id
});

if(exists){

  return res.sendStatus(200);

}

      if(user){

        user.balance += Number(payment.price_amount);

        await user.save();

await History.create({
  userId,
  type: "deposit",
  amount: Number(payment.price_amount),
  text: "Deposit"
});


await Payment.create({

  paymentId:
  payment.payment_id,

  userId,

  amount:
  Number(payment.price_amount)

});

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

  const { title, price, profit, image } = req.body;

  await Task.create({
    title,
    price: Number(price),
    profit: Number(profit),
    image
  });

  res.json({
    msg: "task added"
  });

});
// اضافى الرصيد من الادمن
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

await Notification.create({

  userId:user._id,

  text:"💰 Balance added by admin"

});

    res.json({
      msg: "balance updated"
    });

  } catch(err){

    console.log("MAIL ERROR:", err);

    res.json({
      error: "server error"
    });
  }
});

app.post("/admin/block-user", async(req,res)=>{

  const { userId, blocked } = req.body;

  const user =
  await User.findById(userId);

  if(!user){

    return res.json({
      error:"User not found"
    });

  }

  user.blocked = blocked;

  await user.save();

  res.json({
    msg: blocked ? "User blocked" : "User unblocked"
  });

});

app.post("/admin/unblock-user", async(req,res)=>{

  const { userId } = req.body;

  await User.findByIdAndUpdate(

    userId,

    {
      blocked:false
    }

  );

  res.json({
    msg:"User unblocked"
  });

});

app.post("/admin/send-message",

async (req, res) => {

  try{

    const { email, message }
    = req.body;

    const user =
    await User.findOne({ email });

    if(!user){

      return res.json({
        error:"user not found"
      });
    }

    user.adminMessage = message;

    await user.save();

    res.json({
      msg:"message sent"
    });

  } catch(err){

    console.log(err);

    res.json({
      error:"server error"
    });
  }
});

app.post("/admin/reset-wallet",

async (req, res) => {

  try{

    const { email } = req.body;

    const user =
    await User.findOne({ email });

    if(!user){

      return res.json({
        error:"user not found"
      });
    }

    user.walletLocked = false;

    await user.save();

    res.json({
      msg:"wallet unlocked"
    });

  } catch(err){

    console.log(err);

    res.json({
      error:"server error"
    });
  }
});

app.post("/send-to-admin",

async (req, res) => {

  try{

    const { userId, message }
    = req.body;

    const user =
    await User.findById(userId);

    if(!user){

      return res.json({
        error:"user not found"
      });
    }

    user.userMessage = message;

    await user.save();

    res.json({
      msg:"message sent"
    });

  } catch(err){

    console.log(err);

    res.json({
      error:"server error"
    });
  }
});

app.get("/admin/messages",

async (req, res) => {

  const users =
  await User.find({

    userMessage:{
      $ne:null
    }

  });

  res.json(users);
});

app.get("/history", async (req,res)=>{

  const { userId } = req.query;

  const data = await History.find({
    userId
  }).sort({ date:-1 });

  res.json(data);

});

// جلب جميع المستخدمين
app.get("/admin/users", async (req, res) => {

  const users = await User.find(
    {},
    "firstName lastName email referralCode balance country"
  );

  res.json(users);

});

// البحث بمستخدم حسب الكود
app.get("/admin/user/:code", async (req, res) => {

  const user = await User.findOne({
    referralCode: req.params.code
  });

  if(!user){
    return res.json({
      error: "User not found"
    });
  }

  res.json(user);

});
// عداد الاحصايات
app.get("/admin/stats", async (req,res)=>{

  const users =
  await User.countDocuments();

  const tasks =
  await Task.countDocuments();

  const pendingWithdraws =
  await Withdraw.countDocuments({
    status:"pending"
  });

  const balances =
  await User.find();

const vip1 =
await User.countDocuments({
  vip:1
});

const vip2 =
await User.countDocuments({
  vip:2
});

const vip3 =
await User.countDocuments({
  vip:3
});

const vip4 =
await User.countDocuments({
  vip:4
});

  let totalBalance = 0;

  balances.forEach(u=>{
    totalBalance +=
    u.balance || 0;
  });

  res.json({

    users,

    tasks,

    pendingWithdraws,

    totalBalance,

  vip1,

  vip2,

  vip3,

  vip4

});

});
//ترقية في اي بي
app.post("/upgrade-vip", async (req,res)=>{

  const { userId, vip } = req.body;

  const user = await User.findById(userId);

  if(!user){
    return res.json({
      error:"User not found"
    });
  }

  let price = 0;

  if(vip === 1) price = 50;
  if(vip === 2) price = 200;
  if(vip === 3) price = 500;
  if(vip === 4) price = 1000;

  if(user.balance < price){ //خصم الرصيد
    return res.json({
      error:"Insufficient balance"
    });
  }

  user.balance -= price;
  user.vip = vip;

  await user.save();

await Notification.create({

  userId:user._id,

  text:"🔥 VIP upgraded successfully"

});

const parent =
await User.findOne({

  referralCode:
  user.referredBy

});

if(parent){

  parent.balance +=
  price * 0.05;

  await parent.save();

}

const finance = await Finance.findOne();

finance.platformProfit += price;

await finance.save();

await History.create({
  userId:user._id,
  type:"vip",
  amount:price,
  text:"VIP Upgrade"
});

let setting = await Setting.findOne();

if(!setting){

  setting = await Setting.create({});
}

setting.totalVipSales += price;

await setting.save();

  res.json({
    msg:"VIP upgraded",
    balance:user.balance,
    vip:user.vip
  });

});

app.get("/admin/finance", async (req,res)=>{

  let setting = await Setting.findOne();


  const finance =
  await Finance.findOne();

  res.json(finance);

});

app.get("/admin/history", async(req,res)=>{

  const history =
  await History.find()
  .sort({ date:-1 })
  .limit(500);

  res.json(history);

});

app.post("/verify-email", async(req,res)=>{

  const { email, code } = req.body;

  const user =
  await User.findOne({ email });

  if(!user){

    return res.json({
      error:"User not found"
    });
  }

  if(user.verifyCode != code){

    return res.json({
      error:"Wrong code"
    });
  }

  user.verified = true;
  user.verifyCode = "";

  await user.save();

  res.json({
    msg:"Verified"
  });

});

app.post("/forgot-password",

async(req,res)=>{

  const { email } = req.body;

  const user =
  await User.findOne({ email });

  if(!user){

    return res.json({
      error:"User not found"
    });

  }

  const resetCode =
  Math.floor(
  100000 +
  Math.random()*900000
  ).toString();

  user.resetCode =
  resetCode;

  await user.save();

  await resend.emails.send({

    from:
    "onboarding@resend.dev",

    to: email,

    subject:
    "Reset Password",

    text:
    "Your reset code is: " +
    resetCode

  });

  res.json({
    msg:"Code Sent"
  });

});

app.post("/reset-password",

async(req,res)=>{

  const {

    email,
    code,
    password

  } = req.body;

  const user =
  await User.findOne({ email });

  if(!user){

    return res.json({
      error:"User not found"
    });

  }

  if(user.resetCode != code){

    return res.json({
      error:"Wrong Code"
    });

  }

  const hashed =
  await bcrypt.hash(
    password,
    10
  );

  user.password =
  hashed;

  user.resetCode = "";

  await user.save();

  res.json({
    msg:"Password Changed"
  });

});

//جلب الاشعارات
app.get("/notifications", async(req,res)=>{

  const { userId } = req.query;

  const data =
  await Notification.find({

    userId

  }).sort({

    date:-1

  });

  res.json(data);

});
//الرسائل الجماعية
app.post("/admin/announcement", async(req,res)=>{

  const { text } = req.body;

  console.log("TEXT =", text);

  const a = await Announcement.create({
    text
  });

  console.log("SAVED =", a);

  res.json({
    msg:"Announcement Sent"
  });

});
// جلب الاعلانات للمستخدم
app.get("/announcements", async(req,res)=>{

  const data =

  await Announcement.find()

  .sort({ date:-1 })

  .limit(20);

  res.json(data);

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
