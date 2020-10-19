import test from 'ava'

import app from '../../index'

test('Module exports expected functions', t => {
    t.is(typeof app.initialize, 'function')
    t.is(typeof app.getAlarm, 'function')
    t.is(typeof app.getConfig, 'function')
    t.is(typeof app.getFormattedAge, 'function')
    t.is(typeof app.getReading, 'function')
    t.is(typeof app.GuhrliError, 'function')
    const instance = new app.GuhrliError('msg')
    t.is(instance instanceof Error, true)
})

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