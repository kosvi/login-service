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
| [/users](#users) | allows CRUD-operations for viewing / editing user | 
| [/verify](#verify) | verifies a token |
| [/settings](#settings) | allows viewing server settings (like password requirements) |
| [/hosts](#hosts) | allows adding, editing and removing of client services |

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

## users

| endpoint | method | authorization | success | failure(s) |
|----------|--------|---------------|---------|------------|
| [/users/](API/users.md#users) | POST | none          | 201     | 400, 409, 422 |
| [/users/:id](API/users.md#users-id)    | GET    | any           | 200     | 401        |
| [/users/:id](API/users.md#users-id) | PUT  | any           | 200     | 401, 409, 422 |
| [/users/:id](API/users.md#users-id) | DELETE | any | 204 | 401 |
| [/users/:id](API/users.md#users-id) | PATCH | any      | 204     | 401, 422   |

## verify

| endpoint | method | authorization | success | failure(s) |
|----------|--------|---------------|---------|------------|
| [/verify](API/verify.md#verify) | GET | any | 200 | 401  |

## settings

| endpoint | method | authorization | success | failure(s) |
|----------|--------|---------------|---------|------------|
| [/settings](API/settings.md#settings) | GET | none | 200 | - |

## hosts

| endpoint | method | authorization | success | failure(s) |
|----------|--------|---------------|---------|------------|
| [/hosts](API/hosts.md#hosts) | GET    | admin         | 200     | 401, 403   |
| [/hosts](API/hosts.md#hosts) | POST   | admin         | 201     | 401, 403   |
| [/hosts/:id](API/hosts.md#hosts-id) | PUT    | admin         | 200     | 401, 403   |
| [/hosts/:id](API/hosts.md#hosts-id) | DELETE | admin         | 204     | 401, 403   |
