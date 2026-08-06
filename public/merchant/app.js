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
accept="image/*">

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
<h2>🧾 Orders</h2>

<p>Your customer orders will appear here.</p>
`;

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

// رابط الصورة النهائي
let imageUrl =
document.getElementById("product_image").value;

// إذا اختار صورة من الهاتف
const file =
document.getElementById("product_file").files[0];

if(file){

const formData = new FormData();

formData.append("image", file);

const uploadRes = await fetch(

"/merchant/upload-image",

{

method:"POST",

body:formData

}

);

const uploadData =
await uploadRes.json();

if(uploadData.success){

imageUrl = uploadData.url;

}else{

alert("Image upload failed");

return;

}

}

const body={

merchantId,

merchantName,

name:
document.getElementById("product_name").value,

price:
Number(document.getElementById("product_price").value),

category:
document.getElementById("product_category").value,

image:imageUrl,

description:
document.getElementById("product_description").value

};

const res = await fetch(

"/merchant/add-product",

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(body)

}

);

const data = await res.json();

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

<div class="card">

<h3>${p.name}</h3>

<p>${p.category}</p>

<p>${p.price} USDT</p>

</div>

`;

});

document.getElementById("productsList").innerHTML=html;

}
