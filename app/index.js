import { DEFAULT_CONFIG } from './consts'
import { GuhrliError } from '../common/errors'

let reading = '-'
let time = null
let alarm = ''
let hasError = false
let config = DEFAULT_CONFIG

const initialize = function(peerSocket, userConfig) {
  if (!peerSocket) throw new GuhrliError('Missing paramater "peerSocket"')
  if (userConfig) config = userConfig // todo: merge to allow partial config to be passed
  peerSocket.onmessage = (evt) => {
    // make sure it's one of our events first
    if (evt.data && evt.data.type === 'guhrli') {
      _processEvent(evt.data)
    }
  }
}

const getFormattedAge = function() {
  if (!time) return
  const age = Math.round((new Date() - time) / (60 * 1000))
  if (age > config.staleSgvMins) {
    if (age < 60 ) {
      return `${age}m`
    } else {
      return `${Math.round(age / 60)}h`
    }
  } else {
    return ''
  }
}

const _processEvent = function(data) {
  if (data.error) {
    hasError = true
    return
  }
  hasError = false
  if (data.reading) {
    reading = data.reading
    time = new Date(data.time)
    alarm = data.alarm
  }
}

const getReading = function() {
  return reading
}

const getAlarm = function() {
  return alarm
}

const getConfig = function() {
  return config
}

export default {
  initialize,
  getAlarm,
  getConfig,
  getFormattedAge,
  getReading,
  GuhrliError,
  _processEvent
}
