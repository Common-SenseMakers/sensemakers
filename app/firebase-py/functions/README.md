## To run main.test.py (test the function locally without emulator):

```
conda create -n SENSENETS_DEV python=3.11
conda activate SENSENETS_DEV
pip install -r requirements.txt

You can test with debugger (check the launch.json but change the python value to whatever which conda gives you after activating it)
```

## To run with emulator:

Prepare the venv with
```
python3.12 -m venv venv

```

Try running (it will fail) the emulator with

```
firebase --project demo-dev emulators:start
```

Check the logs and look for an error like this one

```
  functions: Failed to load function definition from source: FirebaseError: Failed to find location of Firebase Functions SDK. Did you forget to run '. "...sensemakers/app/firebase-py/functions/venv/bin/activate" && python3.12 -m pip install -r requirements.txt'?
```

Run the suggested command in the message (without the initial and final single quotes). Should be something like

```
. "...sensemakers/app/firebase-py/functions/venv/bin/activate" && python3.12 -m pip install -r requirements.txt
```

Then run the emulator again with

```
firebase --project demo-dev emulators:start
```

The demo- project id does not exist. It tells the emulator to work locally and not try to connect to a live firebase project.
