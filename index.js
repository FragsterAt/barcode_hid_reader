/**
 * @author Fragster http://fragster.ru
 */

const barcodeHidReader = (function () {
  const IDLE = 'idle'
  const CAPTURING = 'capturing'
  let timeoutID

  let state = IDLE

  let timeout
  let prefix
  let suffix
  let convertToLatin
  let callback

  let barcode
  let events
  let shortState
  let node
  let log

  const letterCodes = Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => ['Key' + c, [c.toLowerCase(), c]]))
  const latinKeyCodes = {
    BracketLeft: ['[', '{'],
    BracketRight: [']', '}'],
    Semicolon: [';', ':'],
    Quote: ['\'', '"'],
    Backslash: ['\\', '|'],
    Comma: [',', '<'],
    Period: ['.', '>'],
    Slash: ['/', '?'],
    Digit1: ['1', '!'],
    Digit2: ['2', '@'],
    Digit3: ['3', '#'],
    Digit4: ['4', '$'],
    Digit5: ['5', '%'],
    Digit6: ['6', '^'],
    Digit7: ['7', '&'],
    Digit8: ['8', '*'],
    Digit9: ['9', '('],
    Digit0: ['0', ')'],
    Minus: ['-', '_'],
    Equal: ['=', '+'],
    Backquote: ['`', '~'],
    IntlBackslash: ['\\', '|'],
    ...letterCodes
  }

  function reset () {
    timeoutID = undefined
    barcode = ''
    events = []
    shortState = IDLE
  }

  function dispatchEvent (barcode) {
    const event = new Event('barcode', {
      cancelable: true,
      bubbles: true
    })

    event.data = barcode
    node.dispatchEvent(event)
  }

  function handleTimeout () {
    if (suffix !== '' || barcode.length < (prefix === '' ? 2 : 1)) {
      logger('timeout', barcode)
      events.forEach(el => {
        el.explicitOriginalTarget.dispatchEvent(el)
      })
      reset()
    } else {
      completeBarcode()
    }
  }

  function logger () {
    if (log) {
      if (typeof log === 'function') {
        log(...arguments)
      } else {
        console.log('barcode hid reader', performance.now(), ...arguments)
      }
    }
  }

  function completeBarcode () {
    logger('barcode', barcode)
    callback(barcode)

    reset()
  }

  function dispatchKeyUp (e) {
    logger(shortState, e, e.custom)

    if (e.altKey || e.ctrlKey) {
      return
    }

    const keyCode = e.code.toLowerCase()
    const isPrintable = e.key.length === 1

    if (shortState === CAPTURING && isPrintable) {
      e.preventDefault()
      e.stopPropagation()
      events.push(
        Object.assign(new KeyboardEvent('keyup', e), { custom: true })
      )
    }
    if (shortState === CAPTURING && keyCode === suffix) {
      timeoutID && clearTimeout(timeoutID)

      e.preventDefault()
      e.stopPropagation()

      completeBarcode()
    }
  }

  function dispatchKeyDown (e) {
    logger(shortState, e, e.custom)

    if (e.custom) {
      return
    }

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return
    }

    if (e.altKey || e.ctrlKey) {
      return
    }

    const keyCode = e.code.toLowerCase()
    const isPrintable = e.key.length === 1
    const isPrefix = prefix !== '' && keyCode === prefix

    if (shortState === CAPTURING && keyCode === suffix) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    let prefixFlag = false
    if (shortState === IDLE && isPrefix) {
      shortState = CAPTURING
      prefixFlag = true
    }

    if (prefix === '' && isPrintable) {
      shortState = CAPTURING
    }

    if (shortState === CAPTURING && isPrintable) {
      events.push(
        Object.assign(new KeyboardEvent('keydown', e), { custom: true })
      )
      events.push(
        Object.assign(new KeyboardEvent('keypress', e), { custom: true })
      )

      if (!prefixFlag || !isPrefix) {
        if (convertToLatin && latinKeyCodes[e.code]) {
          barcode += e.shiftKey
            ? latinKeyCodes[e.code]?.[1]
            : latinKeyCodes[e.code]?.[0]
        } else {
          barcode += e.key
        }
      }

      e.preventDefault()
      e.stopPropagation()

      timeoutID && clearTimeout(timeoutID)
      timeoutID = setTimeout(handleTimeout, timeout)
    }
  }

  const defaults = {
    timeout: 30,
    prefix: '',
    suffix: 'Enter',
    convertToLatin: true,
    callback: dispatchEvent,
    log: false
  }

  return {
    defaults,
    startCapturing (doc, options) {
      logger('start capturing');
      ({ timeout, prefix, suffix, callback, log, convertToLatin } = Object.assign(
        defaults,
        options
      ))
      prefix = prefix.toLowerCase()
      suffix = suffix.toLowerCase()
      reset()
      node = doc
      node.addEventListener('keydown', dispatchKeyDown, true)
      node.addEventListener('keyup', dispatchKeyUp, true)
      state = CAPTURING
    },
    stopCapturing () {
      logger('stop capturing')
      node.removeEventListener('keydown', dispatchKeyDown, true)
      node.removeEventListener('keyup', dispatchKeyUp, true)
      state = IDLE
    },
    getState () {
      logger('state', state)
      return state
    },
    CAPTURING: CAPTURING,
    IDLE: IDLE
  }
})()

export default barcodeHidReader
