import { validators } from '../../../src/utils/validators';
import { converters } from '../../../src/utils/converters';
import { testData } from './helperData';

describe('converter tests', () => {

  it('should be able to make publicUser from User', () => {
    expect(validators.isPublicUser(testData.validUser)).toBe(false);
    const newPublicUser = converters.userToPublicUser(testData.validUser);
    expect(validators.isPublicUser(newPublicUser)).toBe(true);
    // newPublicUser should be exact the same as original, but only misses password
    expect({ ...newPublicUser, password: testData.validUser.password }).toEqual(testData.validUser);
  });

});