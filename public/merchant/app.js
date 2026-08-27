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
id="product_stock"
type="number"
min="0"
value="0"
placeholder="Stock Quantity">

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

<div style="
  margin-top:15px;
  padding:15px;
  border:1px solid #333;
  border-radius:12px;
">

  <h3>🚚 Delivery Options</h3>

  <label style="
    display:flex;
    align-items:center;
    gap:10px;
    margin-bottom:12px;
  ">

    <input
      type="checkbox"
      id="shipping_available"
      onchange="
        document.getElementById('shippingCostBox').style.display =
          this.checked ? 'block' : 'none';
      "
    >

    🚚 Delivery available

  </label>

  <div
    id="shippingCostBox"
    style="display:none;"
  >

    <input
      id="shipping_cost"
      type="number"
      min="0"
      step="0.01"
      placeholder="Delivery Cost (USDT)"
    >

  </div>

</div>

<button
  onclick="saveProduct()"
  style="
    margin-top:15px;
  "
>

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

<div class="card">

  <h2>💰 Earnings & Statistics</h2>

  <p id="merchantStatsStatus">
    Loading statistics...
  </p>

</div>

<div id="merchantStats">

</div>

`;

loadMerchantStats();

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

const shippingAvailable =
  document.getElementById(
    "shipping_available"
  )?.checked || false;

const shippingCost =
  shippingAvailable
    ? Number(
        document.getElementById(
          "shipping_cost"
        )?.value || 0
      )
    : 0;


const body = {

  merchantId,

  merchantName,

  name:
    document.getElementById(
      "product_name"
    ).value,

  price:
    Number(
      document.getElementById(
        "product_price"
      ).value
    ),

stock:
  Number(
    document.getElementById(
      "product_stock"
    ).value || 0
  ),

  category:
    document.getElementById(
      "product_category"
    ).value,

  image:
    document.getElementById(
      "product_image"
    ).value,

  description:
    document.getElementById(
      "product_description"
    ).value,

shippingAvailable,

shippingCost,

merchantLocation:
  window.merchantLocation || {
    lat:null,
    lng:null
  }
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

  const list =
    document.getElementById("productsList");

  if(!list)
    return;

  list.innerHTML =
    "⏳ Loading products...";

  const merchantId =
    localStorage.getItem("userId");

  if(!merchantId){

    list.innerHTML =
      "❌ Merchant ID not found.";

    return;
  }

  try{

    const res =
      await fetch(
        "/merchant/products/" +
        merchantId
      );

    if(!res.ok){

      throw new Error(
        "HTTP " + res.status
      );

    }

    const products =
      await res.json();

    console.log(
      "MERCHANT PRODUCTS:",
      products
    );

    if(!Array.isArray(products) ||
       products.length === 0){

      list.innerHTML = `
        <div class="card">
          <p>📦 No products yet.</p>
        </div>
      `;

      return;
    }

    let html = "";

    products.forEach(p => {

      html += `

        <div
          class="card merchant-product"
          onclick="
            openProductOptions(
              '${p._id}'
            )
          "
          style="cursor:pointer;"
        >

          ${
            p.image
            ?
            `
            <img
              src="${p.image}"
              alt="${p.name || ""}"
              style="
                width:100%;
                height:180px;
                object-fit:cover;
                border-radius:14px;
                margin-bottom:12px;
              "
              onerror="
                this.style.display='none';
              "
            >
            `
            :
            ""
          }

          <h3>
            ${p.name || "Unnamed Product"}
          </h3>

          <p>
            ${p.category || "General"}
          </p>

          <p>
            💰
            ${Number(
              p.price || 0
            ).toFixed(2)}
            USDT
          </p>

${(() => {

  const stock =
    Number(p.stock || 0);

  let statusText = "";
  let statusIcon = "";

  if(stock <= 0){

    statusText = "Out of Stock";
    statusIcon = "🔴";

  }else if(stock <= 5){

    statusText = "Low Stock";
    statusIcon = "🟡";

  }else{

    statusText = "Available";
    statusIcon = "🟢";

  }

  return `

    <p>
      📦 Stock:
      <strong>
        ${stock}
      </strong>
    </p>

    <p>
      ${statusIcon}
      <strong>
        ${statusText}
      </strong>
    </p>

  `;

})()}

  <p>
    🛍️ Status:
    <strong>
      ${
        p.active === false
        ? "🔴 Inactive"
        : "🟢 Active"
      }
    </strong>
  </p>

  <p>
    ${
      p.shippingAvailable
      ?
      "🚚 Delivery available"
      :
      "📍 Pickup only"
    }
  </p>

          <p>
            ${
              p.shippingAvailable
              ?
              "🚚 Delivery available"
              :
              "📍 Pickup only"
            }
          </p>

          ${
            p.shippingAvailable
            ?
            `
            <p style="opacity:.7;">
              Delivery:
              ${Number(
                p.shippingCost || 0
              ).toFixed(2)}
              USDT
            </p>
            `
            :
            ""
          }

        </div>

      `;

    });

    list.innerHTML =
      html;

  }catch(err){

    console.error(
      "MERCHANT PRODUCTS ERROR:",
      err
    );

    list.innerHTML = `
      <div class="card">
        <p>
          ❌ Unable to load products.
        </p>

        <p style="opacity:.6;">
          ${err.message}
        </p>
      </div>
    `;

  }

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
onclick="toggleProduct('${productId}')"
style="
background:#2563eb;
color:white;
border:0;
padding:12px;
border-radius:10px;
width:100%;
margin-top:10px;
">

🔄 Activate / Deactivate

</button>

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

async function toggleProduct(productId){

  const merchantId =
    localStorage.getItem("userId");

  if(!merchantId){

    alert("❌ Merchant ID not found");

    return;

  }

  try{

    const res =
      await fetch(
        "/merchant/toggle-product",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({
            productId,
            merchantId
          })
        }
      );

    const data =
      await res.json();

    if(!data.success){

      alert(
        "❌ " +
        (
          data.error ||
          "Unable to change product status"
        )
      );

      return;

    }

    alert(
      data.active
        ? "🟢 Product activated"
        : "🔴 Product deactivated"
    );

    closeProductOptions();

    loadProducts();

  }catch(err){

    console.error(
      "TOGGLE PRODUCT ERROR:",
      err
    );

    alert(
      "❌ " + err.message
    );

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

      const paymentHeld =
        order.merchantPaymentStatus !== "released" &&
        Number(order.total || 0) > 0;

      const hasDispute =
        order.disputeStatus &&
        order.disputeStatus !== "none";

      const merchantAmount =
        Number(
          order.merchantAmount ||
          (
            Number(order.total || 0) -
            Number(order.platformFee || 0)
          )
        );

      const disputeReason =
        order.disputeReason ||
        "No reason provided";

      html += `

        <div class="card">

          <h3>
            📦 ${order.productName}
          </h3>

          ${
            hasDispute
            ?
            `
            <div
              id="merchantDisputeData_${order.orderId}"
              data-reason="${String(disputeReason)
                .replace(/"/g, '&quot;')}"
              style="display:none;"
            ></div>
            `
            :
            ""
          }

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

          ${
            paymentHeld
            ?
            `
            <div style="
              margin-top:12px;
              padding:12px;
              border:1px solid #555;
              border-radius:12px;
              background:rgba(255,193,7,.08);
            ">

              <strong>
                🔒 Payment Reserved
              </strong>

              <p style="
                margin:6px 0 0;
                font-size:18px;
              ">
                ${merchantAmount.toFixed(2)} USDT
              </p>

              <small style="opacity:.7;">
                Customer payment is securely held for this order.
              </small>

            </div>
            `
            :
            `
            <div style="
              margin-top:12px;
              padding:12px;
              border:1px solid #333;
              border-radius:12px;
            ">
              💰 Payment:
              <strong>
                ${order.merchantPaymentStatus || "unknown"}
              </strong>
            </div>
            `
          }

          ${
            hasDispute
            ?
            `
            <div style="
              margin-top:12px;
              padding:12px;
              border:1px solid #ef4444;
              border-radius:12px;
              background:rgba(239,68,68,.08);
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:10px;
            ">

              <div>
                <strong>
                  ⚠️ Problem with delivery
                </strong>

                <div style="
                  font-size:13px;
                  opacity:.75;
                  margin-top:4px;
                ">
                  Dispute requires attention
                </div>
              </div>

              <button
                type="button"
                onclick="
                  openMerchantDispute(
                    '${order.orderId}'
                  )
                "
                style="
                  width:38px;
                  height:38px;
                  border-radius:50%;
                  border:0;
                  cursor:pointer;
                  font-size:20px;
                "
              >
                ❓
              </button>

            </div>
            `
            :
            ""
          }


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
  <div
    style="
      margin-top:10px;
      padding:10px;
      border:1px solid #333;
      border-radius:10px;
    "
  >

    <p>
      🚚 Delivery
    </p>

    ${
      order.customerLocation &&
      order.customerLocation.lat !== null &&
      order.customerLocation.lng !== null
      ?
      `
      <button
        type="button"
        onclick="
          window.open(
            'https://www.google.com/maps?q=' +
            ${Number(order.customerLocation.lat)} +
            ',' +
            ${Number(order.customerLocation.lng)},
            '_blank'
          )
        "
        style="
          width:100%;
          padding:12px;
          border:0;
          border-radius:10px;
          cursor:pointer;
        "
      >
        📍 Open Customer Location
      </button>
      `
      :
      `
      <p style="opacity:.7;">
        📍 Customer location not available
      </p>
      `
    }

  </div>
  `
  :
  `
  <p>
    📍 Pickup from merchant
  </p>
  `
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
                'confirmed'
              )"
            >
              ✅ Accept
            </button>

            <button
              onclick="updateMerchantOrderStatus(
                '${order.orderId}',
                'cancelled'
              )"
            >
              ❌ Reject
            </button>

            `
            :
            ""
          }

          ${
            order.orderStatus === "confirmed"
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

  let trackingNumber = "";

  // =================================
  // SHIPPING
  // =================================

  if(status === "shipped"){

    trackingNumber =
      prompt(
        "Enter the shipping tracking number:"
      );

    if(trackingNumber === null){

      return;

    }

    trackingNumber =
      trackingNumber.trim();

    if(!trackingNumber){

      alert(
        "❌ Tracking number is required"
      );

      return;

    }

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

            status,

            trackingNumber

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

async function loadMerchantStats(){

  const merchantId =
    localStorage.getItem("userId");

  const status =
    document.getElementById(
      "merchantStatsStatus"
    );

  const container =
    document.getElementById(
      "merchantStats"
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
        "/merchant/stats/" +
        merchantId
      );

    const data =
      await res.json();

    if(!data.success){

      if(status)
        status.innerText =
          data.error ||
          "Unable to load statistics";

      return;

    }

    const s =
      data.statistics || {};

    if(status)
      status.innerText = "";

    if(!container)
      return;

    container.innerHTML = `

      <div class="card">

        <h3>💰 Total Sales</h3>

        <h2>
          ${Number(
            s.totalSales || 0
          ).toFixed(2)}
          USDT
        </h2>

      </div>

      <div class="card">

        <h3>🏦 Platform Fees (2%)</h3>

        <h2>
          ${Number(
            s.totalPlatformFees || 0
          ).toFixed(2)}
          USDT
        </h2>

      </div>


      <div class="card">

        <h3>💵 Merchant Earnings</h3>

        <h2>
          ${Number(
            s.merchantEarnings || 0
          ).toFixed(2)}
          USDT
        </h2>

      </div>

      <div class="card">

        <h3>✅ Completed Sales</h3>

        <h2>
          ${Number(
            s.completedSales || 0
          ).toFixed(2)}
          USDT
        </h2>

      </div>


      <div class="card">

        <h3>🧾 Total Orders</h3>

        <h2>
          ${s.totalOrders || 0}
        </h2>

      </div>


      <div class="card">

        <h3>📦 Products</h3>

        <h2>
          ${s.totalProducts || 0}
        </h2>

      </div>


      <div class="card">

        <h3>⏳ Pending</h3>

        <h2>
          ${s.pendingOrders || 0}
        </h2>

      </div>


      <div class="card">

        <h3>🔵 Confirmed</h3>

        <h2>
          ${s.confirmedOrders || 0}
        </h2>

      </div>


      <div class="card">

        <h3>🔧 Preparing</h3>

        <h2>
          ${s.preparingOrders || 0}
        </h2>

      </div>


      <div class="card">

        <h3>📦 Ready</h3>

        <h2>
          ${s.readyOrders || 0}
        </h2>

      </div>


      <div class="card">

        <h3>🚚 Shipped</h3>

        <h2>
          ${s.shippedOrders || 0}
        </h2>

      </div>


      <div class="card">

        <h3>✅ Completed</h3>

        <h2>
          ${s.completedOrders || 0}
        </h2>

      </div>


      <div class="card">

        <h3>❌ Cancelled</h3>

        <h2>
          ${s.cancelledOrders || 0}
        </h2>

      </div>

    `;

  } catch(err) {

    console.error(
      "MERCHANT STATS ERROR:",
      err
    );

    if(status)
      status.innerText =
        "Unable to load statistics.";

  }

}

function openMerchantDispute(orderId){

  const old =
    document.getElementById(
      "merchantDisputeBox"
    );

  if(old){
    old.remove();
  }

  const orderCard =
    [...document.querySelectorAll(
      "#merchantOrdersList .card"
    )].find(card =>
      card.innerText.includes(orderId)
    );

  if(!orderCard){
    return;
  }

  const text =
    orderCard.innerText;

  const box =
    document.createElement("div");

  box.id =
    "merchantDisputeBox";

  box.className =
    "card";

  box.style.marginTop =
    "15px";

  box.innerHTML = `

    <h2>
      ⚖️ Dispute Resolution
    </h2>

    <p>
      Order:
      <strong>
        ${orderId}
      </strong>
    </p>

    <div style="
      margin-top:12px;
      padding:12px;
      border:1px solid #ef4444;
      border-radius:12px;
    ">

      <strong>
        ⚠️ Customer reported a delivery problem
      </strong>

      <p style="
        margin-top:10px;
      ">
        The payment remains reserved while the dispute is being reviewed.
      </p>

    </div>

    <button
      type="button"
      onclick="
        document.getElementById(
          'merchantDisputeBox'
        )?.remove()
      "
      style="
        width:100%;
        margin-top:15px;
        padding:12px;
        border:0;
        border-radius:10px;
        cursor:pointer;
      "
    >
      ✖ Close
    </button>

  `;

  document
    .getElementById(
      "merchantOrdersList"
    )
    .prepend(box);

}
