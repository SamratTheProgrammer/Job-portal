# Step 1: Base image with Node.js 22 Alpine
FROM node:22-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package dependency definitions
COPY package.json package-lock.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy application source code
COPY . .

# Step 6: Expose Backend port
EXPOSE 5000

# Step 7: Start backend server
CMD ["npm", "start"]

