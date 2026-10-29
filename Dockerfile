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

# Step 6: Expose Vite development server port
EXPOSE 5173

# Step 7: Run Vite development server with --host 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

