/* eslint-disable @typescript-eslint/unbound-method */
import { validators } from '../../../src/utils/validators';
import { userService } from '../../../src/services';
import { PublicUser } from '../../../src/types';
import { verifyAsyncThrows } from '../utils/helperFunctions';
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

  it('password hasher should hash passwords', async () => {
    const password = 'some-random-string';
    const hashedPassword = await userService.hashPassword(password);
    expect(hashedPassword.startsWith('$2b$')).toBe(true);
    const foobar = await userService.hashPassword('Password!');
    // eslint-disable-next-line no-console
    console.log(foobar);
  });

  it('should allow storing a user', async () => {
    // mock database query result
    const password = 'ExtraDifficultPassw0rd!';
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{}], rowCount: 1 });
    const newUser = await userService.addUser('username', password, 'full name', 'user@example.com');
    expect(validators.isPublicUser(newUser)).toBe(true);
    // check that pool.query was called with correct params (password hash can be any string)
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith('INSERT INTO account (uid, username, password, name, email) VALUES ($1, $2, $3, $4, $5)',
      ['af3b325f-06f0-4b25-9fb8-27b07a55cd14', 'username', expect.any(String), 'full name', 'user@example.com']);
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
      created_on: new Date()
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

  it('shouldn\'t allow too easy passwords', async () => {

    // This is our helper to avoid writing same code over and over
    const helper = async (password: string) => {
      const result = await verifyAsyncThrows<PublicUser>(userService.addUser('username', password, 'Full Name', 'user@example.com'), 'password not strong enough');
      if (!result) {
        expect('failed password was').toBe(password);
      }
      expect(result).toBe(true);
    };

    // short but contains lowercase, uppercase, letters, numbers and special char
    const tooShort = 'IamT00S!';
    await helper(tooShort);
    // all lowercase
    const allLowerCase = 'iamalll0wercase!';
    await helper(allLowerCase);
    // all UPPERCASE
    const allUpperCase = allLowerCase.toUpperCase();
    await helper(allUpperCase);
    // no numbers
    const onlyLetters = 'IhaveOnlyLetters';
    await helper(onlyLetters);
    // contains only numbers
    const onlyNumbers = '1!2.3!4,567890';
    await helper(onlyNumbers);
    // contains username
    const includesUsername = 'Iamusername1cluded!';
    await helper(includesUsername);
    // contains first name
    const includesFirstname = 'Iamfull1cluded!';
    await helper(includesFirstname);
    // is in the list of most common
    const mostCommon = 'testpasswordW1th!';
    await helper(mostCommon);
  });

  it('username can only contain letters and numbers', async () => {
    const helper = async (username: string) => {
      const result = await verifyAsyncThrows<PublicUser>(userService.addUser(username, 'val1dPassword!!!', 'Full name', 'user@example.com'), 'username must contain only letters and numbers');
      if (!result) {
        expect('failed username was').toBe(username);
      }
      expect(result).toBe(true);
    };

    // contains empty space
    const emptySpace = 'user name';
    await helper(emptySpace);
    // contains underscore
    const underscore = 'user_name';
    await helper(underscore);
    // contains minus
    const minus = 'user-name';
    await helper(minus);
    // contains questionmark
    const qmark = 'username?';
    await helper(qmark);

    // valid username can contain numbers
    const validUsername = 'Username12';
    // mock database query result
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{}], rowCount: 1 });
    const newUser = await userService.addUser(validUsername, 'val1dPassword!!!', 'Full Name', 'user@example.com');
    expect(validators.isPublicUser(newUser)).toBe(true);
    // username should be all lowercase
    expect(newUser.username).toBe(validUsername.toLowerCase());
  });

});
