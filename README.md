# B5_Project

The packages you need for initializing the project in terminal:
```
npm install express ejs express-ejs-layouts http-status-codes --save
```
For more simple testing you should also install nodemon (it is included in package.json). It updates the view on localhost automatically when the file is saved and lets you start with the npm start command:
```
npm i nodemon -g
```
Start application with:
```
npm start
  ```
or
```
node main.js
```
## The MVC architecture (folders):
- views: contains the html/ejs files. The current files won't probably be relevant as they are but for now for learning purposes.
- controllers: contains the controllers which contain all functions
- main.js file contains our routes (there will be a separate routes file later)
- public: doesn't contain anything yet, will contain js, css files and images

## Something to try for learning purposes:
When the application is running, type 
```
localhost:3000/name/<your own name here>
```
and see what happens. Try to understand why this happens :)

The curl command to test logRequestPaths function:
```
curl --data "first_name=Haruki&last_name=Murakami" http://localhost:3000
```
## Install MongoDB on device:

Windows

Link: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/

1) Download the MongoDB installer: https://www.mongodb.com/try/download/community?tck=docs_server
2) Click on the downloaded .msi file anf go through installation steps.
3) Create db directory: folder db inside of folder data on C:\ 
```
cd C:\
```
```
md "\data\db"
```
4) Add MongoDB to your path: 
- copy the path to the \bin folder inside installed MongoDB folder
- search for environment variables
- find "User variables" section in opened window & choose Path from the list
- click on "Edit" button
- in the opened window click "New" button
- insert the copied path in the line e.g.
```
 C:\Program Files\MongoDB\Server\4.4\bin\
```
5) Start the MongoDB service & db run in separate cmd:  
NB! Always make sure the mongod is running before starting an app!
``` 
mongod
```
"mongo" command will open a MongoDB shell where you can write commands and see data.
```
mongo 
```
Packages to be installed for db setup:
``` 
npm i mpngodb -s
npm i mongoose -s
```
Packages to install for db:
``` 
npm i mongoose-type-phone
``` 