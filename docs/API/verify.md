### verify

**Success**

GET `/verify`

Status 200

```
{
  "uid": "<uid>",
  "username": "<username>",
  "name"?: "<full name>",
  "email"?: "<email>",
  "expires": number
}
```
? = this attribute is not set if user is in stealth mode
