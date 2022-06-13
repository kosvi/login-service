import { v4 as uuidv4 } from 'uuid';
import { Migration } from '../types';

export const migrations: Array<Migration> = [
  {
    id: 'create_account_table',
    up: 'CREATE TABLE IF NOT EXISTS account (\
    uid VARCHAR(50) PRIMARY KEY, \
    username VARCHAR(50) UNIQUE NOT NULL, \
    password VARCHAR(100) NOT NULL, \
    name VARCHAR(100) NOT NULL, \
    email VARCHAR(100) UNIQUE NOT NULL, \
    admin BOOLEAN NOT NULL DEFAULT FALSE, \
    locked BOOLEAN NOT NULL DEFAULT FALSE, \
    stealth BOOLEAN NOT NULL DEFAULT TRUE, \
    deleted BOOLEAN NOT NULL DEFAULT FALSE, \
    created_on TIMESTAMP NOT NULL DEFAULT current_timestamp \
    );',
    down: 'DROP TABLE IF EXISTS account;'
  },
  {
    id: 'add_admin_account',
    // admin:Password!
    up: `INSERT INTO account (uid, username, password, name, email, admin) \
    VALUES ('${uuidv4()}', 'admin', '$2b$10$hJrr3K5tTpOdGW7l4suvXeDnoiy/t0UPZl/H57E9KVJK7ZznNieR.', 'Admin Account', 'admin@example.com', TRUE);`,
    down: 'DELETE FROM account WHERE username = \'admin\';'
  },
  {
    id: 'add_whitelist_table',
    up: 'CREATE TABLE IF NOT EXISTS whitelist (\
    id SERIAL PRIMARY KEY, \
    name VARCHAR(100) UNIQUE NOT NULL, \
    host VARCHAR(200) UNIQUE NOT NULL, \
    trusted BOOLEAN NOT NULL DEFAULT FALSE \
    );',
    down: 'DROP TABLE IF EXISTS whitelist;'
  }
];
