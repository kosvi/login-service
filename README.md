# Login Service

- [Description](#project-description)
- [Specifications](#specifications)
- [API](#api)
- [Installation](#installation)
- [Environmental variables](#environmental-variables)

## Project description

This project is supposed to simply provide authentication service and provide JSONWebTokens for authenticated clients. 

![Sequence diagram](/docs/sequence-diagram.svg)

## Specifications

Specs are in their [own file](docs/specs.md). 

## API

Api-documentation is in it's [own file](docs/API.md). 

## Installation

TODO

## Environmental variables

App has following environmental variables and they can be set in `.env`.

|variable name| description | required | default value |
|-------------|-------------|----------|---------------|
|NODE_ENV     |informs the server about the enviroment it's currently running | no | production |
|DEBUG_MODE   | determines if debug lines are written on log and if stack traces are returned on error | no | false |
|DATABASE_URL | tell where to find database | **yes** | postgres://user:password@localhost:port/db |
|PORT         | set the port the server listens on | no | 3000 |
|SECRET       | secret that is used when signing JSON web tokens | **yes** | process.exit(2) |
|TOKEN_EXPIRE_TIME | tells how long the tokens are valid (in minutes) | no | 5 |
|FRONTEND_URL | location of frontend (for CORS) | no | |

**Password settings**
|variable name| description | value type | default value |
|-------------|-------------|------------|---------------|
|PASSWORD_MIN_LENGTH| sets the minimum length required from a password | int | 10 |
|PASSWORD_REQUIRE_BOTH_CASES | sets the requirement for passwords to contain at least one lowercase and uppercase letter | boolean | true |
|PASSWORD_REQUIRE_SPECIAL_CHARACTER | sets the requirement for password to contain special character | boolean | true |
|PASSWORD_REQUIRE_NO_EASY | checks passwords against the list of most common passwords (by OWASP) | boolean | true |

