require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const app = require('./app');

(async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: (
          process.env.CLIENT_URL ||
          'http://localhost:5173'
        ).split(','),
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      socket.on('join-property', (id) => {
        if (id) {
          socket.join(`property:${id}`);
        }
      });
    });

    app.set('io', io);

    const PORT = process.env.PORT || 5000;
    const HOST = '0.0.0.0';

    server.listen(PORT, HOST, () => {
      console.log(
        `Hotel Enterprise API running on port ${PORT}`
      );
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
})();