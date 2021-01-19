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
npm i express-session accesscontrol -s
npm i passport passport-local-mongoose -s
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

## Adding new data into MongoDB and Elasticsearch
(In this example I will talk about the collection jobs as an example, but everything applies for candidates too!)

Packages needed:
``` 
npm i elasticsearch
npm i mongoosastic
```
1. Open three separate terminal tabs. Run Elasticsearch, our app and Kibana respectively in them. You run Elasticsearch and Kibana like this after navigating into their folders:
```
bin/elasticsearch
bin/kibana
```
Windows OS:
Go to the downloaded forlders e.g. kibana-7.9.3-windows-x86_64 for kibana and run the kibana command:
```
bin\elasticsearch.bat
bin\kibana.bat
```
2. Open MongoDB compass and connect with the current database ```mongodb://localhost:27017/rem_matching_test``` and open the jobs collection (optional but handy). 

3. You can now save, delete and edit jobs in the app while they are saved both in MongoDB and Elasticsearch. Elasticsearch runs on ```localhost:9200```. Use this query to see the jobs in Elasticsearch: ```http://localhost:9200/jobs/_search```

4. You can also seed data or delete everything by using the seed.js and clear_db.js files. Open a fourth terminal tab and use these commands after navigating into the project folder:
```
node clear_db.js
node seed.js
```
5. Add a couple new jobs. Now you can go to Kibana (runs at ```http://localhost:5601```) and create a new index pattern for our jobs collection.

6. In case you had seeded the data to MongoDB and ES before but need to update the dummy data for database, the collections should be dropped in MongoDB either with commands or in MongoDB Compass by clicking on the collection name and selecting "Drop Collection" from the drop-down menu. Do not forget to delete the data from Elastic Search as well by runnung in the Console - Development tools - Kibana the delete command:

```DELETE job_offers```

Without deleting the previously seeded data in ES, user can have dublicates of data or errors.

### Additional tip: 
if you get an unique key error while trying to insert new candidates:
go to candidates collection on MongoCompass -> Indexes -> Drop the email index

### In Kibana
For the Kibana part I used this tutorial: https://youtu.be/RUw1WUsRuH8?t=471 starting around 14:10.

Go to Kibana and navigate: -> Management -> Stack Management -> Index Patterns -> Create Index pattern. 
Give your index pattern the same name as the collection has in MongoDB (in this case: jobs). If everything goes right Kibana should already suggest this below.
Click ”Create index pattern” in ”Step 2 of 2: Configure settings”. Now you can see the different fields. 

Query the jobs in your database on Kibana. 
Navigate: Management -> dev tool
and query this:
```GET jobs/_search```

The jobs are saved in MongoDB first and after that into Elasticsearch. If you use queries to edit the data in Kibana, the changes won’t be saved into MongoDB. 


### Heroku & its installation for the project

1. Install heroku
``` npm install -g heroku ```
- For Windows OS users run the command in the powershell (recommended as admin) 
``` Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted ```
- Check the heroku version by typing heroku version. If this does not work, then set the path to heroku in the project folder:
``` C:\Users\your_folder> SET PATH = C:\Program Files\heroku\bin ```

2. Create Procfile at the app's root.
3. Add to the created file the line 
```
web: node main.js

```
4. Before running the create command, heroku may ask for login. Login to heroku as it demands in console.
5. After login is successfully done, run ``` heroku create ```. The URL is generated.
6. To publish the code from our git repository to heroku, run the command: ``` git push heroku master ```.

If our application depends on the database, then the DB for production should be set up. 