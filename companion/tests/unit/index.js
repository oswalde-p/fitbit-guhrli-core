import test from 'ava'
import * as sinon from 'sinon'
import proxyquire from 'proxyquire'

const messagingStub = {
    peerSocket: {
        send: sinon.stub()
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

const companion = proxyquire('../../index', {
    'messaging': messagingStub,
    './services/nightscout': { NightscoutService: ServiceStub },
    './services/xdrip': { XdripService: ServiceStub },
    './services/tomato': { TomatoService: ServiceStub }
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

test('peerSocket.onerror prints to console.error', t => {
    const guhrli = new companion.GuhrliCompanion()
    sinon.spy(console, 'error')
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
