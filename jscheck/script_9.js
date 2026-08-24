

async function openProductDetails(productId){

  try {

    const res =
      await fetch("/market/products");

    const products =
      await res.json();

    const product =
      products.find(
        p => p._id === productId
      );

    if(!product){

      alert("Product not found");

      return;

    }

    window.selectedProduct =
      product;

let ratingHTML = `
  ⭐ No ratings yet
`;

try {

  const ratingRes =
    await fetch(
      "/products/" +
      product._id +
      "/rating"
    );

  const ratingData =
    await ratingRes.json();

  if(
    ratingData.success &&
    Number(ratingData.ratingCount || 0) > 0
  ){

    const average =
      Number(
        ratingData.averageRating || 0
      ).toFixed(1);

    const count =
      Number(
        ratingData.ratingCount || 0
      );

    const rounded =
      Math.round(
        Number(
          ratingData.averageRating || 0
        )
      );

    ratingHTML = `
      ⭐ ${average} / 5
      ${"★".repeat(rounded)}
      ${"☆".repeat(5 - rounded)}
      <span style="opacity:.7;">
        (${count} ratings)
      </span>
    `;

  }

}catch(err){

  console.error(
    "PRODUCT RATING ERROR:",
    err
  );

}

    document.getElementById(
      "productDetailsContent"
    ).innerHTML = `

      ${
        product.image
        ?
        `<img
        src="${product.image}"
        style="
        width:100%;
        max-height:260px;
        object-fit:cover;
        border-radius:15px;
        ">`
        :
        ""
      }

      <h2>
        ${product.name}
      </h2>

      <p>
        ${product.description || ""}
      </p>

      <p>
        Category:
        ${product.category || "General"}
      </p>

      <h3>
        ${product.price} USDT
      </h3>

      <p>
       ${ratingHTML}
      </p>

      <hr>

      <h3>
        Quantity
      </h3>

      <div
      style="
      display:flex;
      align-items:center;
      justify-content:center;
      gap:20px;
      "
      >

        <button
        onclick="changeProductQuantity(-1)"
        >
        −
        </button>

        <strong
        id="productQuantity"
        >
        1
        </strong>

        <button
        onclick="changeProductQuantity(1)"
        >
        +
        </button>

      </div>

      <br>


<h3>
  📦 Receiving Method
</h3>

<select
  id="shippingType"
  onchange="updateShippingUI(); updateCheckoutPreview();"
  style="
    width:100%;
    padding:12px;
  "
>

  <option value="pickup">
    📍 Pickup from merchant
  </option>

  ${
    product.shippingAvailable
    ?
    `
    <option value="delivery">
      🚚 Delivery
    </option>
    `
    :
    ""
  }

</select>

<div
  id="shippingAddressBox"
  style="
    display:none;
    margin-top:10px;
  "
>

  <button
    type="button"
    onclick="getCustomerLocation()"
    style="
      width:100%;
      padding:12px;
      border:0;
      border-radius:10px;
    "
  >
    📍 Use My Current Location
  </button>

  <p
    id="customerLocationStatus"
    style="
      opacity:.7;
      font-size:13px;
      margin-top:8px;
    "
  >
    Location not selected.
  </p>

  <input
    type="hidden"
    id="shippingAddress"
    value=""
  >

</div>

      <div
      id="checkoutPreview"
      style="
      margin-top:20px;
      "
      >
      </div>

      <button
      onclick="buyProduct()"
      style="
      width:100%;
      margin-top:15px;
      padding:14px;
      background:#16a34a;
      color:white;
      border:0;
      border-radius:12px;
      font-size:16px;
      "
      >

      🛒 Buy Now

      </button>

    `;

    document.getElementById(
      "productDetailsModal"
    ).style.display = "block";

    updateCheckoutPreview();

  } catch(err) {

    console.error(
      "PRODUCT DETAILS ERROR:",
      err
    );

  }

}

function updateShippingUI(){

  const type =
    document.getElementById(
      "shippingType"
    )?.value;

  const box =
    document.getElementById(
      "shippingAddressBox"
    );

  if(!box) return;

  box.style.display =
    type === "delivery"
      ? "block"
      : "none";

}
let customerLocation = {
  lat: null,
  lng: null
};

function getCustomerLocation(){

  const status =
    document.getElementById(
      "customerLocationStatus"
    );

  const address =
    document.getElementById(
      "shippingAddress"
    );

  if(!navigator.geolocation){

    if(status)
      status.innerText =
        "❌ GPS is not supported.";

    return;
  }

  if(status)
    status.innerText =
      "📍 Getting your location...";

  navigator.geolocation.getCurrentPosition(

    position => {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;

customerLocation = {
  lat: lat,
  lng: lng
};

      if(status){

        status.innerText =
          "✅ Location selected";

      }

      console.log(
        "CUSTOMER LOCATION:",
        lat,
        lng
      );

    },

    error => {

      console.error(
        "CUSTOMER GPS ERROR:",
        error
      );

      if(status)
        status.innerText =
          "❌ Unable to get your location.";

    },

    {
      enableHighAccuracy:true,
      timeout:15000,
      maximumAge:0
    }

  );

}



function changeProductQuantity(amount){

  const quantityElement =
    document.getElementById(
      "productQuantity"
    );

  if(!quantityElement)
    return;

  let quantity =
    Number(
      quantityElement.innerText
    );

  quantity += amount;

  if(quantity < 1)
    quantity = 1;

  quantityElement.innerText =
    quantity;

  updateCheckoutPreview();

}

function updateCheckoutPreview(){

  const product =
    window.selectedProduct;

  if(!product)
    return;

  const quantity =
    Number(
      document.getElementById(
        "productQuantity"
      )?.innerText || 1
    );

  const shippingType =
    document.getElementById(
      "shippingType"
    )?.value || "pickup";

  const productsTotal =
    product.price * quantity;

  const shipping =
    shippingType === "delivery"
      ? 3
      : 0;

  const fee =
    Number(
      (
        productsTotal * 0.02
      ).toFixed(2)
    );

  const total =
    Number(
      (
        productsTotal +
        shipping +
        fee
      ).toFixed(2)
    );

  const addressBox =
    document.getElementById(
      "shippingAddressBox"
    );

  if(addressBox){

    addressBox.style.display =
      shippingType === "delivery"
        ? "block"
        : "none";

  }

  const preview =
    document.getElementById(
      "checkoutPreview"
    );

  if(!preview)
    return;

  preview.innerHTML = `

    <div class="card">

      <h3>
        🧾 Order Summary
      </h3>

      <p>
        Unit price:
        ${product.price.toFixed(2)}
        USDT
      </p>

      <p>
        Quantity:
        ${quantity}
      </p>

      <p>
        Products:
        ${productsTotal.toFixed(2)}
        USDT
      </p>

      <p>
        Shipping:
        ${shipping.toFixed(2)}
        USDT
      </p>

      <p>
        Platform fee:
        ${fee.toFixed(2)}
        USDT
      </p>

      <hr>

      <h2>
        Total:
        ${total.toFixed(2)}
        USDT
      </h2>

    </div>

  `;

}

async function buyProduct(){

  const product =
    window.selectedProduct;

  if(!product){

    alert(
      "Product not selected"
    );

    return;

  }

  const customerId =
    localStorage.getItem(
      "userId"
    );

  if(!customerId){

    alert(
      "Please login first"
    );

    return;

  }

  const quantity =
    Number(
      document.getElementById(
        "productQuantity"
      ).innerText
    );

  const shippingType =
    document.getElementById(
      "shippingType"
    ).value;

let shippingAddress = "";

if(shippingType === "delivery"){

  const confirmed =
    confirm(
      "📍 سيتم استخدام موقعك الحالي كموقع استلام الطلب.\n\nهل تريد تحديد موقعك؟"
    );

  if(!confirmed)
    return;

  try {

    const position =
      await new Promise((resolve, reject) => {

        if(!navigator.geolocation){

          reject(
            new Error(
              "Geolocation is not supported"
            )
          );

          return;

        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );

      });

    const lat =
      position.coords.latitude;

    const lng =
      position.coords.longitude;

    shippingAddress =
      JSON.stringify({
        lat,
        lng
      });

  } catch(err) {

    alert(
      "❌ لم نتمكن من تحديد موقعك.\n" +
      "يرجى السماح للموقع من الهاتف والمحاولة مرة أخرى."
    );

    console.error(
      "GPS ERROR:",
      err
    );

    return;

  }

}

const ok =
  confirm(
    "Confirm this purchase?"
  );

if(!ok)
  return;

try {

  const res =
    await fetch(
      "/orders/create",
      {

        method:"POST",

        headers:{
          "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

          customerId,

          productId:
            product._id,

          quantity,

          shippingType,

          shippingAddress,
          
          customerLocation

        })

      }
    );

    const data =
      await res.json();

    console.log(
      "ORDER RESPONSE:",
      data
    );

    if(data.success){

      alert(
        "✅ Order created successfully\n\n" +
        "Order ID: " +
        data.order.orderId
      );

      closeProductDetails();

      /*
        Later we will call loadOrders()
        here to refresh customer orders.
      */

    }else{

      alert(
        "❌ " +
        (
          data.error ||
          "Order failed"
        )
      );

    }

  }catch(err){

    console.error(
      "BUY PRODUCT ERROR:",
      err
    );

    alert(
      "❌ Purchase error: " +
      err.message
    );

  }

}

function closeProductDetails(){

  const modal =
    document.getElementById(
      "productDetailsModal"
    );

  if(modal){

    modal.style.display =
      "none";

  }

  window.selectedProduct =
    null;

  }

async function loadMyOrders(){

  const customerId =
    localStorage.getItem("userId");

  const list =
    document.getElementById("myOrdersList");

  const status =
    document.getElementById("ordersStatus");

  if(!customerId){

    if(status)
      status.innerText =
        "Please login first";

    return;
  }

  if(list)
    list.innerHTML = "";

  if(status)
    status.innerText =
      "Loading orders...";

  try {

    const res =
      await fetch(
        "/orders/customer/" +
        customerId
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
          "No orders yet.";

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

      let ratingHTML = "";


      // =========================
      // RATING SECTION
      // =========================

      if(order.orderStatus === "completed"){

        if(Number(order.rating || 0) > 0){

          ratingHTML = `

            <div style="
              margin-top:15px;
              padding-top:10px;
              border-top:1px solid #333;
            ">

              <strong>
                ⭐ Your Rating
              </strong>

              <p style="
                font-size:22px;
                letter-spacing:3px;
              ">
                ${
                  "★".repeat(
                    Number(order.rating)
                  )
                }${
                  "☆".repeat(
                    5 - Number(order.rating)
                  )
                }
              </p>

              ${
                order.review
                ?
                `
                <p>
                  💬 ${order.review}
                </p>
                `
                :
                ""
              }

            </div>

          `;

        }else{

          ratingHTML = `

            <div style="
              margin-top:15px;
              padding-top:10px;
              border-top:1px solid #333;
            ">

              <button
                onclick="
                  openRatingBox(
                    '${order.orderId}'
                  )
                "
              >
                ⭐ Rate Product
              </button>

              <div
                id="
                  ratingBox_${order.orderId}
                "
                style="
                  display:none;
                  margin-top:10px;
                "
              >

                <p>
                  How would you rate this product?
                </p>

<div
  style="
    display:flex;
    gap:5px;
    font-size:28px;
    margin:10px 0;
  "
>

  <button
    type="button"
    class="rating-star"
    data-rating="1"
    onclick="
      selectRating(
        '${order.orderId}',
        1
      )
    "
  >☆</button>

  <button
    type="button"
    class="rating-star"
    data-rating="2"
    onclick="
      selectRating(
        '${order.orderId}',
        2
      )
    "
  >☆</button>

  <button
    type="button"
    class="rating-star"
    data-rating="3"
    onclick="
      selectRating(
        '${order.orderId}',
        3
      )
    "
  >☆</button>

  <button
    type="button"
    class="rating-star"
    data-rating="4"
    onclick="
      selectRating(
        '${order.orderId}',
        4
      )
    "
  >☆</button>

  <button
    type="button"
    class="rating-star"
    data-rating="5"
    onclick="
      selectRating(
        '${order.orderId}',
        5
      )
    "
  >☆</button>

</div>

                <input
                  id="
                    review_${order.orderId}
                  "
                  placeholder="
                    Write a review (optional)
                  "
                  style="
                    width:100%;
                    margin-top:10px;
                  "
                >

                <button
                  onclick="
                    submitRating(
                      '${order.orderId}'
                    )
                  "
                  style="
                    margin-top:10px;
                  "
                >
                  ⭐ Submit Rating
                </button>

                <p
                  id="
                    ratingStatus_${order.orderId}
                  "
                ></p>

              </div>

            </div>

          `;

        }

      }


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
            Quantity:
            ${order.quantity}
          </p>

          <p>
            Unit Price:
            ${Number(
              order.unitPrice || 0
            ).toFixed(2)}
            USDT
          </p>

          <p>
            Products:
            ${Number(
              order.productsTotal || 0
            ).toFixed(2)}
            USDT
          </p>

          <p>
            Shipping:
            ${Number(
              order.shippingCost || 0
            ).toFixed(2)}
            USDT
          </p>

          <p>
            Platform Fee:
            ${Number(
              order.platformFee || 0
            ).toFixed(2)}
            USDT
          </p>

          <hr>

          <h3>
            Total:
            ${Number(
              order.total || 0
            ).toFixed(2)}
            USDT
          </h3>

          <p>
            Payment:
            ${order.paymentStatus}
          </p>

          <p>
            Status:
            ${order.orderStatus}
          </p>

          <p>
            ${
              order.shippingType ===
              "delivery"
              ?
              "🚚 Delivery"
              :
              "📍 Pickup"
            }
          </p>

          ${
            order.shippingType ===
            "delivery"
            ?
            `
            <p>
              📍 ${order.shippingAddress}
            </p>
            `
            :
            ""
          }

          <p style="
            opacity:.6;
            font-size:13px;
          ">
            ${date}
          </p>

          ${ratingHTML}

        </div>

      `;

    });

    list.innerHTML =
      html;

  } catch(err) {

    console.error(
      "MY ORDERS ERROR:",
      err
    );

    if(status)
      status.innerText =
        "Unable to load orders.";

  }

}

async function loadMyPurchases(){

  const customerId =
    localStorage.getItem("userId");

  const list =
    document.getElementById(
      "myPurchasesList"
    );

  const status =
    document.getElementById(
      "purchasesStatus"
    );

  if(!customerId){

    if(status)
      status.innerText =
        "Please login first";

    return;
  }


  if(list)
    list.innerHTML = "";

  if(status)
    status.innerText =
      "Loading purchases...";


  try{

    const res =
      await fetch(
        "/orders/customer/" +
        customerId
      );


    const data =
      await res.json();


    if(!data.success){

      if(status)
        status.innerText =
          data.error ||
          "Unable to load purchases";

      return;
    }


    const orders =
      data.orders || [];


    const purchases =
      orders.filter(
        order =>
          order.orderStatus ===
          "completed"
      );


    if(!purchases.length){

      if(status)
        status.innerText =
          "No purchases yet.";

      return;
    }


    if(status)
      status.innerText = "";


    let html = "";


    purchases.forEach(order => {

      const date =
        order.createdAt
        ?
        new Date(
          order.createdAt
        ).toLocaleString()
        :
        "";


      html += `

        <div
          class="card"
          style="
            margin-bottom:15px;
            cursor:pointer;
          "
          onclick="
            openProductDetails(
              '${order.productId}'
            )
          "
        >


          ${
            order.productImage
            ?
            `
            <img
              src="${order.productImage}"
              alt="${order.productName}"
              style="
                width:100%;
                height:180px;
                object-fit:cover;
                border-radius:14px;
                margin-bottom:12px;
              "
            >
            `
            :
            ""
          }


          <h3>
            📦 ${order.productName}
          </h3>


          <p>
            Quantity:
            ${order.quantity}
          </p>


          <p>
            Unit Price:
            ${Number(
              order.unitPrice || 0
            ).toFixed(2)}
            USDT
          </p>


          <p>
            Total:
            ${Number(
              order.total || 0
            ).toFixed(2)}
            USDT
          </p>


          <p>
            Status:
            ✅ ${order.orderStatus}
          </p>


          <p>
            Payment:
            ${order.paymentStatus}
          </p>


          ${
            order.rating > 0
            ?
            `
            <p>
              ⭐ Rating:
              ${"★".repeat(
                Number(order.rating)
              )}
              ${"☆".repeat(
                5 - Number(order.rating)
              )}
            </p>
            `
            :
            `
            <button
              onclick="
                event.stopPropagation();
                openRatingBox('${order.orderId}');
              "
            >
              ⭐ Rate Product
            </button>
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


        </div>

      `;

    });


    list.innerHTML =
      html;


  }catch(err){

    console.error(
      "MY PURCHASES ERROR:",
      err
    );


    if(status)
      status.innerText =
        "Unable to load purchases.";

  }

}

function openRatingBox(orderId){

  const box =
    document.getElementById(
      "ratingBox_" + orderId
    );

  if(!box) return;

  box.style.display =
    box.style.display === "none"
    ? "block"
    : "none";

}

function selectRating(orderId, rating){

  window.selectedRatings =
    window.selectedRatings || {};

  window.selectedRatings[orderId] =
    Number(rating);

  const box =
    document.getElementById(
      "ratingBox_" + orderId
    );

  if(!box) return;

  const buttons =
    box.querySelectorAll(
      ".rating-star"
    );

  buttons.forEach(button => {

    const value =
      Number(
        button.dataset.rating
      );

    button.innerText =
      value <= rating
        ? "★"
        : "☆";

  });

}

async function submitRating(
  orderId
){

  const customerId =
    localStorage.getItem("userId");

  const rating =
    window.selectedRatings
    ?
    window.selectedRatings[
      orderId
    ]
    :
    0;


  const reviewInput =
    document.getElementById(
      "review_" + orderId
    );


  const review =
    reviewInput
    ?
    reviewInput.value.trim()
    :
    "";


  const status =
    document.getElementById(
      "ratingStatus_" + orderId
    );


  if(!customerId){

    if(status)
      status.innerText =
        "Please login first";

    return;

  }


  if(!rating){

    if(status)
      status.innerText =
        "Please select a rating";

    return;

  }


  if(status)
    status.innerText =
      "Submitting rating...";


  try {

    const res =
      await fetch(
        "/orders/rating",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            orderId,

            customerId,

            rating,

            review

          })

        }
      );


    const data =
      await res.json();


    console.log(
      "RATING RESPONSE:",
      data
    );


    if(data.success){

      if(status)
        status.innerText =
          "✅ Rating submitted";


      if(window.selectedRatings)
        delete window.selectedRatings[
          orderId
        ];


      setTimeout(
        () => {
          loadMyOrders();
        },
        500
      );


    }else{

      if(status)
        status.innerText =
          "❌ " +
          (
            data.error ||
            "Unable to submit rating"
          );

    }


  } catch(err) {

    console.error(
      "RATING ERROR:",
      err
    );


    if(status)
      status.innerText =
        "❌ " +
        err.message;

  }

}



