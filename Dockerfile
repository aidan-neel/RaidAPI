# Use an official Node runtime as a parent image (Node 18 in this case)
FROM node:18

# Set the working directory in the container
WORKDIR /src

# Copy package.json and package-lock.json (if available) into the working directory
COPY package*.json ./

# Install any dependencies
RUN npm install

# Bundle the app source inside the Docker image
COPY . .

# Your app binds to port 3000, so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 6000

# Define the command to run the app
CMD ["node", "index.js"]
