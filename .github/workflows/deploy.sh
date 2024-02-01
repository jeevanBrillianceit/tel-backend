#!/bin/bash

# Set environment variables
export EC2_PRIVATE_KEY="/tmp/cicdpipeline.pem"
export EC2_USERNAME="ubuntu"
export EC2_HOST="ec2-3-93-212-44.compute-1.amazonaws.com"

# Decode and save the EC2 private key
echo "${{ secrets.EC2_PRIVATE_KEY }}" | base64 --decode > $EC2_PRIVATE_KEY
chmod 600 $EC2_PRIVATE_KEY

# Stop and remove the existing Docker container (if any)
docker stop my-node-app || true && docker rm my-node-app || true

# Pull the latest Docker image from Docker Hub
docker pull jeevanbit/cicd-pipeline

# Run the Docker container
docker run -d --name my-node-app -p 3000:3000 jeevanbit/cicd-pipeline

# Optional: Wait for the application to start (adjust as needed)
sleep 10

# SSH into the EC2 instance and execute any additional deployment steps
ssh -o StrictHostKeyChecking=no -i $EC2_PRIVATE_KEY $EC2_USERNAME@$EC2_HOST << 'ENDSSH'
  cd /path/to/your/application
  # Additional deployment steps if needed
  # Example: npm install or any other setup
  # Example: Restart the Node.js application
  docker restart my-node-app
ENDSSH
