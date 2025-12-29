FROM node:25.2.1-alpine
WORKDIR /app
COPY app.js .
CMD ["node", "app.js", "agent"]
