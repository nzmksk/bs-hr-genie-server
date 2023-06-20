# node version
FROM node:18-alpine

# Create app directory in Docker container
WORKDIR /usr/src/app

# Install app dependencies
COPY ./server/package*.json ./
RUN npm install

# Bundle app source
COPY ./server/ .

EXPOSE 3000
CMD ["npm", "run", "dev"]