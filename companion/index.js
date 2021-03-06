import { peerSocket } from 'messaging'


import { FETCH_FREQUENCY_MINS, BG_SOURCES } from './consts'
import { addSlash } from './utils'
import { NightscoutService } from './services/nightscout'
import { TomatoService } from './services/tomato'
import { XdripService } from './services/xdrip'
import { GuhrliError } from '../common/errors'

class GuhrliCompanion {
  constructor() {
    // first, add listeners for socket events
    peerSocket.onopen = () => {
      console.log('Socket open') // eslint-disable-line no-console
      this.fetchReading()
    }

    peerSocket.onerror = function(err) {
      console.error(`Companion ERROR: ${err.code} ${err.message}`) // eslint-disable-line no-console
    }

    this.sgvService = {}
    this.displayUnits = null
    this.latestReading = {}


    // try to update reading every minute
    setInterval(() => this.fetchReading(), 1000 * 60 * FETCH_FREQUENCY_MINS)
  }

  updateSgvService(source, nightscoutURL) {
    if (!source) throw new GuhrliError('Missing SGV source')
    switch (source) {
      case BG_SOURCES.TOMATO:
        return this.sgvService = new TomatoService()
      case BG_SOURCES.NIGHTSCOUT: {
        if (!nightscoutURL) throw new GuhrliError('Nighscout url not set')
        return this.sgvService = new NightscoutService(addSlash(nightscoutURL))
      }
      case BG_SOURCES.XDRIP:
        return this.sgvService = new XdripService()
      default:
        throw new GuhrliError(`Unknown SGV source "${source}"`)
    }
  }

  async initializeService() {
    try {
      const { units } = await this.sgvService.initialize()
      this.displayUnits = units
    } catch(err) {
      console.error('Error initializing service') // eslint-disable-line no-console
      console.error(err) // eslint-disable-line no-console
    }
  }

  async fetchReading() {
    if (!this.sgvService || !this.sgvService.latestReading) return
    try {
      let reading = await this.sgvService.latestReading()
      if (reading && (!this.latestReading || this.latestReading.time != reading.time)) {
        this.latestReading = reading
        this.sendReading()
      }
    } catch (err) {
      console.error(err) // eslint-disable-line no-console
    }
  }

  sendReading() {
    if (peerSocket.readyState === peerSocket.OPEN) {
      const data = this.latestReading.serialize(this.displayUnits)
      return peerSocket.send(data)
    }
    console.log('Cannot send reading: peerSocket closed') // eslint-disable-line no-console
  }
}

function initialize({source, nightscoutURL} = {}) {
  if (!source) throw new GuhrliError('Must provide at least SGV source')
  const instance = new GuhrliCompanion()
  instance.updateSgvService(source, nightscoutURL)
  instance.initializeService()
  return instance
}

export {
  initialize,
  GuhrliCompanion,
  GuhrliError
}