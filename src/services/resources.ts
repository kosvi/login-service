import { v4 as uuidv4 } from 'uuid';
import { Resource } from '../types';
import { validators } from '../utils/validators';
import { db } from './database';

const addResource = async (data: unknown): Promise<Resource | undefined> => {
  let newResource;
  if (typeof data === 'object') {
    newResource = { id: uuidv4(), ...data };
  }
  if (!validators.isResource(newResource)) {
    return undefined;
  }
  if (await db.addResource(newResource)) {
    return newResource;
  }
  return undefined;
};

const getResource = async (id: string): Promise<Resource | undefined> => {
  return db.findResource(id);
};

export const resourceService = {
  addResource, getResource
};
