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

