<template>
  <div id="view" ref="view" >
  </div>
</template>
<script>
import { widget as TvWidget } from '../../../static/tradeview/charting_library/charting_library.min.js'
import reconnectingWebSocket from './utils/reconnectingWebSocket.js'
import throttle from './utils/throttle'
import deepClone from './utils/deepClone'
import dateFormat from './utils/dateFormat'
import datafeeds from './datafeeds/datafees.js'
import { mapState, mapMutations } from 'vuex'
import { getBarData } from './api/apiGroup.js'
import moment from "moment"

export default {
  props: {
    requestUrl: {
      type: Object,
      default() {
        return {
          barUrl: '',
          webSocketUrl: ''
        }
      }
    }
  },
  data() {
    return {
      createButtons: [
        {title: '1m', value: '1'},
        {title: '5m', value: '5'},
        {title: '15m', value: '15'},
        {title: '30m', value: '30'},
        {title: '1h', value: '60'},
        {title: '1D', value: '1D'},
      ],
      height: '',
      widget: null,
      socket: '',
      datafeeds: new datafeeds(this),
      symbol: '',
      symbolInfo: {}, // setSymbol时重设信息
      interval: null,
      cacheData: {},
      firstDataTime: 0,
      lastDataTime: 0,
      reseting: false,
      receiveSocketData: {},
      socketStandBy: false,
      timeInterValOpts: {
        '1': 60,
        '5': 300,
        '15': 900,
        '30': 1800,
        '60': 3600,
        '1D': 86400,
        '1W': 604800,
      },
      timeMinsOpts: {
        '1': 1,
        '5': 5,
        '15': 15,
        '30': 30,
        '60': 60,
        'D': 'D',
      },
    }
  },
  created() {
    this.height = document.documentElement.clientHeight
    this.socket = new reconnectingWebSocket(this.requestUrl.webSocketUrl, null ,{debug: false, reconnectInterval: 3000});
    // 开启socket
    this.socket.addEventListener('open', () => {
      console.log('k线 socket 链接开启');
      // 订阅之
      this.subscribe(this.symbol, this.interval);
      console.log(this.symbol, 777)
      setTimeout(() => {
        this.socketStandBy = true;
      }, 200);
    });
    this.socket.addEventListener('close', () => {
      console.log('k线 socket 链接关闭');
    });
    this.socket.addEventListener('message', this.onMessage);
  },
  mounted() {

  },
  methods: {
    /* 初始化tradingView以及获取历史数据 start  ======================*/
    init(symbol = '', interval = 5) {
      let timer = null;
      new Promise((resolve, reject) => {
        timer = setInterval(() => {
          if (this.socketStandBy) {
            resolve();
          }
        }, 100);
      }).then(res => {
        console.log('初始订阅完成 =============================');
        [this.symbol, this.interval] = [symbol, interval];
        this.initTV(symbol, interval);
        clearInterval(timer);
      });
    },
    getHisData(time, firstRequest,callback) {
      this.reseting = true;
      getBarData({
        url: this.requestUrl.barUrl,
        data: {
          type: 'bar',
          code: this.symbol,
          startday: dateFormat(time.startTime, 'yyyyMMdd'),
          starttime: dateFormat(time.startTime, 'hh:mm:ss'),
          endday: dateFormat(time.endTime, 'yyyyMMdd'),
          endtime: dateFormat(time.endTime, 'hh:mm:ss'),
          period: this.timeMinsOpts[this.interval],
        }
      }, res => {
        const ticker = `${this.symbol}-${this.interval}`;
        if (res && res.Items && res.Items[0]) {
          let list = this.formatData(res.Items[0], res.Time);
          if (firstRequest) {
            // 记录最后一条数据的时间
            this.lastDataTime = list[list.length - 1].time;
            // // 订阅之
            // this.subscribe(this.symbol, this.interval);
          }
          if (callback) { callback(deepClone(list)) }
        } else if (res && res.Items && !res.Items[0]) {
          if (callback) { callback([]) }
        }
      })
    },
    initTV(symbol = '', interval = 5) {
      if (!this.widget) {
        let widget = new TvWidget({
          symbol: symbol,
          interval: interval,
          fullscreen: false,
          width: "100%",
          height: this.height-116,
          // autosize: true,
          container_id: 'view',
          datafeed: this.datafeeds,
          library_path: 'static/tradeview/charting_library/',
          disabled_features: [
            "volume_force_overlay", // k线与销量分开
            'header_symbol_search', // 搜索栏
            "header_screenshot", // 照相机
            "header_fullscreen_button", // 全屏按钮
            // "header_indicators",
            "header_settings",
            "header_resolutions",
            "header_undo_redo", // 左右箭头
            "header_compare", // compare
            // "header_chart_type", // 图表类型
            "header_undo_redo", // 左右箭头
            "header_symbol_search", // 搜索
            "edit_buttons_in_legend",
            "property_pages",
            "left_toolbar", // 左边工具栏
            // "header_widget_dom_node", // 顶部工具栏
            "border_around_the_chart", // 周围边框
            "pane_context_menu", // 图表右键菜单
            "timeframes_toolbar", // 底部时间栏目
            "symbol_search_hot_key", // 搜索热键
            "caption_buttons_text_if_possible",
            "control_bar",
            "context_menus",  //长按纵坐标菜单显示
          ],
          enabled_features: ['hide_last_na_study_output', "dont_show_boolean_study_arguments", "legend_context_menu"],
          timezone: 'Asia/Shanghai',
          locale: 'zh',
          theme: 'Light',
          debug: false,
          overrides: {
            "symbolWatermarkProperties.color": "rgba(0, 0, 0, 0)",
            'paneProperties.topMargin': 15, // 图表上边际
            // 蜡烛图样式
            "mainSeriesProperties.candleStyle.upColor": "#e14e57",
            "mainSeriesProperties.candleStyle.downColor": "#37bc9c",
            "mainSeriesProperties.candleStyle.borderUpColor": "#e14e57",
            "mainSeriesProperties.candleStyle.borderDownColor": "#37bc9c",
            "mainSeriesProperties.candleStyle.wickUpColor": '#e14e57',
            "mainSeriesProperties.candleStyle.wickDownColor": '#37bc9c',
            "paneProperties.legendProperties.showLegend": false, //隐藏图例
            "paneProperties.background": "#ffffff", //背景
            "paneProperties.vertGridProperties.color": "#e9eefa", //网格线
            "scalesProperties.lineColor": "#eee", //坐标轴和刻度标签颜色
            "scalesProperties.textColor": "#979797",
            "scalesProperties.backgroundColor": '#ffffff',
            // "paneProperties.vertGridProperties.style": 0,
            // "paneProperties.horzGridProperties.color": "#1e273c",
            // "paneProperties.horzGridProperties.style": 0,
            // "scalesProperties.showLeftScale":false,

          },
          studies_overrides: {
            "volume.volume.color.0": "rgba(55,188,156,1)",
            "volume.volume.color.1": "rgba(225,78,87,1)",
          }
        })
        this.widget = widget;
        this.symbol = symbol;
        this.interval = interval;
        // 初始化完成后的操作
        this.widget.onChartReady(() => { // 时间刻度切换
          this.widget.chart().createStudy('Moving Average', false, true, [5, "close", 0], null, {'Plot.color': "#dd9d3e"}); // 添加macd线
          this.widget.chart().createStudy('Moving Average', false, true, [10, "close", 0], null, {'Plot.color': "#6195e9"}); // 添加macd线
          let iframeDoc = this.$refs.view.getElementsByTagName('iframe')[0].contentWindow.document;
          // 屏蔽部分指标
          let toolbarPadding = iframeDoc.getElementsByClassName('toolbar-2n2cwgp5-')[0];
          let chartType = iframeDoc.getElementsByClassName('group-wWM3zP_M-')[0];
          chartType.onclick=function(){
            setTimeout(()=>{
              let chartTypes = iframeDoc.getElementsByClassName('item-2xPVYue0- withIcon-1xBjf-oB-');
              var chartTypesArr = [0,2,3,5,6]
              if(chartTypes[0]){
                for(var i=0; i<chartTypesArr.length;i++){
                  chartTypes[chartTypesArr[i]].setAttribute('style', 'display: none');
                }
              }
            },2)

          }
          toolbarPadding.setAttribute('style', 'padding: 0')

          this.widget.subscribe('indicators_dialog', (con) => {

            // ['布林带', '成交量', 'MACD', 'movingAvg cross', '相对强弱指标', '平滑移动平均线smoothed Moving Average', '成交量摆动指标', '真实波动幅度均值', '移动平均线', '累积/派发线']
            let showGroup = [32, 37, 1, 58, 51, 35, 40, 56, 60]
            let zGroup = iframeDoc.getElementsByClassName('js-study-item tv-insert-study-item i-without-stars');
            let searchArea = iframeDoc.getElementsByClassName('tv-search-row tv-insert-indicator-dialog__search-control')[0];
            let searchAreaH = iframeDoc.getElementsByClassName('js-dialog__scroll-wrap')[0];

            searchArea.setAttribute('style', 'display: none');
            searchAreaH.setAttribute('style', 'height: 310px')

            for (let i = 0; i < zGroup.length; i++) {
              if (!showGroup.includes(i) && zGroup[i].setAttribute) {
                zGroup[i].setAttribute('style', 'display: none');
              }
              // if (zGroup[i].getElementsByClassName('tv-insert-study-item__title-text')[0].innerText.includes('RSI')) {
              //   console.log(i);
              // }
            }
          });
          this.widget.chart().onIntervalChanged().subscribe(null, (interval, obj) => { // 监控时间切换

            this.firstDataTime = 0;
            this.lastDataTime = 0;
          });
//resolution
          let _this = this
          let Buttons = iframeDoc.getElementsByClassName('apply-common-tooltip customButton--jqJTfH5-');
          for(var i=0;i<this.createButtons.length;i++){
            (function(arg){
              var button = _this.widget.createButton()[0];
              button.textContent = _this.createButtons[arg]["title"]
              var value = _this.createButtons[arg]["value"]
              if(value=='1D'){
                button.setAttribute('style','color: #0083ff')
              }
              button.addEventListener('click', function() {
                if(Buttons){
                  for(var j = 0; j<Buttons.length; j++){
                    Buttons[j]?Buttons[j].setAttribute('style',''):null
                  }
                }
                _this.widget.chart().setResolution(value,function(){
                  button.setAttribute('style','color: #0083ff')
                })
              });
            })(i)
            // setResolution
          }


          // button.setAttribute('title', 'My custom button tooltip');
          // button.addEventListener('click', function() { alert("My custom button pressed!"); });

        });

      }
    },
    /* 初始化tradingView以及获取历史数据 end  ======================*/

    /* 切换商品时需触发此方法 start  ======================*/
    // setSymbol(id) {
    //   this.unSubscribe(this.symbol, this.interval);
    //   this.symbol = id;
    //   this.firstDataTime = 0;
    //   this.lastDataTime = 0;
    //   console.log(1112322);
    //   this.widget.setSymbol(id, this.interval, () => {});
    // },
    getSymbol(opts) {
      return Object.assign(this.symbolInfo, opts);
    },
    /* 切换商品时需触发此方法 end  ======================*/

    /* 订阅与取消订阅 start  ======================*/
    unSubscribe(symbol, interval) {
      // this.socket.send(JSON.stringify({
      //   MsgID: "3001",
      //   MsgBody: {
      //     instrumentid: symbol
      //   }
      // }));
      this.socket.send(JSON.stringify({
        MsgID: "2001",
        MsgBody: {
          instrumentid: symbol,
          period: interval - 0
        }
      }));
    },
    subscribe(symbol, interval) {
      this.socket.send(JSON.stringify({
        MsgID: "3000",
        MsgBody: {
          instrumentid: symbol
        }
      }));
      this.socket.send(JSON.stringify({
        MsgID: "2000",
        MsgBody: {
          instrumentid: symbol,
          period: interval - 0
        }
      }));
    },
    /* 订阅与取消订阅 end ======================*/

    /* 接受socket数据后的处理 start  ======================*/
    onMessage(data) {
      data = JSON.parse(data.data);
      if (data.Data.InstrumentID === this.symbol) {
        this.updateFun(data);
      }
    },
    updateFun(data) {
      // tick处理 --------start---------
      if (data.Type === 'Tick') {
        this.$emit('getTick', data)
        return;
      }
      // tick处理 ---------end--------
      if (!this.lastDataTime) return;
      const ticker = `${this.symbol}-${this.interval}`;
      let time = Date.parse(
        data.Data.ActionDay.replace(/-/g, '').substring(0, 4) + '/' +
        data.Data.ActionDay.replace(/-/g, '').substring(4, 6) + '/' +
        data.Data.ActionDay.replace(/-/g, '').substring(6) + ' ' +
        data.Data.ActionTime.replace(/:/g, '').substring(0, 2) + ':' +
        data.Data.ActionTime.replace(/:/g, '').substring(2, 4)
      );
      // if (data.Type === 'Tick') {
      //   return; // 先忽略tick数据
      //   time = this.lastDataTime + this.timeInterValOpts[this.interval] * 1000;
      // }
      const barsData = {
        time: time,
        open: data.Data.OpenPrice,
        high: data.Data.HighestPrice,
        low: data.Data.LowestPrice,
        close: data.Data.ClosePrice,
        volume: data.Data.TotalVolume
      }
      if (barsData.time >= this.lastDataTime) {
        this.datafeeds.barsUpdater.updateData([barsData]); // 更新最新一条数据
        if (data.Type === 'Bar') {
          this.lastDataTime = barsData.time;
        }
      }
    },
    /* 接受socket数据后的处理 end  ======================*/

    /* 触发tradingView刷新历史数据 start  ======================*/
    getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback, firstRequest) {
      console.log('触发getBars ===================');
      console.log('起始时间===============', dateFormat(rangeStartDate * 1000, 'yyyy-MM-dd hh:mm:ss'));
      console.log('结束时间===============', dateFormat(rangeEndDate * 1000, 'yyyy-MM-dd hh:mm:ss'))
      if (this.reseting) return;
      // 获取时间区间
      let [startTime, endTime] = [
        rangeStartDate * 1000,
        rangeEndDate * 1000
      ]


      // console.log( '---getbars开始时间---' +  dateFormat(startTime, 'yyyy-MM-dd hh:mm:ss'), '---getbars结束时间---' + dateFormat(rangeEndDate, 'yyyy-MM-dd hh:mm:ss'));
      if (this.interval != resolution) {
        this.unSubscribe(this.symbol, this.interval);
      }
      this.interval = resolution === 'D'? '1D': resolution;
      const ticker = `${this.symbol}-${this.interval}`;
      this.getHisData({
        startTime: startTime,
        endTime: endTime
      }, firstRequest, list => {
        console.log('返回数组长度=============', list.length);
        let newBars = [];
        list.forEach(element => {
          if (element.time >= startTime && element.time <= endTime) {
            newBars.push(element);
          }
        });
        setTimeout(() => {
          console.log(newBars, 777);
          onLoadedCallback(newBars)  // 触发传过来的回调，更新数据
          this.reseting = false; // 开启可刷新开关
        }, 200);
        setTimeout(() => {
          this.$emit('updateComplete');
        }, 1000);
      });
    },
    /* 触发tradingView刷新历史数据 end  ======================*/

    /* 触发设定标记 start  ======================*/
    getMarks(symbolInfo, startDate, endDate, onDataCallback, resolution) {},
    /* 触发设定标记 end  ======================*/

    /* 添加note标记 start ===================== */
    addNoteShape(shapeArr) {
      try {
        shapeArr.forEach(element => {
          let id = this.widget.chart().createShape({
            time: element.time,
            channel: 'high'
          }, {
            shape: 'note',
            zOrder: 'top'
          });
          let obj = this.widget.chart().getShapeById(id);
          let params = {
            markerColor: element.markerColor || "rgba( 46, 102, 255, 1)",
            textColor: element.textColor || "rgba( 0, 0, 0, 1)",
            backgroundColor: element.backgroundColor || "rgba( 255, 255, 255, 1)",
          }
          obj.setProperties({
            text: element.text,
            ...params
          });
        })
      } catch(err) {
        console.log(err);
      }
    },
    // 初始化数据格式
    formatData(data, time, ex = false) {
      let list = []
      data['Amount'].forEach((element, index) => {
        // 是否需要补时差
        let ftime = ex?
        Date.parse(`${time[index].substring(0, 4)}/${time[index].substring(4, 6)}/${time[index].substring(6, 8)} ` + time[index].split(' ')[1]) - new Date().getTimezoneOffset() * 60 * 1000:
        Date.parse(`${time[index].substring(0, 4)}/${time[index].substring(4, 6)}/${time[index].substring(6, 8)} ` + time[index].split(' ')[1])
        // 判断周期是否为天
        if (['1D', '1W', '1M'].includes(this.interval)) { ftime += 34200000 }
        let obj = {
          time: ftime,
          open: data['OpenPrice'][index],
          high: data['HighestPrice'][index],
          low: data['LowestPrice'][index],
          close: data['ClosePrice'][index],
          volume: data['Amount'][index],
        };
        list.push(obj);
      });
      // console.log( '---开始时间---' +  dateFormat(list[0].time, 'yyyy-MM-dd hh:mm:ss'), '---结束时间---' + dateFormat(list[list.length - 1].time, 'yyyy-MM-dd hh:mm:ss'));
      return list;
    },
  },
  watch: {},
  computed: {
    ...mapState({
      marketInfo: state =>state.tradeAndTrends.marketInfo
    }),
  },
  beforeDestroy() {
    if (this.socket.close) {
      this.socket.close();
    } else {
      setTimeout(() => {
        this.socket.close();
      }, 1000);
    }
    delete this.socket;
  }
}
</script>
<style lang="scss">

  #view {
      width: 100%;
      height: 100%;
  }
  .tv-intervalbtn {
    cursor: pointer;
  }
</style>
<style lang="scss">
  .datebtn {
    color: #ffffff !important;
    cursor: pointer;
  }
</style>
