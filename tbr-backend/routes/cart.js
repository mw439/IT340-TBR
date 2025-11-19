const express = require('express');
const CartItem = require('../CartItem');

const router = express.Router();

// GET /api/cart - get all cart items
router.get('/', async (req, res) => {
  try{
    const items = await CartItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('Error fetching cart items:', err.message);
    res.status(500).json({ error: 'Failed to get cart items.' });
  }
});

// POST /api/cart - add item to cart
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, coverUrl, price, quantity } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required.' });
    }

    const item = new CartItem({
      title,
      author,
      isbn,
      coverUrl,
      price,
      quantity: quantity || 1,
    });

    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).json({ error: 'Failed to add item to cart.' });
  }
});

// DELETE /api/cart/:id - remove item
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await CartItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }
    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error('Error deleting cart item:', err.message);
    res.status(500).json({ error: 'Failed to delete item from cart.' });
  }
});

module.exports = router;
