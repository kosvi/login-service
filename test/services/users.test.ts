/* eslint-disable no-console */
import { validators } from '../../src/utils/validators';
import { userService } from '../../src/services';

describe('users service tests', () => {
  it('should allow storing a user', async () => {
    const newUser = await userService.addUser('username', 'password', 'full name', 'user@example.com');
    expect(validators.isUser(newUser)).toBe(true);
  });
  it('should fail to store invalid user', async () => {
    try {
      await userService.addUser('username', 'password', 'full name', 'invalid email');
      expect('').toBe('never end up here!');
    } catch (error) {
      expect(error).toBe('Invalid email');
    }
  });
  it('should return added users', async () => {
    await userService.addUser('username', 'password', 'full name', 'user@example.com');
    // now fetch user by username
    const user = await userService.findByUsername('username');
    expect(validators.isUser(user)).toBe(true);
    if (validators.isUser(user)) {
      expect(user.email).toBe('user@example.com');
    } else {
      expect('').toBe('user validation failed');
    }
  });
});