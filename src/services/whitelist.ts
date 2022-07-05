import { Whitehost } from '../types';
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

export const hostService = {
  addHost
};
