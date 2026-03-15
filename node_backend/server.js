const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Node.js WebSocket Server is up and running!' });
});

const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production to match your React app's domain
    methods: ["GET", "POST"]
  }
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
