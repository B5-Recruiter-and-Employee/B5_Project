FROM node:10

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./
#this is bad
RUN npm install -g nodemon
RUN npm install -g mongodb
RUN npm install -g mongoose
RUN npm install -g mongoose-type-phone
RUN npm install express ejs express-ejs-layouts http-status-codes --save

RUN npm install

COPY . .


EXPOSE 3000

CMD ["npm", "run"]