const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your-secret-key'; // Keep this safe!

mongoose.connect('mongodb+srv://nass-sk_22:hackathon123@cluster0.jhcye.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Product Schema (with image field)
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String, // URL to the product image
});
const Product = mongoose.model('Product', productSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to my E-commerce Backend! Use /signup, /login, /products, or /products/add.');
});

// Signup
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Products
app.get('/products', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// Add Product (protected route)
app.post('/products/add', authenticateToken, async (req, res) => {
  try {
    const { name, price, description, image } = req.body;
    const product = new Product({ name, price, description, image });
    await product.save();
    res.status(201).json({ message: 'Product added', product });
  } catch (error) {
    res.status(400).json({ message: 'Error adding product', error: error.message });
  }
});

app.listen(5000, () => console.log('Backend running on port 5000'));