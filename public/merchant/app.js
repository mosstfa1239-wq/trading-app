function showPage(page){

const content =
document.getElementById("content");

switch(page){

case "dashboard":

content.innerHTML = `
<h2>📊 Dashboard</h2>

<p>Welcome to your merchant dashboard.</p>
`;

break;

case "products":

content.innerHTML = `

<div class="card">

<h2>📦 My Products</h2>

<button onclick="showAddProduct()">

➕ Add Product

</button>

</div>

<div id="productForm" style="display:none;">

<input
id="product_name"
placeholder="Product Name">

<input
id="product_price"
type="number"
placeholder="Price">

<input
id="product_category"
placeholder="Category">

<input
type="file"
id="product_file"
accept="image/*"
onchange="uploadProductImage()">

<input
id="product_image"
placeholder="Image URL (Optional)">

<textarea
id="product_description"
placeholder="Description"></textarea>

<button onclick="saveProduct()">

💾 Save Product

</button>

</div>

<div id="productsList">

No products yet.

</div>

`;

setTimeout(loadProducts,100);

break;

case "orders":

content.innerHTML = `

  <div class="card">

    <h2>🧾 Customer Orders</h2>

    <p id="merchantOrdersStatus">
      Loading orders...
    </p>

  </div>

  <div id="merchantOrdersList"></div>

`;

loadMerchantOrders();

break;

case "earnings":

content.innerHTML = `
<h2>💰 Earnings</h2>

<p>Your earnings statistics will appear here.</p>
`;

break;

case "settings":

content.innerHTML = `
<h2>⚙️ Settings</h2>

<p>Merchant settings page.</p>
`;

break;

}

}

function logout(){

window.location.href="/";

}

showPage("dashboard");

function showAddProduct(){

document.getElementById("productForm").style.display="block";

}

async function saveProduct(){

const merchantId =
localStorage.getItem("userId");

const merchantName =
document.getElementById("merchantName").innerText;

const body={

merchantId,

merchantName,

name:
document.getElementById("product_name").value,

price:
Number(document.getElementById("product_price").value),

category:
document.getElementById("product_category").value,

image:
document.getElementById("product_image").value,

description:
document.getElementById("product_description").value

};

const res=await fetch(
"/merchant/add-product",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(body)

});

const data=await res.json();

if(data.success){

alert("✅ Product Added");

loadProducts();

}else{

alert("❌ Error");

}

}

async function loadProducts(){

const merchantId=
localStorage.getItem("userId");

const res=
await fetch("/merchant/products/"+merchantId);

const products=
await res.json();

let html="";

products.forEach(p=>{

html+=`

<div
class="card merchant-product"
onclick="openProductOptions('${p._id}')"
>

<h3>${p.name}</h3>

<p>${p.category}</p>

<p>${p.price} USDT</p>

</div>

`;

});

document.getElementById("productsList").innerHTML=html;

}
async function uploadProductImage(){

  const fileInput =
    document.getElementById("product_file");

  const imageInput =
    document.getElementById("product_image");

  const file =
    fileInput.files[0];

  if(!file){
    return;
  }

  try{

    console.log("IMAGE SELECTED:", file.name);

    const formData =
      new FormData();

    formData.append("image", file);

    const res =
      await fetch(
        "/merchant/upload-image",
        {
          method: "POST",
          body: formData
        }
      );

    const data =
      await res.json();

    console.log("IMAGE UPLOAD:", data);

    if(!data.success){

      alert(
        "Image upload failed: " +
        (data.error || "Unknown error")
      );

      return;
    }

    imageInput.value =
      data.url;

    alert("✅ Image uploaded");

  }catch(err){

    console.error(err);

    alert(
      "Image upload error: " +
      err.message
    );

  }

}
function openProductOptions(productId){

const old =
document.getElementById("productOptions");

if(old){
  old.remove();
}

const box =
document.createElement("div");

box.id="productOptions";

box.className="card";

box.innerHTML=`

<h3>Product Options</h3>

<button
onclick="deleteProduct('${productId}')"
style="
background:#dc2626;
color:white;
border:0;
padding:12px;
border-radius:10px;
width:100%;
margin-top:10px;
">

🗑️ Delete Product

</button>

<button
onclick="closeProductOptions()"
style="
background:#374151;
color:white;
border:0;
padding:12px;
border-radius:10px;
width:100%;
margin-top:10px;
">

✖️ Cancel

</button>

`;

document
.getElementById("productsList")
.prepend(box);

}

function closeProductOptions(){

const box =
document.getElementById("productOptions");

if(box){
  box.remove();
}

}
async function deleteProduct(productId){

  const ok = confirm(
    "Are you sure you want to delete this product?"
  );

  if(!ok) return;

  const merchantId =
    localStorage.getItem("userId");

  try {

    const res = await fetch(
      "/merchant/delete-product",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          productId: productId,
          merchantId: merchantId
        })
      }
    );

    const data = await res.json();

    console.log("DELETE RESPONSE:", data);

    if(data.success){

      alert("✅ Product deleted successfully");

      loadProducts();

      closeProductOptions();

    }else{

      alert(
        "❌ Product could not be deleted: " +
        (data.error || "Unknown error")
      );

    }

  }catch(err){

    console.error("DELETE ERROR:", err);

    alert(
      "❌ Delete error: " +
      err.message
    );

  }

}

async function loadMerchantOrders(){

  const merchantId =
    localStorage.getItem("userId");

  const list =
    document.getElementById(
      "merchantOrdersList"
    );

  const status =
    document.getElementById(
      "merchantOrdersStatus"
    );

  if(!merchantId){

    if(status)
      status.innerText =
        "Please login first";

    return;

  }

  try {

    const res =
      await fetch(
        "/orders/merchant/" +
        merchantId
      );

    const data =
      await res.json();

    if(!data.success){

      if(status)
        status.innerText =
          data.error ||
          "Unable to load orders";

      return;

    }

    const orders =
      data.orders || [];

    if(!orders.length){

      if(status)
        status.innerText =
          "No customer orders yet.";

      if(list)
        list.innerHTML = "";

      return;

    }

    if(status)
      status.innerText = "";

    let html = "";

    orders.forEach(order => {

      const date =
        order.createdAt
        ?
        new Date(
          order.createdAt
        ).toLocaleString()
        :
        "";

      html += `

        <div class="card">

          <h3>
            📦 ${order.productName}
          </h3>

          <p>
            Order ID:
            <strong>
              ${order.orderId}
            </strong>
          </p>

          <p>
            Customer:
            ${order.customerName || "Customer"}
          </p>

          <p>
            Email:
            ${order.customerEmail || "-"}
          </p>

          <p>
            Quantity:
            ${order.quantity}
          </p>

          <p>
            Total:
            <strong>
              ${Number(
                order.total || 0
              ).toFixed(2)}
              USDT
            </strong>
          </p>

          <p>
            Payment:
            ${order.paymentStatus}
          </p>

          <p>
            Order Status:
            <strong>
              ${order.orderStatus}
            </strong>
          </p>

          <p>
            ${
              order.shippingType === "delivery"
              ?
              "🚚 Delivery"
              :
              "📍 Pickup"
            }
          </p>

          ${
            order.shippingType === "delivery"
            ?
            `
            <p>
              📍 ${order.shippingAddress}
            </p>
            `
            :
            ""
          }

          <p
          style="
          opacity:.6;
          font-size:13px;
          "
          >
            ${date}
          </p>

          <hr>

          ${
            order.orderStatus === "pending"
            ?
            `

            <button
              onclick="updateMerchantOrderStatus(
                '${order.orderId}',
                'accepted'
              )"
            >
              ✅ Accept
            </button>

            <button
              onclick="updateMerchantOrderStatus(
                '${order.orderId}',
                'rejected'
              )"
            >
              ❌ Reject
            </button>

            `
            :
            ""
          }

          ${
            order.orderStatus === "accepted"
            ?
            `
            <button
              onclick="updateMerchantOrderStatus(
                '${order.orderId}',
                'preparing'
              )"
            >
              🔧 Preparing
            </button>
            `
            :
            ""
          }

          ${
            order.orderStatus === "preparing"
            ?
            `
            <button
              onclick="updateMerchantOrderStatus(
                '${order.orderId}',
                'ready'
              )"
            >
              📦 Ready
            </button>
            `
            :
            ""
          }

          ${
            order.orderStatus === "ready" &&
            order.shippingType === "delivery"
            ?
            `
            <button
              onclick="updateMerchantOrderStatus(
                '${order.orderId}',
                'shipped'
              )"
            >
              🚚 Shipped
            </button>
            `
            :
            ""
          }

          ${
            order.orderStatus === "ready" &&
            order.shippingType === "pickup"
            ?
            `
            <button
              onclick="updateMerchantOrderStatus(
                '${order.orderId}',
                'completed'
              )"
            >
              ✅ Completed
            </button>
            `
            :
            ""
          }

          ${
            order.orderStatus === "shipped"
            ?
            `
            <button
              onclick="updateMerchantOrderStatus(
                '${order.orderId}',
                'completed'
              )"
            >
              ✅ Completed
            </button>
            `
            :
            ""
          }

        </div>

      `;

    });

    list.innerHTML =
      html;

  } catch(err) {

    console.error(
      "MERCHANT ORDERS ERROR:",
      err
    );

    if(status)
      status.innerText =
        "Unable to load orders.";

  }

}

async function updateMerchantOrderStatus(
  orderId,
  status
){

  const merchantId =
    localStorage.getItem("userId");

  if(!merchantId){

    alert(
      "Please login first"
    );

    return;

  }

  try {

    const res =
      await fetch(
        "/orders/merchant/status",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            orderId,

            merchantId,

            status

          })

        }
      );

    const data =
      await res.json();

    console.log(
      "ORDER STATUS RESPONSE:",
      data
    );

    if(data.success){

      loadMerchantOrders();

    }else{

      alert(
        "❌ " +
        (
          data.error ||
          "Unable to update order"
        )
      );

    }

  } catch(err) {

    console.error(
      "ORDER STATUS ERROR:",
      err
    );

    alert(
      "❌ " +
      err.message
    );

  }

}
