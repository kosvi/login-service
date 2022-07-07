// https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-node-js-on-ubuntu-20-04

/*
 * This file exports all the functions in the files found in this directory
 */

import { runMigrations, revertMigrations, runSingleQuery } from './migrations';
import { addUser, getUserByUid, getUserByUsername, getUserByCreds, getUserByUidAndPassword, updateUser, updatePassword, deleteUser } from './users';
import { findHost, addHost, editHost } from './whitelist';

export const db = {
  runMigrations, revertMigrations, runSingleQuery,
  addUser, getUserByUid, getUserByUsername, getUserByCreds, getUserByUidAndPassword, updateUser, updatePassword, deleteUser,
  findHost, addHost, editHost
};