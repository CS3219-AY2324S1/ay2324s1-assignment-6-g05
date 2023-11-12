# User Service

## Quick Navigation

- [User Service](#user-service)
  - [Quick Navigation](#quick-navigation)
  - [Set up](#set-up)
  - [Running the service](#running-the-service)
  - [Endpoint and usage](#endpoint-and-usage)
    - [`GET /user/api/health`](#get-userapihealth)
    - [`GET /user/api/users/:userId`](#get-userapiusersuserid)
    - [`GET /user/api/users/email`](#get-userapiusersemail)
    - [`GET /user/api/users/:userId/preferences`](#get-userapiusersuseridpreferences)
    - [`POST /user/api/users`](#post-userapiusers)
    - [`PUT /user/api/users/:userId`](#put-userapiusersuserid)
    - [`DELETE /user/api/users/:userId`](#delete-userapiusersuserid)
    - [`PUT /user/api/users/:userId/preferences`](#put-userapiusersuseridpreferences)

## Set up

To set up `user-service` locally, we will need to create a `.env` file directly under `/user-service`. Ensure that you have all the environmental variables listed below:

```sh
SERVICE_PORT=5005
NODE_ENV=development
LOG_LEVEL=debug
DATABASE_URL=<COPY_DATABASE_URL_FROM_ENV_FILE_SECRETS>
```

## Running the service

To run the user service locally, run `npm run dev` directly under the `/user-service` directory.

There are multiple API endpoints available, you may find the detailed documentation of each endpoint in below section.

**IMPORTANT:** All the user service endpoints, other than [`GET /user/api/health`](#get-userapihealth) are protected, which means that they require a valid JWT token embedded inside a HTTP-Only cookie within the request header. To authenticate yourself, please refer to the [`README.md`](#https://github.com/CS3219-AY2324S1/ay2324s1-course-assessment-g05/tree/update-user-and-question-readme/backend/auth-service#authentication-service) under `../auth-service`.

## Endpoint and usage

### `GET /user/api/health`

This endpoint helps ping the API server and the database connected to ensure it is working perfectly.

**Example**

```
GET http://localhost:5005/user/api/health
```

**Response**

```
status: 200 OK
{
  message: "Healthy"
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 200 | The API server is connected to the database and is working. |
| 500 | The API server/database ran into a problem |

### `GET /user/api/users/:userId`

This endpoint returns the user information with the specific user id `userId` from the database. If you don't know about the `userId` yet, please use the `getUserByEmail` endpoint.

**Example**:

```
GET http://localhost:5005/user/api/users/clmlp93wz00007kbwvws8oynd
```

**Response**:

```
Status: 200 OK

Response Body:
{
  "id": "clmlp93wz00007kbwvws8oynd",
  "name": "Your Name",
  "email": "youremail@domain.com",
  "role": "USER",
  "image": "http://your-image.png",
  "bio": "Your Bio",
  "gender": "MALE",
  "createdOn": "2023-10-17T15:30:30.751Z",
  "updatedOn": "2023-10-27T09:31:02.105Z",
  "isVerified": true,
  "preferences": {
    "languages": [
      "C++"
    ],
    "topics": [
      "DYNAMIC PROGRAMMING"
    ],
    "difficulties": [
      "MEDIUM",
      "EASY"
    ]
  }
}
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|200|Successful retrieving user data from the database|
|401|You are not authorized yet, login first|
|404|The given user id cannot be found|
|500|Server error, please see log message for details|

### `GET /user/api/users/email`

This endpoint returns the user information based on the user email provided in the query parameter. The `email` query parameter must exist.

**Example**:

```
GET http://localhost:5005/user/api/users/email?email=youremail@domain.com
```

**Response**:

```
Status: 200 OK

Response Body:
{
  "id": "clmlp93wz00007kbwvws8oynd",
  "name": "Your Name",
  "email": "youremail@domain.com",
  "role": "USER",
  "image": "http://your-image.png",
  "bio": "Your Bio",
  "gender": "MALE",
  "createdOn": "2023-10-17T15:30:30.751Z",
  "updatedOn": "2023-10-27T09:31:02.105Z",
  "isVerified": true,
  "preferences": {
    "languages": [
      "C++"
    ],
    "topics": [
      "DYNAMIC PROGRAMMING"
    ],
    "difficulties": [
      "MEDIUM",
      "EASY"
    ]
  }
}
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|200|Successful retrieving user data from the database|
|400|The given user email is invalid|
|401|You are not authorized yet, login first|
|404|The given user email cannot be found|
|500|Server error, please see log message for details|

### `GET /user/api/users/:userId/preferences`

This endpoint only returns the preferences set by the user with `userId`.

**Example**

```
GET http://localhost:5005/user/api/users/clmlp93wz00007kbwvws8oynd/preferences
```

**Response**

```
{
  "userId": "clmlp93wz00007kbwvws8oynd",
  "languages": [
    "C++"
  ],
  "topics": [
    "DYNAMIC PROGRAMMING"
  ],
  "difficulties": [
    "MEDIUM",
    "EASY"
  ]
}
```

**Possible Response Status Code**
|Status Code|Explanation|
|---|---|
|200|Successful retrieving user data from the database|
|401|You are not authorized yet, login first|
|404|The given user id cannot be found|
|500|Server error, please see log message for details|

### `POST /user/api/users`

This endpoint allows creating a new user given some necessary information like `name`, `email`, and `role` in the request body.

**Request Body format**
| Property | Type | Description |
|----------|------|-------------|
| name | string | The name of the user |
| email | string | The email of the user, must be unique |
| password | string | The hashed password set by the user |
| role | Role | The role of the user, either "user" or "admin" |
| image | string | The url of the profile image, optional |
| gender | Gender | The gender of the user, either "male", "female", or "other", optional, default as "other" |
| bio | string | The bio of the user, optional |
| verificationToken | string | The verification token issued by auth service |

**Example**

```
POST  http://localhost:5005/user/api/users

Request Body:
{
  "name": "Your Name",
  "email": "Your email",
  "password": "hashed_password",
  "role": "user"
  "verificationToken": "VERIFICATION_TOKEN_GENERATED_BY_AUTH",
}
```

**Response**:

```
Status: 201 Created

Response Body:
{
  "id": "NEW_USER_ID_GENERATED",
  "email": "Your email",
  "message": "User created."
}
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|201|Successfully created a new user|
|400|The given request body is invalid|
|401|You are not authorized yet. This endpoint is intended to only come from auth service|
|409|The input user email is already taken|
|500|Server error, please see log message for details|

### `PUT /user/api/users/:userId`

This endpoint updates the user information according to the request body provided.

**Request Body format**
| Property | Type | Description |
|----------|------|-------------|
| name | string | The name of the user, optional |
| email | string | The email of the user, must be unique, optional |
| password | string | The hashed password set by the user, optional |
| role | Role | The role of the user, either "user" or "admin", optional |
| image | string | The url of the profile image, optional |
| gender | Gender | The gender of the user, either "male", "female", or "other", optional |
| bio | string | The bio of the user, optional |

**Request**:

```
PUT http://localhost:5000/user/api/users/clmlp93wz00007kbwvws8oynd

Request Body:
{
    "name": "Your Updated Name",
    "email": "yourupdatedemail@domain.com",
    "role": "admin",
    "image": "https://testimage.com/image.png",
    "gender": "male",
    "bio": "Hello World! I just updated my user profile."
}
```

**Response**:

```
Status: 204 No Content

No response body.
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|204|Successfully updated the user information|
|400|The given request body is invalid|
|401|You are not authorized yet, login first|
|404|The given user id cannot be found in the database|
|409|The user email is already taken|
|500|Server error, please see log message for details|

### `DELETE /user/api/users/:userId`

This endpoint deletes user record from the database, be cautious when you are using this endpoint.

**Request**:

```
DELETE http://localhost:5005/user/api/users/clmlp93wz00007kbwvws8oynd
```

**Response**:

```
Status: 204 No Content

No response body.
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|204|Successfully deleted the user record in the database|
|401|You are not authorized yet, login first|
|404|The given user id cannot be found in the database|
|500|Server error, please see log message for details|

### `PUT /user/api/users/:userId/preferences`

This endpoint updates the user preferences, provided that there already have a preferences record in the database.

**Request Body Format**:
| Property | Type | Description |
| -------- | ---- | ----------- |
| languages | Array<Language> | Each language provided must be either "C++", "Python", "Java", or "JavaScript", optional |
| difficulties | Array<Complexity> | Each complexity provided must be either "Easy", "Medium", or "Hard", optional |
| topics | Array<Topic> | Each topic provided must be one of the topics recognised by the question service, for information about which topic is supported, see question service topics list, optional |

Take note that although each field can be omitted, at least one field need to be provided for a successful call.

**Request**:

```
PUT http://localhost:5005/user/api/users/clmlp93wz00007kbwvws8oynd/preferences

Request Body:
{
  "languages": ["Python", "C++", "Java"],
  "difficulties": ["Hard"],
  "topics": ["Brain Teaser"]
}
```

**Response**:

```
Status: 204 No Content

No response body.
```

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|204|Successfully updated the user record in the database|
|401|You are not authorized yet, login first|
|404|The given user id does not exist, or there is no existing preferences with the user id.|
|500|Server error, please see log message for details|
