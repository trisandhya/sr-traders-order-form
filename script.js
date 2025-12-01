const quantityOptions = [0, 12, 24, 36, 48];

// Utility to mask secrets before logging
function maskSecret(secret) {
  if (!secret) return "";
  return secret.substring(0, 6) + "..." + secret.slice(-4); // show only start+end
}

async function loadShops() {
  const response = await fetch('shops.json');
  const shops = await response.json();
  const shopSelect = document.getElementById('shopSelect');

  shops.forEach(shop => {
    const option = document.createElement('option');
    option.value = shop;
    option.textContent = shop;
    shopSelect.appendChild(option);
  });
}

async function loadProducts() {
  const response = await fetch('balaji_products_all.json');
  const products = await response.json();
  const grid = document.getElementById('productGrid');

  products.forEach(product => {
    if (product.variants) {
      product.variants.forEach(variant => {
        const card = document.createElement('div');
        card.className = 'card';

        const img = document.createElement('img');
        if (product.images && product.images.length > 0) {
          img.src = product.images[0].src;
        }
        card.appendChild(img);

        const title = document.createElement('p');
        title.textContent = `${product.title} - ${variant.title} (₹${variant.price})`;
        card.appendChild(title);

        const select = document.createElement('select');
        select.name = `${product.title}_${variant.title}`.replace(/\s+/g, '_');
        quantityOptions.forEach(qty => {
          const option = document.createElement('option');
          option.value = qty;
          option.textContent = qty;
          select.appendChild(option);
        });
        card.appendChild(select);

        grid.appendChild(card);
      });
    }
  });
}

// Placeholders replaced during build by GitHub Actions
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwtjrhYNhIMvJbkHbMC4V-6t-Q9C73UEBStloj0zj0f5D7ye_W8R4AR9PQeWhOlMF-O/exec";
const DEPLOYMENT_ID = "AKfycbwtjrhYNhIMvJbkHbMC4V-6t-Q9C73UEBStloj0zj0f5D7ye_W8R4AR9PQeWhOlMF-O";

document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const data = {};
  const shopName = document.getElementById("shopSelect").value;
  const orderDate = document.getElementById("orderDate").value;

  if (!shopName || !orderDate) {
    alert("Please select a shop name and date.");
    return;
  }

  data.shopName = shopName;
  data.orderDate = orderDate;

  const selects = document.querySelectorAll("select:not(#shopSelect)");
  selects.forEach(select => {
    if (parseInt(select.value) > 0) {
      data[select.name] = select.value;
    }
  });

  // JSON download
  const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement("a");
  jsonLink.href = jsonUrl;
  jsonLink.download = "order.json";
  jsonLink.click();

  // CSV download
  const rows = [["Shop Name", data.shopName], ["Order Date", data.orderDate], [], ["Product", "Quantity"]];
  for (let key in data) {
    if (key !== "shopName" && key !== "orderDate") {
      rows.push([key, data[key]]);
    }
  }
  const csvBlob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);
  const csvLink = document.createElement("a");
  csvLink.href = csvUrl;
  csvLink.download = "order.csv";
  csvLink.click();

  // Send to Google Sheet via Web App
  fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.text())
  .then(msg => {
    console.log("Sheet update success:", msg);
    console.log("Deployment reference:", maskSecret(DEPLOYMENT_ID)); // masked
  })
  .catch(err => console.error("Error updating sheet:", err));

  alert("Order submitted for " + shopName + " on " + orderDate + "! JSON/CSV downloaded and Sheet updated.");
});

loadShops();
loadProducts();
