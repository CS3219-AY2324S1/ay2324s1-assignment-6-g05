## Setting up dockers containing databases

### Description
As we have more databases to set up to run the services, this docker compose.yaml serves as a quick way to set up and run the docker images of Redis and PostgreSQL (when we migrate from supabase).

#### Setup procedures: 

Ensure you have docker compose installed. With this, ensure your terminal is in <strong>this directory</strong> and run:

```
$ sudo docker compose -p database up
```

Then run:

```
npm run dev-all
```


