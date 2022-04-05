import { dotenv } from '../../src/utils/dotenv';

describe('dotenv tests', () => {
  it('should parse valid lines (only)', () => {
    // let's create content with all sorts of lines
    const content = '\n \
    foo=bar \n\
    foo=foo=bar\n\
    password=kl3htljqbtgpi5471===34515=\n\
    =noname\n\
    novalue=\n  \
    \n\
    empty\n\
    and=another=valid=line\n\
    \n';
    const result = dotenv.parseEnv(content);
    expect(result).toEqual({
      foo: 'foo=bar',
      password: 'kl3htljqbtgpi5471===34515=',
      and: 'another=valid=line'
    });
  });
  it('should return empty object with empty file', () => {
    const content = '';
    const result = dotenv.parseEnv(content);
    expect(result).toEqual({});
  });
});