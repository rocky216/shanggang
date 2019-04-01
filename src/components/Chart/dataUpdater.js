export default class DataUpdater {
  constructor() {
    this.subscribers = {}
    this.onRealtimeCallback = ''
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback){
    return new Promise((resole, reject)=>{
      this.onRealtimeCallback = onRealtimeCallback
      resole(onRealtimeCallback)
    })

  }

  updateBar(data){

    if(this.onRealtimeCallback){
      this.onRealtimeCallback(data)
    }

  }
}
