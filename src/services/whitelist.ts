import { Whitehost } from '../types';
import { ControllerError } from '../utils/customErrors';
import { validators } from '../utils/validators';
import { db } from './database';

// just gimme the request body and I'll validate it... 
const addHost = async (data: unknown): Promise<Whitehost | undefined> => {
  let newHost;
  if (typeof data === 'object') {
    newHost = { id: 1, ...data };
  }
  // we gave some default id for the host as it's a required property of whitehost, but it shouldn't cause a problem
  if (!validators.isWhitehost(newHost)) {
    return undefined;
  }
  // ok, newHost is a valid whitehost
  // let's add it to database
  return await db.addHost(newHost);
};

// edit a host with simply passing request body & id
const editHost = async (id: number, data: unknown): Promise<Whitehost> => {
  let newData;
  if (typeof data === 'object') {
    newData = { id: id, ...data };
  }
  // validate data
  if (!validators.isWhitehost(newData)) {
    // failure -> throw ControllerError
    throw new ControllerError(400, 'malformed request');
  }
  // update host 
  const result = await db.editHost(newData);
  if (result) {
    return result;
  }
  // not a cool way to handle errors (by simply guessing the most likely reason for failure)
  // maybe I'll fix this one day?
  throw new ControllerError(400, 'incorrect id');
};

export const hostService = {
  addHost, editHost
};
