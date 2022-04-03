import { Migration } from '../types';

export const migrations: Array<Migration> = [
  {
    id: 'create_user_table',
    sql: 'CREATE TABLE IF NOT EXISTS user (uid VARCHAR(50) PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(100) NOT NULL, name VARCHAR(100) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, admin BOOLEAN NOT NULL DEFAULT FALSE, locked BOOLEAN NOT NULL DEFAULT FALSE, stealth BOOLEAN NOT NULL DEFAULT TRUE, created_on TIMESTAMP NOT NULL DEFAULT current_timestamp)'
  }
];
