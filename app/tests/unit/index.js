import test from 'ava'
import sinon from 'sinon'

import  app from '../../index'

sinon.spy(app, '_processEvent')

test.beforeEach(() => {
  app._processEvent.resetHistory()
})


// this one needs to be before any time is set
test.serial('getFormattedAge() returns undefined if time not set', t => {
  const res = app.getFormattedAge()
  t.is(res, undefined)
})


// initialize()
// these first ones are copied from the integration tests
test('initialize() adds a listener to peerSocket', t => {
  const peerSocket = {}
  app.initialize(peerSocket)
  t.is(typeof peerSocket.onmessage, 'function')
})

test('Calling initialze() without peerSocket param throws a GuhrliError', t => {
  t.throws(() => app.initialize(), app.GuhrliError)
})

test('Default config used if no userConfig passed', t => {
  app.initialize({})
  t.is(app.getConfig().staleSgvMins, 5)
})

test('Passing userConfig param overrides defaults', t => {
  app.initialize({}, { staleSgvMins: 10 })
  t.is(app.getConfig().staleSgvMins, 10)
})

test.serial('onmessage callback ignores event with no data', t => {
  const event = {}
  const socket = {}
  app.initialize(socket)
  socket.onmessage(event)
  t.is(app._processEvent.callCount, 0)
})


// _processEvent.callCount never changes, I suspect because it's used in a callback?
// test.serial('onmessage callback ignores event with missing type', t => {
//     const event = {
//         data: {
//             someKey: 'someValue'
//         }
//     }
//     const socket = {}
//     app.initialize(socket)
//     socket.onmessage(event)
//     t.is(app._processEvent.callCount, 0)
// })

// test.serial('onmessage callback ignores event with incorrect type', t => {
//     const event = {
//         data: {
//             type: 'another app',
//             someKey: 'someValue'
//         }
//     }
//     const socket = {}
//     app.initialize(socket)
//     socket.onmessage(event)
//     t.is(app._processEvent.callCount, 0)
// })

test.serial('onmessage callback calls processEvent for evt with type == "guhrli"', t => {
  const event = {
    data: {
      type: 'guhrli',
      reading: '70'
    }
  }
  const socket = {}
  app.initialize(socket)
  socket.onmessage(event)
  t.is(app.getReading(), '70')
})

// getFormattedAge()
test.serial('getFormattedAge() returns empty string for time less than 5 minutes', t => {
  const data = {
    type: 'guhrli',
    reading: '180',
    time: new Date().toISOString()
  }
  app._processEvent(data)
  t.is(app.getFormattedAge(), '')
})

test.serial('getFormattedAge() returns time with "m" for age between 5 and 60 minutes', t => {
  const now = new Date()
  const sixMinutesAgo = new Date(now.setMinutes(now.getMinutes() - 6))
  const data = {
    type: 'guhrli',
    reading: '180',
    time: sixMinutesAgo.toISOString()
  }
  app._processEvent(data)
  t.is(app.getFormattedAge(), '6m')
})

test.serial('getFormattedAge() returns time with "h" for age > 60 minutes', t => {
  const now = new Date()
  const seventyMinutesAgo = new Date(now.setMinutes(now.getMinutes() - 70))
  const data = {
    type: 'guhrli',
    reading: '180',
    time: seventyMinutesAgo.toISOString()
  }
  app._processEvent(data)
  t.is(app.getFormattedAge(), '1h')
})

// _processEvent()
test.serial('_processEvent() sets reading and alarm if present', t => {
  const data = {
    reading: '90',
    time: new Date().toISOString(),
    alarm: 'HIGH'
  }
  app._processEvent(data)
  t.is(app.getReading(), '90')
  t.is(app.getAlarm(), 'HIGH')
})

test.serial('_processEvent sets nothing if data.error present', t => {
  const data = {
    reading: '90',
    time: new Date().toISOString(),
    alarm: 'HIGH'
  }
  app._processEvent(data)
  t.is(app.getReading(), '90')

  data.error = true
  data.reading = '85'
  app._processEvent(data)
  t.is(app.getReading(), '90')
})

test.serial('_processEvet setns nothing if data.reading missing', t => {
  const data = {
    reading: '90',
    time: new Date().toISOString(),
    alarm: 'HIGH'
  }
  app._processEvent(data)
  t.is(app.getReading(), '90')
  t.is(app.getAlarm(), 'HIGH')

  delete data.reading
  data.alarm = ''
  t.is(app.getReading(), '90')
  t.is(app.getAlarm(), 'HIGH')
})

// getReading()

// getAlarm()

// getConfig()