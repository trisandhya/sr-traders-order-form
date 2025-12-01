// Fixed quantity choices
const quantityOptions = [0, 12, 24, 36, 48];

async function loadProducts() {
  const response = await fetch('balaji_products_all.json');
  const products = await response.json();
  const grid = document.getElementById('productGrid');

  products.forEach(product => {
    if (product.variants) {
      product.variants.forEach(variant => {
        const card = document.createElement('div');
        card.className = 'card';

        // Product image
        const img = document.createElement('img');
        if (product.images && product.images.length > 0) {
          img.src = product.images[0].src;
        }
        card.appendChild(img);

        // Product name + variant
        const title = document.createElement('p');
        title.textContent = `${product.title} - ${variant.title} (₹${variant.price})`;
        card.appendChild(title);

        // Quantity dropdown
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

// Convert order data to CSV
function convertToCSV(obj) {
  const rows = [["Shop Name", obj.shopName], ["Order Date", obj.orderDate], [], ["Product", "Quantity"]];
  for (let key in obj) {
    if (key !== "shopName" && key !== "orderDate") {
      rows.push([key, obj[key]]);
    }
  }
  return rows.map(r => r.join(",")).join("\n");
}

// Handle form submission
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
  const csvBlob = new Blob([convertToCSV(data)], { type: "text/csv" });
  const csvUrl = URL.createObjectURL(csvBlob);
  const csvLink = document.createElement("a");
  csvLink.href = csvUrl;
  csvLink.download = "order.csv";
  csvLink.click();

  alert("Order submitted for " + shopName + " on " + orderDate + "! JSON and CSV downloaded.");
});

loadProducts();
