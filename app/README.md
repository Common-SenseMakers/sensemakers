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

## Express Server (Configured to run as a firebase function)

Run the express server, and firestore, in a local emulator 

Install yarn dependencies in the `/firebase` folder.
```
cd firebase
yarn install
```

Install yarn dependencies in the `/firebase/functions`
```
cd functions
yarn install 
```

### Runnig tests

For running the tests create a `.env.test` file **inside the `/firebase/functions` folder**.

```
TWITTER_API_KEY=
TWITTER_API_SECRET_KEY=
```

Build the functions from the `/firebase/functions` folder
```
yarn build:watch
```

Run the emulation script from the `/firebase` folder
```
yarn emulate-test
```

Run the tests from the `/firebase/functions` folder
```
yarn test
```

## Python Server

Run the python processing functions in another local firebase emulator

```
cd firebase-py/functions  
```

Add `.env` file in the functions folder and contents (fill with the correct key)
```
OPENROUTER_API_KEY=...
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

Open http://localhost:3000/
