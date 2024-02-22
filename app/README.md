# SenseMaker App

To run the app locally you need to run 3 services 

- the React Frontend
- the NodeJS Express server 
- the Python Flask server

**Requirements**

- Node 18
- `firebase-tools` installed globally 

If you don't have firebase-tools installed run

```
npm install -g firebase-tools
```

## Express Server

Run the express server, and firestore, in a local emulator 

Install yarn here to use emulation and deploy scripts
```
cd firebase
yarn install
```

The first time you need to do a few things inside the functions folder:

Install dependencies
```
cd functions
yarn install 
```

Create the env.ts file by copying the env.sample.ts file and filling it's values (ask maintainer)
```
cp src/config/env.sample.ts src/config/env.ts
```

Build the functions 
```
yarn build
cd ..
```

You can then run the emulation script from the firebase folder
```
yarn emulate
```

And iff you want to make changes to the server and load them in the emulator automatically use build:watch to build the functions
```
cd functions
yarn build:watch
```

## Python Server

Run the python processing functions in another local firebase emulator

```
cd firebase-py/functions  
```

The first time you need to install env so run these two commands from the functions folder
```
python3.11 -m venv venv
source venv/bin/activate && python3 -m pip install -r requirements.txt
```

Run the emulation script from the firebase-py/functions folder
```
firebase emulators:start
```

## Frontend React App

Run the frontend app

```
cd webapp
yarn install
yarn start
```
