<template>
<div id="container" ref="container">

</div>
</template>

<script>
import {widget as TvWidget} from "../../../static/tradeview/charting_library/charting_library.min.js"
import ReconnectingWebSocket from '@/components/tradingView/utils/reconnectingWebSocket.js'
import Datafeeds from "./Datafeeds"
import axios from "axios"
import moment from "moment"
import { TV_RESFUL_URL, TV_WEBSOCKET_URL} from '@/config/config'
import {options, subData, CreateStudys, Romovefun, AddButton} from "./util"


export default {
  props:{
    code: {
      type: String,
      default: '000797.SZ',
    },
    initOpt: {
      type: Object,
      default: function(){
        return {}
      }
    },
    tickData:{
      type: Object,
      default: function(){
        return {}
      }
    }
  },
  watch: {
    tickData(val){
      this.tickData = val
    }
  },
  data(){
    return {
      bBtn: 1,
      timer: null,
      ws: new ReconnectingWebSocket(TV_WEBSOCKET_URL,null, {debug: true, reconnectInterval: 3000}),
      widget: '',
      datafeeds: new Datafeeds(this),
      onRealtimeCallback: '',
      resolution: '',
      startday: '',
      starttime: '',
      params: {
        symbol: this.initOpt.code,
        interval: this.initOpt.interval,
        name: this.initOpt.code,
        resolution: this.initOpt.interval,
        'session': '0930-1130,1300-1500:23456', // 交易时间
        'description': this.initOpt.code, // 商品描述
        'pricescale': 100, // 数值精度
        'ticker': this.initOpt.code, // ticker
        // fullscreen: true,
        'supported_resolutions':['1', '5', '15', '30', '60', 'D'] // 支持分辨率
      },
    }
  },
  mounted() {
    this.InitTV()
    this.handlenWs()
  },
  methods: {
    //获取订阅函数
    getRealtimeCallback(fn){
      this.onRealtimeCallback = fn
    },
    handlenWs(){
      this.ws.addEventListener('open', ()=>{
        this.ws.send(JSON.stringify( subData(3000, this.initOpt.code) ))
        this.ws.send(JSON.stringify( subData(2000, this.initOpt.code) ))
        this.ws.send(JSON.stringify( subData(2000, this.initOpt.code, 1440) ))
      }, false)
      this.ws.addEventListener('message', (val)=>{
        let data= JSON.parse(val.data)

        if (data.Type == 'Tick') {
          this.$emit('getTick', data.Data)
        }
        if(data.Type == 'RunningBar'){
          data = data.Data
          if(data.OpenPrice){
            this.handlenRunningBar(data)
          }

        }
      }, false)
    },
    handlenRunningBar(data){

      let time = moment(this.processTime(`${data.ActionDay} ${data.ActionTime}`)).valueOf()
      const barsData = {
        time: time,
        open: data.OpenPrice,
        high: data.HighestPrice,
        low: data.LowestPrice,
        close: data.LastPrice?data.LastPrice:data.ClosePrice,
        volume: data.TotalVolume
      }
      if (this.onRealtimeCallback) {
        this.onRealtimeCallback(barsData)
      }
    },
    unsubHandlen(close, open){
      if(!close || close==open) return
      if (close=='D' || close=="1D") {
        close = 1440
      }
      if (open=='D' || open=="1D") {
        open = 1440
      }
      if (this.ws.readyState == 1) {
        this.ws.send(JSON.stringify( subData(2001, this.initOpt.code, close) ))
        this.ws.send(JSON.stringify( subData(2000, this.initOpt.code, open) ))
      }else {
        this.ws.addEventListener('open', ()=>{
          this.ws.send(JSON.stringify( subData(2001, this.initOpt.code, close) ))
          this.ws.send(JSON.stringify( subData(2000, this.initOpt.code, open) ))
        }, false)
      }
    },
    InitTV() {
      let _this = this
      const opt = Object.assign({
          ...options,
          container_id: "container",
          datafeed: _this.datafeeds,
          ...this.params,
      }, this.initOpt)

      this.widget = new TvWidget(opt);
      this.widget.onChartReady(()=>{
        //生成masd线
        CreateStudys(this.widget)
        //去除功能
        let iframeDoc = this.$refs.container.getElementsByTagName('iframe')[0].contentWindow.document;
        Romovefun(iframeDoc, this.widget)

        //添加button
        AddButton(iframeDoc, this.widget)

      })
    },
    getBars(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest){
      let resolute = resolution
      if(resolution=='D' || resolution=='1D'){
        resolute='D'
      }

      this.unsubHandlen(this.resolution, resolution)
      if(this.resolution != resolution){
        this.startday = moment(to*1000).format("YYYYMMDD")
        this.starttime = moment(to*1000).format("HH:mm:ss")
        this.resolution = resolution
      }

      axios({
        url: `${TV_RESFUL_URL}/Stock`,
        method: 'get',
        params: {
          type: 'bar',
          code: this.initOpt.code,
          endday: moment(from*1000).format("YYYYMMDD"),
          endtime: moment(from*1000).format("HH:mm:ss"),
          startday: this.startday,
          starttime: this.starttime,
          max_point: this.getMaxPoint(resolute),
          period: resolute
        }
      }).then((res)=>{
        const {Items, Time} = res.data
        let data = this.processData(Items, Time, resolution)
        if(Time.length){
          this.startday = this.compareTime(Time[0], Time[Time.length-1]).substring(0,8)
          this.starttime = this.compareTime(Time[0], Time[Time.length-1]).substring(9)

          data = this.rangeDataPreMkt(data);
          onHistoryCallback(
            data,
            Math.abs(this.getMaxPoint(resolute)),
            resolution
          )
        }
        if(this.onRealtimeCallback && resolute=='D' && this.tickData.LastPrice){
          this.handlenRunningBar(this.tickData)
        }
      })
    },
    getMaxPoint(resolution){
      switch (resolution) {
        case 'D' || '1D':
          return -100
          break;
        case '1':
          return -100
          break;
        case '5':
          return -50
          break;
        case '15':
          return -30
          break;
        case '30':
          return -10
          break;
        case '60':
          return -20
          break;
        default:
          return -20
      }
    },
    processData(Items, Time, resolution){
      let arr = []
      let timeArr = []
      if(!Time.length) return arr
      let opens = Items[0]["OpenPrice"], closes = Items[0]["ClosePrice"],
      highs = Items[0]["HighestPrice"], lows = Items[0]["LowestPrice"], volumes = Items[0]["TotalVolume"]
      _.each(Time, (item, index)=>{
        arr.push({
          time: moment(this.processTime(item)).valueOf(), //new Date(this.processTime(item)).getTime(),
          open: parseFloat(opens[index]),
          close: parseFloat(closes[index]),
          high: parseFloat(highs[index]),
          low: parseFloat(lows[index]),
          volume: parseFloat(volumes[index])
        })
        timeArr.push(moment(this.processTime(item)))
      })
      let outputData = this.compareBoolea(Time[0],Time[Time.length-1])?arr.reverse():arr
      return outputData
    },
    processTime(str){
      return `${str.substring(0,4)}-${str.substring(4,6)}-${str.substring(6,8)} ${str.substring(9)}`
    },
    compareTime(t1, t2){
      let time1 = `${t1.substring(0,4)-t1.substring(4,6)-t1.substring(6,8)} ${t1.substring(9)}`
      let time2 = `${t2.substring(0,4)-t2.substring(4,6)-t2.substring(6,8)} ${t2.substring(9)}`
      return t1>t2?t2:t1
    },
    compareBoolea(t1, t2){
      let time1 = `${t1.substring(0,4)-t1.substring(4,6)-t1.substring(6,8)} ${t1.substring(9)}`
      let time2 = `${t2.substring(0,4)-t2.substring(4,6)-t2.substring(6,8)} ${t2.substring(9)}`
      return t1>t2?true:false
    },
    rangeDataPreMkt(data){
      if (data[0].close === 0) {
        data[0].open =
        data[0].high =
        data[0].low =
        data[0].close =
        data[1].close;
      }
      if (data[data.length - 1].close === 0) {
        data[data.length - 1].open =
        data[data.length - 1].high =
        data[data.length - 1].low =
        data[data.length - 1].close =
        data[data.length - 2].close;
      }
      return data;
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
