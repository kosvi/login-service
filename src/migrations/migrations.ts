import { v4 as uuidv4 } from 'uuid';
import { userService } from '../services';
import { Migration } from '../types';

export const migrations: Array<Migration> = [
  {
    id: 'create_user_table',
    sql: 'CREATE TABLE IF NOT EXISTS user (uid VARCHAR(50) PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(100) NOT NULL, name VARCHAR(100) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, admin BOOLEAN NOT NULL DEFAULT FALSE, locked BOOLEAN NOT NULL DEFAULT FALSE, stealth BOOLEAN NOT NULL DEFAULT TRUE, created_on TIMESTAMP NOT NULL DEFAULT current_timestamp)'
  },
  {
    id: 'add_admin_account',
    sql: `INSERT INTO user (uid, username, password, name, email, admin) VALUES (${uuidv4()}, 'admin', ${userService.hashPassword('password')}, 'Admin Account', 'admin@example.com', TRUE)`
  }
];
