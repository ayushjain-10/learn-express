import express from 'express';
import cors from 'cors';
import readUsersRouter from './readUsers';
import writeUsersRouter from './writeUsers';
import { User, UserRequest } from './types';

const app = express();
const port = 8000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for API health check
app.get('/', (req, res) => {
  res.send({ status: 'ok', message: 'User API is running' });
});

// Use routers
app.use('/read', readUsersRouter);
app.use('/write', writeUsersRouter);

// Start the server
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
