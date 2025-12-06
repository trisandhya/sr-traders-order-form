// SR-Traders Order Form — script.js

// Fixed quantity choices (pack sizes)
const quantityOptions = [0, 12, 24, 36, 48];

// Utility to mask secrets in logs
function maskSecret(secret) {
  if (!secret) return "";
  return secret.substring(0, 6) + "..." + secret.slice(-4);
}
// get device type
function getDeviceType() {
  if (navigator.userAgentData) {
    return navigator.userAgentData.mobile ? "Mobile" : "Desktop";
  }
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
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

document.getElementById('orderForm').addEventListener('submit', function(e) {
  // DO NOT call e.preventDefault()
  const shopName = document.getElementById("shopSelect").value;
  const orderDate = document.getElementById("orderDate").value;

  const data = { shopName, orderDate, deviceType: getDeviceType() };
  const selects = document.querySelectorAll("select:not(#shopSelect)");
  selects.forEach(select => {
    const val = parseInt(select.value, 10);
    if (val > 0) {
      data[select.name] = val;
    }

    // Show confirmation toast
    const toast = document.createElement('div');
    toast.textContent = "✅ Order submitted successfully!";
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "#4CAF50";
    toast.style.color = "white";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "6px";
    toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    toast.style.zIndex = "9999";
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
    document.getElementById('orderForm').reset();
  });

  // Local JSON download
  const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement("a");
  jsonLink.href = jsonUrl;
  jsonLink.download = "order.json";
  jsonLink.click();

  // Local CSV download
  const rows = [["Shop Name", data.shopName], ["Order Date", data.orderDate], ["Device Type", data.deviceType], [], ["Product", "Quantity"]];
  for (let key in data) {
    if (!["shopName", "orderDate", "deviceType"].includes(key)) {
      rows.push([key, data[key]]);
    }
  }
  const csvBlob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);
  const csvLink = document.createElement("a");
  csvLink.href = csvUrl;
  const safeShopName = data.shopName.replace(/\s+/g,"_");
  const safeDate = data.orderDate.replace(/[^0-9\-]/g,"");
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  const ss = String(now.getSeconds()).padStart(2,"0");
  const safeTime = `${hh}-${mm}-${ss}`;
  csvLink.download = `${safeShopName}-${safeDate}-${safeTime}.csv`;
  csvLink.click();
});

// Initialize
loadShops();
loadProducts();
