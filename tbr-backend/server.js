const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const cartRoutes = require('./routes/cart');


dotenv.config();
const app = express();

app.get("/", (reg,res) => {
res.send( "Hello from MEAN stack backend!")
});

// Allow frontend
app.use(cors({ origin: 'http://localhost:4200' }));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/cart', cartRoutes);


mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
.then(() => {
	console.log('MongoDB connected');
	app.listen(process.env.PORT, () => {
		console.log(`Server running on port ${process.env.PORT}`);
	});
})
.catch(err => console.error(err));
