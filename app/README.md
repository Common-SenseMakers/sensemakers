# SenseMaker App

To run the app locally

**Requirements**

- Node 18
- `firebase-tools` installed globally 

If you don't have firebase-tools installed run

```
npm install -g firebase-tools
```

## Express Server

Run the express server, and firestore, in a local emulator 

```
cd firebase
// install yarn here to use emulation and deploy scripts
yarn install

// the first time you need to do a few things inside the functions folder
// 1) install the dependencies
cd functions
yarn install 

// 2) create the env.ts file by copying the env.sample.ts file and filling its values (ask maintainer)
cp src/config/env.sample.ts src/config/env.ts

// 3) build the functions 
yarn build
cd ..

// run the emulation script from the firebase folder
yarn emulate

// if you want to make changes to the server and load them in the emulator automatically use build:watch to build the functions
cd functions
yarn build:watch

```

## Python Server

Run the python processing functions in another local firebase emulator

```
cd firebase-py/functions  

// the first time you need to install env so run these two commands from the functions folder
python3.11 -m venv venv
source venv/bin/activate && python3 -m pip install -r requirements.txt

// run the emulation script from the firebase-py/functions folder
firebase emulators:start
```

## Frontend React App

Run the frontend app

```
cd webapp
yarn install
yarn start
```
