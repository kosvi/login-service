# Login Service

- [Description](#project-description)
- [Technologies](#used-technologies)
- [Repository structure](#repository-structure)
- [Database](#database)
- [Environmental variables](#environmental-variables)

## Project description

This project is supposed to simply provide authentication service and provide JSONWebTokens for authenticated clients. 

## Used technologies

Main goal is to provide a simple authentication server. To achieve this, dependencies are tried to keep as minimal as possible. Project does not use Express.js! Database will be Postgres, no others supported. 

## Repository structure

Source code of the project is located in `./src`. It is organized in the following structure. 

| path | description |
|------|-------------|
|app.js| Contains the main server that is used to fire up the application. |
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
| created_on | timestamp | current timestamp on time of creation |

*possibility for a settings-table is reserver for the future*

## Environmental variables

App has following environmental variables and they can be set in `.env`.

|variable name| description | required | default value |
|-------------|-------------|----------|---------------|
|NODE_ENV     |informs the server about the enviroment it's currently running | no | production |
|DATABASE_URL | tell where to find database | **yes** | postgres://user:password@localhost:port/db |
|PORT         | set the port the server listens on | no | 3000 |
