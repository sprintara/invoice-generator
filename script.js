document.addEventListener("DOMContentLoaded", function () {
  const { jsPDF } = window.jspdf;
  window.jsPDF = jsPDF;
});

// Генериране на уникален номер за фактурата
function generateInvoiceNumber() {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
  const key = `invoiceNumber-${datePart}`;
  let currentNumber = parseInt(localStorage.getItem(key)) || 0;
  currentNumber += 1;
  localStorage.setItem(key, currentNumber);
  return `INV-${datePart}-${String(currentNumber).padStart(3, '0')}`;
}

// Добавяне на нова услуга
function addService() {
  const container = document.getElementById("services-container");
  const first = container.querySelector(".service-item");
  const clone = first.cloneNode(true);
  clone.querySelectorAll("input").forEach((input) => (input.value = ""));
  container.appendChild(clone);
}

// Генериране на PDF
function generatePDF() {
  const clientName = document.getElementById("client-name").value;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');
  const invoiceNumber = generateInvoiceNumber();

  // Вземане на логото
  const logoImg = document.getElementById("logo");
  const canvas = document.createElement("canvas");
  canvas.width = logoImg.naturalWidth;
  canvas.height = logoImg.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(logoImg, 0, 0);
  const imgData = canvas.toDataURL("image/png");

  // Лого и заглавие
  doc.addImage(imgData, "PNG", 20, 10, 40, 20);
  doc.setFont("helvetica");
  doc.setFontSize(16);
  doc.text("INVOICE", 70, 20);
  doc.setFontSize(12);
  doc.text(`Invoice No: ${invoiceNumber}`, 70, 27);
  doc.setFontSize(10);
  doc.text(`Date: ${formattedDate}`, 150, 20);

  // Клиент
  doc.setFontSize(12);
  doc.text(`Client: ${clientName}`, 20, 50);

  // Таблица с услуги
  let startY = 60;
  let total = 0;
  doc.text("Service", 20, startY);
  doc.text("Qty", 90, startY);
  doc.text("Unit £", 110, startY);
  doc.text("Total £", 140, startY);
  doc.line(20, startY + 2, 190, startY + 2);

  const serviceItems = document.querySelectorAll(".service-item");

  serviceItems.forEach((item, index) => {
    const service = item.querySelector(".service").value;
    const qty = parseFloat(item.querySelector(".quantity").value) || 0;
    const unit = parseFloat(item.querySelector(".unit-price").value) || 0;
    const lineTotal = qty * unit;
    total += lineTotal;

    const lineY = startY + 10 + index * 10;
    doc.text(service, 20, lineY);
    doc.text(qty.toString(), 90, lineY);
    doc.text(unit.toFixed(2), 110, lineY);
    doc.text(lineTotal.toFixed(2), 140, lineY);
  });

  // Общо
  const totalY = startY + 10 + serviceItems.length * 10 + 5;
  doc.setFontSize(12);
  doc.text(`Total Amount: £${total.toFixed(2)}`, 20, totalY);

  // Footer информация
  doc.setFontSize(10);
  doc.line(20, 270, 190, 270);
  doc.text("Green Lads", 20, 275);
  doc.text("Website: greenlads.co.uk", 20, 280);
  doc.text("Email: info@greenlands.co.uk", 20, 285);
  doc.text("Phone: +44 7777 180433", 20, 290);
  doc.text("Address: 33 Parkhill Road, DA5 1HA, Bexley, London", 20, 295);

  // Сваляне
  doc.save(`${invoiceNumber}.pdf`);
}
