webpackJsonp([3],{"0NAM":function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=a(o("rVsN")),n=a(o("AA3o"));function a(e){return e&&e.__esModule?e:{default:e}}var s=function(){function e(){(0,n.default)(this,e),this.subscribers={},this.onRealtimeCallback=""}return e.prototype.subscribeBars=function(e,t,o,n,a){var s=this;return console.log(n),new r.default(function(e,t){s.onRealtimeCallback=o,e(o)})},e.prototype.updateBar=function(e){this.onRealtimeCallback&&this.onRealtimeCallback(e)},e}();t.default=s},Ajw4:function(e,t){},LHuS:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=s(o("rVsN")),n=s(o("AA3o")),a=s(o("0NAM"));function s(e){return e&&e.__esModule?e:{default:e}}var i=function(){function e(t){(0,n.default)(this,e),this.self=t,this.barsUpdater=new a.default,this.defaultConfiguration={supports_marks:!0,supports_timescale_marks:!0,supports_time:!0,supported_resolutions:["1","5","15","30","60","1D","1W"]},this.defaultSymbol={name:"BTCUSDT",timezone:"UTC",minmov:1,minmov2:0,pointvalue:1,fractional:!1,session:"24x7",has_intraday:!0,has_no_volume:!1,description:"BTCUSDT",pricescale:1,ticker:"BTCUSDT",supported_resolutions:["1","5","15","30","60","1D","2D","3D","1W","1M"]}}return e.prototype.onReady=function(e){var t=this;return new r.default(function(e,o){e(t.defaultConfiguration)}).then(function(t){console.log(t,"onReady"),e(t)})},e.prototype.resolveSymbol=function(e,t,o){var n=this;return new r.default(function(e,t){e(_.assign(n.defaultSymbol,n.self.params))}).then(function(e){t(e)})},e.prototype.getBars=function(e,t,o,r,n,a,s){this.self.getBars(e,t,o,r,function(e){e&&e.length>0?n(e):n([],{noData:!0})},a,s)},e.prototype.subscribeBars=function(e,t,o,r,n){this.self.getRealtimeCallback(o)},e.prototype.unsubscribeBars=function(e){},e}();t.default=i},vDcN:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=o("x2U2"),n=o.n(r);for(var a in r)"default"!==a&&function(e){o.d(t,e,function(){return r[e]})}(a);var s=o("zlEH");var i=function(e){o("Ajw4")},l=o("C7Lr")(n.a,s.a,!1,i,"data-v-2913b468",null);t.default=l.exports},x2U2:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=f(o("4YfN")),n=f(o("3cXf")),a=o("IuFh"),s=f(o("pPcT")),i=f(o("LHuS")),l=f(o("aozt")),u=f(o("VD+p")),c=o("d2gY"),d=o("zga2");function f(e){return e&&e.__esModule?e:{default:e}}t.default={data:function(){return{ws:new s.default(c.TV_WEBSOCKET_URL,null,{debug:!0,reconnectInterval:3e3}),widget:"",datafeeds:new i.default(this),onRealtimeCallback:"",params:{symbol:this.$route.query.stock_code||"000797.SZ",interval:"1",name:this.$route.query.stock_code||"000797.SZ",fullscreen:!0,supported_resolutions:["1","5","15","30","60","D"]}}},mounted:function(){console.log(this.$route.query.stock_code),this.InitTV(),this.handlenWs()},methods:{getRealtimeCallback:function(e){this.onRealtimeCallback=e},handlenWs:function(){var e=this;this.ws.addEventListener("open",function(){e.ws.send((0,n.default)((0,d.subData)(3e3,e.params.symbol))),e.ws.send((0,n.default)((0,d.subData)(2e3,e.params.symbol)))},!1),this.ws.addEventListener("message",function(t){var o=JSON.parse(t.data).Data;(0,u.default)(e.processTime(o.ActionDay+" "+o.ActionTime)).valueOf(),o.OpenPrice,o.HighestPrice,o.LowestPrice,o.ClosePrice,o.TotalVolume},!1)},InitTV:function(){var e=this;this.widget=new a.widget((0,r.default)({},this.params,{container_id:"container",datafeed:this.datafeeds},d.options)),this.widget.onChartReady(function(){(0,d.CreateStudys)(e.widget);var t=e.$refs.container.getElementsByTagName("iframe")[0].contentWindow.document;(0,d.Romovefun)(t,e.widget),(0,d.AddButton)(t,e.widget)})},getBars:function(e,t,o,r,n,a,s){var i=this;(0,l.default)({url:c.TV_RESFUL_URL,method:"get",params:{type:"bar",code:this.params.symbol,startday:(0,u.default)(1e3*o).format("YYYYMMDD"),starttime:(0,u.default)(1e3*o).format("HH:mm:ss"),endday:(0,u.default)(1e3*r).format("YYYYMMDD"),endtime:(0,u.default)(1e3*r).format("HH:mm:ss"),period:"1D"==t?"D":t}}).then(function(e){var t=e.data,o=t.Items,r=t.Time,a=i.processData(o,r);n(a)})},processData:function(e,t){var o=this,r=[];if(!t.length)return r;var n=e[0].OpenPrice,a=e[0].ClosePrice,s=e[0].HighestPrice,i=e[0].LowestPrice,l=e[0].TotalVolume;return _.each(t,function(e,t){r.push({time:(0,u.default)(o.processTime(e)).valueOf(),open:n[t],close:a[t],high:s[t],low:i[t],volume:l[t]})}),r},processTime:function(e){return e.substring(0,4)+"-"+e.substring(4,6)+"-"+e.substring(6,8)+" "+e.substring(9)}}}},zga2:function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.subData=function(e,t){return{MsgID:e,MsgBody:{instrumentid:t}}},t.CreateStudys=function(e){e.chart().createStudy("Moving Average",!1,!0,[5,"close",0],null,{"Plot.color":"#dd9d3e"}),e.chart().createStudy("Moving Average",!1,!0,[10,"close",0],null,{"Plot.color":"#6195e9"})},t.Romovefun=function(e,t){var o=e.getElementsByClassName("toolbar-2n2cwgp5-")[0];e.getElementsByClassName("group-wWM3zP_M-")[0].onclick=function(){setTimeout(function(){var t=e.getElementsByClassName("item-2xPVYue0- withIcon-1xBjf-oB-"),o=[0,2,3,5,6];if(t[0])for(var r=0;r<o.length;r++)t[o[r]].setAttribute("style","display: none")},2)},o.setAttribute("style","padding: 0"),t.subscribe("indicators_dialog",function(){var t=[32,37,1,58,51,35,40,56,60],o=e.getElementsByClassName("js-study-item tv-insert-study-item i-without-stars"),r=e.getElementsByClassName("tv-search-row tv-insert-indicator-dialog__search-control")[0],n=e.getElementsByClassName("js-dialog__scroll-wrap")[0];r.setAttribute("style","display: none"),n.setAttribute("style","height: 310px");for(var a=0;a<o.length;a++)!t.includes(a)&&o[a].setAttribute&&o[a].setAttribute("style","display: none")})},t.AddButton=function(e,t){for(var o=[{title:"1m",value:"1"},{title:"5m",value:"5"},{title:"15m",value:"15"},{title:"30m",value:"30"},{title:"1h",value:"60"},{title:"1D",value:"1D"}],r=e.getElementsByClassName("apply-common-tooltip customButton--jqJTfH5-"),n=0;n<o.length;n++)!function(e){var n=t.createButton()[0];n.textContent=o[e].title;var a=o[e].value;"1D"==a&&n.setAttribute("style","color: #0083ff"),n.addEventListener("click",function(){if(r)for(var e=0;e<r.length;e++)r[e]&&r[e].setAttribute("style","");t.chart().setResolution(a,function(){n.setAttribute("style","color: #0083ff")})})}(n)};t.options={locale:"zh",library_path:"static/tradeview/charting_library/",disabled_features:["volume_force_overlay","header_symbol_search","header_screenshot","header_fullscreen_button","header_settings","header_resolutions","header_undo_redo","header_compare","header_undo_redo","header_symbol_search","edit_buttons_in_legend","property_pages","left_toolbar","border_around_the_chart","pane_context_menu","timeframes_toolbar","symbol_search_hot_key","caption_buttons_text_if_possible","control_bar","context_menus"],enabled_features:["hide_last_na_study_output","dont_show_boolean_study_arguments","legend_context_menu"],timezone:"Asia/Shanghai",theme:"Light",debug:!1,overrides:{"symbolWatermarkProperties.color":"rgba(0, 0, 0, 0)","paneProperties.topMargin":15,"mainSeriesProperties.candleStyle.upColor":"#e14e57","mainSeriesProperties.candleStyle.downColor":"#37bc9c","mainSeriesProperties.candleStyle.borderUpColor":"#e14e57","mainSeriesProperties.candleStyle.borderDownColor":"#37bc9c","mainSeriesProperties.candleStyle.wickUpColor":"#e14e57","mainSeriesProperties.candleStyle.wickDownColor":"#37bc9c","paneProperties.legendProperties.showLegend":!1,"paneProperties.background":"#ffffff","paneProperties.vertGridProperties.color":"#e9eefa","scalesProperties.lineColor":"#eee","scalesProperties.textColor":"#979797","scalesProperties.backgroundColor":"#ffffff"},studies_overrides:{"volume.volume.color.0":"rgba(55,188,156,1)","volume.volume.color.1":"rgba(225,78,87,1)"}}},zlEH:function(e,t,o){"use strict";var r={render:function(){var e=this.$createElement;return(this._self._c||e)("div",{ref:"container",attrs:{id:"container"}})},staticRenderFns:[]};t.a=r}});