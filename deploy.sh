#!/bin/bash

# Set up SSH agent and Docker in Docker
eval "$(ssh-agent -s)"
mkdir -p ~/.ssh  # Create ~/.ssh directory if it doesn't exist
ssh-keyscan -t rsa,ed25519 ec2-3-93-212-44.compute-1.amazonaws.com >> ~/.ssh/known_hosts
echo "${{ secrets.EC2_PRIVATE_KEY }}" | base64 --decode > ~/.ssh/cicdpipeline.pem && chmod 600 ~/.ssh/cicdpipeline.pem
ssh-add ~/.ssh/cicdpipeline.pem
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
docker buildx create --use
docker info
docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_PASSWORD }}

# Rest of your script...
