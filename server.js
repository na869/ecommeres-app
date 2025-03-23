const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://nass-sk_22:hackathon123@cluster0.jhcye.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
});
const Product = mongoose.model('Product', productSchema);

app.get('/', (req, res) => {
  res.send('Welcome to my E-commerce Backend! Visit /products for the product list.');
});

app.get('/products', async (req, res) => {
  try {
    const { search } = req.query; // Get 'search' from query params
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }
    
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

app.listen(5000, () => console.log('Backend running on port 5000'));