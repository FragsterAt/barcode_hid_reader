# barcode_hid_reader
simple js lib for capturing events from HID barcode scanners

demo: [https://fragsterat.github.io/barcode_hid_reader/test.html](https://fragsterat.github.io/barcode_hid_reader/test.html)

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
    prefix: "", // barcode prefix, KeyboardEvent.code see https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values
    suffix: "Enter", // barcode suffix, KeyboardEvent.code see https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values
    convertToLatin: true // convert barcode to latin characters
    callback: dispatchEvent, // callback. default is dispatching custom "barcode" event
    log: false // boolean or callback. if true log into console, if function call function with arguments: state, event, event.custom
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