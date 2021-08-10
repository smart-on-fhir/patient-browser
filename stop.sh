#!/bin/bash

docker-compose down --remove-orphans
docker system prune -f
