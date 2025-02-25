import { Request } from "express";

/**
 * Interface representing a user object
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

/**
 * Interface extending Express Request to include user data
 */
export interface UserRequest extends Request {
  users?: User[];
}