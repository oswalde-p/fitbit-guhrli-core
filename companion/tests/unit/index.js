import test from 'ava'
import * as sinon from 'sinon'
import proxyquire from 'proxyquire'

const messagingStub = {
    peerSocket: {
        send: sinon.stub(),
        OPEN: 'OPEN',
        CLOSED: 'CLOSED'
    },
    '@noCallThru': true
}

const ServiceStub = class {
    initialize = sinon.stub().returns({ units: 'mmol' })

    latestReading = sinon.stub().returns({
        time: 1598763209167,
        value: 201,
        alarm: null
    })
}

class NightscoutService extends ServiceStub { 
    constructor(url) {
        super()
        this.url = url
    }
    type ='NIGHTSCOUT' }
class XdripService extends ServiceStub { type ='XDRIP' }
class TomatoService extends ServiceStub { type ='TOMATO' }

const companion = proxyquire('../../index', {
    'messaging': messagingStub,
    './services/nightscout': { NightscoutService },
    './services/xdrip': { XdripService },
    './services/tomato': { TomatoService }
})

test.before(() => {
    sinon.spy(console, 'error')
    sinon.spy(console, 'log')
})

test('constructor sets peerSocket onopen & onerror events', t => {
    new companion.GuhrliCompanion()
    t.is(typeof messagingStub.peerSocket.onopen, 'function')
    t.is(typeof messagingStub.peerSocket.onerror, 'function')
})

test('peerSocket.onopen calls fetchReading()', t => {
    const guhrli = new companion.GuhrliCompanion()
    sinon.spy(guhrli, 'fetchReading')
    t.is(guhrli.fetchReading.callCount, 0)
    messagingStub.peerSocket.onopen()
    t.is(guhrli.fetchReading.callCount, 1)
})

test.serial('peerSocket.onerror prints to console.error', t => {
    const guhrli = new companion.GuhrliCompanion()
    console.error.resetHistory()
    messagingStub.peerSocket.onerror({ code: '400', message: 'uh oh'})
    t.is(console.error.called, true)
    t.deepEqual(console.error.lastCall.args, ['Companion ERROR: 400 uh oh'])

})

test('constructor initializes sgvService, displayUnits and latestReading attributes', t => {
    const guhrli = new companion.GuhrliCompanion()
    t.deepEqual(guhrli.sgvService, {})
    t.is(guhrli.displayUnits, null)
    t.deepEqual(guhrli.latestReading, {})
})

test('updateSgvService throws GuhrliError if source not provided', t => {
    const guhrli = new companion.GuhrliCompanion()
    t.throws(() => guhrli.updateSgvService(), companion.GuhrliError)
})

test('updateSgvService returns correct service for valud sources', t => {
    const guhrli = new companion.GuhrliCompanion()
    let service = guhrli.updateSgvService('TOMATO')
    t.is(service.type, 'TOMATO')

    service = guhrli.updateSgvService('NIGHTSCOUT', 'test.com')
    t.is(service.type, 'NIGHTSCOUT')

    service = guhrli.updateSgvService('XDRIP')
    t.is(service.type, 'XDRIP')
})

test('updateSgcService throws GuhrliError for unknown source', t => {
    const guhrli = new companion.GuhrliCompanion()
    t.throws(() => guhrli.updateSgvService('NOT_A_SERVICE'), companion.GuhrliError)
})

test('updateSgvService throws GuhrliError when URL not provided for source: NIGHTSCOUT', t => {
    const guhrli = new companion.GuhrliCompanion()
    t.throws(() => guhrli.updateSgvService('NIGHTSCOUT'), companion.GuhrliError)
})

test('initializeService calls .initialize() on the service', async t => {
    const guhrli = new companion.GuhrliCompanion()
    guhrli.updateSgvService('XDRIP')
    t.is(guhrli.sgvService.initialize.callCount, 0)
    await guhrli.initializeService()
    t.is(guhrli.sgvService.initialize.callCount, 1)
})

test('initializeService sets this.units property', async t => {
    const guhrli = new companion.GuhrliCompanion()
    guhrli.updateSgvService('XDRIP')
    t.is(guhrli.displayUnits, null)
    await guhrli.initializeService()
    t.is(guhrli.displayUnits, 'mmol')
})

test.serial('initializeService displays errors using console.error', async t => {
    const guhrli = new companion.GuhrliCompanion()
    guhrli.updateSgvService('XDRIP')
    guhrli.sgvService.initialize.throws('test error', 'bad thing happened')
    console.error.resetHistory()
    await guhrli.initializeService()
    t.is(console.error.firstCall.args[0], 'Error initializing service')
    t.is(console.error.lastCall.args[0].name, 'test error')
})

test('fetchReading returns undefined if sgvService missing or without reading', async t => {
    const guhrli = new companion.GuhrliCompanion()
    t.is(await guhrli.fetchReading(), undefined)
    guhrli.sgvService = {}
    t.is(await guhrli.fetchReading(), undefined)
})

test.serial('fetchReading displays errors using console.error', async t => {
    const guhrli = new companion.GuhrliCompanion()
    guhrli.sgvService = {
        latestReading: sinon.stub().throws('test error 2', 'bad thing happened')
    }
    console.error.resetHistory()
    await guhrli.fetchReading()
    t.is(console.error.lastCall.args[0].name, 'test error 2')
})

test('fetchReading calls sgvSerivice.latestReading() and this.sendReading() for when this.latestReading is falsey', async t => {
    const guhrli = new companion.GuhrliCompanion()
    guhrli.sgvService = new XdripService()
    sinon.stub(guhrli, 'sendReading')
    await guhrli.fetchReading()
    t.is(guhrli.sgvService.latestReading.callCount, 1)
    t.is(guhrli.sendReading.callCount, 1)
})

test('fetchReading does nothing if latest reading has sime time as current reading', async t => {
    const guhrli = new companion.GuhrliCompanion()
    guhrli.sgvService = new XdripService()
    guhrli.latestReading = {
        time: 1598763209167,
        value: '100'
    }
    sinon.stub(guhrli, 'sendReading')

    await guhrli.fetchReading()
    t.is(guhrli.sgvService.latestReading.callCount, 1)
    t.is(guhrli.sendReading.callCount, 0)
    t.is(guhrli.latestReading.value, '100')
})

test.serial('sendReading prints to console.log if peerSocket not open', t => {
    messagingStub.peerSocket.readyState = 'CLOSED'
    const guhrli = new companion.GuhrliCompanion()
    guhrli.sendReading()
    t.is(console.log.lastCall.args[0], 'Cannot send reading: peerSocket closed')
})

test.serial('sendReading calls peerSocket.send with correct args when readyState === OPEN', t => {
    messagingStub.peerSocket.readyState = 'OPEN'
    const guhrli = new companion.GuhrliCompanion()
    guhrli.displayUnits = 'mgdl'
    guhrli.latestReading = {
        serialize: sinon.stub().returns('some text')
    }
    guhrli.sendReading()
    t.is(guhrli.latestReading.serialize.lastCall.args[0], 'mgdl')
    t.is(messagingStub.peerSocket.send.lastCall.args[0], 'some text')
})

test('initialize() throws GuhrliError if no source provided', t => {
    t.throws(() => companion.initialize(), companion.GuhrliError)
})

test('initialize() returns companion instance', t => {
    const result = companion.initialize({ source: 'TOMATO' })
    t.is(result instanceof companion.GuhrliCompanion, true)
})

test('initialize() passes source and url on to updateSgvService', t => {
    const result = companion.initialize({ source: 'NIGHTSCOUT', nightscoutURL: 'test.com/' })
    t.is(result.sgvService.initialize.callCount, 1)
    t.is(result.sgvService.type, 'NIGHTSCOUT')
    t.is(result.sgvService.url, 'test.com/')
})
