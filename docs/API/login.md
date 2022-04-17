### login

**Success** 

POST `/login`

```
{
  "username": "<username>",
  "password": "<password>"
}
```

Status 200

```
{
  "token": "<token>",
  "content": {
    "uid": "<uid>",
    "username": "<username>",
    "name"?: "<full name>",
    "email"?: "<email>",
    "expires": number
  }
}
```
? = this attribute is not set if user is in stealth mode

