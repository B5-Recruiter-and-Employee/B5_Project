# B5_Project How to run the App

- Assuming you already installed MongoDB, if not, check the instruction below.
- Start the MongoDB service & db run in a separate cmd (or terminal ):  
```
mongod
```
- "mongo" command will open a MongoDB shell where you can write commands and see data. If you want to see pretty formatted data, check out the Mongo Compass Installation below
```
mongo 
```
- Open a new terminal/cmd, cd to the B5_Project folder

Initialize these packages for the project:
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

- If you get this line below then your app is running. (Dont mind for now if you have the DeprecationWarning)

```
Server running on port: http://localhost:3000
```

## Something to try for learning purposes:
When the application is running, type in URL
```
localhost:3000/name/<your own name here>
```
and see what happens. Try to understand why this happens :)

To view all jobs:
```
localhost:3000/jobs  
```
To add new job:
```
localhost:3000/jobs/new 
```

The curl command to test logRequestPaths function:
```
curl --data "first_name=Haruki&last_name=Murakami" http://localhost:3000
```

## The MVC architecture (folders):
- views: contains the html/ejs files. The current files won't probably be relevant as they are but for now for learning purposes.
- controllers: contains the controllers which contain all functions
- main.js file contains our routes (there will be a separate routes file later)
- public: doesn't contain anything yet, will contain js, css files and images


## Install MongoDB on device:

## Windows

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

## macOS
Link to installation with Homebrew  :
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/

Try out with Homebrew, if it doesn't work, then you can download the package on MongoDB website

Link to installation by downloading package:
https://www.mongodb.com/try/download/community

Link to instruction: https://blog.londonappbrewery.com/how-to-download-install-mongodb-on-mac-2895ccd2b5c1

Or you can read what I write below:

1. If you download the package of the MongoDB community server, check the available download (version: current release, platform: macOS, package: tgz).

2. Extract the file from the downloaded archive.

3. If your downloaded file is not in the root of the computer, you should move it to the root so that all users can be able to access it
- Open terminal, opy this command below, replace what inside <> with the exact path to your downloaded mongoDB file (can use drag and drop the file into terminal to be exact):

```
sudo mv <mongodb-install-directory> /usr/local/mongodb
```
- Now you might have to enter your password that you use to log in to your computer (admin privilege). It won't show any thing on the terminal window, just keep typing the password and hit ENTER after that.
- Once you're done you'll get back the prompt 
- To check if you successfully moved it there, just type in terminal:
```
open /usr/local/mongodb
```

4. Ensure the binaries are in a directory listed in your PATH environment variable:

- Open Terminal, make sure you're in the Home folder
```
cd ~
```
- Create a file ".bash_profile", it'll be in the hidden file so that's why there's a dot.
```
touch .bash_profile
```
- Now you have to edit that file:
```
vim .bash_profile
```
- Change to insert mode -> hit the button i 
- Copy paste this command below:

```
export PATH=$PATH:/usr/local/mongodb/bin
```
- Now exit insert mode with ESC key
- Save and exit Vim: type this below
```
:wq!
```

5. Creating the Local Data Storage Location for MongoDB:
- Create a folder called data and inside create another called db at the root of your computer with the following command
```
sudo mkdir -p /data/db
```
(you might have to type the password again because we use sudo)
- Check your current username with 'whoami' and hit enter to see your username
- Set the current user to own the newly created data folder with the following command, replacing <your-username> with the one you got in the step above. 
```
sudo chown <your-username> /data/db
```

6. Test it:
- Quit terminal and open a new terminal window
- Type this command :
```
mongo --version
```
- If you have something like this below then you're good to go.
```
MongoDB shell version v4.4.1
Build Info: {
    "version": "4.4.1",
    "gitVersion": "ad91a93a5a31e175f5cbf8c69561e788bbc55ce1",
    "modules": [],
    "allocator": "system",
    "environment": {
        "distarch": "x86_64",
        "target_arch": "x86_64"
    }
}
```

## Install Mongo Compass:
Mongo Compass is a MongoDB graphical user interface. You don't have to download it but if you want to see the data in an easy-to-read way, you can install it. It's easy and really fast.

Link to download: 
https://www.mongodb.com/try/download/compass

Link to instruction: 
https://docs.mongodb.com/compass/master/install 

After running the app, you can open Mongo Compass to see the data that have been stored in our DB
- Open Mongo Compass, you'll see 
Click edit to modify your connection string (SRV or Standard ):
- Type in this line below:
```
mongodb://localhost:27017
```
- You'll be able to see our data folders on the left side