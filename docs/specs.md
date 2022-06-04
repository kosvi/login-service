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
| 6  | client service | as a service, I want to easily authenticate users so that I know who is accessing my service. |
| 7  | admin | as an admin, I want to be able to delete/lock users if needed. |
| 8  | admin | as an admin, I want to be able to manage sites allowed to use this login-service so that only trusted sites can authenticate our users. |

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
| password| string | combine with username and use it to login |
|name | string | gecos (full name suggested, up to user what to input) |
|email | string, unique | just so we can reset password or similar, mailinator etc. allowed |
|admin| boolean | simply marks if the user is admin (can manage user database) |
|locked | boolean | user is locked or not |
|stealth | boolean | affects the information added to tokens |
|deleted | boolean | if set to true, accound is deleted |
| created_on | timestamp | current timestamp on time of creation |

*whitelist*

| field | type | description |
|-------|------|-------------|
| id    | serial, primary key | id of the whitelisted host |
| name  | string, unique | a name to identify the whitelisted site | 
| host  | string, unique | a host(:port) that is whitelisted to allow requests to this login-service |
| trusted(*) | boolean | if false, only allowed methods are: OPTIONS and POST. Else will also allow GET, PUT, PATCH and DELETE. | 

(*) setting this to false does NOT provide any additional security. It simply limits the features available on whitelisted site to "register" and "login". 

*possibility for a settings-table is reserved for the future*

## Security

Basics:
- Passwords are hashed using bcrypt.
- All requests are logged, all database interactions are logged. 
- Requirements for passwords can be set via settings. 

**Brute force** \
This is an issue that needs to be solved. Possible solution is adding delay when suspecting abuse and finally stop responding for a period of time. 
