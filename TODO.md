TODO:

- ~~setup Docker for Postgres~~
- ~~build migrations!~~ (no down though)
- ~~add insert & select by username~~
- ~~there are some re-organization needed in the utils-folder (especially validators contains interesting stuff...)~~
- ~~test that they work!~~
- ~~write api-documentation / plan api~~
- implement the documented / planned api


Current task:
- ~~fix tests for password validity testing~~
- ~~make sure username does not contain anything but a-z0-9 (no spaces!)~~
- ~~make tests for username validity!~~
- ~~document env variables to README~~
- ~~write tests for number parser~~
- ~~implement JWT in login-controller~~
- ~~add bcrypt to password hasher~~
- ~~add (unit)tests to login controller! (mock user-service!)~~
- make some sense to NODE_ENV=dev and DEBUG env.-variables!
- make a whitelist of allowed sites that can use login-service!
- ~~make a test to test if expired tokens are still verified~~
