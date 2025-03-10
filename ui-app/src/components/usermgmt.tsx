import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

interface UsernameResponse {
  id: string;
  username: string;
}

interface EmailResponse {
  id: string;
  email?: string;
}

const UserManagement = () => {
  const [usernames, setUsernames] = useState<UsernameResponse[]>([]);
  const [showUsernames, setShowUsernames] = useState<boolean>(false);
  const [showAddUserForm, setShowAddUserForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<User>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    id: ''
  });
  const [searchUserForm, setSearchUserForm] = useState<boolean>(false);
  const [searchUsername, setSearchUsername] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState<EmailResponse[]>([]);
  const [showEmail, setShowEmail] = useState<boolean>(false);

  const getAllUsernames = async () => {
    try {
      const response = await axios.get<UsernameResponse[]>('http://localhost:8000/read/usernames');
      const data = response.data as UsernameResponse[];
      setUsernames(data);
      setShowUsernames(true);
      setShowAddUserForm(false);
      setSearchUserForm(false);
      setShowEmail(false);
    } catch (error) {
      console.error('Error fetching usernames:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleClickNewUser = () => {
    setShowAddUserForm(true);
    setShowUsernames(false);
    setSearchUserForm(false);
    setShowEmail(false);
  };

  const handleSearchForm = () => {
    setSearchUserForm(true);
    setShowAddUserForm(false);
    setShowUsernames(false);
    setShowEmail(false);
  };

  const handleShowEmail = async () => {
    try {
      const response = await axios.get<EmailResponse[]>(`http://localhost:8000/read/username/${searchUsername}`);
      const data = response.data;
      if (data.length > 0) {
        setSearchEmail(data);
      } else {
        setSearchEmail([{ id: 'error', email: 'Not Found' }]);
      }
      setShowEmail(true);
      setSearchUserForm(false);
      setShowAddUserForm(false);
    } catch (error) {
      console.error('Error fetching email of username', error);
    }
  };

  const addUser = async () => {
    try {
      const response = await axios.post('http://localhost:8000/write/adduser', formData);
      const data = response.data;
      if (data.error) {
        alert(data.error.message);
      } else {
        alert('User added successfully!');
      }
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        id: ''
      });
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <div>
      <h1>User Management</h1>
      <button onClick={getAllUsernames}>View All Usernames</button>
      <button onClick={handleClickNewUser}>Add New User</button>
      <button onClick={handleSearchForm}>Search User</button>

      {showUsernames && (
        <div>
          <h2>All Usernames:</h2>
          <ol>
            {usernames.map((username) => (
              <li key={username.id}>
                {username.username}
              </li>
            ))}
          </ol>
        </div>
      )}

      {showAddUserForm && (
        <div>
          <h2>Add New User:</h2>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="id"
            placeholder="ID"
            value={formData.id}
            onChange={handleInputChange}
          />
          <button onClick={addUser}>Submit New User</button>
        </div>
      )}

      {searchUserForm && (
        <div>
          <h2>Search for User's Email:</h2>
          <input
            type="text"
            name="srchUsername"
            placeholder="username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
          />
          <button onClick={handleShowEmail}>Show Email</button>
        </div>
      )}

      {showEmail && (
        <div>
          <ul>
            {searchEmail.map((e) => (
              <li key={e.id}>
                {e.email ? e.email : 'N/A'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
