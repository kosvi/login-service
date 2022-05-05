# Api documentation

No token is needed, if authorization is 'none'. \
If authorization is needed, token has to be sent in 'Authorization'-header in following format: `bearer <token>`

## endpoints

| endpoint | description | 
|----------|-------------|
| / | redirects to `/static` |
| [/hello](#hello) | used by tests to ensure service is up |
| [/login](#login) | used to request token |
| [/static](#static) | serves static files, like viewing / editing profile |
| [/user](#user) | allows CRUD-operations for viewing / editing user | 
| [/verify](#verify) | verifies a token |
| [/settings](¤settings) | allows viewing server settings (like password requirements) |

## hello

| endpoint | method | authorization | success | failure(s) |
|----------|--------|---------------|---------|------------|
| [/hello](API/hello.md#hello) | GET    | none          | 200     | -          |

## login 

| endpoint | method | authorization | success | failure(s) |
|----------|--------|---------------|---------|------------|
| [/login](API/login.md#login) | POST | none | 200 | - |

## static

Serves static files...

## user

| endpoint | method | authorization | success | failure(s) |
|----------|--------|---------------|---------|------------|
| [/user](API/user.md#user)    | GET    | any           | 200     | 401        |
| [/user/save](API/user.md#user-save) | POST | none          | 201     | 400, 409, 422 |
| [/user/save](API/user.md#user-save) | PUT  | any           | 200     | 401, 409, 422 |
| [/user/delete](API/user.md#user-delete) | DELETE | any | 204 | 401 |
| [/user/password](API/user.md#user-password) | PATCH | any      | 204     | 401, 422   |

## verify

| endpoint | method | authorization | success | failure(s) |
|----------|--------|---------------|---------|------------|
| [/verify](API/verify.md#verify) | GET | any | 200 | 401  |

## settings

| endpoint | method | authorization | success | failure(s) |
|----------|--------|---------------|---------|------------|
| [/settings](API/settings.md#settings) | GET | none | 200 | - |
