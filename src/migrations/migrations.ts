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
    id: 'add_clients_table',
    up: 'CREATE TABLE IF NOT EXISTS client (\
    id SERIAL PRIMARY KEY, \
    name VARCHAR(100) UNIQUE NOT NULL, \
    redirect_uri VARCHAR(200) UNIQUE NOT NULL, \
    secret VARCHAR(100) NOT NULL \
    );',
    down: 'DROP TABLE IF EXISTS client;'
  },
  {
    id: 'add_codes_table',
    up: 'CREATE TABLE IF NOT EXISTS code (\
    id SERIAL PRIMARY KEY, \
    user_uid VARCHAR(50) NOT NULL references account(uid), \
    client_id INT NOT NULL references client(id), \
    code VARCHAR(100) UNIQUE NOT NULL, \
    code_challenge VARCHAR(100) NOT NULL, \
    full_info BOOLEAN NOT NULL DEFAULT FALSE, \
    created_on TIMESTAMP NOT NULL DEFAULT corrent_timestamp \
    );',
    down: 'DROP TABLE IF EXISTS code'
  }
];
