const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const GatePass = require('./models/GatePass'); 

const app = express();

// Configure CORS to permit your specific live Vercel frontend website link
app.use(cors({
  origin: 'https://vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Establish connection to MongoDB Atlas Cloud Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 Successfully connected to MongoDB Atlas Cloud Database!"))
  .catch((err) => console.error("❌ Database connection error failure:", err));

// Fallback home check route
app.get('/', (req, res) => {
  res.send("Gatepass API server is running and accepting live Vercel connections!");
});

// 1. Submit Request API (Student)
app.post('/api/gatepass/request', async (req, res) => {
  try {
    const newPass = new GatePass(req.body);
    await newPass.save();
    res.status(201).json(newPass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch All Requests API (Mentor & Dean display view)
app.get('/api/gatepass/all', async (req, res) => {
  try {
    const passes = await GatePass.find().sort({ createdAt: -1 });
    res.status(200).json(passes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Status API (Approvals)
app.put('/api/gatepass/review/:id', async (req, res) => {
  const { role, action } = req.body; 
  try {
    const pass = await GatePass.findById(req.params.id);
    if (!pass) return res.status(404).json("Pass not found");

    if (role === 'MENTOR') {
      pass.mentorStatus = action;
    } else if (role === 'DEAN') {
      pass.deanStatus = action;
      if (action === 'APPROVED' && pass.mentorStatus === 'APPROVED') {
        pass.overallStatus = 'APPROVED';
      } else if (action === 'REJECTED') {
        pass.overallStatus = 'REJECTED';
      }
    }
    await pass.save();
    res.status(200).json(pass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running smoothly on port ${PORT}`));
