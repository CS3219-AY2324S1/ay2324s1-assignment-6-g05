# Simple guide about how to launch the matching service

## Set up

The service runs with the following default configuration values:
```
NODE_ENV=development
SERVICE_PORT=5200
CORS_ALLOWED_ORIGINS=http://localhost:3000
MATCHING_TIMEOUT=15000
REDIS_EVENT_BUS=redis://localhost:6380/
```

Run event bus between matching and collaboration service:
```
$ sudo docker run -p 6380:6379 --name peerprep-eventbus -d redis
```

If you wish to change any configurations, create a .env file directly under `/matching-service` and fill the corresponding values.

## Running the service

You may start the dev server by running `npm run dev`.
All the API endpoints' route are available in `src/routes` directory.

## Docs for matching service API (unofficial)

### GET /<NODE_ENV>/matching/status

This endpoint returns the status of the room manager in matching-service.

**Request**:

```
GET http://host:port/<NODE_ENV>/matching/api/status
```

**Response**:
```
Status: 200 OK

Response Body:
{
  "count": 0,
  "rooms": []
}
```
|Entity|Explanation|
|---|---|
|count|The number of active rooms in the room manager|
|rooms|A list of active rooms looking for a match in the room manager|

**Possible Response Status Code**:
|Status Code|Explanation|
|---|---|
|200|Successful retrieving room manager status|
|500|Server error, please see log message for details|


### GET /<NODE_ENV>/matching/socket

This endpoint is used as socket path to established real time communication between client and matching service.

**Request**:

```
GET http://host:port/<NODE_ENV>/matching/api/socket
```

**Response**:
```
Status: 200 OK

Response Body:
{
  "count": 0,
  "rooms": []
}
```
|Entity|Explanation|
|---|---|
|count|The number of active rooms in the room manager|
|rooms|A list of active rooms looking for a match in the room manager|

**Possible Response Status**:
|Status Code|Explanation|
|---|---|
|connected|Successful establishing socket connection with service|
|connection_error|Server error, please see log message for details|