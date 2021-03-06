// https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-node-js-on-ubuntu-20-04

/*
 * This file exports all the functions in the files found in this directory
 */

import { runMigrations, runSingleMigration } from './migrations';
import { addUser, getUser, getUserByCreds } from './users';

export const db = {
  runMigrations, runSingleMigration,
  addUser, getUser, getUserByCreds
};