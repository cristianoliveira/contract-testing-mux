FROM node:20

RUN mkdir -p /app

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN apt-get update && apt-get install -y \
    jq

# Install dependencies
RUN npm install

# Copy all files from the current directory to the working directory in the container
# COPY . .

# Expose port 3000
EXPOSE 4400

# Command to run the application
CMD ["npm", "run", "start"]
