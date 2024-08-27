const express = require('express');
const app = express();
const vendorRoutes = require('./routes/vendorRoutes')
const purchaseRoutes = require('./routes/puracheOrderRoutes');

// Middleware to parse JSON request bodies
app.use(express.json());

app.use('/api', vendorRoutes);
app.use('/api', purchaseRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
