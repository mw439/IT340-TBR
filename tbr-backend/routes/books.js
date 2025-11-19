const express = require('express');
const axios = require('axios');

const router = express.Router();

// GET /api/books/search?q=harry+potter
router.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Missing search query (q).' });
  }

  try {
    // Call Open Library API
    const response = await axios.get('https://openlibrary.org/search.json', {
      params: {
        q: query,
        limit: 20,
      },
    });

    const docs = response.data.docs || [];

    // Map the external data to a simpler format for your frontend
    const books = docs.map((doc) => {
      const isbn = doc.isbn && doc.isbn.length > 0 ? doc.isbn[0] : null;
      const coverUrl = isbn
        ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
        : null;

      // Fake price just so your cart has something (you can change this)
      const basePrice = 10;
      const randomExtra = Math.floor(Math.random() * 10); // 0–9
      const price = basePrice + randomExtra;

      return {
        title: doc.title || 'Unknown title',
        author: doc.author_name && doc.author_name[0]
          ? doc.author_name[0]
          : 'Unknown author',
        isbn,
        coverUrl,
        price,
        firstPublishYear: doc.first_publish_year || null,
      };
    });

    res.json(books);
  } catch (err) {
    console.error('Error calling Open Library API:', err.message);
    res.status(500).json({ error: 'Failed to fetch books from external API.' });
  }
});

module.exports = router;
