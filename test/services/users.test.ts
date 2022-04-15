/* eslint-disable @typescript-eslint/unbound-method */
import { validators } from '../../src/utils/validators';
import { userService } from '../../src/services';
import { PublicUser } from '../../src/types';
// these are needed for mocking
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';

// mock pg / pool.query 
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn()
  };
  return { Pool: jest.fn(() => mockPool) };
});
// mock uuid
jest.mock('uuid', () => {
  const mockUuid = {
    v4: jest.fn().mockImplementation(() => { return 'af3b325f-06f0-4b25-9fb8-27b07a55cd14'; })
  };
  return mockUuid;
});

describe('users service tests', () => {

  // this is our pool for the tests
  const pool: Pool = new Pool();

  // reset jest.fn after each so we can start counting from 0
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow storing a user', async () => {
    // mock database query result
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{}], rowCount: 1 });
    const newUser = await userService.addUser('username', 'ExtraDifficultPassw0rd!', 'full name', 'user@example.com');
    expect(validators.isPublicUser(newUser)).toBe(true);
    // check that pool.query was called with correct params
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith('INSERT INTO users (uid, username, password, name, email) VALUES ($1, $2, $3, $4, $5)',
      ['af3b325f-06f0-4b25-9fb8-27b07a55cd14', 'username', userService.hashPassword('ExtraDifficultPassw0rd!'), 'full name', 'user@example.com']);
  });

  it('should fail to store invalid user', async () => {
    // we will give invalid email-address
    try {
      await userService.addUser('username', 'ExtraDifficultPassw0rd!', 'full name', 'invalid email');
      // addUser should fail, below line should never be run
      expect('').toBe('never end up here!');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toBe('Invalid email');
      } else {
        expect('').toBe('impossible just happened');
      }
    }
  });

  it('should return user by username', async () => {
    const user: PublicUser = {
      uid: uuidv4(),
      username: 'username',
      name: 'full name',
      email: 'user@example.com',
      admin: false,
      locked: false,
      stealth: false,
      created_on: '2022-04-09T17:27:38.378Z'
    };
    // mock database query result, the query used is tested in database-services unit-tests
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [user],
      rowCount: 1
    });
    // now fetch user by username
    const resultUser = await userService.findByUsername('username');
    if (validators.isPublicUser(resultUser)) {
      expect(resultUser.email).toBe(user.email);
    } else {
      // for some mind melting reason, we failed to validate user we just validate earlier
      expect('').toBe('user validation failed');
    }
  });
});

/*
describe('test password validity checker', () => {
  it('shouldn\'t allow too easy passwords', () => {
    // short but contains lowercase, uppercase, letters, numbers and special char
    const tooShort = 'IamT00S!';
    // all lowercase
    const allLowerCase = 'iamalll0wercase!';
    // all UPPERCASE
    const allUpperCase = allLowerCase.toUpperCase();
    // no numbers
    const onlyLetters = 'IhaveOnlyLetters!';
    // contains only numbers
    const onlyNumbers = '1!2.3!4,567890';
    // contains username
    const includesUsername = 'Iamusername1cluded!';
    // contains first name
    const includesFirstname = 'Iamfull1cluded!';
    expect(async () => { await userService.addUser('username', tooShort, 'Full Name', 'user@example.com'); }).toThrow(Error);
    expect(async () => { await userService.addUser('username', allLowerCase, 'Full Name', 'user@example.com'); }).toThrow(Error);
    expect(async () => { await userService.addUser('username', allUpperCase, 'Full Name', 'user@example.com'); }).toThrow(Error);
    expect(async () => { await userService.addUser('username', onlyLetters, 'Full Name', 'user@example.com'); }).toThrow(Error);
    expect(async () => { await userService.addUser('username', onlyNumbers, 'Full Name', 'user@example.com'); }).toThrow(Error);
    expect(async () => { await userService.addUser('username', includesUsername, 'Full Name', 'user@example.com'); }).toThrow(Error);
    expect(async () => { await userService.addUser('username', includesFirstname, 'Full Name', 'user@example.com'); }).toThrow(Error);
  });
});
*/