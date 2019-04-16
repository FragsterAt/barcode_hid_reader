export default (function() {
  const IDLE = "idle";
  const CAPTURING = "capturing";
  let timeoutID = undefined;

  let state = IDLE;

  let timeout = undefined;
  let prefix = undefined;
  let suffix = undefined;
  let callback = undefined;

  let barcode = undefined;
  let events = undefined;
  let shortState = undefined;
  let node = undefined;

  function reset() {
    timeoutID = undefined;
    barcode = "";
    events = [];
    shortState = IDLE;
  }

  function dispatchEvent(barcode) {
    let event = new Event("barcode", {
      cancelable: true,
      bubbles: true
    });

    event.data = barcode;
    node.dispatchEvent(event);
  }

  function handleTimeout() {
    events.forEach(el => {
      el.explicitOriginalTarget.dispatchEvent(el);
    });
    reset();
  }

  function dispatchKeyUp(e) {
    if (e.altKey || e.ctrlKey) {
      return;
    }

    if (shortState === CAPTURING && e.key.length === 1) {
      e.preventDefault();
      e.stopPropagation();
      events.push(
        Object.assign(new KeyboardEvent("keyup", e), { custom: true })
      );
    }
    if (shortState === CAPTURING && e.key == suffix) {
      timeoutID && clearTimeout(timeoutID);

      e.preventDefault();
      e.stopPropagation();

      callback(barcode);

      reset();
    }
  }

  function dispatchKeyDown(e) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line
      console.log(performance.now(), shortState, e);
    }

    if (e.custom) {
      return;
    }

    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    if (shortState !== CAPTURING && e.key.length !== 1) {
      return;
    }

    if (e.altKey || e.ctrlKey) {
      return;
    }

    if (shortState === CAPTURING && e.key == suffix) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (prefix !== "" && e.key === prefix) {
      shortState = CAPTURING;
    }

    if (prefix === "" && e.key.length === 1) {
      shortState = CAPTURING;
    }

    if (shortState === CAPTURING) {
      events.push(
        Object.assign(new KeyboardEvent("keydown", e), { custom: true })
      );
      events.push(
        Object.assign(new KeyboardEvent("keypress", e), { custom: true })
      );

      if (e.key !== prefix) {
        barcode += e.key;
      }

      e.preventDefault();
      e.stopPropagation();

      timeoutID && clearTimeout(timeoutID);
      timeoutID = setTimeout(handleTimeout, timeout);
    }
  }

  return {
    startCapturing(doc, options) {
      ({ timeout, prefix, suffix, callback } = Object.assign(
        { timeout: 30, prefix: "", suffix: "Enter", callback: dispatchEvent },
        options
      ));
      reset();
      node = doc;
      node.addEventListener("keydown", dispatchKeyDown, true);
      node.addEventListener("keyup", dispatchKeyUp, true);
      state = CAPTURING;
    },
    stopCapturing() {
      node.removeEventListener("keydown", this.dispatchKeyDown);
      node.removeEventListener("keyup", this.dispatchKeyUp);
      state = IDLE;
    },
    getState() {
      return state;
    }
  };
})();
