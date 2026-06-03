const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const server = http.createServer(app);

// Authentication Middleware Placeholder
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Health Check Endpoints
app.get('/', (req, res) => {
  res.send('Pharmacy Management System - Node Backend Active');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'Operational',
    database: 'PostgreSQL (Synced with Django)',
    auth: 'JWT + Bcrypt'
  });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password, role, email } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, role, email }
    });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.ACCESS_TOKEN_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    res.json({ accessToken, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected Example Route
app.get('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const drugs = await prisma.drug.findMany();
    res.json(drugs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Add path if behind proxy that doesn't strip it, but default is /socket.io/
});


io.on('connection', (socket) => {
  console.log(`[+] A client connected: ${socket.id}`);

  // Example: Listen for a new prescription uploaded from the patient frontend (UploadPrescription.jsx)
  socket.on('new_prescription_uploaded', (data) => {
    console.log(`[Rx] New prescription received! ID: ${data.prescriptionId}`);
    
    // Broadcast this event to all specific connected staff/pharmacists 
    // This allows the "Pharmacy Overview" or "Prescription Requests" dashboards to update instantly!
    socket.broadcast.emit('alert_new_prescription', data);
  });

  // Example: Listen for status changes (e.g., from DetailPrescriptionReview.jsx Verify & Approve)
  socket.on('prescription_status_changed', (data) => {
    console.log(`[Rx] Prescription status updated: ${data.status}`);
    
    // Notify clients (could notify the specific patient or update admin dashboards)
    io.emit('broadcast_status_update', data);
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log(`[-] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Node.js WebSocket server running on http://localhost:${PORT}`);
  console.log(`   Waiting for real-time events...`);
});
