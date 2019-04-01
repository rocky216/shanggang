import DataUpdater from "./dataUpdater"

export default class Datafeeds {
  constructor(vue) {
    this.self = vue
    this.barsUpdater = new DataUpdater()
    this.defaultConfiguration={
      // supports_search: true,
      // supports_group_request: false,
      supports_marks: true,
      supports_timescale_marks: true,
      supports_time: true,
      supported_resolutions:['1', '5', '15', '30', '60', '1D', '1W'],
    }
    this.defaultSymbol = {
      'name': 'BTCUSDT',
      'timezone': 'UTC',
      'minmov': 1,
      'minmov2': 0,
      'pointvalue': 1,
      'fractional': false,
      'session': '24x7',
      'has_intraday': true,
      'has_no_volume': false,
      'description': 'BTCUSDT',
      'pricescale': 1,
      'ticker': 'BTCUSDT',
      'supported_resolutions': ['1', '5', '15', '30', '60', '1D', '2D', '3D', '1W', '1M']
    }
  }

  onReady(callback){
    let _this = this
    return new Promise((resolve, reject)=>{
      resolve(_this.defaultConfiguration)
    }).then((data)=>{
      console.log(data, 'onReady')
      callback(data)
    })
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback){
    return new Promise((resolve, reject)=>{
      let symbolInfo = _.assign(this.defaultSymbol, this.self.params)
      resolve(symbolInfo)
    }).then((data)=>{
      onSymbolResolvedCallback(data)
    })
  }

  getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest){
    let historyCallback = (data)=>{
      data && data.length>0?onHistoryCallback(data):onHistoryCallback([], {noData: true})
    }
    this.self.getBars(symbolInfo, resolution, from, to, historyCallback, onErrorCallback, firstDataRequest)
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback){
    // this.self.getRealtimeCallback

    this.self.getRealtimeCallback(onRealtimeCallback)
    // this.barsUpdater.subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback)
  }

  unsubscribeBars(subscriberUID) {

  }

}
