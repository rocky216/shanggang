import moment from "moment"

export let options = {
  fullscreen: false,
  width: "100%",
  "library_path": 'static/tradeview/charting_library/',
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
  theme: 'Light',
  locale: 'zh',
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
    "volume.volume.color.0": "rgba(55,188,156,0.8)",
    "volume.volume.color.1": "rgba(225,78,87,0.8)",
  }
}

export function subData(num, code, period=''){
  return {
    MsgID: num,
    MsgBody: {
      instrumentid: code,
      period
    }
  }
}

//创建指标线
export function CreateStudys(widget){
  widget.chart().createStudy('Moving Average', false, true, [5, "close", 0], null,
  {
    'Plot.color': "#dd9d3e",
    "Plot.linewidth": 1
  }); // 添加macd线
  widget.chart().createStudy('Moving Average', false, true, [10, "close", 0], null, {
    'Plot.color': "#6195e9",
    "Plot.linewidth": 1
  }); // 添加macd线
}

//去除不需要的功能
export function Romovefun(iframeDoc, widget){
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

  // ['布林带', '成交量', 'MACD', 'movingAvg cross', '相对强弱指标', '平滑移动平均线smoothed Moving Average', '成交量摆动指标', '真实波动幅度均值', '移动平均线', '累积/派发线']
  widget.subscribe("indicators_dialog", ()=>{
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
    }
  })
}

export function AddButton(iframeDoc, widget){
  let createButtons = [
    {title: '1m', value: '1'},
    {title: '5m', value: '5'},
    {title: '15m', value: '15'},
    {title: '30m', value: '30'},
    {title: '1h', value: '60'},
    {title: '1D', value: 'D'},
  ]
  let Buttons = iframeDoc.getElementsByClassName('apply-common-tooltip customButton--jqJTfH5-');
  for(var i=0;i<createButtons.length;i++){
    (function(arg){
      var button = widget.createButton()[0];
      button.textContent = createButtons[arg]["title"]
      var value = createButtons[arg]["value"]
      if(value=='D'){
        button.setAttribute('style','color: #0083ff')
      }
      button.addEventListener('click', function() {
        if(Buttons){
          for(var j = 0; j<Buttons.length; j++){
            Buttons[j]?Buttons[j].setAttribute('style',''):null
          }
        }

        widget.chart().setResolution(value, function(){
          button.setAttribute('style','color: #0083ff')
        })
      });
    })(i)
  }
}
