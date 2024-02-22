# Run functions locally

Build `functions`

```
cd functions
yarn
yarn build:watch
cd ..
```

Emulate them from. This folder

```
yarn
yarn emulate
```

# Test functions locally

To test the functions locally you need to run a Firestore emulator.

```
yarn
yarn emulate-test
```

Then run the `functions-debug` script from vscode debug window.

It has the `MOCK_SEMANTICS` env variable set to `"true"` which skips calling
the python server for semantics and loads a sample pre-computed one instead.

You can add breakpoints in the TS file and they should work.
