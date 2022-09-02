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

  it('should be able to convert anything to number (or NaN)', () => {
    const first = converters.unknownToInteger(6);
    expect(first).toEqual(6);
    const second = converters.unknownToInteger(new Number('30'));
    expect(second).toEqual(30);
    const third = converters.unknownToInteger('50');
    expect(third).toEqual(50);
    const fourth = converters.unknownToInteger(new String('7'));
    expect(fourth).toEqual(7);
    const final = converters.unknownToInteger('foobar');
    expect(final).toEqual(NaN);
  });

});