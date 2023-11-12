# History Service

## Setting up the service locally
First, create a `.env` file directly under the `history-service` path.
The ``.env`` file should contain:
```
SERVICE_PORT=5400

DATABASE_URL=<REPLACE_WITH_SHARED_CLOUD_DATABASE_URL>
```

## Endpoint and usage

### `GET /history/api/health`

This endpoint helps ping the API server and the database connected to ensure it is working perfectly.

**Example**
```
GET http://localhost:5400/history/api/health
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

### `GET /history/api/history`
This endpoint is used to retrieve the attempted questions given a user id, or the users who attempted a given question. If only a specific history is needed, you can provide a pair of user id and a question id.

For a successful call, the endpoint requires at least a query parameter of user id or question id.

**Request**
```
GET /api/history?userId=<USER_ID1>&questionId=<QUESTION_ID>
```
Please note that multiple user ids and question ids are acceptable, with a maximum limit of 10 each.

**Example**
```
GET /api/history?userId=exampleUserId123
```
**Response**
```
status: 200 OK
{
    "count": 3,
    "data": [
        {
            "userId": "exampleUserId123",
            "questionId": "exampleQuestionId1",
            "question": {
                "title": "Reverse a String",
                "topics": ["STRING", "TWO POINTERS"],
                "complexity": "EASY"
            }
            "languages": ["C++", "PYTHON", "JAVA", "JAVASCRIPT"],
            "createdAt": "2023-10-19T14:04:14.203Z",
            "updatedAt": "2023-10-19T14:11:37.593Z"
        },
        {
            "userId": "exampleUserId123",
            "questionId": "exampleQuestionId2"
            ...
        },
        {
            "userId": "exampleUserId123",
            "questionId": "exampleQuestionId3"
            ...
        },
    ] 
}
```

**Example**
```
GET /api/history?questionId=exampleQuestionId1&questionId=exampleQuestionId2
```
**Response**
```
status: 200 OK
{
    "count": 2,
    "data": [
        {
            "userId": "exampleUserId123",
            "questionId": "exampleQuestionId1",
            "question": {
                "title": "Reverse a String",
                "topics": ["STRING", "TWO POINTERS"],
                "complexity": "EASY"
            }
            "languages": ["C++", "PYTHON", "JAVA", "JAVASCRIPT"],
            "createdAt": "2023-10-19T14:04:14.203Z",
            "updatedAt": "2023-10-19T14:11:37.593Z"
        },
        {
            "userId": "exampleUserId123",
            "questionId": "exampleQuestionId2"
            ...
        }
    ]
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 200 | The API server is connected to the database and is working |
| 400 | The request query parameter is missing, or is invalid |
| 401 | Unauthorized access, please login first |
| 404 | The given user id(s) or question id cannot be found |
| 500 | Server error, please see logs for detailed message |

### `GET /history/api/history/user/:userId/question/:questionId/code`

This endpoint retrieves the code submission history records based on the question that a user has attempted. It accepts a query parameter `language` to only filter code submission based on the specified language.

**Request**
```
GET /api/history/user/:userId/question/:questionId/code?language=<LANGUAGE>
```

**Example**
```
GET /api/history/user/exampleUserId123/question/exampleQuestionId1/code
```
**Response**
```
status: 200 OK
{
  "count": 2,
  "data": [
    {
      "code": "#include <iostream>\n#include <string>\n\nusing namespace std;\nstring reverseAString(const std::string& input) {\n    std::string reversed;\n    for (int i = input.length() - 1; i >= 0; i--) {\n        reversed += input[i];\n    }\n    return reversed;\n}",
      "language": "C++"
    },
    {
      "code": "def reverseAString(input_string):\n    reversed_string = input_string[::-1]\n    return reversed_string",
      "language": "PYTHON"
    }
  ]
}
```
**Example**
```
GET /api/history/user/exampleUserId123/question/exampleQuestionId1/code?language=PYTHON
```
**Response**
```
{
    "code": "def reverseAString(input_string):\n    reversed_string = input_string[::-1]\n    return reversed_string",
    "language": "PYTHON"
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 200 | The API server is connected to the database and is working |
| 400 | The request parameter(s) is invalid |
| 401 | Unauthorized access, please login first |
| 404 | The given user id(s) or question id cannot be found, or there is no code submission for the history yet |
| 500 | Server error, please see logs for detailed message |


### `POST /history/api/history`
This endpoint creates a user id and question id history to the database if there is no error.
**Request Body**
```
{
    userId: string | string[] (with max length of 2) 
    questionId: string
    language: string
    code: string
}
```
**Example**:
```
POST /api/history

Request Body:
{
    "userId": "exampleUserId789",
    "questionId": "exampleQuestionId456"
    "language": "C++",
    "code": "cout << "Hello World! << endl;"
}
```
**Response**
```
status: 201 Created
{
    "message": "History created successfully" 
}
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 201 | The history is created successfully |
| 400 | The request body is invalid, please refer to the error message for detailed information |
| 401 | Unauthorized access, please login first |
| 404 | The given user id(s) or question id cannot be found |
| 409 | Conflict as the history already exists |
| 500 | Server error, please see logs for detailed message |

### `PUT /history/api/history/user/:userId/question/:questionId/code`
This endpoint only supports updating code submission for a language that has already attempted before for the given same question. If you want to add new code with a new language, please use the `POST /api/history` endpoint instead.

**Request Body**
```
{
    "language": string
    "code": string
}
```
**Example**
```
PUT /api/history/user/exampleUserId123/question/exampleQuestionId1/code

{
    "language": "PYTHON",
    "code": "def reverseAString(input_string):\n    reversed_string = input_string[::-1]\n    return reversed_string"
}
```
**Response**
```
status: 204 NO CONTENT
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 200 | The API server is connected to the database and is working |
| 400 | The request body is invalid, see the error message for detailed information |
| 401 | Unauthorized access, please login first |
| 404 | The given user id(s) or question id cannot be found, or there is no code submission for the history yet |
| 500 | Server error, please see logs for detailed message |


### `DELETE /history/api/history/user/:userId/question/:questionId`
This endpoint allow deleting a history record.
**Example**:
```
DELETE /api/history/user/exampleUserId123/question/exampleQuestionId123
```
**Response**
```
status: 204 NO CONTENT
```

**Possible Status Code**
| Status Code | Explanation |
|-------------|-------------|
| 200 | The API server is connected to the database and is working |
| 400 | The request parameter(s) is invalid |
| 401 | Unauthorized access, please login first |
| 404 | The given user id(s) or question id cannot be found, or the history cannot be found |
| 500 | Server error, please see logs for detailed message |