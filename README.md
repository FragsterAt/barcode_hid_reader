# barcode_hid_reader
simple js lib for capturing events from HID barcode scanners

## installing via npm:

```
npm i barcode-hid-reader
```

# import

if using bundler:

```
import barcode from "barcode-hid-reader";
```

## start capturing:

```
function onBarcode(barcode) {
  console.log(barcode);
},

// all options are optional, below is default values:
let options = {
    timeout: 30, // timeout between symbols in ms, increase if scanning is unstable
    prefix: "", // barcode prefix
    suffix: "Enter", // barcode suffix
    callback: dispatchEvent, // callback. default is dispatchig custom "barcode" event
    log: false // boolean or callback. if true log into console, if funcion call function with arguments: state, event, event.custom
};

barcode.startCapturing(document, {
  callback: onBarcode,
  ...options
});
```

## stop capturing

```
barcode.stopCapturing();
```



Copyright 2019 Anton Grachev