// script.js

// Load shops and products from JSON files and build the form dynamically
Promise.all([
  fetch("shops.json").then(r => r.json()),
  fetch("products.json").then(r => r.json())
]).then(([shops, products]) => {
  const shopSelect = document.getElementById("shopSelect");
  const productGrid = document.getElementById("productGrid");

  // Populate shop dropdown
  shops.forEach(shop => {
    const opt = document.createElement("option");
    opt.value = shop.name;
    opt.textContent = shop.name;
    shopSelect.appendChild(opt);
  });

  // Populate product list
  products.forEach(p => {
    const label = document.createElement("label");
    label.style.display = "block";
    label.style.marginTop = "8px";
    label.textContent = `${p.displayName} (${p.packSize})`;

    const input = document.createElement("input");
    input.type = "number";
    input.name = p.key;   // must match sheet product key
    input.min = "0";

    label.appendChild(document.createElement("br"));
    label.appendChild(input);
    productGrid.appendChild(label);
  });
});

// No hidden_iframe logic here — submission handled in index.html via fetch
