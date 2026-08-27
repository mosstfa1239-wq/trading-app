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

shippingAvailable: {
  type: Boolean,
  default: false
},

shippingCost: {
  type: Number,
  default: 0
},

merchantLocation: {
  lat: {
    type: Number,
    default: null
  },
  lng: {
    type: Number,
    default: null
  },
  address: {
    type: String,
    default: ""
  }
},

  active: {
    type: Boolean,
    default: true
  },

stock: {
  type: Number,
  default: 0,
  min: 0
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

productImage: {
  type: String,
  default: ""
},

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


customerLocation: {
  lat: {
    type: Number,
    default: null
  },

  lng: {
    type: Number,
    default: null
  }
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

  // ================================
  // PAYMENT HOLD / ESCROW
  // ================================

  paymentHold: {
    type: Boolean,
    default: true
  },

  merchantPaymentStatus: {
    type: String,
    enum: [
      "held",
      "ready",
      "released",
      "refunded",
      "partial"
    ],
    default: "held"
  },

  merchantAmount: {
    type: Number,
    default: 0
  },

  releasedAmount: {
    type: Number,
    default: 0
  },

  releasedAt: {
    type: Date,
    default: null
  },

  releasedBy: {
    type: String,
    default: ""
  },

  releaseEligibleAt: {
    type: Date,
    default: null
  },

  payoutReleasedAt: {
    type: Date,
    default: null
  },

  // ================================
  // DELIVERY / RECEIPT
  // ================================

  trackingNumber: {
    type: String,
    default: ""
  },

  shippingCompany: {
    type: String,
    default: ""
  },

  shippedAt: {
    type: Date,
    default: null
  },

  deliveredAt: {
    type: Date,
    default: null
  },

  customerReceivedAt: {
    type: Date,
    default: null
  },

  customerReceived: {
    type: Boolean,
    default: false
  },

  // ================================
  // SHIPPING EVIDENCE
  // ================================

  shippingEvidence: {
    packageImage: {
      type: String,
      default: ""
    },

    contractImage: {
      type: String,
      default: ""
    },

    trackingImage: {
      type: String,
      default: ""
    },

    submittedAt: {
      type: Date,
      default: null
    }
  },

  // ================================
  // DISPUTE
  // ================================

  disputeStatus: {
    type: String,
    enum: [
      "none",
      "open",
      "under_review",
      "waiting_evidence",
      "resolved"
    ],
    default: "none"
  },

disputeReason: {
  type: String,
  default: ""
},

disputeMerchantResponse: {
  type: String,
  default: ""
},

disputeMerchantResponseAt: {
  type: Date,
  default: null
},

  disputeOpenedBy: {
    type: String,
    default: ""
  },

  disputeOpenedAt: {
    type: Date,
    default: null
  },

  disputeDecision: {
    type: String,
    enum: [
      "",
      "customer",
      "merchant",
      "partial"
    ],
    default: ""
  },

  disputeDecisionNote: {
    type: String,
    default: ""
  },

  disputeResolvedAt: {
    type: Date,
    default: null
  },

  disputeResolvedBy: {
    type: String,
    default: ""
  },

orderStatus: {
  type: String,

  enum: [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "shipped",
    "completed",
    "cancelled"
  ],

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

const {
  merchantId,
  merchantName,
  name,
  price,
  category,
  image,
  description,
  stock,
  shippingAvailable,
  shippingCost,
  merchantLocation
} = req.body;

const product = await Product.create({

  merchantId,
  merchantName,

  name,
  price,
  category,
  image,
  description,

stock:
  Math.max(
    0,
    Number(stock) || 0
  ),

  shippingAvailable:
    Boolean(shippingAvailable),

  shippingCost:
    shippingAvailable
      ? Math.max(
          0,
          Number(shippingCost) || 0
        )
      : 0,

  merchantLocation:
    merchantLocation || {
      lat: null,
      lng: null,
      address: ""
    }

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
//حذف المنتج
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

app.post("/merchant/toggle-product", async (req, res) => {

  try {

    const {
      productId,
      merchantId
    } = req.body;

    if(!productId || !merchantId){

      return res.json({
        success:false,
        error:"Missing product information"
      });

    }

    const product =
      await Product.findOne({
        _id:productId,
        merchantId:merchantId
      });

    if(!product){

      return res.json({
        success:false,
        error:"Product not found"
      });

    }

    product.active =
      product.active === false
        ? true
        : false;

    await product.save();

    res.json({
      success:true,
      active:product.active
    });

  }catch(err){

    console.error(
      "TOGGLE PRODUCT ERROR:",
      err
    );

    res.json({
      success:false,
      error:err.message
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
  shippingAddress,
  customerLocation
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

if (Number(product.stock || 0) < qty) {

  return res.json({
    success: false,
    error: "Insufficient stock"
  });

}

    const productsTotal =
      product.price * qty;

/*
  Shipping:
  Pickup = 0
  Delivery = merchant-defined cost
*/

if (
  shippingType === "delivery" &&
  !product.shippingAvailable
) {

  return res.json({
    success: false,
    error: "Delivery is not available for this product"
  });

}

const shippingCost =
  shippingType === "delivery"
    ? Number(product.shippingCost || 0)
    : 0;

/*
  Platform commission.
  Current commission: 2%
*/

const platformFee =
  Number(
    (productsTotal * 0.02)
      .toFixed(2)
  );

const merchantAmount =
  Number(
    (
      productsTotal -
      platformFee
    ).toFixed(2)
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

    productImage:
      product.image || "",

    quantity:
      qty,

    unitPrice:
      product.price,

    productsTotal,

    shippingType,

    shippingAddress:
      shippingType === "delivery"
        ? shippingAddress || ""
        : "",

    customerLocation:
      shippingType === "delivery"
        ? {
            lat:
              Number(
                customerLocation?.lat
              ) || null,

            lng:
              Number(
                customerLocation?.lng
              ) || null
          }
        : {
            lat: null,
            lng: null
          },

    shippingCost,

    platformFee,

merchantAmount,

paymentHold:
  true,

merchantPaymentStatus:
  "held",

releasedAmount:
  0,

    total,

merchantAmount:
  Number(
    (
      total -
      platformFee
    ).toFixed(2)
  ),

    paymentMethod:
      "balance",

    paymentStatus:
      "paid",

    orderStatus:
      "pending"

  });

/*
  Deduct product stock
*/

product.stock =
  Math.max(
    0,
    Number(product.stock || 0) - qty
  );

await product.save();

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
// ================================
// MERCHANT STATISTICS
// ================================
app.get("/merchant/stats/:merchantId", async (req, res) => {

  try {

    const merchantId =
      req.params.merchantId;

    if (!merchantId) {

      return res.json({
        success: false,
        error: "Merchant ID required"
      });

    }

    const orders =
      await Order.find({
        merchantId: merchantId
      });

    const products =
      await Product.find({
        merchantId: merchantId
      });

    let totalSales = 0;
    let completedSales = 0;

let totalPlatformFees = 0;
let merchantEarnings = 0;

    let pendingOrders = 0;
    let confirmedOrders = 0;
    let preparingOrders = 0;
    let readyOrders = 0;
    let shippedOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    orders.forEach(order => {

      const total =
        Number(order.total || 0);

      const status =
        order.orderStatus || "pending";

      /*
        =========================
        ORDER STATUS COUNTS
        =========================
      */

      if (status === "pending") {

        pendingOrders++;

      }

      if (status === "confirmed") {

        confirmedOrders++;

      }

      if (status === "preparing") {

        preparingOrders++;

      }

      if (status === "ready") {

        readyOrders++;

      }

      if (status === "shipped") {

        shippedOrders++;

      }

      if (status === "completed") {

        completedOrders++;

      }

      if (status === "cancelled") {

        cancelledOrders++;

      }


      /*
        =========================
        SALES
        =========================
      */

if (
  order.paymentStatus === "paid" &&
  status !== "cancelled"
) {

  totalSales += total;

  totalPlatformFees +=
    Number(order.platformFee || 0);

}

      /*
        =========================
        COMPLETED SALES
        =========================
      */

      if (
        order.paymentStatus === "paid" &&
        status === "completed"
      ) {

        completedSales += total;

      }

    });

merchantEarnings =
  totalSales -
  totalPlatformFees;

    /*
      =========================
      AVERAGE ORDER VALUE
      =========================
    */

    const averageOrderValue =
      orders.length > 0
        ? totalSales / orders.length
        : 0;

    res.json({

      success: true,

      statistics: {

        totalOrders:
          orders.length,

        totalProducts:
          products.length,

        totalSales:
          Number(
            totalSales.toFixed(2)
          ),

completedSales:
  Number(
    completedSales.toFixed(2)
  ),

totalPlatformFees:
  Number(
    totalPlatformFees.toFixed(2)
  ),

merchantEarnings:
  Number(
    merchantEarnings.toFixed(2)
  ),

averageOrderValue:
  Number(
    averageOrderValue.toFixed(2)
  ),

        pendingOrders:
          pendingOrders,

        confirmedOrders:
          confirmedOrders,

        preparingOrders:
          preparingOrders,

        readyOrders:
          readyOrders,

        shippedOrders:
          shippedOrders,

        completedOrders:
          completedOrders,

        cancelledOrders:
          cancelledOrders

      }

    });

  } catch (err) {

    console.log(
      "MERCHANT STATS ERROR:",
      err
    );

    res.json({

      success: false,

      error:
        err.message

    });

  }

});

app.post("/orders/merchant/status", async (req, res) => {

  const session =
    await mongoose.startSession();

  try {

    const {
      orderId,
      merchantId,
      status,
      trackingNumber
    } = req.body;

    if (!orderId || !merchantId || !status) {

      return res.json({
        success: false,
        error: "Missing order information"
      });

    }

    const allowedStatuses = [
      "confirmed",
      "cancelled",
      "preparing",
      "ready",
      "shipped",
      "completed"
    ];

    if (!allowedStatuses.includes(status)) {

      return res.json({
        success: false,
        error: "Invalid order status"
      });

    }

    session.startTransaction();

    const order =
      await Order.findOne({
        orderId,
        merchantId
      }).session(session);

    if (!order) {

      await session.abortTransaction();

      return res.json({
        success: false,
        error: "Order not found"
      });

    }

    const currentStatus =
      order.orderStatus || "pending";


    const allowedTransitions = {

      pending: [
        "confirmed",
        "cancelled"
      ],

      confirmed: [
        "preparing",
        "cancelled"
      ],

      preparing: [
        "ready",
        "cancelled"
      ],

ready: [
  "shipped",
  "cancelled"
],

shipped: [
  // العميل هو من يؤكد الاستلام
],

      completed: [],

      cancelled: []

    };


    if (
      !allowedTransitions[currentStatus] ||
      !allowedTransitions[currentStatus]
        .includes(status)
    ) {

      await session.abortTransaction();

      return res.json({
        success: false,
        error:
          "Invalid order status transition"
      });

    }


    if (status === "cancelled") {

      if (order.paymentStatus !== "paid") {
        await session.abortTransaction();

        return res.json({
          success: false,
          error:
            "Order payment is not refundable"
        });

      }

      const refundAmount =
        Number(order.total || 0);

      if (refundAmount <= 0) {

        await session.abortTransaction();

        return res.json({
          success: false,
          error:
            "Invalid refund amount"
        });

      }

      const customer =
        await User.findOne({
          _id: order.customerId
        }).session(session);

      if (!customer) {

        await session.abortTransaction();

        return res.json({
          success: false,
          error:
            "Customer not found"
        });

      }

      customer.balance =
        Number(customer.balance || 0)
        + refundAmount;

      await customer.save({
        session
      });

      order.orderStatus =
        "cancelled";

      order.paymentStatus =
        "refunded";

await Notification.create({

  userId: order.customerId,

  text:
    `❌ Order ${order.orderId} has been cancelled and your payment has been refunded.`

});

      await order.save({
        session
      });

      await session.commitTransaction();

      return res.json({
        success: true,
        refunded: true,
        refundAmount,
        order
      });

    }

// =================================
// SHIPPING TRACKING
// =================================

if(status === "shipped"){

  const tracking =
    String(
      trackingNumber || ""
    ).trim();

  if(!tracking){

    await session.abortTransaction();

    return res.json({
      success: false,
      error:
        "Tracking number is required"
    });

  }

  order.trackingNumber =
    tracking;

  order.shippedAt =
    new Date();

}


    // =================================
    // SHIPPING
    // =================================

    if (status === "shipped") {

      const cleanTrackingNumber =
        String(trackingNumber || "").trim();

      if (!cleanTrackingNumber) {

        await session.abortTransaction();

        return res.json({
          success: false,
          error:
            "Tracking number is required"
        });

      }

      order.trackingNumber =
        cleanTrackingNumber;

      order.shippedAt =
        new Date();

    }

    // =================================
    // NORMAL STATUS UPDATE
    // =================================

    order.orderStatus =
      status;

await Notification.create({

  userId: order.customerId,

  text:
    `📦 Order ${order.orderId} status updated to: ${status}`

});

    await order.save({
      session
    });

    await session.commitTransaction();

    res.json({
      success: true,
      refunded: false,
      order
    });

  } catch (err) {

    try {
      await session.abortTransaction();
    } catch (e) {}

    console.log(
      "UPDATE ORDER STATUS ERROR:",
      err
    );

    res.json({
      success: false,
      error: err.message
    });

  } finally {

    session.endSession();

  }

});

// =================================
// CUSTOMER CONFIRMS ORDER RECEIVED
// =================================

app.post("/orders/customer/received", async (req, res) => {

  try {

    const {
      orderId,
      customerId
    } = req.body;

    if (!orderId || !customerId) {

      return res.json({
        success: false,
        error: "Missing order information"
      });

    }

    const order =
      await Order.findOne({
        orderId,
        customerId
      });

    if (!order) {

      return res.json({
        success: false,
        error: "Order not found"
      });

    }

    // لا يمكن تأكيد الاستلام إذا كان هناك نزاع
    if (
      order.disputeStatus &&
      order.disputeStatus !== "none"
    ) {

      return res.json({
        success: false,
        error:
          "Order is under dispute"
      });

    }

    // الطلب مستلم مسبقاً
    if (order.customerReceived) {

      return res.json({
        success: false,
        error:
          "Order has already been received"
      });

    }

    // التحقق من مرحلة الطلب
    const validForReceipt =
      order.orderStatus === "shipped" ||
      (
        order.shippingType === "pickup" &&
        order.orderStatus === "ready"
      );

    if (!validForReceipt) {

      return res.json({
        success: false,
        error:
          "Order is not ready for receipt"
      });

    }

    // =================================
    // CONFIRM CUSTOMER RECEIPT
    // =================================

    order.customerReceived =
      true;

    order.customerReceivedAt =
      new Date();

    order.deliveredAt =
      new Date();

const releaseTime =
  new Date(
    Date.now() +
    24 * 60 * 60 * 1000
  );

order.releaseEligibleAt =
  releaseTime;

    order.orderStatus =
      "completed";

    // المال يصبح جاهزاً للإدارة فقط
    order.paymentHold =
      true;

    order.merchantPaymentStatus =
      "ready";

    order.releasedAmount =
      0;

    order.releasedAt =
      null;

    order.releasedBy =
      "";

    await order.save();

    // إشعار العميل
    await Notification.create({

      userId:
        order.customerId,

      text:
        `✅ Order ${order.orderId} has been marked as received. Payment is now awaiting administrative release.`

    });

    // إشعار التاجر
    await Notification.create({

      userId:
        order.merchantId,

      text:
        `📦 Order ${order.orderId} has been received by the customer. Payment is ready for administrative release.`

    });

    res.json({

      success: true,

      message:
        "Order received successfully",

      order

    });

  } catch (err) {

    console.log(
      "CUSTOMER RECEIVED ERROR:",
      err
    );

    res.json({

      success: false,

      error:
        err.message

    });

  }

});


// =====================================
// ADMIN RELEASE MERCHANT PAYMENT
// =====================================

app.post("/admin/orders/release", checkAdmin, async (req, res) => {

  const session =
    await mongoose.startSession();

  try {

    const {
      orderId,
      userId
    } = req.body;

    if (!orderId || !userId) {

      return res.json({
        success: false,
        error: "Order ID and admin ID are required"
      });

    }

    session.startTransaction();

    const order =
      await Order.findOne({
        orderId
      }).session(session);

    if (!order) {

      await session.abortTransaction();

      return res.json({
        success: false,
        error: "Order not found"
      });

    }

    // =================================
    // MUST BE RECEIVED
    // =================================

    if (!order.customerReceived) {

      await session.abortTransaction();

      return res.json({
        success: false,
        error:
          "Customer has not confirmed receipt"
      });

    }

    // =================================
    // DISPUTE PROTECTION
    // =================================

    if (
      order.disputeStatus &&
      order.disputeStatus !== "none"
    ) {

      await session.abortTransaction();

      return res.json({
        success: false,
        error:
          "Cannot release payment while order is under dispute"
      });

    }

    // =================================
    // ALREADY RELEASED
    // =================================

    if (
      order.merchantPaymentStatus ===
      "released"
    ) {

      await session.abortTransaction();

      return res.json({
        success: false,
        error:
          "Payment has already been released"
      });

    }

    // =================================
    // CHECK 24 HOURS
    // =================================

    if (!order.releaseEligibleAt) {

      await session.abortTransaction();

      return res.json({
        success: false,
        error:
          "Payment release time is not available"
      });

    }

    const now =
      new Date();

    if (
      now <
      new Date(order.releaseEligibleAt)
    ) {

      const remaining =
        new Date(
          order.releaseEligibleAt
        ).getTime() -
        now.getTime();

      const hours =
        Math.ceil(
          remaining /
          (1000 * 60 * 60)
        );

      await session.abortTransaction();

      return res.json({
        success: false,
        error:
          `Payment cannot be released yet. ${hours} hour(s) remaining.`
      });

    }

    // =================================
    // MERCHANT
    // =================================

    const merchant =
      await User.findById(
        order.merchantId
      ).session(session);

    if (!merchant) {

      await session.abortTransaction();

      return res.json({
        success: false,
        error:
          "Merchant not found"
      });

    }

    // =================================
    // PAYMENT AMOUNT
    // =================================

    const merchantAmount =
      Number(
        order.merchantAmount ||
        (
          Number(order.total || 0) -
          Number(order.platformFee || 0)
        )
      );

    if (
      !Number.isFinite(merchantAmount) ||
      merchantAmount <= 0
    ) {

      await session.abortTransaction();

      return res.json({
        success: false,
        error:
          "Invalid merchant payment amount"
      });

    }

    // =================================
    // RELEASE MONEY
    // =================================

    merchant.balance =
      Number(
        (
          Number(merchant.balance || 0) +
          merchantAmount
        ).toFixed(2)
      );

    await merchant.save({
      session
    });

    // =================================
    // UPDATE ORDER
    // =================================

    order.paymentHold =
      false;

    order.merchantPaymentStatus =
      "released";

    order.releasedAmount =
      merchantAmount;

    order.releasedAt =
      new Date();

    order.payoutReleasedAt =
      new Date();

    order.releasedBy =
      userId;

    await order.save({
      session
    });

    // =================================
    // NOTIFY MERCHANT
    // =================================

    await Notification.create(
      [{
        userId:
          order.merchantId,

        text:
          `💰 Payment for order ${order.orderId} has been released. Amount: ${merchantAmount.toFixed(2)} USDT`
      }],
      {
        session
      }
    );

    // =================================
    // NOTIFY CUSTOMER
    // =================================

    await Notification.create(
      [{
        userId:
          order.customerId,

        text:
          `✅ Order ${order.orderId} payment process has been completed.`
      }],
      {
        session
      }
    );

    await session.commitTransaction();

    res.json({

      success: true,

      message:
        "Merchant payment released successfully",

      order,

      releasedAmount:
        merchantAmount

    });

  } catch (err) {

    await session.abortTransaction();

    console.error(
      "ADMIN RELEASE PAYMENT ERROR:",
      err
    );

    res.json({

      success: false,

      error:
        err.message

    });

  } finally {

    session.endSession();

  }

});

// =============================================
// ADMIN - RESOLVE DISPUTE
// =============================================

app.post(
  "/admin/orders/resolve-dispute",
  checkAdmin,
  async (req, res) => {

    const session =
      await mongoose.startSession();

    try {

      const {
        orderId,
        decision,
        merchantAmount,
        customerAmount,
        note
      } = req.body;

      if (
        !orderId ||
        !["merchant", "customer", "partial"].includes(decision)
      ) {

        return res.json({
          success: false,
          error: "Invalid dispute decision"
        });

      }

      session.startTransaction();

      const order =
        await Order.findOne({
          orderId
        }).session(session);

      if (!order) {

        await session.abortTransaction();

        return res.json({
          success: false,
          error: "Order not found"
        });

      }

      if (
        !order.disputeStatus ||
        order.disputeStatus === "none"
      ) {

        await session.abortTransaction();

        return res.json({
          success: false,
          error: "Order is not under dispute"
        });

      }

      if (
        order.merchantPaymentStatus === "released"
      ) {

        await session.abortTransaction();

        return res.json({
          success: false,
          error: "Payment has already been released"
        });

      }

      const platformFee =
        Number(order.platformFee || 0);

      const refundableAmount =
        Number(order.total || 0) -
        platformFee;

      let merchantPayout = 0;
      let customerRefund = 0;

      if (decision === "merchant") {

        merchantPayout =
          Number(
            order.merchantAmount ||
            refundableAmount
          );

        customerRefund = 0;

      }

      else if (decision === "customer") {

        merchantPayout = 0;

        customerRefund =
          Math.max(
            0,
            refundableAmount
          );

      }

      else {

        merchantPayout =
          Number(merchantAmount || 0);

        customerRefund =
          Number(customerAmount || 0);

        const totalDistributed =
          merchantPayout +
          customerRefund;

        if (
          totalDistributed >
          refundableAmount + 0.01
        ) {

          await session.abortTransaction();

          return res.json({
            success: false,
            error:
              "Merchant and customer amounts exceed the refundable amount"
          });

        }

      }

      // =========================
      // PAY MERCHANT
      // =========================

      if (merchantPayout > 0) {

        const merchant =
          await User.findOne({
            _id: order.merchantId
          }).session(session);

        if (!merchant) {

          await session.abortTransaction();

          return res.json({
            success: false,
            error: "Merchant not found"
          });

        }

        merchant.balance =
          Number(
            merchant.balance || 0
          ) +
          merchantPayout;

        await merchant.save({
          session
        });

      }

      // =========================
      // REFUND CUSTOMER
      // =========================

      if (customerRefund > 0) {

        const customer =
          await User.findOne({
            _id: order.customerId
          }).session(session);

        if (!customer) {

          await session.abortTransaction();

          return res.json({
            success: false,
            error: "Customer not found"
          });

        }

        customer.balance =
          Number(
            customer.balance || 0
          ) +
          customerRefund;

        await customer.save({
          session
        });

      }

      // =========================
      // UPDATE ORDER
      // =========================

      order.disputeStatus =
        "resolved";

      order.disputeDecision =
        decision;

      order.disputeDecisionNote =
        note || "";

      order.disputeResolvedAt =
        new Date();

      order.disputeResolvedBy =
        "admin";

      order.releasedAmount =
        merchantPayout;

      order.merchantPaymentStatus =
        merchantPayout > 0
          ? "released"
          : "refunded";

      order.paymentHold =
        false;

      order.releasedAt =
        new Date();

      order.payoutReleasedAt =
        merchantPayout > 0
          ? new Date()
          : null;

      await order.save({
        session
      });

      await session.commitTransaction();

      // =========================
      // NOTIFICATIONS
      // =========================

      if (merchantPayout > 0) {

        await Notification.create({

          userId:
            order.merchantId,

          text:
            `⚖️ Dispute resolved in your favor for Order ${order.orderId}. ${merchantPayout.toFixed(2)} USDT has been added to your balance.`

        });

      }

      if (customerRefund > 0) {

        await Notification.create({

          userId:
            order.customerId,

          text:
            `⚖️ Dispute resolved in your favor for Order ${order.orderId}. ${customerRefund.toFixed(2)} USDT has been refunded to your balance.`

        });

      }

      res.json({

        success: true,

        message:
          "Dispute resolved successfully",

        decision,

        merchantPayout,

        customerRefund

      });

    } catch (err) {

      try {
        await session.abortTransaction();
      } catch (e) {}

      console.log(
        "RESOLVE DISPUTE ERROR:",
        err
      );

      res.json({

        success: false,

        error:
          err.message

      });

    } finally {

      session.endSession();

    }

  }
);

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

// =============================================
// CUSTOMER - OPEN ORDER DISPUTE
// =============================================

app.post("/orders/dispute/open", async (req, res) => {

  try {

    const {
      orderId,
      customerId,
      reason
    } = req.body;

    if (
      !orderId ||
      !customerId ||
      !reason ||
      !String(reason).trim()
    ) {

      return res.json({
        success: false,
        error: "Order ID, customer ID and dispute reason are required"
      });

    }

    const order =
      await Order.findOne({
        orderId,
        customerId
      });

    if (!order) {

      return res.json({
        success: false,
        error: "Order not found"
      });

    }

    // لا يمكن فتح نزاع بعد تحرير المال
    if (
      order.merchantPaymentStatus ===
      "released"
    ) {

      return res.json({
        success: false,
        error:
          "Payment has already been released"
      });

    }

    // منع فتح نزاع مكرر
    if (
      order.disputeStatus &&
      order.disputeStatus !== "none"
    ) {

      return res.json({
        success: false,
        error:
          "This order already has an active or resolved dispute"
      });

    }

    // الطلب يجب أن يكون في مرحلة شحن/استلام
    const validStatus = [
      "shipped",
      "completed"
    ];

    if (
      !validStatus.includes(
        order.orderStatus
      )
    ) {

      return res.json({
        success: false,
        error:
          "This order is not eligible for a dispute"
      });

    }

    order.disputeStatus =
      "open";

    order.disputeReason =
      String(reason).trim();

    order.disputeOpenedBy =
      "customer";

    order.disputeOpenedAt =
      new Date();

    // إيقاف تحرير الأموال
    order.paymentHold =
      true;

    order.merchantPaymentStatus =
      "held";

    await order.save();

    // إشعار التاجر
    await Notification.create({

      userId:
        order.merchantId,

      text:
        `⚠️ A dispute has been opened for Order ${order.orderId}. Payment is currently on hold pending review.`

    });

    // إشعار العميل
    await Notification.create({

      userId:
        order.customerId,

      text:
        `⚠️ Dispute opened for Order ${order.orderId}. The payment has been placed on hold pending review.`

    });

    res.json({

      success: true,

      message:
        "Dispute opened successfully",

      order

    });

  } catch (err) {

    console.log(
      "OPEN DISPUTE ERROR:",
      err
    );

    res.json({

      success: false,

      error:
        err.message

    });

  }

});

// =============================================
// MERCHANT - RESPOND TO ORDER DISPUTE
// =============================================

app.post(
  "/orders/dispute/merchant-response",
  async (req, res) => {

    try {

      const {
        orderId,
        merchantId,
        response
      } = req.body;

      if (
        !orderId ||
        !merchantId ||
        !response ||
        !String(response).trim()
      ) {

        return res.json({
          success: false,
          error:
            "Order ID, merchant ID and response are required"
        });

      }

      const order =
        await Order.findOne({
          orderId,
          merchantId
        });

      if (!order) {

        return res.json({
          success: false,
          error:
            "Order not found"
        });

      }

      // يجب أن يكون هناك نزاع
      if (
        !order.disputeStatus ||
        order.disputeStatus === "none"
      ) {

        return res.json({
          success: false,
          error:
            "This order is not under dispute"
        });

      }

      // لا يمكن الرد بعد إنهاء النزاع
      if (
        order.disputeStatus === "resolved"
      ) {

        return res.json({
          success: false,
          error:
            "This dispute has already been resolved"
        });

      }

      const merchantResponse =
        String(response).trim();

      // منع الرد الفارغ
      if (!merchantResponse) {

        return res.json({
          success: false,
          error:
            "Merchant response cannot be empty"
        });

      }

      order.disputeMerchantResponse =
        merchantResponse;

      order.disputeMerchantResponseAt =
        new Date();

      // نقل النزاع للمراجعة
      order.disputeStatus =
        "under_review";

      await order.save();

      // إشعار الإدارة
      // نستخدم إشعارًا عامًا للإدارة إذا كان نظام
      // الإشعارات عندك يعتمد على userId.
      // لذلك لا ننشئه هنا بشكل عشوائي.

      res.json({

        success: true,

        message:
          "Merchant response submitted successfully",

        order: {

          orderId:
            order.orderId,

          disputeStatus:
            order.disputeStatus,

          disputeReason:
            order.disputeReason,

          disputeMerchantResponse:
            order.disputeMerchantResponse,

          disputeMerchantResponseAt:
            order.disputeMerchantResponseAt

        }

      });

    } catch (err) {

      console.log(
        "MERCHANT DISPUTE RESPONSE ERROR:",
        err
      );

      res.json({

        success: false,

        error:
          err.message

      });

    }

  }
);

app.post("/orders/rating", async (req, res) => {

  try {

    const {
      orderId,
      customerId,
      rating,
      review
    } = req.body;


    if (
      !orderId ||
      !customerId ||
      rating === undefined
    ) {

      return res.json({
        success: false,
        error: "Missing rating information"
      });

    }


    const score =
      Number(rating);


    if (
      !Number.isInteger(score) ||
      score < 1 ||
      score > 5
    ) {

      return res.json({
        success: false,
        error: "Rating must be between 1 and 5"
      });

    }


    const order =
      await Order.findOne({
        orderId: orderId,
        customerId: customerId
      });


    if (!order) {

      return res.json({
        success: false,
        error: "Order not found"
      });

    }


    if (
      order.orderStatus !== "completed"
    ) {

      return res.json({
        success: false,
        error:
          "You can rate only completed orders"
      });

    }


    if (
      Number(order.rating || 0) > 0
    ) {

      return res.json({
        success: false,
        error:
          "This order has already been rated"
      });

    }


    order.rating =
      score;

    order.review =
      String(review || "").trim();


    await order.save();


    res.json({
      success: true,
      order: order
    });


  } catch (err) {

    console.log(
      "ORDER RATING ERROR:",
      err
    );

    res.json({
      success: false,
      error: err.message
    });

  }

});

app.get(
  "/products/:id/rating",
  async (req, res) => {

    try {

      const productId =
        req.params.id;


      const orders =
        await Order.find({
          productId: productId,
          orderStatus: "completed",
          rating: {
            $gte: 1
          }
        });


      if (!orders.length) {

        return res.json({
          success: true,
          averageRating: 0,
          ratingCount: 0
        });

      }


      const total =
        orders.reduce(
          (sum, order) =>
            sum + Number(
              order.rating || 0
            ),
          0
        );


      const average =
        total / orders.length;


      res.json({
        success: true,

        averageRating:
          Number(
            average.toFixed(1)
          ),

        ratingCount:
          orders.length
      });


    } catch (err) {

      console.log(
        "PRODUCT RATING ERROR:",
        err
      );

      res.json({
        success: false,
        error: err.message
      });

    }

  }
);



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

app.get("/products/ratings", async (req, res) => {

  try {

    const ratings = await Order.aggregate([

      {
        $match: {
          orderStatus: "completed",
          rating: {
            $gte: 1
          }
        }
      },

      {
        $group: {
          _id: "$productId",

          averageRating: {
            $avg: "$rating"
          },

          ratingCount: {
            $sum: 1
          }
        }
      }

    ]);

    res.json({
      success: true,
      ratings
    });

  } catch(err) {

    console.error(
      "PRODUCT RATINGS ERROR:",
      err
    );

    res.json({
      success: false,
      ratings: []
    });

  }

});

// =========================================
// AUTOMATIC MERCHANT PAYOUT AFTER 24 HOURS
// =========================================

async function releaseEligibleMerchantPayments() {

  const session =
    await mongoose.startSession();

  try {

    session.startTransaction();

    const now =
      new Date();

    const order =
      await Order.findOne({

        customerReceived:
          true,

        disputeStatus:
          "none",

        merchantPaymentStatus:
          "ready",

        paymentHold:
          true,

        releaseEligibleAt:
          {
            $lte: now
          }

      }).session(session);

    if (!order) {

      await session.abortTransaction();

      return;

    }

    const merchant =
      await User.findById(
        order.merchantId
      ).session(session);

    if (!merchant) {

      await session.abortTransaction();

      console.log(
        "MERCHANT PAYOUT ERROR: Merchant not found",
        order.merchantId
      );

      return;

    }

    const amount =
      Number(
        order.merchantAmount || 0
      );

    if (amount <= 0) {

      await session.abortTransaction();

      console.log(
        "MERCHANT PAYOUT ERROR: Invalid merchant amount",
        order.orderId
      );

      return;

    }

    merchant.balance =
      Number(
        (
          Number(merchant.balance || 0) +
          amount
        ).toFixed(2)
      );

    await merchant.save({
      session
    });

    order.paymentHold =
      false;

    order.merchantPaymentStatus =
      "released";

    order.releasedAmount =
      amount;

    order.releasedAt =
      now;

    order.payoutReleasedAt =
      now;

    order.releasedBy =
      "system_24h";

    await order.save({
      session
    });

    await session.commitTransaction();

    await Notification.create({

      userId:
        order.merchantId,

      text:
        `💰 Payment released for order ${order.orderId}. Amount: ${amount.toFixed(2)} USDT.`

    });

    await Notification.create({

      userId:
        order.customerId,

      text:
        `✅ Order ${order.orderId} has completed its 24-hour protection period.`

    });

    console.log(
      "MERCHANT PAYMENT RELEASED:",
      order.orderId,
      amount
    );

  } catch (err) {

    try {
      await session.abortTransaction();
    } catch (e) {}

    console.log(
      "AUTOMATIC MERCHANT PAYOUT ERROR:",
      err
    );

  } finally {

    session.endSession();

  }

}

// =============================================
// ADMIN - HELD MERCHANT PAYMENTS
// =============================================

app.get("/admin/orders/payouts", async (req, res) => {

  try {

    const orders =
      await Order.find({

        paymentStatus: "paid",

        customerReceived: true,

merchantPaymentStatus: {
  $in: [
    "ready",
    "held"
  ]
}

      }).sort({
        customerReceivedAt: -1
      });

    const now = Date.now();

    const result =
      orders.map(order => {

        const releaseTime =
          order.releaseEligibleAt
            ? new Date(
                order.releaseEligibleAt
              ).getTime()
            : 0;

        const hasDispute =
          order.disputeStatus &&
          order.disputeStatus !== "none";

        let payoutStatus;

        if (hasDispute) {

          payoutStatus =
            "dispute";

        } else if (
          releaseTime &&
          now >= releaseTime
        ) {

          payoutStatus =
            "ready";

        } else {

          payoutStatus =
            "waiting";

        }

        return {

          _id:
            order._id,

          orderId:
            order.orderId,

          customerName:
            order.customerName,

          customerEmail:
            order.customerEmail,

          merchantId:
            order.merchantId,

          merchantName:
            order.merchantName,

          productName:
            order.productName,

          total:
            order.total,

          merchantAmount:
            Number(
              order.merchantAmount ||
              (
                Number(order.productsTotal || 0) +
                Number(order.shippingCost || 0)
              )
            ),

          platformFee:
            order.platformFee,

          customerReceivedAt:
            order.customerReceivedAt,

          releaseEligibleAt:
            order.releaseEligibleAt,

          disputeStatus:
            order.disputeStatus,

          disputeReason:
            order.disputeReason,

disputeMerchantResponse:
  order.disputeMerchantResponse,

disputeMerchantResponseAt:
  order.disputeMerchantResponseAt,


          payoutStatus

        };

      });

    res.json({

      success: true,

      orders: result

    });

  } catch (err) {

    console.log(
      "ADMIN PAYOUTS ERROR:",
      err
    );

    res.json({

      success: false,

      error: err.message

    });

  }

});

// =============================================
// ADMIN - RELEASE MERCHANT PAYMENT
// =============================================

app.post(
  "/admin/orders/release-payment",
  async (req, res) => {

    const session =
      await mongoose.startSession();

    try {

      const {
        orderId
      } = req.body;

      if (!orderId) {

        return res.json({

          success: false,

          error:
            "Order ID required"

        });

      }

      session.startTransaction();

      const order =
        await Order.findOne({
          orderId
        }).session(session);

      if (!order) {

        await session.abortTransaction();

        return res.json({

          success: false,

          error:
            "Order not found"

        });

      }

      // يجب أن يكون العميل قد أكد الاستلام
      if (!order.customerReceived) {

        await session.abortTransaction();

        return res.json({

          success: false,

          error:
            "Customer has not confirmed receipt"

        });

      }

      // لا نحرر أي مبلغ أثناء النزاع
      if (
        order.disputeStatus &&
        order.disputeStatus !== "none"
      ) {

        await session.abortTransaction();

        return res.json({

          success: false,

          error:
            "Payment cannot be released while the order is under dispute"

        });

      }

      // منع تحرير المبلغ مرتين
      if (
        order.merchantPaymentStatus ===
        "released"
      ) {

        await session.abortTransaction();

        return res.json({

          success: false,

          error:
            "Payment has already been released"

        });

      }

      // التأكد من انتهاء 24 ساعة
      if (
        !order.releaseEligibleAt ||
        Date.now() <
        new Date(
          order.releaseEligibleAt
        ).getTime()
      ) {

        await session.abortTransaction();

        return res.json({

          success: false,

          error:
            "Payment is still within the 24-hour holding period"

        });

      }

      const merchant =
        await User.findOne({
          _id: order.merchantId
        }).session(session);

      if (!merchant) {

        await session.abortTransaction();

        return res.json({

          success: false,

          error:
            "Merchant not found"

        });

      }

      const merchantAmount =
        Number(
          order.merchantAmount ||
          (
            Number(order.productsTotal || 0) +
            Number(order.shippingCost || 0)
          )
        );

      if (
        merchantAmount <= 0
      ) {

        await session.abortTransaction();

        return res.json({

          success: false,

          error:
            "Invalid merchant payment amount"

        });

      }

      // إضافة المبلغ لرصيد التاجر
      merchant.balance =
        Number(
          merchant.balance || 0
        ) +
        merchantAmount;

      await merchant.save({
        session
      });

      // تحديث الطلب
      order.merchantPaymentStatus =
        "released";

      order.paymentHold =
        false;

      order.releasedAmount =
        merchantAmount;

      order.releasedAt =
        new Date();

      order.payoutReleasedAt =
        new Date();

      order.releasedBy =
        "admin";

      await order.save({
        session
      });

      await session.commitTransaction();

      // إشعار التاجر
      await Notification.create({

        userId:
          order.merchantId,

        text:
          `💰 Payment released for Order ${order.orderId}. ${merchantAmount.toFixed(2)} USDT has been added to your balance.`

      });

      // إشعار العميل
      await Notification.create({

        userId:
          order.customerId,

        text:
          `✅ Payment for Order ${order.orderId} has been released to the merchant.`

      });

      res.json({

        success: true,

        message:
          "Merchant payment released successfully",

        amount:
          merchantAmount,

        order

      });

    } catch (err) {

      try {
        await session.abortTransaction();
      } catch (e) {}

      console.log(
        "RELEASE PAYMENT ERROR:",
        err
      );

      res.json({

        success: false,

        error:
          err.message

      });

    } finally {

      session.endSession();

    }

  }
);


// 🚀 تشغ
mongoose.connect("mongodb+srv://admin:123123123@cluster0.esh32ir.mongodb.net/trading")
.then(() => {

  console.log("DB Connected 🔥");

  setInterval(
    releaseEligibleMerchantPayments,
    60 * 1000
  );

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });

})
.catch(err => console.log(err));
