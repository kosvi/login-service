import { dotenv } from '../../src/utils/dotenv';
import fs from 'fs';

// mock readFileSync
jest.mock('fs', () => {
  const mockFS = {
    readFileSync: jest.fn(),
    existsSync: jest.fn()
  };
  return mockFS;
});

describe('dotenv tests', () => {

  const ORIGINAL_ENV = process.env;

  // Before each test: clear mocks and reset env
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });

  // at the end, reset env
  afterAll(() => {
    process.env = { ...ORIGINAL_ENV };
  });

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
    space everywhere = more space\n \
    under_score   = is allowe in key   \n \
    and01=another=valid=line\n\
    \n';
    // mock existsSync and readFileSync
    (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
    (fs.readFileSync as jest.Mock).mockReturnValueOnce(content);
    // initialize env
    dotenv.initializeEnv();
    expect(process.env).toEqual({
      ...{
        foo: 'foo=bar',
        password: 'kl3htljqbtgpi5471===34515=',
        under_score: 'is allowe in key',
        and01: 'another=valid=line'
      },
      ...ORIGINAL_ENV
    });
  });

  it('should return empty object with empty file', () => {
    // make existsSync return true once
    (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
    // make readFileSync return empty string
    (fs.readFileSync as jest.Mock).mockReturnValueOnce('');
    // now initialize env and expect results
    dotenv.initializeEnv();
    expect(process.env).toEqual(ORIGINAL_ENV);
  });

  it('shouldn\'t crash if file does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
    dotenv.initializeEnv();
    expect(process.env).toEqual(ORIGINAL_ENV);
  });

});