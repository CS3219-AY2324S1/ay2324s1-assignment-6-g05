# Question Service

## Quick Navigation

- [Setting up the service locally](#setting-up-the-service-locally)
- [Running the service](#running-the-service)
- [Endpoint and usage](#endpoint-and-usage)
  - [`GET /question/api/health`](#get-questionapihealth)
  - [`GET /question/api/questions`](#get-questionapiquestions)
  - [`GET /question/api/questions/:questionId`](#get-questionapiquestionsquestionid)
  - [`GET /question/api/topics`](#get-questionapitopics)
  - [`POST /question/api/questions`](#post-questionapiquestions)
  - [`PUT /question/api/questions/:questionId`](#put-questionapiquestionsquestionid)
  - [`DELETE /question/api/questions/:questionId`](#delete-questionapiquestionsquestionid)

## Setting up the service locally

To run the service locally, first create a `.env` file directly under the `question-service` path. Ensure that your `.env` file contains all the environmental variables listed below:

```
SERVICE_PORT=5100
DATABASE_URL=<REPLACE_WITH_THE_DATABASE_URL_IN_ENV_FILE_SECRETS>
```

If you are running the question service for testing Assignment 1, kindly add an additional variable here:

```
CONNECTION_STRING=<REPLACE_WITH_MONGO_URL_IN_ENV_FILE_SECRET>
```

**IMPORTANT:** All the question service endpoints, other than [`GET /question/api/health`](#get-questionapihealth) are protected, which means that they require a valid JWT token embedded inside a HTTP-Only cookie within the request header. To authenticate yourself, please refer to the [`README.md`](#https://github.com/CS3219-AY2324S1/ay2324s1-course-assessment-g05/tree/update-user-and-question-readme/backend/auth-service#authentication-service) under `../auth-service`. Additionally, for `POST`, `PUT` and `DELETE` endpoints, the authenticated user needs to be an `ADMIN`.

## Running the service

To run the service, do the following command in the `question-service` path:

```bash
npm run dev
```

You may also build the docker image using the following command:

```bash
docker build --tag question-service .
```

## Endpoint and usage

### `GET /question/api/health`

This endpoint helps ping the API server and the database connected to ensure it is working perfectly.

**Example**

```
GET http://localhost:5100/question/api/health
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

### `GET /question/api/questions`

This question returns all the questions available in the storage. The detailed question information will be omitted.

It is possible to provide filters to filter only desired questions by providing query paramters. The supported query parameters include:
| Query Parameter | Type | Description |
| --------------- | ---- | ----------- |
| topic | Topic | Must be one of the valid topic listed in `getTopics` endpoint |
| complexity | Complexity | Must be one of the valid complexity, either "Easy", "Medium", or "Hard" |

**Example**

```
GET http://localhost:5100/question/api/questions
```

**Response**

```
status: 200 OK
{
    "count": 3,
    "data": [
        {
            "questionId": "exampleQuestionId1",
            "title": "Question 1",
            "complexity": "Easy",
            "topics": [
                "HASH TABLE",
                "STRING",
            ],
        },
        {
            "quesetionId": "exampleQuestionId2",
            "title": "Question 2",
            "complexity": "Medium",
            "topics": [
                "GRAPH",
                "DEPTH-FIRST SEARCH"
            ]
        },
        {
            "questionId": "exampleQuestionId3",
            "title": "Question 3",
            "complexity": "Hard",
            "topics": [
                "BRAIN TEASER"
            ]
        }
    ]
}
```

**Possible Status Code**
| Status Code | Explanation |
| ----------- | ----------- |
| 200 | Successful retrieving questions |
| 400 | The query parameters provided are invalid |
| 401 | Unauthorized access, login first |
| 404 | No questions found |
| 500 | Server error, please see log message for details|

### `GET /question/api/questions/:questionId`

This endpoint returns the specific question with the `questionId` in detail.

**Example**

```
GET http://localhost:5100/question/api/questions/exampleQuestionId1
```

**Response**

```
status: 200 OK
{
    "questionId": "exampleQuestionId1",
    "title": "Question 1",
    "complexity": "Easy",
    "topics": [
        "HASH TABLE",
        "STRING",
    ],
    "description": "Question description",
    "url": "http://link-to-the-question-source",
    "author": "The author of the question",
    "constraints": [
        "Question constraint 1"
    ],
    "examples": [
        {
            "input": "Example input",
            "output": "Example output",
            "explanation": "Example explanation"
        }
    ],
    "createdOn": "date-time-of-creation",
    "updatedOn": "date-time-of-update"
}
```

**Possible Status Code**
| Status Code | Explanation |
| ----------- | ----------- |
| 200 | Successful retrieving the question |
| 401 | Unauthorized access, login first |
| 404 | No such question found |
| 500 | Server error, please see log message for details|

### `GET /question/api/topics`

This endpoint returns all the topics available for the question, any topic provided out of this list will result in an error.

**Example**

```
GET http://localhost:5100/question/api/topics
```

**Response**

```
{
    "topics": [
        "ARRAY",
        "STRING",
        "HASH TABLE",
        "MATH",
        "DYNAMIC PROGRAMMING",
        "SORTING",
        "GREEDY",
        "DEPTH-FIRST SEARCH",
        "BINARY SEARCH",
        "DATABASE",
        "BREADTH-FIRST SEARCH",
        "TREE",
        "MATRIX",
        "TWO POINTERS",
        "BINARY TREE",
        "BIT MANIPULATION",
        "HEAP (PRIORITY QUEUE)",
        "STACK",
        "PREFIX SUM",
        "GRAPH",
        "BACKTRACKING",
        "SLIDING WINDOW",
        "UNION FIND",
        "LINKED LIST",
        "TRIE",
        "RECURSION",
        "DIVIDE AND CONQUER",
        "QUEUE",
        "MEMOIZATION",
        "TOPOLOGICAL SORT",
        "QUICKSELECT",
        "BRAIN TEASER"
    ]
}
```

**Possible Status Code**
| Status Code | Explanation |
| ----------- | ----------- |
| 200 | Successful retrieving questions |
| 500 | Server error, please see log message for details|

### `POST /question/api/questions`

This endpoint allows creation of a new question, provided that the request body are valid.

Please note that only user with `ADMIN` role can create a new question.

**Request Body Format**
| Property | Type | Description |
| -------- | ---- | ----------- |
| title | string | The name of the question, must be unique |
| complexity | Complexity | Must be either "Easy", "Medium", or "Hard" |
| topics | Array<Topic> | Must be either one of the available topics listed in the `getTopics` endpoint |
| description | string | The description of the question |
| author | string | The author of the question |
| url | string | The reference question link url |
| constraints | Array<string> | The constraint applied to the question, for example, `0 <= a <= 10^6` |
| examples | Array<Example> | The input output example of the question, if any. See below additional notes on how to construct a valid example |

The structure of the `Example`:
| Property | Type | Description |
| -------- | ---- | ----------- |
| input | string | The input for a question test case |
| output | string | The expected output of the corresponding input test case |
| explanation | string | The explanation of the intended behaviour, optional |

**Example**

```
POST http://localhost:5100/question/api/questions

{
    "title": "Question Title",
    "description": "The description of the question.",
    "complexity": "Medium",
    "topics": ["String"],
    "url": "http://link-to-the-question-source.com",
    "author": "Question Author",
    "constraints": [
        "1 <= a <= 1000"
    ],
    "examples": [
        {
            "input": "a = 10",
            "output": "100",
            "explanation": "A simple example of a code behaviour that multiply the input by 10."
        }
    ]
}
```

**Response**

```
status: 201 Created

{
    "message": "Question Created."
}
```

**Possible Status Code**
| Status Code | Explanation |
| ----------- | ----------- |
| 201 | Successfully create the question |
| 400 | The request body is invalid, see the error message for details |
| 403 | The user calling this endpoint does not have `ADMIN` access |
| 409 | The question title conflicts with other existing questions |
| 500 | Server error, please see log message for details|

### `PUT /question/api/questions/:questionId`

This endpoint updates the existing question with the `questionId`.

Please note that only user with `ADMIN` access can update the question.

**Response Body Format**
| Property | Type | Description |
| -------- | ---- | ----------- |
| title | string | The name of the question, must be unique, optional |
| complexity | Complexity | Must be either "Easy", "Medium", or "Hard", optional |
| topics | Array<Topic> | Must be either one of the available topics listed in the `getTopics` endpoint |
| description | string | The description of the question, optional |
| author | string | The author of the question, optional |
| url | string | The reference question link url, optional |
| constraints | Array<string> | The constraint applied to the question, for example, `0 <= a <= 10^6`, optional |
| examples | Array<Example> | The input output example of the question, if any. See `postQuestion` endpoint details on how to construct a valid example, optional |

**Example**

```
PUT http://localhost:5100/question/api/questions/exampleQuestionId1

{
    "title": "New Question Title",
    "description": "The updated description of the question.",
    "complexity": "Hard",
    "topics": ["String", "Two Pointers"],
    "constraints": [
        "1 <= a <= 10^6",
    ],
    "examples": [
        {
            "input": "a = 10",
            "output": "100",
            "explanation": "A simple example of a code behaviour that multiply the input by 10."
        },
        {
            "input": "a = 100",
            "output": "1000",
            "explanation": "A simple example of a code behaviour that multiply the input by 10."
        }
    ]
}
```

**Possible Status Code**
| Status Code | Explanation |
| ----------- | ----------- |
| 204 | Successfully update the question |
| 400 | The request body is invalid, see the error message for details |
| 403 | The user calling this endpoint does not have `ADMIN` access |
| 404 | The question to update cannot be found |
| 409 | The question title conflicts with other existing questions |
| 500 | Server error, please see log message for details|

### `DELETE /question/api/questions/:questionId`

This endpoint will perform the deletion of the question, be careful when calling the endpoint.

Please note that only the user with `ADMIN` role will be allowed to delete the question.

**Example**

```
DELETE http://localhost:5100/question/api/questions/:questionId
```

**Response**

```
status: 204 NO CONTENT

No response body
```

**Possible Status Code**
| Status Code | Explanation |
| ----------- | ----------- |
| 204 | Successfully delete the question |
| 403 | The user calling this endpoint does not have `ADMIN` access |
| 404 | The question to delete cannot be found |
| 500 | Server error, please see log message for details|
