import test from 'ava'

import { SgvServiceBase } from '../../../services/sgv-service-base'

test('initialize() throws error', async t => {
    const instance = new SgvServiceBase()
    await t.throwsAsync(() => instance.initialize(), Error)
})

test('latestReading() throws error', async t => {
    const instance = new SgvServiceBase()
    await t.throwsAsync(() => instance.latestReading(), Error)
})