// Quantity choices
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

// Handle form submission
document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const data = {};
  const selects = document.querySelectorAll("select");
  selects.forEach(select => {
    if (parseInt(select.value) > 0) {
      data[select.name] = select.value;
    }
  });
  console.log("Order JSON:", JSON.stringify(data));
  alert("Order submitted! Check console for JSON output.");
});

loadProducts();
