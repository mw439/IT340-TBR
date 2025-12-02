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
    const response = await axios.get('https://openlibrary.org/search.json', {
      params: {
        q: query,
        limit: 20,
      },
    });

    const docs = response.data.docs || [];

    const books = docs.map((doc) => {
      const coverId = doc.cover_i;
      const coverUrl = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : null;

      const price = 10 + Math.floor(Math.random() * 15); // fake price for now

      return {
        key: doc.key,
        title: doc.title,
        author: (doc.author_name && doc.author_name[0]) || 'Unknown',
        isbn: (doc.isbn && doc.isbn[0]) || '',
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
