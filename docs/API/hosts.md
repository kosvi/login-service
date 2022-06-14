### hosts

**Success**

GET `/hosts`

Status 200

```
[
  {
    "id": "<number>",
    "name": "<string>",
    "host": "http://host.example.com:<port>",
    "trusted": "<boolean>"
  },
  {
    "id": "<number>",
    "name": "<string>",
    "host": "https://host2.example.com",
    "trusted": "<boolean>"
  }
]
```

POST `/hosts`

```
{
  "name": "<string>",
  "host": "https://foo.example.com",
  "trusted": "<boolean>"
}
```

Status 201

```
{
  "id": "<number>",
  "name": "<string>",
  "host": "https://foo.example.com",
  "trusted": "<boolean>"
}
```

### hosts id

**Success**

PUT `/hosts/:id`

```
{
  "name": "<string>",
  "host": "http://www.example.com",
  "trusted": "<boolean>"
}
```

Status 200

```
  "id": "<id>"
  "name": "<string>",
  "host": "http://www.example.com",
  "trusted": "<boolean>"
```

DELETE `/hosts/:id`

Status 204
