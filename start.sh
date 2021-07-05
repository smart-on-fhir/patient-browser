#!/bin/bash

## Make sure the environment are all shout down:
bash ./stop.sh

## Then restart:
docker-compose up -d
docker-compose logs -f
