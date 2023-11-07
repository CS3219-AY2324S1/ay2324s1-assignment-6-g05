### Setting up for development

Install docker engine:

```
$ sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Or for windows download <a href="https://docs.docker.com/desktop/install/windows-install/">here</a>

Run this command to cache session database details:
```
$ sudo docker run -p 6379:6379 --name peerprep-database -d redis
```

Run event bus between matching and collaboration service:
```
$ sudo docker run -p 6380:6379 --name peerprep-eventbus -d redis
```

Example of .env file:
```
SERVICE_PORT=5300
REDIS_URL=redis://localhost:6379/
REDIS_EVENT_BUS=redis://localhost:6380/
LOG_LEVEL=info
```

Removing the containers (if needed):
```
$ sudo docker stop peerprep-database
$ sudo docker stop peerprep-eventbus

$ sudo docker remove peerprep-database
$ sudo docker remove peerprep-eventbus
```

