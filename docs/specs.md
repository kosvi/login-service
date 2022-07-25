# Specs

- [User stories](#user-stories)
- [Technologies](#used-technologies)
- [Repository structure](#repository-structure)
- [Database](#database)
- [Security](#security)


## User stories

| id | actor | story  |
|----|-------|--------|
| 1  | user  | as a user, I want to use same password for all services so that I need to remember only single password. |
| 2  | user  | as a user, I want a simple way to change my password so that once I update my password, the new password instantly works on all services. |
| 3  | user  | as a user, I want to limit the information provided to services I use so that they can't send spam to my email account or publish my real name. |
| 4  | user  | as a user, I want to be able to delete my account so that no information about me is left to the servers. |
| 5  | client service | as a service, I dont want to maintain user database so that I won't have to worry about password security or general data protection regulations. |
| 6  | client service | as a service, I want to easily authenticate/authorize users so that I know who is accessing my service. |
| 7  | admin | as an admin, I want to be able to delete/lock users if needed. |
| 8  | admin | as an admin, I want to be able to manage sites allowed to use this login-service so that only trusted sites can authenticate/authorize our users. |

## Used technologies

Main goal is to provide a simple authentication server. To achieve this, dependencies are tried to keep as minimal as possible. Project does not use Express.js! Database will be Postgres, no others supported. 

## Repository structure

Source code of the project is located in `./src`. It is organized in the following structure. 

| path | description |
|------|-------------|
|index.js| Contains the startup script that is used to fire up the application. |
|app.js | Contains the actual app that is started from index.js | 
|./controllers| Contains a single Controller class in every file. Controllers handle requests and send responses. |
|./services | Services are used to handle the main business logic. They provide data for controllers to send to user and they take the input from Controllers and handle it accordingly. |
|./utils| Contains additional support utilities for the application. |

Tests are located in separate `./test` folder. They follow the same structure as the `./src` folder and each source file should contain it's pair in the test folder. 

## Database

Database is relatively simple. And since there is only a few simple requests needed, no ORM is planned as dependency. 
As a bit of an anti-pattern, our DB migrations are built-in, but we try to live with it. 

**Tables**

*Users*

| field | type | description |
|-------|------|-------------|
|uid   | string, primary key | this is unique id given to each user |
|username | string, unique | this is the username used for logging in, needs to be unique |
|password | string | combine with username and use it to login |
|name | string | gecos (full name suggested, up to user what to input) |
|email | string, unique | just so we can reset password or similar, mailinator etc. allowed |
|admin| boolean | simply marks if the user is admin (can manage user database) |
|locked | boolean | user is locked or not |
|deleted | boolean | if set to true, accound is deleted |
|created_on | timestamp | current timestamp on time of creation |

*Clients*

| field | type | description |
|-------|------|-------------|
| id    | string, primary key | unique id of the client |
| name  | string, unique | a name to identify the client | 
| redirect_uri  | string, unique | location where user is returned after authorization |
| secret | string | client secret used for Basic authentication with refresh token |

*Resources*

| field | type | description |
|-------|------|-------------|
| id    | string, primary key | unique id of the resource |
| name  | string, unique | a name to identify the resource |

*Codes*

| field | type | description |
|-------|------|-------------|
| id | serial, primary key | id of the code |
| user_uid | foreign_key (Users.uid) | reference to Users table |
| client_id | foreign_key (Clients.id) | reference to Clients table |
| resource_id | foreign_key (Resources.id) | references to Resources table |
| code | string, unique | code that was handed to client |
| code_challenge | string | must match code_verifier | 
| full_info | boolean | if true, also name & email is added to token |
| read_only | boolean | defines the value for the read_only attribute in the token |
| created_on | timestamp | used to clean up expired codes | 

*possibility for a settings-table is reserved for the future*

## Security

Basics:
- Passwords are hashed using bcrypt.
- All requests are logged, all database interactions are logged. 
- Requirements for passwords can be set via settings. 
- implements OAuth 2.0 / rfc 6749