import { v4 as uuidv4 } from 'uuid';
import { PublicClient } from '../types';
import { ControllerError } from '../utils/customErrors';
import { validators } from '../utils/validators';
import { db } from './database';

// just gimme the request body and I'll validate it... 
const addClient = async (data: unknown): Promise<PublicClient | undefined> => {
  let newClient;
  if (typeof data === 'object') {
    newClient = { id: uuidv4(), ...data };
  }
  if (!validators.isClient(newClient)) {
    return undefined;
  }
  // ok, newClient is a valid Client
  // let's add it to database
  return await db.addClient(newClient);
};

// edit a client with simply passing request body & id
const editClient = async (id: number, data: unknown): Promise<PublicClient> => {
  let newData;
  if (typeof data === 'object') {
    newData = { id: id, ...data };
  }
  // validate data
  if (!validators.isClient(newData)) {
    // failure -> throw ControllerError
    throw new ControllerError(400, 'malformed request');
  }
  // update client 
  const result = await db.editClient(newData);
  if (result) {
    return result;
  }
  // not a cool way to handle errors (by simply guessing the most likely reason for failure)
  // maybe I'll fix this one day?
  throw new ControllerError(400, 'incorrect id');
};

export const hostService = {
  addClient, editClient
};
