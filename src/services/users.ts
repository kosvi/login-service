import { v4 as uuidv4 } from 'uuid';
import { User } from '../types/objects';

export class UserService {
  async addUser(username: string, name: string, password: string): Promise<User> {
    return new Promise((resolve, _reject) => {
      const newUser: User = {
        uid: uuidv4(),
        username: username,
        name: name,
        password: password
      };
      resolve(newUser);
    });
  }
}