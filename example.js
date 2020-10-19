import { settingsStorage } from 'settings'
import * as guhrli from './companion'

// order is defined by the Settings component
const BG_SOURCES = {
    NONE: 0,
    NIGHTSCOUT: 1,
    TOMATO: 2,
    XDRIP: 3
}

const KEYS = {
    BG_SOURCE: 'BG_SOURCE',
    NIGHTSCOUT_URL: 'NIGHTSCOUT_URL'
}

function parseSettings() {
    const { selected } = JSON.parse(settingsStorage.getItem(KEYS.BG_SOURCE))
    const source = BG_SOURCES[selected[0]]
    const nightscoutSetting = settingsStorage.getItem(KEYS.NIGHTSCOUT_URL)
    const { name: nightscoutURL } = JSON.parse(nightscoutSetting)
    return { source, nightscoutURL }
}

// first, read current settings from storage
const currentSettings = parseSettings()

// now initialize the service
guhrli.initialize(currentSettings)

// don't forget to listen for settings updates...
settingsStorage.addEventListener('change', (evt) => {
  if (evt.key == KEYS.BG_SOURCE || evt.key == KEYS.NIGHTSCOUT_URL){ 
    guhrli.initialize(parseSettings())
  }
})
