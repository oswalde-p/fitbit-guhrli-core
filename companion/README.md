# Companion API

### initialize({ source: string, nightscoutURL?: string }): GuhrliCompanion

Create a new GuhrliCompanion instance, and attempt to intialize the sgv service.
This behaviour varies with the source, but usually involves making a request to
the source's status endpoint to set things like display units and alarm
thresholds. 

**source** must be one of ```[ 'NIGHTSCOUT', 'XDRIP', 'TOMATO']```.  If using
nightscout, **nightscoutURL** must be provided and must link to a nightscout
deployment. Only include the URL base, eg "https://my-deployment.herokuapp.com"



### GuhrliCompanion

The main class responsible for sending messages to the device and fetching new
readings from the source. The consructor uses setInterval to poll the source for
new readings each minute.

You shouldn't need to call any methods or access any properties directly.

#### updateSgvService(source: string, nightscoutURL?: string) : SGVService

Instantiate a new SGV service and set this.sgvService.

#### async initializeService()

Initialize the current sgvService and set this.displayUnits.

#### async fetchReading()

Retrieve the latest reading from the sgvService. If it is new, set
this.latestReading and call this.sendReading().

Called every minute by setInterval.

#### sendReading()

If the peerSocket is open, send the this.latestReading to the device. Otherwise,
display an error message to console.log



### GuhrliError

Custom error class for all errors thrown by the library.
