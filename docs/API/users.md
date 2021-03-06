### user me

**Success**

GET `/users/me`

Status 200

```
{
  "uid": "<uid>",
  "username": "<username>",
  "name": "<name>",
  "email": "<email>",
  "admin": boolean,
  "locked": boolean,
  "stealth": boolean,
  "created_on": "<date-in-iso-format>"
}
```

### user save

**Success**

POST / PUT (*) `/users/save`

```
{
  "username": "<username>",
  "password": "<password>",
  "name": "<full name>",
  "email": "<email>",
  "stealth"?: boolean
}
```

Status 201

```
{
  "uid": "<uid>",
  "username": "<username>",
  "name": "<name>",
  "email": "<email>",
  "admin": boolean,
  "locked": boolean,
  "stealth": boolean,
  "created_on": "<date-in-iso-format>"
}
```
(*) POST creates a new user on server, PUT updates existing user \
? = this is required only on PUT-request

### user password

**Success**

PATCH `/users/password`

```
{
  "password": "<password>",
  "newPassword": "<newPassword>"
}
```

Status 204