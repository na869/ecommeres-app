const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Use your connection string here
mongoose.connect('mongodb+srv://nass-sk_22:hackathon2k25@cluster0.jhcye.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
});
const Product = mongoose.model('Product', productSchema);

app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.listen(5000, () => console.log('Backend running on port 5000'));