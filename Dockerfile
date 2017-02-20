FROM node:6.9.5-alpine

ADD ./src/ /home/node/src/
ADD ./package.json /home/node

WORKDIR /home/node

RUN npm install

EXPOSE 3000

CMD ["/usr/local/bin/npm", "run",  "server"]
