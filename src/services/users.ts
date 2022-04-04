import { v4 as uuidv4 } from 'uuid';
import { User } from '../types';
import { validators } from '../utils/validators';

const users: Array<User> = [];

const hashPassword = (password: string): string => {
  return password.split('').reverse().join('');
};

const addUser = async (username: string, password: string, name: string, email: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    const newUser: User = {
      uid: uuidv4(),
      username: username,
      password: password,
      name: name,
      email: email,
      admin: false,
      locked: false,
      stealth: true
    };
    if (validators.isUser(newUser)) {
      users.push(newUser);
      resolve(newUser);
    } else {
      reject(validators.userFailure(newUser));
    }
  });
};

const findByUsername = async (username: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    const user = users.find(u => u.username === username);
    if (user) {
      resolve(user);
    } else {
      reject('not found');
    }
  });
};

export const userService = {
  hashPassword, addUser, findByUsername
};