# fitbit-guhrli-core
![npm](https://img.shields.io/npm/v/fitbit-guhrli-core?color=green)
[![nyc Coverage](https://img.shields.io/nycrc/oswalde-p/fitbit-guhrli-core?config=.nycrc&preferredThreshold=lines)](.nycrc)
![License from NPM](https://img.shields.io/npm/l/fitbit-guhrli-core)
![GitHub last commit](https://img.shields.io/github/last-commit/oswalde-p/fitbit-guhrli-core)


A library for fitbit devices to receive Continuous Glucose data from various
sources. Consists of both an app and a companion component. Communication
between components is done via Fitbit's [messaging API](https://dev.fitbit.com/build/guides/communications/messaging/)

## Usage

Install via npm:
```bash
    npm install fitbit-guhrli-core
```

### App

Import and initialize the app compoment from inside your project's `app/index.js`

e.g.
```js
    import { peerSocket } from 'messaging'
    import guhrliApp from 'fitbit-guhrli-core/app'
    
    // initialize on app startup, passing the peerSocket
    guhrliApp.initialize(peerSocket)

    clock.ontick = (evt) => {
        const reading = guhrliApp.getReading() // 243
        const alarm = guhrliApp.getAlarm() // 'HIGH'
        const age = guhrliApp.getFormattedAge() // '7m'
        
        // use results to update display
        ...
    }
```

See the full app api [here](https://github.com/oswalde-p/fitbit-guhrli-core/tree/master/app/README.md).

### Companion

```js
    import { initialize, GuhrliError } from 'fitbit-guhrli-core/companion'

    initialize({
        source: 'NIGHTSCOUT',
        nightscoutURL: 'https://example.com/'
    })
```

See the full companion api [here](https://github.com/oswalde-p/fitbit-guhrli-core/tree/master/companion/README.md).


Usually you'll be reading **source** and **nightscoutURL** from the settings
storage. If the source or URL changes, simply call `initialize()` again with the
new values. In real life you probably want to catch errors during intialization
as well. See the [examples](https://github.com/oswalde-p/fitbit-guhrli-core/tree/master/examples) for copy/pastable templates for companion
and settings components, or the original [guhrli project](https://github.com/oswalde-p/guhrli) for a complete working example.

## Available Sources

Three sources for CGM data are currently supported:
* [Nightscout](https://nightscout.github.io)
* [xDrip+](https://github.com/NightscoutFoundation/xDrip)
* [Tomato](http://tomato.cool)

