const quantityOptions = [0, 12, 24, 36, 48];

function getDeviceType() {
  if (navigator.userAgentData) {
    return navigator.userAgentData.mobile ? "Mobile" : "Desktop";
  }
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
}

async function loadShops() {
  const shopSelect = document.getElementById('shopSelect');
  try {
    const response = await fetch('shops.json', { cache: 'no-store' });
    const shops = await response.json();
    shops.forEach(shop => {
      const option = document.createElement('option');
      option.value = shop;
      option.textContent = shop;
      shopSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading shops:", err);
  }
}

async function loadProducts() {
  const grid = document.getElementById('productGrid');
  try {
    const response = await fetch('balaji_products_all.json', { cache: 'no-store' });
    const products = await response.json();
    products.forEach(product => {
      const title = product.title || "Unknown Product";
      const imageSrc = product?.images?.[0]?.src || "";
      const variants = Array.isArray(product.variants) ? product.variants : [];
      variants.forEach(variant => {
        const card = document.createElement('div');
        card.className = 'card';

        // ✅ restore product image
        if (imageSrc) {
          const img = document.createElement('img');
          img.src = imageSrc;
          img.alt = title;
          card.appendChild(img);
        }

        const p = document.createElement('p');
        p.textContent = `${title} - ${variant.title} (₹${variant.price})`;
        card.appendChild(p);

        const select = document.createElement('select');
        select.name = `${title}_${variant.title}`.replace(/\s+/g, '_');
        quantityOptions.forEach(qty => {
          const option = document.createElement('option');
          option.value = qty;
          option.textContent = qty;
          select.appendChild(option);
        });
        card.appendChild(select);

        grid.appendChild(card);
      });
    });
  } catch (err) {
    console.error("Error loading products:", err);
  }
}


function buildOrderData() {
  const shopName = document.getElementById("shopSelect").value;
  const now = new Date();
  const orderDate = now.toISOString().split("T")[0];
  const data = { shopName, orderDate, deviceType: getDeviceType() };

  const selects = document.querySelectorAll("#orderForm select:not(#shopSelect)");
  selects.forEach(select => {
    const val = parseInt(select.value, 10);
    if (val > 0) {
      data[select.name] = val;
    }
  });
  return { data, now };
}

document.querySelector("iframe[name='hidden_iframe']").onload = function() {
  const { data, now } = buildOrderData();

  // CSV download
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
  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  const ss = String(now.getSeconds()).padStart(2,"0");
  const safeTime = `${hh}-${mm}-${ss}`;
  csvLink.download = `${safeShopName}-${safeDate}-${safeTime}.csv`;
  csvLink.click();

  console.log("✅ Order submitted and CSV downloaded");
};

// Initialize
loadShops();
loadProducts();
