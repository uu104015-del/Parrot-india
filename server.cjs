var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
var DATA_FILE_PATH = import_path.default.join(process.cwd(), "data.json");
app.use(import_express.default.json());
app.use(import_express.default.urlencoded({ extended: true }));
app.use("/src/assets", import_express.default.static(import_path.default.join(process.cwd(), "src/assets")));
function readData() {
  try {
    if (!import_fs.default.existsSync(DATA_FILE_PATH)) {
      const initialData = { parrots: [], enquiries: [] };
      import_fs.default.writeFileSync(DATA_FILE_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const rawData = import_fs.default.readFileSync(DATA_FILE_PATH, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading database file:", error);
    return { parrots: [], enquiries: [] };
  }
}
function writeData(data) {
  try {
    import_fs.default.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing database file:", error);
    return false;
  }
}
var ADMIN_TOKEN = "secret-parrot-token-123";
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token === ADMIN_TOKEN) {
      return next();
    }
  }
  return res.status(401).json({ error: "Unauthorized: Invalid or missing administrator token." });
}
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "Qasib86990" && password === "Qasib@8699026488") {
    return res.json({
      success: true,
      token: ADMIN_TOKEN,
      message: "Login successful"
    });
  }
  return res.status(401).json({ success: false, error: "Incorrect username or password." });
});
app.get("/api/admin/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token === ADMIN_TOKEN) {
      return res.json({ valid: true });
    }
  }
  return res.json({ valid: false });
});
app.get("/api/parrots", (req, res) => {
  const data = readData();
  res.json(data.parrots || []);
});
app.post("/api/parrots", authenticateAdmin, (req, res) => {
  const data = readData();
  const newParrot = req.body;
  newParrot.id = `parrot-${Date.now()}`;
  newParrot.available = newParrot.available === void 0 ? true : newParrot.available;
  newParrot.price = Number(newParrot.price) || 0;
  data.parrots.push(newParrot);
  if (writeData(data)) {
    res.status(201).json({ success: true, parrot: newParrot });
  } else {
    res.status(500).json({ error: "Failed to write to database" });
  }
});
app.put("/api/parrots/:id", authenticateAdmin, (req, res) => {
  const data = readData();
  const { id } = req.params;
  const updatedInfo = req.body;
  const index = data.parrots.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Parrot not found." });
  }
  const oldParrot = data.parrots[index];
  const mergedParrot = {
    ...oldParrot,
    ...updatedInfo,
    id,
    // clamp id
    price: Number(updatedInfo.price) || oldParrot.price
  };
  data.parrots[index] = mergedParrot;
  if (writeData(data)) {
    res.json({ success: true, parrot: mergedParrot });
  } else {
    res.status(500).json({ error: "Failed to write to database." });
  }
});
app.delete("/api/parrots/:id", authenticateAdmin, (req, res) => {
  const data = readData();
  const { id } = req.params;
  const index = data.parrots.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Parrot not found." });
  }
  data.parrots.splice(index, 1);
  if (writeData(data)) {
    res.json({ success: true, message: "Parrot successfully removed from catalog." });
  } else {
    res.status(500).json({ error: "Failed to write to database." });
  }
});
app.post("/api/enquiries", (req, res) => {
  const data = readData();
  const { name, phone, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and Phone Number are required." });
  }
  const newEnquiry = {
    id: `enquiry-${Date.now()}`,
    name,
    phone,
    message: message || "",
    date: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (!data.enquiries) {
    data.enquiries = [];
  }
  data.enquiries.push(newEnquiry);
  if (writeData(data)) {
    res.status(201).json({ success: true, enquiry: newEnquiry });
  } else {
    res.status(500).json({ error: "Failed to record enquiry." });
  }
});
app.get("/api/enquiries", authenticateAdmin, (req, res) => {
  const data = readData();
  res.json(data.enquiries || []);
});
app.post("/api/orders", (req, res) => {
  const data = readData();
  const {
    trackingId,
    trackingCode,
    firstName,
    lastName,
    email,
    address,
    phone,
    pincode,
    landmark,
    notes,
    items,
    totalAmount,
    paymentMethod,
    date,
    utrNumber,
    promoCode,
    discountAmount
  } = req.body;
  if (!firstName || !phone || !address) {
    return res.status(400).json({ error: "First Name, Phone Number, and Address are required." });
  }
  const newOrder = {
    id: trackingId || `PI-ORD-${Math.floor(1e5 + Math.random() * 9e5)}`,
    trackingCode: trackingCode || `PI-ORD-${Math.floor(1e5 + Math.random() * 9e5)}`,
    firstName,
    lastName: lastName || "",
    email: email || "",
    address,
    phone,
    pincode: pincode || "",
    landmark: landmark || "",
    notes: notes || "",
    items: items || [],
    totalAmount: Number(totalAmount) || 0,
    paymentMethod: paymentMethod || "upi",
    date: date || (/* @__PURE__ */ new Date()).toISOString(),
    utrNumber: utrNumber || "",
    promoCode: promoCode || "",
    discountAmount: Number(discountAmount) || 0
  };
  if (!data.orders) {
    data.orders = [];
  }
  data.orders.push(newOrder);
  if (writeData(data)) {
    console.log(`
\u{1F4E7} [EMAIL SERVICE: PARROT INDIA] Dispatching official order receipt...`);
    console.log(`\u27A1\uFE0F Recipient Email: ${newOrder.email || "customer@parrotindia.com"}`);
    console.log(`\u27A1\uFE0F Email Subject: Your Parrot India Order ${newOrder.id} is Successfully Registered!`);
    console.log(`\u27A1\uFE0F Email Body:
  Dear ${newOrder.firstName},
  Your companion booking under Unique Track ID: ${newOrder.trackingCode} has been recorded.
  Total processed amount: \u20B9${newOrder.totalAmount} | Method: ${newOrder.paymentMethod.toUpperCase()}.
  If you chose Scan & Pay, UPI transaction reference ${newOrder.utrNumber || "None"} will be verified within 24-48 hours.
  Thank you for choosing Parrot India!
`);
    res.status(201).json({ success: true, order: newOrder });
  } else {
    res.status(500).json({ error: "Failed to record order." });
  }
});
app.get("/api/orders/:id", (req, res) => {
  const data = readData();
  const { id } = req.params;
  if (!data.orders) {
    data.orders = [];
  }
  const order = data.orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase());
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: "Order details not found." });
  }
});
app.get("/api/orders", authenticateAdmin, (req, res) => {
  const data = readData();
  res.json(data.orders || []);
});
app.get("/api/promocodes", (req, res) => {
  const data = readData();
  if (!data.promocodes) {
    data.promocodes = [
      { code: "WELCOME10", type: "percentage", value: 10, minOrder: 0, active: true },
      { code: "INDIAPARROT", type: "flat", value: 5e3, minOrder: 5e4, active: true }
    ];
    writeData(data);
  }
  res.json(data.promocodes);
});
app.post("/api/promocodes", authenticateAdmin, (req, res) => {
  const data = readData();
  const newPromo = req.body;
  if (!newPromo.code || !newPromo.type || newPromo.value === void 0) {
    return res.status(400).json({ error: "Code, Type (percentage/flat), and Value are required." });
  }
  newPromo.code = newPromo.code.trim().toUpperCase();
  newPromo.value = Number(newPromo.value) || 0;
  newPromo.minOrder = Number(newPromo.minOrder) || 0;
  newPromo.active = newPromo.active !== false;
  if (!data.promocodes) {
    data.promocodes = [];
  }
  const existingIndex = data.promocodes.findIndex((p) => p.code === newPromo.code);
  if (existingIndex !== -1) {
    data.promocodes[existingIndex] = newPromo;
  } else {
    data.promocodes.push(newPromo);
  }
  if (writeData(data)) {
    res.status(201).json({ success: true, promocode: newPromo });
  } else {
    res.status(500).json({ error: "Failed to write promo code database." });
  }
});
app.delete("/api/promocodes/:code", authenticateAdmin, (req, res) => {
  const data = readData();
  const code = req.params.code.trim().toUpperCase();
  if (!data.promocodes) {
    data.promocodes = [];
  }
  const index = data.promocodes.findIndex((p) => p.code === code);
  if (index === -1) {
    return res.status(404).json({ error: "Promo code not found in registry." });
  }
  data.promocodes.splice(index, 1);
  if (writeData(data)) {
    res.json({ success: true, message: "Promo code deleted successfully." });
  } else {
    res.status(500).json({ error: "Failed to write promo database." });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Parrot India API Backend] Running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
