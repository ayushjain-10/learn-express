import { Router, Request, Response } from 'express';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { User, UserRequest } from './types';

const router = Router();
const dataFile = '../data/users.json';

let users: User[] = [];

// Function to read users from the file
async function readUsersFile() {
  try {
    const data = await fsPromises.readFile(path.resolve(__dirname, dataFile));
    const rawUsers = JSON.parse(data.toString());
    
    // Transform raw users to match User interface
    users = rawUsers.map((user: any) => {
      return {
        id: typeof user.id === 'string' ? parseInt(user.id, 10) || 0 : user.id || 0,
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ')[1] || '',
        username: user.username || '',
        email: user.email || ''
      };
    });
  } catch (err) {
    console.error('Error reading file:', err);
    throw err;
  }
}

// Middleware to load users
router.use(async (req: UserRequest, res: Response, next) => {
  await readUsersFile();
  req.users = users;
  next();
});

// GET route to read all users
router.get('/users', (req: UserRequest, res: Response) => {
  res.send(users);
});

// GET route to read all usernames
router.get('/usernames', (req: UserRequest, res: Response) => {
  const usernames = users.map(user => ({ id: user.id, username: user.username }));
  res.send(usernames);
});

// GET route to read a specific user by username
router.get('/username/:name', (req: UserRequest, res: Response) => {
  const username = req.params.name;
  const user = users.find(user => user.username === username);
  
  if (user) {
    res.send({ id: user.id, email: user.email });
  } else {
    res.status(404).send({ error: 'User not found' });
  }
});

// GET route to read a specific user by ID
router.get('/user/:id', (req: UserRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = users.find(user => user.id === id);
  
  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ error: 'User not found' });
  }
});

// GET route to search users by email domain
router.get('/search/email/:domain', (req: UserRequest, res: Response) => {
  const domain = req.params.domain.toLowerCase();
  const matchingUsers = users.filter(user => 
    user.email.toLowerCase().endsWith(`@${domain}`)
  );
  
  res.send(matchingUsers);
});

export default router;
