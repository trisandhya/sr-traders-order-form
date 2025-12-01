// Load JSON file
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

        // Quantity input
        const input = document.createElement('input');
        input.type = 'number';
        input.name = `${product.title}_${variant.title}`.replace(/\s+/g, '_');
        input.min = 0;
        input.value = 0;
        card.appendChild(input);

        grid.appendChild(card);
      });
    }
  });
}

// Handle form submission
document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const data = {};
  const inputs = document.querySelectorAll("input[type=number]");
  inputs.forEach(input => {
    if (parseInt(input.value) > 0) {
      data[input.name] = input.value;
    }
  });
  console.log("Order JSON:", JSON.stringify(data));
  alert("Order submitted! Check console for JSON output.");
});

loadProducts();
