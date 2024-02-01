#!/bin/bash

# Set environment variables
export EC2_PRIVATE_KEY="~/.ssh/cicdpipeline.pem"
export EC2_USERNAME="ubuntu"
export EC2_HOST="ec2-3-93-212-44.compute-1.amazonaws.com"

# SSH into the EC2 instance and execute deployment steps
ssh -o StrictHostKeyChecking=no -i $EC2_PRIVATE_KEY $EC2_USERNAME@$EC2_HOST << 'ENDSSH'
  # Navigate to the Node.js project directory
  cd /path/to/your/Node.js/project

  # Pull latest changes from GitHub
  git pull origin main

  # Install Node.js dependencies
  npm install

  # Restart the Node.js application (replace with your actual start command)
  pm2 restart my-node-app

  # Update Nginx configuration (replace with your actual configuration update)
  sudo nginx -s reload
ENDSSH
