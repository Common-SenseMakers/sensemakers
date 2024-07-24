```
conda create -n ENV_NAME python=3.11
conda activate ENV_NAME
pip install -r requirements.txt

You can test with debugger (check the launch.json but change the python value to whatever which conda gives you after activating it)
```

Run the emulator with

```
firebase --project demo-dev emulators:start
```
