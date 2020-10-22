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

test('companion exports intialize() function', t => {
    t.is(typeof companion.initialize, 'function')
})

test('companion exports GuhrliError', t => {
    t.is(typeof companion.GuhrliError, 'function')
    const instance = new companion.GuhrliError('msg')
    t.is(instance instanceof Error, true)
})

test('companion.initialize throws Error if called without source', t => {
    t.throws(() => companion.initialize(), Error)
})

test('companion.initialize() with source: "TOMATO" returns GuhrliCompanion instance', t => {
    const guhrli = companion.initialize({ source: 'TOMATO' })
    t.is(typeof guhrli, 'object')
    t.is(typeof guhrli.fetchReading, 'function')
})

test('companion.initialize() with source: "XDRIP" returns GuhrliCompanion instance', t => {
    const guhrli = companion.initialize({ source: 'XDRIP' })
    t.is(typeof guhrli, 'object')
    t.is(typeof guhrli.fetchReading, 'function')
})

test('companion.initialize() with source: "NIGHTSCOUT" and URL returns GuhrliCompanion instance', t => {
    const guhrli = companion.initialize({ source: 'NIGHTSCOUT', nightscoutURL: 'https://test.com/' })
    t.is(typeof guhrli, 'object')
    t.is(typeof guhrli.fetchReading, 'function')
})

test('companion.initialize() with source: "NIGHTSCOUT" and no URL throws GuhrliError', t => {
    t.throws(() => companion.initialize({source: 'NIGHTSCOUT'}), companion.GuhrliError)
})

test('companion.initialize() with unknown source throws GuhrliError', t => {
    t.throws(() => companion.initialize({source: 'NIGHTSCOOT'}), companion.GuhrliError)
})