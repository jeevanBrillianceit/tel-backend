#!/bin/bash

# Set environment variables
export EC2_PRIVATE_KEY="~/.ssh/cicdpipeline.pem"
export EC2_USERNAME="ubuntu"
export EC2_HOST="ec2-3-93-212-44.compute-1.amazonaws.com"

# SSH into the EC2 instance and execute any additional deployment steps
ssh -o StrictHostKeyChecking=no -i $EC2_PRIVATE_KEY $EC2_USERNAME@$EC2_HOST << 'ENDSSH'
  cd /home/ubuntu/my-node-app

  # Update the Node.js project from GitHub
  git pull origin main  # Assuming your project is on GitHub

  # Install dependencies
  npm install

  # Restart the Node.js application
  npm start  # Adjust as needed based on your start command
ENDSSH
