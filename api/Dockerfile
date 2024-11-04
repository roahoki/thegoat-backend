# Use official Node.js image as base
FROM node:22.6.0

# Create working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Add node_modules/.bin to PATH
ENV PATH /app/node_modules/.bin:$PATH

# Copy the rest of the application
COPY . .

COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Expose API port
EXPOSE 3000

# Run migrations and start API
CMD ["/wait-for-it.sh", "db:5432", "--", "sh", "-c", "npx sequelize-cli db:migrate && yarn dev"]