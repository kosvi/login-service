import { validators } from '../../src/utils/validators';
import { UserService } from '../../src/services/users';

describe('users service tests', () => {
  it('should allow storing a user', async () => {
    const service = new UserService();
    const newUser = await service.addUser('username', 'full name', 'password');
    expect(validators.isUser(newUser)).toBe(true);
  });
});