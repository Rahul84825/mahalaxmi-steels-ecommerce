const asyncHandler = require("express-async-handler");
const Order        = require("../models/Order");
const { sendEmail } = require("../utils/mailer");
const { checkDeliveryEligibility, MAX_DELIVERY_RADIUS_KM } = require("../utils/delivery");

const logEmailFailure = (context, err, order) => {
  console.error(`[email] ${context} failed`, {
    orderId: order?.orderId,
    customerEmail: order?.customer?.email,
    adminEmail: process.env.ADMIN_EMAIL || null,
    message: err.message,
    name: err.name,
    statusCode: err.statusCode,
    stack: err.stack,
  });
};

// ── Send order confirmation email to customer ─────────────────────────────────
const sendOrderEmail = async (order) => {
  const itemRows = order.items.map((i) =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right">₹${(i.price * i.quantity).toLocaleString("en-IN")}</td>
    </tr>`
  ).join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#1d4ed8;padding:20px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">✅ Order Confirmed!</h1>
        <p style="color:#bfdbfe;margin:4px 0 0">Mahalaxmi Steels & Home Appliance</p>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
        <p style="color:#374151">Hi <strong>${order.customer.name}</strong>,</p>
        <p style="color:#374151">Your order <strong>#${order.orderId}</strong> has been placed successfully!</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#eff6ff">
              <th style="padding:8px;text-align:left;color:#1d4ed8;font-size:13px">Item</th>
              <th style="padding:8px;text-align:center;color:#1d4ed8;font-size:13px">Qty</th>
              <th style="padding:8px;text-align:right;color:#1d4ed8;font-size:13px">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="background:white;border-radius:8px;padding:16px;border:1px solid #e2e8f0">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="color:#6b7280">Subtotal</span>
            <span>₹${order.subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="color:#6b7280">Delivery</span>
            <span style="color:#16a34a">${order.delivery === 0 ? "FREE" : "₹" + order.delivery}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:16px;border-top:1px solid #e2e8f0;padding-top:8px">
            <span>Total</span>
            <span style="color:#1d4ed8">₹${order.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
        <div style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">
          <p style="margin:0;color:#166534;font-size:13px">
            📦 <strong>Deliver to:</strong> ${order.address.line1}${order.address.line2 ? ", " + order.address.line2 : ""},
            ${order.address.city} - ${order.address.pincode}, ${order.address.state}
          </p>
          <p style="margin:4px 0 0;color:#166534;font-size:13px">
            🚚 <strong>Est. Delivery:</strong> 3–5 Business Days
          </p>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center">
          Questions? Call us or visit our store in Pune.<br/>
          Mahalaxmi Steels & Home Appliance
        </p>
      </div>
    </div>
  `;

  await sendEmail(
    order.customer.email,
    `Order Confirmed #${order.orderId} — Mahalaxmi Steels`,
    html
  );
};

// ── Send new-order notification email to admin ────────────────────────────────
const sendAdminNotification = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const itemList = order.items
    .map((i) => `<li>${i.name} × ${i.quantity} — ₹${(i.price * i.quantity).toLocaleString("en-IN")}</li>`)
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#0f172a;padding:20px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">🛒 New Order Received</h1>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
        <p><strong>Order ID:</strong> #${order.orderId}</p>
        <p><strong>Customer:</strong> ${order.customer.name} (${order.customer.email})</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
        <p><strong>Total:</strong> ₹${order.total.toLocaleString("en-IN")}</p>
        <p><strong>Items:</strong></p>
        <ul>${itemList}</ul>
        <p><strong>Shipping:</strong> ${order.address.line1}${order.address.line2 ? ", " + order.address.line2 : ""}, ${order.address.city} - ${order.address.pincode}, ${order.address.state}</p>
      </div>
    </div>
  `;

  await sendEmail(
    adminEmail,
    `🛒 New Order #${order.orderId} — ₹${order.total.toLocaleString("en-IN")}`,
    html
  );
};

// ── Send delivery confirmation email to customer ──────────────────────────────
const sendDeliveryEmail = async (order) => {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#16a34a;padding:20px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">🎉 Order Delivered!</h1>
        <p style="color:#bbf7d0;margin:4px 0 0">Mahalaxmi Steels & Home Appliance</p>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
        <p style="color:#374151">Hi <strong>${order.customer.name}</strong>,</p>
        <p style="color:#374151">
          Great news! Your order <strong>#${order.orderId}</strong> has been successfully delivered.
          We hope you love your purchase!
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;color:#166534;font-size:14px">
            ✅ <strong>Delivered to:</strong> ${order.address.line1}${order.address.line2 ? ", " + order.address.line2 : ""},
            ${order.address.city} - ${order.address.pincode}, ${order.address.state}
          </p>
          <p style="margin:8px 0 0;color:#166534;font-size:14px">
            📦 <strong>Order Total:</strong> ₹${order.total.toLocaleString("en-IN")}
          </p>
          <p style="margin:8px 0 0;color:#166534;font-size:14px">
            💳 <strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}
          </p>
          <p style="margin:8px 0 0;color:#166534;font-size:14px">
            🕐 <strong>Delivered At:</strong> ${new Date(order.deliveredAt).toLocaleString("en-IN")}
          </p>
        </div>
        <p style="color:#374151;font-size:14px">
          If you have any issues with your order, please don't hesitate to contact us.
          We'd love to hear your feedback!
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;text-align:center">
          Thank you for shopping with us!<br/>
          Mahalaxmi Steels & Home Appliance, Pune
        </p>
      </div>
    </div>
  `;

  await sendEmail(
    order.customer.email,
    `✅ Order Delivered #${order.orderId} — Mahalaxmi Steels`,
    html
  );
};

// ── Send delivery notification to admin ───────────────────────────────────────
const sendAdminDeliveryNotification = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#0f172a;padding:20px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">✅ Order Marked as Delivered</h1>
      </div>
      <div style="background:#f8fafc;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
        <p><strong>Order ID:</strong> #${order.orderId}</p>
        <p><strong>Customer:</strong> ${order.customer.name} (${order.customer.email})</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        <p><strong>Total:</strong> ₹${order.total.toLocaleString("en-IN")}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
        <p><strong>Delivered At:</strong> ${new Date(order.deliveredAt).toLocaleString("en-IN")}</p>
        <p><strong>Address:</strong> ${order.address.line1}${order.address.line2 ? ", " + order.address.line2 : ""}, ${order.address.city} - ${order.address.pincode}</p>
      </div>
    </div>
  `;

  await sendEmail(
    adminEmail,
    `✅ Order Delivered #${order.orderId} — ${order.customer.name}`,
    html
  );
};

// ── POST /api/orders ──────────────────────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { customer, address, items, paymentMethod, subtotal, delivery, total, itemCount } = req.body;

  if (!customer || !address || !items?.length || !paymentMethod) {
    res.status(400);
    throw new Error("Missing required order fields");
  }

  // ── Delivery radius safety check ────────────────────────────────
  try {
    const deliveryCheck = await checkDeliveryEligibility(
      address.pincode,
      address.city,
      address.state
    );
    if (!deliveryCheck.eligible && deliveryCheck.reason === "out_of_range") {
      res.status(400);
      throw new Error(
        `Sorry! Your location is approximately ${deliveryCheck.distance} KM from our store. We currently deliver only within ${MAX_DELIVERY_RADIUS_KM} KM of our store in Akurdi, Pune.`
      );
    }
  } catch (err) {
    // If already a controlled error (delivery out of range), re-throw
    if (res.statusCode === 400 && err.message.includes("KM")) throw err;
    // Otherwise geocoding failed — allow the order through
    console.warn("Delivery check skipped (geocoding error):", err.message);
  }

  const order = await Order.create({
    user:          req.user?._id || null,
    customer, address, items,
    paymentMethod,
    paymentStatus: "pending",
    subtotal, delivery, total, itemCount,
    status: "pending",
  });

  sendOrderEmail(order).catch((err) => logEmailFailure("Order confirmation email", err, order));
  sendAdminNotification(order).catch((err) => logEmailFailure("New-order admin notification", err, order));

  res.status(201).json(order);
});

// ── GET /api/orders (admin) ───────────────────────────────────────────────────
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  res.json(order);
});

// ── GET /api/orders/my ────────────────────────────────────────────────────────
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// ── PATCH /api/orders/:id/deliver (admin only) ────────────────────────────────
const markDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.status === "delivered") {
    res.status(400);
    throw new Error("Order is already marked as delivered");
  }

  order.status      = "delivered";
  order.deliveredAt = new Date();

  await order.save();

  sendDeliveryEmail(order).catch((err) => logEmailFailure("Delivery confirmation email", err, order));
  sendAdminDeliveryNotification(order).catch((err) => logEmailFailure("Delivery admin notification", err, order));

  res.json({ message: "Order marked as delivered", order });
});

// ── PATCH /api/orders/:id/mark-paid (admin) ──────────────────────────────────
const markAsPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }

  order.paymentStatus = "paid";
  await order.save();

  res.json({ message: "Order marked as paid", order });
});

// ── PATCH /api/orders/:id/upi-txn (customer submits UPI transaction ID) ──────
const submitUpiTransaction = asyncHandler(async (req, res) => {
  const { upiTransactionId } = req.body;
  if (!upiTransactionId || !upiTransactionId.trim()) {
    res.status(400);
    throw new Error("UPI Transaction ID is required");
  }

  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }

  order.upiTransactionId = upiTransactionId.trim();
  order.paymentStatus    = "paid";
  await order.save();

  res.json({ message: "UPI transaction ID submitted", order });
});

module.exports = { createOrder, getOrders, getOrderById, getMyOrders, markDelivered, markAsPaid, submitUpiTransaction };