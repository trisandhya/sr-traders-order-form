// Build order data from form fields
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

// Trigger downloads AFTER Apps Script responds
document.querySelector("iframe[name='hidden_iframe']").onload = function() {
  const { data, now } = buildOrderData();

  // JSON download
  const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement("a");
  jsonLink.href = jsonUrl;
  jsonLink.download = "order.json";
  jsonLink.click();

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

  console.log("✅ Order submitted and files downloaded");
};
