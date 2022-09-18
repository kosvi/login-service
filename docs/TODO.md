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
- make some sense to NODE_ENV=dev and DEBUG .env-variables!
- make a whitelist of allowed sites that can use login-service!
- ~~make a test to test if expired tokens are still verified~~
- ~~TAKE AWAY THE CORS STUFF FROM /hello~~
- ~~(don't!!!) move cors tests to Unit-tests (also add tests to: isWhitehost, setCors)~~
- ~~working on updateUser~~
- ~~write whitelist api-documentation! (a bit incomplete tho)~~
- ~~add tests to: db.updateUser, db.updatePassword, db.deleteUser~~
- one could add tests when db-promises are rejected ;)
- add (integration) tests to /users
- ~~write tests: db.getUserByUidAndPassword(), ...~~
- WRITE A LOT OF TESTS!!! especially tests that do something unexpecting...
- ~~Write tests for down-migrations~~


New list:
- Make sure that resource_id is validated from tokens! (so no other resources/clients gain access to users)
- a HUGE amount of tests missing!!!
- update documentation (this is lagging badly too!)
- ~~FINISH CODE API! (code controller)~~
- ~~Create /token endpoint!~~
- ~~UID for the code SHOULD NOT come from payload but from token! ~~
  -> ~~currently anyone can craft codes without even logging in!~~