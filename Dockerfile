FROM node:25.2.1-alpine
WORKDIR /app
COPY . .
CMD ["node", "app.js", "agent"]
