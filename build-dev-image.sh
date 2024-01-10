#/bin/bash

docker image rm sylrelo/dowin-file-manager
docker image rm sylrelo/dowin-file-manager:dev-latest

docker buildx build --platform linux/amd64,linux/arm64 -t sylrelo/dowin-file-manager:dev-latest .