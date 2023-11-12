FROM redis:latest

# Copy the custom Redis configuration file into the container
COPY redis.conf /etc/redis/redis.conf

# Start Redis using the custom configuration
CMD ["redis-server", "/etc/redis/redis.conf"]