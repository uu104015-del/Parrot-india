import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DATA_FILE_PATH = path.join(process.cwd(), 'data.json');

// Middleware for parsing JSON and urlencoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve assets folder directly
app.use('/src/assets', express.static(path.join(process.cwd(), 'src/assets')));

// Helper functions for reading/writing database JSON
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      const initialData = { parrots: [], enquiries: [] };
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading database file:', error);
    return { parrots: [], enquiries: [] };
  }
}

function writeData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing database file:', error);
    return false;
  }
}

// Authentication Token Validator Middleware
const ADMIN_TOKEN = 'secret-parrot-token-123';
function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === ADMIN_TOKEN) {
      return next();
    }
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid or missing administrator token.' });
}

// --- API ROUTES ---

// 1. Admin Authentication Login Route
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'Qasib86990' && password === 'Qasib@8699026488') {
    return res.json({
      success: true,
      token: ADMIN_TOKEN,
      message: 'Login successful'
    });
  }
  return res.status(401).json({ success: false, error: 'Incorrect username or password.' });
});

// 2. Admin Token Verification Route
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === ADMIN_TOKEN) {
      return res.json({ valid: true });
    }
  }
  return res.json({ valid: false });
});

// 3. GET all parrots (Public)
app.get('/api/parrots', (req, res) => {
  const data = readData();
  res.json(data.parrots || []);
});

// 4. POST add brand new parrot (Admin Only)
app.post('/api/parrots', authenticateAdmin, (req, res) => {
  const data = readData();
  const newParrot = req.body;

  // Set ID and push
  newParrot.id = `parrot-${Date.now()}`;
  newParrot.available = newParrot.available === undefined ? true : newParrot.available;
  newParrot.price = Number(newParrot.price) || 0;

  data.parrots.push(newParrot);
  if (writeData(data)) {
    res.status(201).json({ success: true, parrot: newParrot });
  } else {
    res.status(500).json({ error: 'Failed to write to database' });
  }
});

// 5. PUT edit existing parrot (Admin Only)
app.put('/api/parrots/:id', authenticateAdmin, (req, res) => {
  const data = readData();
  const { id } = req.params;
  const updatedInfo = req.body;

  const index = data.parrots.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Parrot not found.' });
  }

  // Preserve ID, merge changes
  const oldParrot = data.parrots[index];
  const mergedParrot = {
    ...oldParrot,
    ...updatedInfo,
    id, // clamp id
    price: Number(updatedInfo.price) || oldParrot.price
  };

  data.parrots[index] = mergedParrot;
  if (writeData(data)) {
    res.json({ success: true, parrot: mergedParrot });
  } else {
    res.status(500).json({ error: 'Failed to write to database.' });
  }
});

// 6. DELETE existing parrot (Admin Only)
app.delete('/api/parrots/:id', authenticateAdmin, (req, res) => {
  const data = readData();
  const { id } = req.params;

  const index = data.parrots.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Parrot not found.' });
  }

  data.parrots.splice(index, 1);
  if (writeData(data)) {
    res.json({ success: true, message: 'Parrot successfully removed from catalog.' });
  } else {
    res.status(500).json({ error: 'Failed to write to database.' });
  }
});

// 7. POST submit client enquiry (Public)
app.post('/api/enquiries', (req, res) => {
  const data = readData();
  const { name, phone, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and Phone Number are required.' });
  }

  const newEnquiry = {
    id: `enquiry-${Date.now()}`,
    name,
    phone,
    message: message || '',
    date: new Date().toISOString()
  };

  if (!data.enquiries) {
    data.enquiries = [];
  }

  data.enquiries.push(newEnquiry);
  if (writeData(data)) {
    res.status(201).json({ success: true, enquiry: newEnquiry });
  } else {
    res.status(500).json({ error: 'Failed to record enquiry.' });
  }
});

// 8. GET all enquiries (Admin Only)
app.get('/api/enquiries', authenticateAdmin, (req, res) => {
  const data = readData();
  res.json(data.enquiries || []);
});

// 9. POST submit client order (Public)
app.post('/api/orders', (req, res) => {
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
    return res.status(400).json({ error: 'First Name, Phone Number, and Address are required.' });
  }

  const newOrder = {
    id: trackingId || `PI-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    trackingCode: trackingCode || `PI-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    firstName,
    lastName: lastName || '',
    email: email || '',
    address,
    phone,
    pincode: pincode || '',
    landmark: landmark || '',
    notes: notes || '',
    items: items || [],
    totalAmount: Number(totalAmount) || 0,
    paymentMethod: paymentMethod || 'upi',
    date: date || new Date().toISOString(),
    utrNumber: utrNumber || '',
    promoCode: promoCode || '',
    discountAmount: Number(discountAmount) || 0
  };

  if (!data.orders) {
    data.orders = [];
  }

  data.orders.push(newOrder);
  if (writeData(data)) {
    // Simulated Email Dispatch System for User Request 3 ("Customer place order and send confirmation email")
    console.log(`\n📧 [EMAIL SERVICE: PARROT INDIA] Dispatching official order receipt...`);
    console.log(`➡️ Recipient Email: ${newOrder.email || 'customer@parrotindia.com'}`);
    console.log(`➡️ Email Subject: Your Parrot India Order ${newOrder.id} is Successfully Registered!`);
    console.log(`➡️ Email Body:\n  Dear ${newOrder.firstName},\n  Your companion booking under Unique Track ID: ${newOrder.trackingCode} has been recorded.\n  Total processed amount: ₹${newOrder.totalAmount} | Method: ${newOrder.paymentMethod.toUpperCase()}.\n  If you chose Scan & Pay, UPI transaction reference ${newOrder.utrNumber || 'None'} will be verified within 24-48 hours.\n  Thank you for choosing Parrot India!\n`);

    res.status(201).json({ success: true, order: newOrder });
  } else {
    res.status(500).json({ error: 'Failed to record order.' });
  }
});

// 10. GET single order status (Public)
app.get('/api/orders/:id', (req, res) => {
  const data = readData();
  const { id } = req.params;
  
  if (!data.orders) {
    data.orders = [];
  }

  const order = data.orders.find((o: any) => o.id.toLowerCase() === id.trim().toLowerCase());
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order details not found.' });
  }
});

// 11. GET all orders (Admin Only)
app.get('/api/orders', authenticateAdmin, (req, res) => {
  const data = readData();
  res.json(data.orders || []);
});

// --- PROMO CODE ROUTES ---

// 12. GET all promo codes (Public)
app.get('/api/promocodes', (req, res) => {
  const data = readData();
  if (!data.promocodes) {
    data.promocodes = [
      { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 0, active: true },
      { code: 'INDIAPARROT', type: 'flat', value: 5000, minOrder: 50000, active: true }
    ];
    writeData(data);
  }
  res.json(data.promocodes);
});

// 13. POST publish new or updated promo code (Admin Only)
app.post('/api/promocodes', authenticateAdmin, (req, res) => {
  const data = readData();
  const newPromo = req.body;

  if (!newPromo.code || !newPromo.type || newPromo.value === undefined) {
    return res.status(400).json({ error: 'Code, Type (percentage/flat), and Value are required.' });
  }

  newPromo.code = newPromo.code.trim().toUpperCase();
  newPromo.value = Number(newPromo.value) || 0;
  newPromo.minOrder = Number(newPromo.minOrder) || 0;
  newPromo.active = newPromo.active !== false;

  if (!data.promocodes) {
    data.promocodes = [];
  }

  const existingIndex = data.promocodes.findIndex((p: any) => p.code === newPromo.code);
  if (existingIndex !== -1) {
    data.promocodes[existingIndex] = newPromo;
  } else {
    data.promocodes.push(newPromo);
  }

  if (writeData(data)) {
    res.status(201).json({ success: true, promocode: newPromo });
  } else {
    res.status(500).json({ error: 'Failed to write promo code database.' });
  }
});

// 14. DELETE existing promo code (Admin Only)
app.delete('/api/promocodes/:code', authenticateAdmin, (req, res) => {
  const data = readData();
  const code = req.params.code.trim().toUpperCase();

  if (!data.promocodes) {
    data.promocodes = [];
  }

  const index = data.promocodes.findIndex((p: any) => p.code === code);
  if (index === -1) {
    return res.status(404).json({ error: 'Promo code not found in registry.' });
  }

  data.promocodes.splice(index, 1);
  if (writeData(data)) {
    res.json({ success: true, message: 'Promo code deleted successfully.' });
  } else {
    res.status(500).json({ error: 'Failed to write promo database.' });
  }
});


// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Parrot India API Backend] Running on http://localhost:${PORT}`);
  });
}

startServer();
