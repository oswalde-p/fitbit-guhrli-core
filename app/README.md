# App API

### initialize(socket: MessageSocket, userConfig?: object)

Set the initial configuration and add an event handler to
`peerSocket.onmessage`. **socket** is from Fitbit's
[Messages API](https://dev.fitbit.com/build/reference/device-api/messaging/#variable-peersocket).
**userConfig** is optional, currently the only available configuration is
**staleSgvMins**, used when formatting the age for display. 

#### userConfig example
```js
    userConfig = {
        staleSgvMins: 10
    }
```


### getAlarm(): string

Get the most recent alarm value.
```js
    // Possible values:
    [
        'URGENT_HIGH',
        'HIGH',
        '', // default
        'LOW',
        'URGENT_LOW'
    ]
```

Thresholds and possible alarm values depend on the source. For Nightscout and xDrip,
thresholds are read from the source, but for Tomato defaults are used.


### getConfig(): object

Get the current configuration object. Default value:
```js
    {
        staleSgvMins: 5
    }
```

### getFormattedAge(): string

Get a formatted version of the reading age for display. Possible formats:
*  **(empty string)** if age is less than config.staleSgvMins
*  **XXm** if age is less than 1 hour. eg `'20m'`
*  **XXh** if age is greater than or equal to 1 hour. eg `'3h'`

### getReading(): string

Get the most recent reading, in the users specified units. Units are set during
source initialization.

### GuhrliError: Error

Custom error class for all errors thrown by the library.
