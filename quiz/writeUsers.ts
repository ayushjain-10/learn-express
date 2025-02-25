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

// Helper function to write users to file
async function writeUsersFile() {
  await fsPromises.writeFile(path.resolve(__dirname, dataFile), JSON.stringify(users));
}

// POST route to add a new user
router.post('/adduser', async (req: UserRequest, res: Response) => {
  try {
    // Validate that the request body matches the User interface
    const { id, firstName, lastName, username, email } = req.body;
    
    if (!username) {
      return res.status(400).send({ error: 'Username is required' });
    }
    
    // Check if username already exists
    if (users.some(user => user.username === username)) {
      return res.status(400).send({ error: 'Username already exists' });
    }
    
    // Create a new user object that conforms to the User interface
    const newUser: User = {
      id: typeof id === 'string' ? parseInt(id, 10) || Math.floor(Math.random() * 100000) : id || Math.floor(Math.random() * 100000),
      firstName: firstName || '',
      lastName: lastName || '',
      username,
      email: email || ''
    };
    
    users.push(newUser);
    
    // Write all users back to the file
    await writeUsersFile();
    
    console.log('User Saved');
    res.send({ message: 'User added successfully', user: newUser });
  } catch (err) {
    console.log('Failed to write:', err);
    res.status(500).send({ error: 'Error saving user' });
  }
});

// PUT route to update a user
router.put('/user/:id', async (req: UserRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).send({ error: 'User not found' });
    }
    
    const { firstName, lastName, username, email } = req.body;
    
    // Check if username is being changed and already exists
    if (username && username !== users[userIndex].username && 
        users.some(user => user.username === username)) {
      return res.status(400).send({ error: 'Username already exists' });
    }
    
    // Update user properties
    const updatedUser: User = {
      ...users[userIndex],
      firstName: firstName || users[userIndex].firstName,
      lastName: lastName || users[userIndex].lastName,
      username: username || users[userIndex].username,
      email: email || users[userIndex].email
    };
    
    users[userIndex] = updatedUser;
    
    // Write all users back to the file
    await writeUsersFile();
    
    console.log('User Updated');
    res.send({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.log('Failed to update:', err);
    res.status(500).send({ error: 'Error updating user' });
  }
});

// DELETE route to delete a user
router.delete('/user/:id', async (req: UserRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).send({ error: 'User not found' });
    }
    
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    
    // Write all users back to the file
    await writeUsersFile();
    
    console.log('User Deleted');
    res.send({ message: 'User deleted successfully', user: deletedUser });
  } catch (err) {
    console.log('Failed to delete:', err);
    res.status(500).send({ error: 'Error deleting user' });
  }
});

export default router;
