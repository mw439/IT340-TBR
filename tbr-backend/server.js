const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');

dotenv.config();
const app = express();

// Allow frontend
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());
app.use('/api/auth', authRoutes);

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
