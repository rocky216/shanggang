import DataUpdater from "./dataUpdater"

export default class Datafeeds {
  constructor(vue) {
    this.self = vue
    this.barsNum = 0
    this.barsUpdater = new DataUpdater()
    this.resolution="D"
  }

  onReady(callback){
    let _this = this
    return new Promise((resolve, reject)=>{
      resolve(_this.defaultConfiguration())
    }).then((data)=>{
      callback(data)
    })
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback){
    return new Promise((resolve, reject)=>{
      let symbolInfo = _.assign(this.defaultSymbol(), this.self.params)
      resolve(symbolInfo)
    }).then((data)=>{
      onSymbolResolvedCallback(data)
    })
  }

  getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onDataCallback, onErrorCallback, firstRequest) {

    const onLoadedCallback = (data, max, resolute) => {
      if(data && data.length && data.length<max){
        // console.log(this.resolution , resolute);
        // if(this.resolution != resolute){
        //   this.barsNum=0
        //
        //   this.resolution = resolution
        // }
        this.barsNum++
        if(this.barsNum==1){
          onDataCallback(data)
        }else if(this.barsNum==2){
          onDataCallback([], { noData: true })
        }
      }else {
        this.barsNum=0
        onDataCallback(data)
      }

      // data && data.length && data.length==20 ? onDataCallback(data) : onDataCallback([], { noData: true })

    }
    this.self.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback, firstRequest)
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback){
    // this.self.getRealtimeCallback

    this.self.getRealtimeCallback(onRealtimeCallback)
    // this.barsUpdater.subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback)
  }

  unsubscribeBars(subscriberUID) {

  }

  defaultConfiguration(){
    return {
      supports_search: true,
      supports_group_request: false,
      supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W'],
      supports_marks: true,
      supports_timescale_marks: true,
      supports_time: true,
    }
  }

  defaultSymbol(){
    return {
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
      // 'has_empty_bars': true,
      'supported_resolutions': ['1', '5', '15', '30', '60', '1D', '2D', '3D', '1W', '1M']
    }
  }

}
