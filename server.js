const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { Resend } = require("resend");

const crypto = require("crypto");
const axios = require("axios");

const cloudinary = require("cloudinary").v2;

const multer = require("multer");

const upload = multer({
storage: multer.memoryStorage()
});

cloudinary.config({

cloud_name: "ma3oodbb",

api_key: "954661348451215",

api_secret: "qzbljethhYGioJvcF7IdvNvQi7U API_SECRET"

});

const TINPAY_API_KEY = "c30efed9306fbdaf9de4425bd35b64a0ea75f299b31f31ea";
const TINPAY_API_SECRET = "d36efca079f34a0c54d27e40f9bf9215784f767833abe896174b6ac3e47968fd";

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

function signTinPay(timestamp, method, path, body) {
    const payload =
        timestamp + "\n" +
        method + "\n" +
        path + "\n" +
        JSON.stringify(body);

    return crypto
        .createHmac("sha256", TINPAY_API_SECRET)
        .update(payload)
        .digest("hex");
}

async function checkBlocked(req,res,next){

  const userId =
  req.body.userId ||
  req.query.userId;

  if(!userId){

    return next();

  }

  const user =
  await User.findById(userId);

  if(!user){

    return res.json({
      error:"User not found"
    });

  }

  if(user.blocked){

    return res.json({
      error:"Your account has been blocked"
    });

  }

  next();

}

async function checkAdmin(req,res,next){

  const userId =
    req.body.userId ||
    req.query.userId;

  const user =
    await User.findById(userId);

  if(!user || !user.isAdmin){

    return res.json({
      error:"Access denied"
    });

  }

  next();

}

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

accountType: {
  type: String,
  default: "customer"
},

companyName: String,

businessType: String,

companyCity: String,

website: String,

licenseNumber: String,

commercialRegister: String,

companyDescription: String,

merchantStatus: {
  type: String,
  default: ""
},

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
},

blocked: {
  type: Boolean,
  default: false
},

isAdmin: {
  type: Boolean,
  default: false
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
  }

});

const ProductSchema = new mongoose.Schema({

  merchantId: String,

  merchantName: String,

  name: String,

  price: Number,

  category: String,

  image: String,

  description: String,

  active: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Product =
mongoose.model("Product", ProductSchema);

const OrderSchema = new mongoose.Schema({

  orderId: {
    type: String,
    unique: true
  },

  customerId: String,
  customerName: String,
  customerEmail: String,

  merchantId: String,
  merchantName: String,

  productId: String,
  productName: String,

  quantity: {
    type: Number,
    default: 1
  },

  unitPrice: Number,

  productsTotal: Number,

  shippingType: {
    type: String,
    enum: ["pickup", "delivery"],
    default: "pickup"
  },

  shippingAddress: {
    type: String,
    default: ""
  },

  shippingCost: {
    type: Number,
    default: 0
  },

  platformFee: {
    type: Number,
    default: 0
  },

  total: Number,

  paymentMethod: {
    type: String,
    default: "balance"
  },

  paymentStatus: {
    type: String,
    default: "pending"
  },

  orderStatus: {
    type: String,
    default: "pending"
  },

  rating: {
    type: Number,
    default: 0
  },

  review: {
    type: String,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Order =
mongoose.model("Order", OrderSchema);

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
  referralCode,

  accountType,

  companyName,
  businessType,
  companyCity,
  website,
  licenseNumber,
  commercialRegister,
  companyDescription

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

  accountType:
  accountType || "customer",

  companyName:
  companyName || "",

  businessType:
  businessType || "",

  companyCity:
  companyCity || "",

  website:
  website || "",

  licenseNumber:
  licenseNumber || "",

  commercialRegister:
  commercialRegister || "",

  companyDescription:
  companyDescription || "",

  merchantStatus:
  accountType === "merchant"
  ? "pending"
  : "",

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
//حفض المنتج
app.post("/merchant/add-product", async (req,res)=>{

const{

merchantId,

merchantName,

name,

price,

category,

image,

description

}=req.body;

const product = await Product.create({

merchantId,

merchantName,

name,

price,

category,

image,

description

});

res.json({

success:true,

product

});

});
//عرمنتجات التاج

app.get("/merchant/products/:id",async(req,res)=>{

const products=

await Product.find({

merchantId:req.params.id

});

res.json(products);

});
//المتجر

app.get("/market/products",async(req,res)=>{

const products=

await Product.find({

active:true

});

res.json(products);

});

app.post("/merchant/delete-product", async (req, res) => {

  try {

    const { productId, merchantId } = req.body;

    if (!productId || !merchantId) {
      return res.json({
        success: false,
        error: "Missing product information"
      });
    }

    const product = await Product.findOne({
      _id: productId,
      merchantId: merchantId
    });

    if (!product) {
      return res.json({
        success: false,
        error: "Product not found"
      });
    }

    await Product.deleteOne({
      _id: productId,
      merchantId: merchantId
    });

    res.json({
      success: true
    });

  } catch (err) {

    console.log("DELETE PRODUCT ERROR:", err);

    res.json({
      success: false,
      error: err.message
    });

  }

});
// فاتورة المنتجات
app.post("/orders/create", async (req, res) => {

  try {

    const {
      customerId,
      productId,
      quantity,
      shippingType,
      shippingAddress
    } = req.body;

    if (!customerId || !productId) {

      return res.json({
        success: false,
        error: "Missing customer or product"
      });

    }

    const customer =
      await User.findById(customerId);

    if (!customer) {

      return res.json({
        success: false,
        error: "Customer not found"
      });

    }

    const product =
      await Product.findById(productId);

    if (!product) {

      return res.json({
        success: false,
        error: "Product not found"
      });

    }

    if (!product.active) {

      return res.json({
        success: false,
        error: "Product is not available"
      });

    }

    const qty =
      Math.max(1, Number(quantity) || 1);

    const productsTotal =
      product.price * qty;

    /*
      Shipping:
      Pickup = 0
      Delivery = demo 3 USDT
    */

    const shippingCost =
      shippingType === "delivery"
        ? 3
        : 0;

    /*
      Platform commission.
      We start with 2%.
      Later we can make it configurable
      from Admin Settings.
    */

    const platformFee =
      Number(
        (productsTotal * 0.02)
        .toFixed(2)
      );

    const total =
      Number(
        (
          productsTotal +
          shippingCost +
          platformFee
        ).toFixed(2)
      );

    /*
      Check customer balance
    */

    if (customer.balance < total) {

      return res.json({
        success: false,
        error: "Insufficient USDT balance"
      });

    }

    const orderId =
      "ORD-" +
      Date.now() +
      "-" +
      Math.floor(
        1000 + Math.random() * 9000
      );

    /*
      Create order
    */

    const order =
      await Order.create({

        orderId,

        customerId:
          customer._id.toString(),

        customerName:
          (
            customer.firstName || ""
          ) +
          " " +
          (
            customer.lastName || ""
          ),

        customerEmail:
          customer.email,

        merchantId:
          product.merchantId,

        merchantName:
          product.merchantName,

        productId:
          product._id.toString(),

        productName:
          product.name,

        quantity: qty,

        unitPrice:
          product.price,

        productsTotal,

        shippingType,

        shippingAddress:
          shippingType === "delivery"
            ? shippingAddress || ""
            : "",

        shippingCost,

        platformFee,

        total,

        paymentMethod:
          "balance",

        paymentStatus:
          "paid",

        orderStatus:
          "pending"

      });

    /*
      Deduct customer balance
    */

    customer.balance =
      Number(
        (
          customer.balance - total
        ).toFixed(2)
      );

    await customer.save();

    res.json({

      success: true,

      order

    });

  } catch (err) {

    console.log(
      "CREATE ORDER ERROR:",
      err
    );

    res.json({

      success: false,

      error:
        err.message

    });

  }

});

app.get("/orders/merchant/:id", async (req, res) => {

  try {

    const merchantId = req.params.id;

    if (!merchantId) {

      return res.json({
        success: false,
        error: "Merchant ID required"
      });

    }

    const orders = await Order.find({
      merchantId: merchantId
    }).sort({
      createdAt: -1
    });

    res.json({
      success: true,
      orders: orders
    });

  } catch (err) {

    console.log(
      "MERCHANT ORDERS ERROR:",
      err
    );

    res.json({
      success: false,
      error: err.message
    });

  }

});

app.post("/orders/merchant/status", async (req, res) => {

  try {

    const {
      orderId,
      merchantId,
      status
    } = req.body;

    if (
      !orderId ||
      !merchantId ||
      !status
    ) {

      return res.json({
        success: false,
        error: "Missing order information"
      });

    }

    const allowedStatuses = [
      "accepted",
      "rejected",
      "preparing",
      "ready",
      "shipped",
      "completed"
    ];

    if (
      !allowedStatuses.includes(status)
    ) {

      return res.json({
        success: false,
        error: "Invalid order status"
      });

    }

    const order =
      await Order.findOne({
        orderId: orderId,
        merchantId: merchantId
      });

    if (!order) {

      return res.json({
        success: false,
        error: "Order not found"
      });

    }

    order.orderStatus =
      status;

    await order.save();

    res.json({
      success: true,
      order: order
    });

  } catch (err) {

    console.log(
      "UPDATE ORDER STATUS ERROR:",
      err
    );

    res.json({
      success: false,
      error: err.message
    });

  }

});

app.get("/orders/customer/:id", async (req, res) => {

  try {

    const customerId = req.params.id;

    if (!customerId) {

      return res.json({
        success: false,
        error: "Customer ID required"
      });

    }

    const orders = await Order.find({
      customerId: customerId
    }).sort({
      createdAt: -1
    });

    res.json({
      success: true,
      orders: orders
    });

  } catch (err) {

    console.log(
      "CUSTOMER ORDERS ERROR:",
      err
    );

    res.json({
      success: false,
      error: err.message
    });

  }

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
app.post("/buy-task", checkBlocked, async(req,res)=>{
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
app.post("/complete-task", checkBlocked, async(req,res)=>{

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

app.post("/withdraw", checkBlocked, async(req,res)=>{
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

app.post("/send-message", checkBlocked, async (req, res) => {
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

app.post("/deposit", checkBlocked, async (req, res) => {

    const { amount, userId } = req.body;

    const body = {
        amount: Number(amount),
        wallet_code: "trc-a97880",
        network: "TRC20",
        description: "Deposit",
        metadata: {
            userId: userId
        },
        expireMinutes: 30
    };

    const timestamp = Date.now().toString();

    const signature = signTinPay(
        timestamp,
        "POST",
        "/v1/orders",
        body
    );

    try {

        const response = await axios.post(
            "https://tinpay.dev/v1/orders",
            body,
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": TINPAY_API_KEY,
                    "X-Timestamp": timestamp,
                    "X-Signature": signature,
                    "Idempotency-Key": crypto.randomUUID()
                }
            }
        );

        res.json({
            paymentId: response.data.id,
            address: response.data.pay_address,
            amount: response.data.unique_amount,
            payment_url: response.data.payment_url,
            expire: response.data.expire_at
        });

    } catch (err) {

        console.log(err.response?.data || err);

        res.status(500).json({
            error: "TinPay Error"
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

  const user = await User.findById(userId);

  if(!user){

    return res.json({
      error:"User not found"
    });

  }

  console.log("BEFORE:", user.blocked);

  user.blocked = blocked;

  console.log("AFTER:", user.blocked);

  await user.save();

  res.json({
    msg: blocked ? "User blocked" : "User unblocked"
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

app.post("/send-to-admin", checkBlocked, async(req,res)=>{

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
"firstName lastName email referralCode balance country vip blocked"

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
app.post("/upgrade-vip", checkBlocked, async (req,res)=>{
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

//الطرد
app.get("/user/status", async(req,res)=>{

  const { userId } = req.query;

  const user = await User.findById(userId);

  if(!user){

    return res.json({
      error:true
    });

  }

  res.json({

    blocked:user.blocked

  });

});
//التجاري

app.get("/market/products",async(req,res)=>{

const products=

await Product.find({

active:true

});

res.json(products);

});
//رفع الصور

app.post(
"/merchant/upload-image",

upload.single("image"),

async(req,res)=>{

try{

const result=

await new Promise(

(resolve,reject)=>{

cloudinary.uploader.upload_stream(

{

folder:"marketplace"

},

(error,result)=>{

if(error) reject(error);

else resolve(result);

}

).end(req.file.buffer);

}

);

res.json({

success:true,

url:result.secure_url

});

}catch(err){

res.json({

success:false,

error:err.message

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
