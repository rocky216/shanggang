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
  data(){
    return {
      ws: new ReconnectingWebSocket(TV_WEBSOCKET_URL,null, {debug: true, reconnectInterval: 3000}),
      widget: '',
      datafeeds: new Datafeeds(this),
      onRealtimeCallback: '',
      params: {
        symbol: this.$route.query.stock_code || '000797.SZ',
        interval: '1',
        name: this.$route.query.stock_code || '000797.SZ',
        fullscreen: true,
        'supported_resolutions':['1', '5', '15', '30', '60', 'D'] // 支持分辨率
      },
    }
  },
  mounted() {
    console.log(this.$route.query.stock_code);
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
        this.ws.send(JSON.stringify( subData(3000, this.params.symbol) ))
        this.ws.send(JSON.stringify( subData(2000, this.params.symbol) ))
      }, false)
      this.ws.addEventListener('message', (val)=>{
        const data= JSON.parse(val.data).Data
        let time = moment(this.processTime(`${data.ActionDay} ${data.ActionTime}`)).valueOf()
        const barsData = {
          time: time,
          open: data.OpenPrice,
          high: data.HighestPrice,
          low: data.LowestPrice,
          close: data.ClosePrice,
          volume: data.TotalVolume
        }
        // setTimeout(()=>{
        //   this.onRealtimeCallback(barsData)
        // }, 100)
      }, false)
    },
    InitTV() {
      let _this = this
      this.widget = new TvWidget({
        ...this.params,
          container_id: "container",
          datafeed: _this.datafeeds,
          ...options,
      });
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
      axios({
        url: TV_RESFUL_URL,
        method: 'get',
        params: {
          type: 'bar',
          code: this.params.symbol,
          startday: moment(from*1000).format("YYYYMMDD"),
          starttime: moment(from*1000).format("HH:mm:ss"),
          endday: moment(to*1000).format("YYYYMMDD"),
          endtime: moment(to*1000).format("HH:mm:ss"),
          period: resolution=='1D'?'D':resolution
        }
      }).then((res)=>{
        const {Items, Time} = res.data
        let data = this.processData(Items, Time)
        onHistoryCallback(data)
      })
    },
    processData(Items, Time){
      let arr = []
      if(!Time.length) return arr
      let opens = Items[0]["OpenPrice"], closes = Items[0]["ClosePrice"],
      highs = Items[0]["HighestPrice"], lows = Items[0]["LowestPrice"], volumes = Items[0]["TotalVolume"]

      _.each(Time, (item, index)=>{
        arr.push({
          time: moment(this.processTime(item)).valueOf(),
          open: opens[index],
          close: closes[index],
          high: highs[index],
          low: lows[index],
          volume: volumes[index]
        })
      })
      return arr
    },
    processTime(str){
      return `${str.substring(0,4)}-${str.substring(4,6)}-${str.substring(6,8)} ${str.substring(9)}`
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
