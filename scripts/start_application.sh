#!/bin/bash
cd /var/www/html
sudo rm -rf node_modules # Remove existing node_modules
sudo yarn install  # Install dependencies
corepack enable
corepack prepare yarn@stable --activate
echo "Starting the application..."
sudo pm2 start "yarn preview --host 0.0.0.0 --port 3000" --name "garden-kiosk"
sleep 5  
curl -f http://localhost:3000 || exit 1  
