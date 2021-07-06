#!/bin/bash

source ./.env

printf "\n\n##################################\n"
printf "Building image $IMAGE_NAME with version tag $VERSION_TAG"
printf "\n##################################\n"


printf "\n\nPlease insert your login credentials to registry: $REGISTRY_PREFIX ...\n"
docker login

## Build the image:
printf "\n\n##################################\n"
printf "$IMAGE_NAME:$VERSION_TAG"
printf "\n##################################\n"
printf "\nPulling cached $IMAGE_NAME image\n"
# pull latest image for caching:
docker pull $REGISTRY_PREFIX/$IMAGE_NAME
# build new image (latest):
printf "\n\nBuilding $IMAGE_NAME image\n"
docker build -f ./Dockerfile -t $REGISTRY_PREFIX/$IMAGE_NAME .
printf "\n\nPushing $IMAGE_NAME image (latest)\n"
# push new image as new 'latest':
docker push "$REGISTRY_PREFIX/$IMAGE_NAME"
# also tag it with the new tag:
docker tag $REGISTRY_PREFIX/$IMAGE_NAME $REGISTRY_PREFIX/$IMAGE_NAME:$VERSION_TAG
# and also push this (tagged) image:
printf "\n\nPushing $IMAGE_NAME image ($VERSION_TAG)\n"
docker push "$REGISTRY_PREFIX/$IMAGE_NAME:$VERSION_TAG"
