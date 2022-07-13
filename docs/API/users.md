### users

POST `/users`

```
{
  "username": "<username>",
  "password": "<password>",
  "name": "<full name>",
  "email": "<email>"
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
  "deleted": boolean
}
```


### users id

**Success**

GET `/users/:id`

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
  "deleted": boolean,
  "created_on": "<date-in-iso-format>"
}
```

**Success**

PUT `/users/:id`

```
{
  "username": "<username>",
  "password": "<password>",
  "name": "<full name>",
  "email": "<email>",
  "stealth": boolean
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
  "deleted": boolean
}
```

**Success**

PATCH `/users/:id`

```
{
  "password": "<password>",
  "newPassword": "<newPassword>"
}
```

Status 204

**Success**

DELETE `/users/:id`

Status 204
