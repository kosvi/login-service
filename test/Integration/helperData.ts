const dbClient = {
  id: 'c328e670-beeb-49e7-b388-55bda228567d',
  name: 'test client',
  redirect_uri: 'https://test.example.com/callback',
  secret: 'foobar',
  allow_write: true
};

const dbResource = {
  id: 'b50ef4fa-9574-4ecf-a042-d4049effc63a',
  name: 'test resource'
};

const dbUser = {
  uid: 'e82aa422-ecaf-44cc-aee6-be5067e32d12',
  username: 'test3r',
  password: 'password',
  name: 'Test User',
  email: 'test3r@example.com',
  admin: false,
  locked: false,
  deleted: false
};

export const dbData = {
  dbClient, dbResource, dbUser
};
