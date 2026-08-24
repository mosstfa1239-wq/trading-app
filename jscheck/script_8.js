

async function loadNotifications(){

try{

  const userId =
  localStorage.getItem("userId");


  const res =
  await fetch(
    "/notifications?userId=" + userId
  );


  const data =
  await res.json();


  let html = "";


  data.forEach(n=>{

    html += `
      <div class="card">
        ${n.text}
      </div>
    `;

  });


  const box =
  document.getElementById("notifications");


  if(box){

    box.innerHTML = html;

  }


}catch(err){

 console.error("loadNotifications error:",err);

}

}





async function loadAnnouncements(){

try{


  const res =
  await fetch("/announcements");


  const data =
  await res.json();


  let html = "";


  data.forEach(a=>{

    html += `

      <div class="card">
        ${a.text}
      </div>

    `;

  });


  const box =
  document.getElementById("announcements");


  if(box){

    box.innerHTML = html;

  }


}catch(err){

 console.error("loadAnnouncements error:",err);

}

}







// فحص حالة الحساب

async function checkBlocked(){

try{


  const userId =
  localStorage.getItem("userId");


  if(!userId) return;



  const res =
  await fetch(
    "/user/status?userId=" + userId
  );


  if(!res.ok){

    console.log(
      "Status check failed:",
      res.status
    );

    return;

  }


  const data =
  await res.json();



  if(data.blocked){


    alert(
      "🚫 Your account has been blocked"
    );


    localStorage.removeItem(
      "userId"
    );


    location.reload();

  }


}catch(err){


 console.error(
  "checkBlocked error:",
  err
 );


}

}

async function openMarket(type){

  const marketContent =
    document.getElementById("marketContent");

  if(!marketContent) return;


  // =========================
  // PRODUCTS
  // =========================

  if(type === "products"){

    marketContent.innerHTML = `
      <div class="card">
        <h2>📦 Products</h2>
        <p>Loading products...</p>
      </div>
    `;

    try{

      const res =
        await fetch("/market/products");

      const products =
        await res.json();

const ratingsRes =
  await fetch("/products/ratings");

const ratingsData =
  await ratingsRes.json();

const ratingsMap = {};

if(
  ratingsData.success &&
  Array.isArray(ratingsData.ratings)
){

  ratingsData.ratings.forEach(r => {

    ratingsMap[r._id] = {
      average:
        Number(
          r.averageRating || 0
        ).toFixed(1),

      count:
        Number(
          r.ratingCount || 0
        )
    };

  });

}

      if(!products.length){

        marketContent.innerHTML = `
          <div class="card">
            <h2>📦 Products</h2>
            <p>No products available.</p>
          </div>
        `;

        return;
      }

      let html = `
        <div class="card">
          <h2>📦 Products</h2>
        </div>
      `;


      products.forEach(product => {

const rating =
  ratingsMap[product._id];

const ratingHTML =
  rating
  ?
  `
    ⭐ ${rating.average}
    ${"★".repeat(
      Math.round(
        Number(rating.average)
      )
    )}
    <span style="opacity:.6;">
      (${rating.count})
    </span>
  `
  :
  `
    ⭐ No ratings yet
  `;

        html += `

          <div
            class="card marketplace-product"
            onclick="openProductDetails('${product._id}')"
            style="cursor:pointer;"
          >

            ${
              product.image
              ?
              `
              <img
                src="${product.image}"
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
              ${product.name}
            </h3>

            <p>
              ${product.category || "General"}
            </p>

            <h3>
              ${Number(product.price || 0).toFixed(2)}
              USDT
            </h3>

<p>
  ${ratingHTML}
</p>

            <p style="opacity:.7;">
              👤 ${product.merchantName || "Merchant"}
            </p>

          </div>

        `;

      });

      marketContent.innerHTML =
        html;

    }catch(err){

      console.error(
        "MARKET PRODUCTS ERROR:",
        err
      );

      marketContent.innerHTML = `
        <div class="card">
          <h2>📦 Products</h2>
          <p>Unable to load products.</p>
        </div>
      `;

    }

    return;
  }


  // =========================
  // MY ORDERS
  // =========================

if(type === "orders"){

  console.log("ORDERS PAGE: START");

  marketContent.innerHTML = `

    <div class="card">

      <h2>🧾 My Orders</h2>

      <p id="ordersStatus">
        Loading orders...
      </p>

    </div>

    <div id="myOrdersList"></div>

  `;

  console.log("ORDERS PAGE: HTML DONE");

  console.log(
    "ORDERS PAGE: loadMyOrders =",
    typeof loadMyOrders
  );

  await loadMyOrders();

  console.log("ORDERS PAGE: LOAD DONE");

  return;
}

// =========================
// MY PURCHASES
// =========================

if(type === "purchases"){

  marketContent.innerHTML = `

    <div class="card">

      <h2>🛍️ My Purchases</h2>

      <p id="purchasesStatus">
        Loading purchases...
      </p>

    </div>

    <div id="myPurchasesList"></div>

  `;

  await loadMyPurchases();

  return;
}


  // =========================
  // FAVORITES
  // =========================

  if(type === "favorites"){

    marketContent.innerHTML = `

      <div class="card">

        <h2>❤️ Favorites</h2>

        <p>
          No favorites yet.
        </p>

      </div>

    `;

    return;
  }


  // =========================
  // SERVICES
  // =========================

  if(type === "services"){

    marketContent.innerHTML = `

      <div class="card">

        <h2>💼 Services</h2>

        <p>
          Services will appear here.
        </p>

      </div>

    `;

    return;
  }


  // =========================
  // ADVERTISEMENTS
  // =========================

  if(type === "ads"){

    marketContent.innerHTML = `

      <div class="card">

        <h2>📢 Advertisements</h2>

        <p>
          Advertisements will appear here.
        </p>

      </div>

    `;

    return;
  }


  // =========================
  // OFFERS
  // =========================

  if(type === "offers"){

    marketContent.innerHTML = `

      <div class="card">

        <h2>🎁 Offers</h2>

        <p>
          Special offers will appear here.
        </p>

      </div>

    `;

    return;
  }

}

