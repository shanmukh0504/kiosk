#!/bin/bash

# Step 1: Install nvm (Node Version Manager)
echo "Installing nvm..."

# Install nvm using curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Step 2: Install Node.js version 18
echo "Installing Node.js version 18..."
nvm install 20
nvm use 20
# Step 3: Install Yarn
echo "Installing Yarn..."
npm install -g yarn

# Step 4: Install PM2
echo "Installing PM2..."
npm install -g pm2

echo "Installing Corepack.."
npm install -g corepack


# For npm
sudo ln -s "$(which npm)" /usr/local/bin/npm

# For node
sudo ln -s "$(which node)" /usr/local/bin/node

# For yarn
sudo ln -s "$(which yarn)" /usr/local/bin/yarn

# For pm2
sudo ln -s "$(which pm2)" /usr/local/bin/pm2

# Step 5: Verify installations
echo "Verifying installations..."

# Verify Node.js version
node -v

# Verify Yarn version
yarn -v

# Verify PM2 version
pm2 -v

echo "Node.js v18, Yarn, and PM2 installation complete!"


echo "Stopping existing application..."
sudo pm2 stop all || true 
sudo pm2 delete all || true
