/* eslint-disable no-console */
import { validators } from '../../src/utils/validators';
import { userService } from '../../src/services';
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

describe('users service tests', () => {

  // this is our pool for the tests
  const pool: Pool = new Pool();

  // reset jest.fn after each so we can start counting from 0
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow storing a user', async () => {
    // mock database query result
    (pool.query as jest.Mock).mockResolvedValue({ rows: [{}], rowCount: 1 });
    const newUser = await userService.addUser('username', 'password', 'full name', 'user@example.com');
    expect(validators.isPublicUser(newUser)).toBe(true);
  });

  it('should fail to store invalid user', async () => {
    try {
      await userService.addUser('username', 'password', 'full name', 'invalid email');
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

  it('should return added users', async () => {
    // mock database query result
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{}], rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [{
          uid: uuidv4(),
          username: 'username',
          name: 'full name',
          email: 'user@example.com',
          admin: false,
          locked: false,
          stealth: false,
          created_on: '2022-04-09T17:27:38.378Z'
        }],
        rowCount: 1
      });
    await userService.addUser('username', 'password', 'full name', 'user@example.com');
    // now fetch user by username
    const user = await userService.findByUsername('username', 'password');
    expect(validators.isPublicUser(user)).toBe(true);
    if (validators.isPublicUser(user)) {
      expect(user.email).toBe('user@example.com');
    } else {
      // for some mind melting reason, we failed to validate user we just validate earlier
      expect('').toBe('user validation failed');
    }
  });
});