// SR-Traders Order Form — script.js

// Fixed quantity choices (pack sizes)
const quantityOptions = [0, 12, 24, 36, 48];

// Utility to mask secrets in logs
function maskSecret(secret) {
  if (!secret) return "";
  return secret.substring(0, 6) + "..." + secret.slice(-4);
}

// Populate shop dropdown from shops.json
async function loadShops() {
  const shopSelect = document.getElementById('shopSelect');
  try {
    const response = await fetch('shops.json', { cache: 'no-store' });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const shops = await response.json();
    if (!Array.isArray(shops) || shops.length === 0) {
      throw new Error("Empty or invalid shops.json");
    }
    shops.forEach(shop => {
      const option = document.createElement('option');
      option.value = shop;
      option.textContent = shop;
      shopSelect.appendChild(option);
    });
    console.log("Loaded shops:", shops.length);
  } catch (err) {
    console.error("Error loading shops:", err);
    shopSelect.innerHTML = "<option value=''>Failed to load shops</option>";
  }
}

// Build product grid from balaji_products_all.json
async function loadProducts() {
  const grid = document.getElementById('productGrid');
  try {
    const response = await fetch('balaji_products_all.json', { cache: 'no-store' });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const products = await response.json();
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("Empty or invalid balaji_products_all.json");
    }

    let renderedCount = 0;

    products.forEach(product => {
      const title = product?.title || "Unknown Product";
      const imageSrc = product?.images?.[0]?.src || "";
      const variants = Array.isArray(product?.variants) ? product.variants : [];

      variants.forEach(variant => {
        const vTitle = variant?.title || "";
        const vPrice = variant?.price ?? "";
        const vSku = variant?.sku || ""; // optional; helps uniqueness

        const card = document.createElement('div');
        card.className = 'card';

        // Product image (optional)
        if (imageSrc) {
          const img = document.createElement('img');
          img.src = imageSrc;
          img.alt = title;
          card.appendChild(img);
        }

        // Product title + variant + price
        const p = document.createElement('p');
        const priceText = vPrice !== "" ? ` (₹${vPrice})` : "";
        p.textContent = `${title} - ${vTitle}${priceText}`;
        card.appendChild(p);

        // Quantity dropdown
        const select = document.createElement('select');
        // Unique key: title_variant_(sku)
        const keyBase = `${title}_${vTitle}${vSku ? `_${vSku}` : ""}`;
        select.name = keyBase.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
        quantityOptions.forEach(qty => {
          const option = document.createElement('option');
          option.value = qty;
          option.textContent = qty;
          select.appendChild(option);
        });
        card.appendChild(select);

        grid.appendChild(card);
        renderedCount++;
      });
    });

    console.log("Rendered product variants:", renderedCount);
    if (renderedCount === 0) {
      grid.innerHTML = "<p style='color:red'>No variants found to render.</p>";
    }
  } catch (err) {
    console.error("Error loading products:", err);
    grid.innerHTML = "<p style='color:red'>Failed to load products. Check JSON file path/format.</p>";
  }
}

// Secrets placeholders (injected by GitHub Actions during build)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwtjrhYNhIMvJbkHbMC4V-6t-Q9C73UEBStloj0zj0f5D7ye_W8R4AR9PQeWhOlMF-O/exec";
const DEPLOYMENT_ID = "AKfycbwtjrhYNhIMvJbkHbMC4V-6t-Q9C73UEBStloj0zj0f5D7ye_W8R4AR9PQeWhOlMF-O";

// Form submit handler
document.getElementById('orderForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const shopName = document.getElementById("shopSelect").value;
  const orderDate = document.getElementById("orderDate").value;

  if (!shopName || !orderDate) {
    alert("Please select a shop name and date.");
    return;
  }

  // Build order data
  const data = { shopName, orderDate };
  const selects = document.querySelectorAll("select:not(#shopSelect)");
  selects.forEach(select => {
    const val = parseInt(select.value, 10);
    if (val > 0) {
      data[select.name] = val;
    }
  });

  // If no items selected, prompt before proceeding
  if (Object.keys(data).filter(k => !["shopName", "orderDate"].includes(k)).length === 0) {
    const proceed = confirm("No quantities selected. Submit anyway?");
    if (!proceed) return;
  }

  // Local JSON download
  try {
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.href = jsonUrl;
    jsonLink.download = "order.json";
    jsonLink.click();
  } catch (err) {
    console.error("JSON download failed:", err);
  }

  // Local CSV download
  try {
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
  } catch (err) {
    console.error("CSV download failed:", err);
  }

  // Post to Google Sheet via Web App (masked logging)
  try {
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });
    const msg = await res.text();
    console.log("Sheet update success:", msg);
    console.log("Deployment reference:", maskSecret(DEPLOYMENT_ID));
    alert(`Order submitted for ${shopName} on ${orderDate}! JSON/CSV downloaded and Sheet updated.`);
  } catch (err) {
    console.error("Error updating sheet:", err);
    alert(`Order submitted for ${shopName} on ${orderDate}! JSON/CSV downloaded. Sheet update failed.`);
  }
});

// Initialize
loadShops();
loadProducts();
