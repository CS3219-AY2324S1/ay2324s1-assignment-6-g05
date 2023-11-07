# Authentication Service

## Quick Navigation

- [Authentication Service](#authentication-service)
  - [Quick Navigation](#quick-navigation)
  - [Set up](#set-up)
  - [Running the service](#running-the-service)
  - [Endpoint and usage](#endpoint-and-usage)
    - [`GET /auth/api/health`](#get-authapihealth)
    - [`GET /auth/api/verifyResetPasswordLinkValidity/:userId/:token`](#get-authapiverifyresetpasswordlinkvalidityuseridtoken)
    - [`POST /auth/api/registerByEmail`](#post-authapiregisterbyemail)
    - [`POST /auth/api/loginByEmail`](#post-authapiloginbyemail)
    - [`POST /auth/api/logout`](#post-authapilogout)
    - [`POST /auth/api/validate`](#post-authapivalidate)
    - [`POST /auth/api/validateAdmin`](#post-authapivalidateadmin)
    - [`PUT /auth/api/verifyEmail/:email/:token`](#put-authapiverifyemailemailtoken)
    - [`PUT /auth/api/resendVerificationEmail/:email/`](#put-authapiresendverificationemailemail)
    - [`PUT /auth/api/sendPasswordResetEmail/:email`](#put-authapisendpasswordresetemailemail)
    - [`PUT /auth/api/changePassword/:id`](#put-authapichangepasswordid)

## Set up

To set up `auth-service` locally, first create a `.env` file directly under `/auth-service`. Ensure that your `.env` file contains all the environmental variables listed below:

```sh
SERVICE_PORT=5050

JWT_SECRET=<COPY_JWT_SECRET_FROM_ENV_FILE_SECRETS>
EMAIL_VERIFICATION_SECRET=<COPY_EMAIL_VERIFICATION_SECRET_FROM_ENV_FILE_SECRETS>
EMAIL_RESET_SECRET=<COPY_EMAIL_RESET_SECRET_FROM_ENV_FILE_SECRETS>

NM_MAIL="peerprep01@gmail.com"
NM_PASS=<COPY_NM_PASS_FROM_ENV_FILE_SECRETS>
DATABASE_URL=<COPY_DATABASE_URL_FROM_ENV_FILE_SECRETS>
```

## Running the service

To run the auth service locally, first run `npm i` directly under the `/auth-service` directory to install the relevant dependencies. Then, run `npm run dev` in the same directory.

There are multiple API endpoints available, you may find the detailed documentation of each endpoint in the below section.

## Endpoint and usage

### `GET /auth/api/health`

This endpoint helps ping the API server and the database connected to ensure it is working perfectly.

**Example**

```
GET http://localhost:5050/auth/api/health
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
| 200 | The API server is connected to the database and is working |
| 500 | The API server/database ran into a problem |

### `GET /auth/api/verifyResetPasswordLinkValidity/:userId/:token`

This endpoint helps to verify that the reset password link is valid for the certain user.

**Example**

```
GET http://localhost:5050/auth/api/verifyResetPasswordLinkValidity/cln7j90c3000125d0t5jl69jw/randomtoken
```

**Response**

```
status: 403 FORBIDDEN
{
    "error": "FORBIDDEN",
    "message": "This reset password link is invalid."
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 200 | The reset password link is valid |
| 403 | The reset passsword link is invalid |

### `POST /auth/api/registerByEmail`

This endpoint is used to register a new user by email.

Note that in our implementation, the password should be hashed in the frontend before sending to this endpoint. Therefore, even though a new user can be created using this endpoint directly, this password cannot be used to log in the user through the endpoint [`POST /auth/api/loginByEmail`](#post-authapiloginbyemail), as the password will not pass our validity check.

**IMPORTANT:** This endpoint will call the user service internally. Therefore, make sure that the user service is running before calling this endpoint, else the server will always return error code 500.

**Request Body Format**
| Property | Type | Description |
|----------|------|-------------|
| email | string | The email of the user, must be unique |
| name | string | The name of the user |
| password | string | The hashed password set by the user |
| role | Role | The role of the user, either "user" or "admin" |

**Request**

```
PUT http://localhost:5050/auth/api/registerByEmail

Request Body:
{
    "email": "newuser@mail.com",
    "password": "password",
    "name": "new user",
    "role": "user"
}
```

**Response**

```
status: 201 Created
{
    "success": true,
    "userId": "clofmzchr000025820o6r4ujr"
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 201 | The user was registered successfully |
| 400 | The given request body is invalid |
| 409 | The given user email is already taken |
| 500 | The user service is not running |

### `POST /auth/api/loginByEmail`

This endpoint is used to log in a user by email. After calling this endpoint, a HTTP-Only cookie containing a JWT token will be attached to the response header, which will authenticate the user for subsequent endpoint calls that require user authentication.

Note that in our implementation, the password should be hashed in the frontend before sending to this endpoint. Therefore, even though a new user can be created using the endpoint [`POST /auth/api/registerByEmail`](#post-authapiregisterbyemail) directly, the password used to register cannot be used to log in the user through this endpoint, as the password will not pass our validity check.

**Request Body Format**
| Property | Type | Description |
|----------|------|-------------|
| email | string | The email of the user |
| password | string | The hashed password set by the user |

**Request**

```
PUT http://localhost:5050/auth/api/registerByEmail

Request Body:
{
    "email":"userguide@mail.com",
    "password": "password"
}
```

**Response**

```
status: 200 OK
{
    "success": true,
    "user": {
        "id": "cloft82xl000025vfzvj9s9rm",
        "name": "user guide",
        "email": "userguide@mail.com",
        "isVerified": true,
        "role": "USER",
        "gender": null,
        "bio": null,
        "image": null,
        "createdOn": "2023-11-01T13:45:00.633Z",
        "updatedOn": "2023-11-01T13:45:00.633Z",
        "preferences": {
            "languages": [],
            "topics": [],
            "difficulties": []
        }
    }
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 200 | The user was logged in successfully |
| 400 | The given request body is invalid |
| 401 | The password is incorrect |
| 403 | The user is not verified yet |
| 404 | The user does not exist |
| 500 | Server error, please see log message for details |

### `POST /auth/api/logout`

This endpoint is used to log out a user. After calling this endpoint, the HTTP-Only cookie containing the JWT token will be removed from the response header.

**Example**

```
PUT http://localhost:5050/auth/api/logout
```

**Response**

```
status: 200 OK
{
    "success": true
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 200 | The user was logged out successfully |

### `POST /auth/api/validate`

This endpoint is used to authenticate a user. A user is considered authenticated if the request header contains a HTTP-Only cookie with a valid JWT token.

**Example**

```
PUT http://localhost:5050/auth/api/validate
```

**Response**

```
status: 200 OK
{
    "success": true,
    "user": {
        "id": "cloft82xl000025vfzvj9s9rm",
        "name": "user guide",
        "email": "userguide@mail.com",
        "isVerified": true,
        "role": "USER",
        "gender": null,
        "bio": null,
        "image": null,
        "createdOn": "2023-11-01T13:45:00.633Z",
        "updatedOn": "2023-11-01T16:54:50.964Z",
        "preferences": {
            "languages": [],
            "topics": [],
            "difficulties": []
        }
    }
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 200 | The user is authenticated |
| 401 | The user is unauthorised |
| 500 | The user database is down

### `POST /auth/api/validateAdmin`

This endpoint is used to authenticate an admin. An admin is considered authenticated if the request header contains a HTTP-Only cookie with a valid JWT token and the user it corresponds to is an admin.

**Example**

```
PUT http://localhost:5050/auth/api/validateAdmin
```

**Response**

```
status: 200 OK
{
    "success": true,
    "user": {
        "id": "cln60zb8q000025be8w0gm1dp",
        "name": "admin ",
        "email": "admin@email.com",
        "isVerified": true,
        "role": "ADMIN",
        "gender": null,
        "bio": null,
        "image": null,
        "createdOn": "2023-09-30T12:44:44.330Z",
        "updatedOn": "2023-09-30T12:45:04.769Z",
        "preferences": {
            "languages": [],
            "topics": [],
            "difficulties": []
        }
    }
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 200 | The admin is authenticated |
| 401 | The user is unauthorised |
| 403 | The user is not an admin |
| 500 | The user database is down

### `PUT /auth/api/verifyEmail/:email/:token`

This endpoint is used to verify a user's email using the token they received in the verification mail sent to this email.

**IMPORTANT:** This endpoint will call the user service internally. Therefore, make sure that the user service is running before calling this endpoint, else the server will always return error code 500.

**Example**

```
PUT http://localhost:5050/auth/api/verifyEmail/userguide@mail.com/token

```

**Response**

```
status: 400 Bad Request
{
    "error": "BAD REQUEST",
    "message": "Email verification failed."
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 204 | The user was verified successfully |
| 404 | The user with this email cannot be found |
| 400 | The token is invalid |
| 500 | Server error, please see log message for details |

### `PUT /auth/api/resendVerificationEmail/:email`

This endpoint is used to resend a verification email to the user's email and update the user's record in the database with a verification token that will be used to verify the validity of this link.

**IMPORTANT:** This endpoint will call the user service internally. Therefore, make sure that the user service is running before calling this endpoint, else the server will always return error code 500.

**Example**

```
PUT http://localhost:5050/auth/api/resendVerificationEmail/userguide@mail.com
```

**Response**

```
status: 409 Conflict
{
    "error": "CONFLICT",
    "message": "User with email userguide@mail.com is already verified."
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 204 | The email was sent successfully |
| 404 | The user with this email cannot be found |
| 409 | The user with this email is already verified |
| 500 | Server error, please see log message for details |

### `PUT /auth/api/sendPasswordResetEmail/:email`

This endpoint is used to send a password reset link to the user's email and update the user's record in the database with a password reset token that will be used to verify the validity of this link.

**IMPORTANT:** This endpoint will call the user service internally. Therefore, make sure that the user service is running before calling this endpoint, else the server will always return error code 500.

**Example**

```
PUT http://localhost:5050/auth/api/sendPasswordResetEmail/userguide@mail.com
```

**Response**

```
status: 204 No Content
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 204 | The email was sent successfully |
| 404 | The user with this email cannot be found |
| 500 | Server error, please see log message for details |

### `PUT /auth/api/changePassword/:id`

This endpoint is used to change the password of the user. There are 2 use cases for this endpoint:

Case 1. User who is logged in is trying to change their password

Case 2. User who is not logged in is trying to change their password by using the password reset link.

Note that in our implementation, the password should be hashed in the frontend before sending to this endpoint. Therefore, even though a new password can be set through this endpoint, this password cannot be used to log in the user through the endpoint [`POST /auth/api/loginByEmail`](#post-authapiloginbyemail), as the password will not pass our validity check.

**IMPORTANT:** This endpoint will call the user service internally. Therefore, make sure that the user service is running before calling this endpoint, else the server will always return error code 500.

**Request Body Format**
| Property | Type | Description |
|----------|------|-------------|
| token | string | The password reset token from the password reset link (necessary for Case 2) |
| oldPassword | string | The user's original unhashed password (necessary for Case 1) |
| hashedNewPassword | string | The new hashed password set by the user (necessary for Case 1 and 2) |

**Request (Case 1)**

```
PUT http://localhost:5050/auth/api/changePassword/cloft82xl000025vfzvj9s9rm

Request Body:
{
    "oldPassword": "password",
    "hashedNewPassword": "hashedPassword"
}
```

**Response**

```
status: 204 No Content
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 204 | The password was reset successfully |
| 400 | The given request body is invalid |
| 403 | Case 1: The old password is wrong. Case 2: The reset password link is invalid |
| 404 | The user with this id cannot be found |
| 500 | Server error, please see log message for details |
