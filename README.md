# Login Service

## Project description

This project is supposed to simply provide authentication service and provide JSONWebTokens for authenticated clients. 

## Used technologies

Main goal is to provide a simple authentication server. To achieve this, dependencies are tried to keep as minimal as possible. Project does not use Express.js and dotenv is not used, so please edit `./src/utils/config.ts` directly if needed. For now there is no decision made about the database, but it will most likely be Postgres. 

## Project structure

Source code of the project is located in `./src`. It is organized in the following structure. 

| path | description |
|------|-------------|
|app.js| Contains the main server that is used to fire up the application. |
|./controllers| Contains a single Controller class in every file. Controllers handle requests and send responses. |
|./services | Services are used to handle the main business logic. They provide data for controllers to send to user and they take the input from Controllers and handle it correctly. |
|./utils| Contains additional support utilities for the application. |

Tests are located in separate `./test` folder. They follow the same structure as the `./src` folder and each source file should contain it's pair in the test folder. 
