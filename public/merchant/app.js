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
<h2>📦 Products</h2>

<p>Your products will appear here.</p>
`;

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
