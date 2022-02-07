FROM node:16-alpine

ADD index.js /

ENTRYPOINT [ "node", "index.js" ]