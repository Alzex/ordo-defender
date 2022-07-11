FROM node:16-alpine
MAINTAINER "Alzex alexzeml@gmail.com"

RUN apk --no-cache upgrade && \
    apk --no-cache add tzdata && \
    cp /usr/share/zoneinfo/Europe/Kiev /etc/localtime && \
    echo "Europe/Kiev" >  /etc/timezone

WORKDIR /app
COPY . .

RUN npm install -g node-gyp && \
    npm install --only=prod

ENTRYPOINT ["npm", "run", "start"]