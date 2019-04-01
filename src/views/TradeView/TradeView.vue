<template>
<div class="">
  <Dialog ref="dialog" msg="登录添加自选股" :visable="visable" @ok="ok" @cencal="()=>visable=false" />
  <div class="trade_wrap" style="height:86px;" >
    <div class="trade_money" :class="{redColor: getCoolor(tickData.LastPrice,tickData.PreClosePrice), greenColor: !getCoolor(tickData.LastPrice,tickData.PreClosePrice)}">
      <p class="price" >{{tickData.LastPrice?tickData.LastPrice.toFixed(2):'--'}}</p>
      <div class="increase" v-if="tickData.PreClosePrice" >
        <span >{{tickData.LastPrice?(tickData.LastPrice-tickData.PreClosePrice).toFixed(2):'0'}}</span>
        <span>{{tickData.LastPrice?((tickData.LastPrice-tickData.PreClosePrice)/tickData.PreClosePrice*100).toFixed(2)+'%':'0%'}}</span>
      </div>
    </div>

    <ul class="trade_info">
      <li>
        <p>今开</p>
        <span class="redColor">{{tickData.LastPrice? tickData.OpenPrice.toFixed(2): '--'}}</span>
      </li>
      <li>
        <p>最高</p>
        <span class="redColor">{{tickData.LastPrice? tickData.HighestPrice.toFixed(2): '--'}}</span>
      </li>
      <li>
        <p>最低</p>
        <span class="greenColor">{{tickData.LastPrice? tickData.LowestPrice.toFixed(2): '--'}}</span>
      </li>
      <li>
        <p>昨收</p>
        <span>{{tickData.PreClosePrice.toFixed(2)}}</span>
      </li>
      <li>
        <p>总手</p>
        <span>{{tickData.LastPrice? moneyFormat(tickData.TotalVolume): '0'}}</span>
      </li>
      <li>
        <p>金额</p>
        <span>{{tickData.LastPrice? moneyFormat(tickData.TotalTurnover): '0'}}</span>
      </li>
    </ul>
  </div>
  <div class="Interrupted"></div>
  <div class="OptionalStock">
    <span v-if="isOptional" @click="handlenOptionalStock(1)"><img src="../../assets/images/addStock.png" />添加自选</span>
    <span v-if="!isOptional" @click="handlenOptionalStock(0)"><img src="../../assets/images/deleteStock.png" />删除自选</span>
  </div>
  <div class="Interrupted"></div>

  <div class="tradeView_outer">
    <div class="tradeView fullpar" >
      <Chart
        ref="tradingView"
        class="fullpar"
        :initOpt="initOpt"
        :tickData="tickData"
        @getTick="getTick"  />
    </div>
  </div>

</div>
</template>
<script>
  import Chart from '@/components/Chart';
  import {fetch, pFetch} from "@/utils"
  import { TV_RESFUL_URL, TV_WEBSOCKET_URL} from '@/config/config'
  import Dialog from "@/components/Dialog"

  export default {
    data() {
      return {
        visable: false,
        tickData: {
          LastPrice: 0,
          PreClosePrice: 0,
          OpenPrice: 0,
          HighestPrice: 0,
          LowestPrice:0,
          TurnoverRatio: 0,
          TotalVolume: 0,
          TotalTurnover: 0
        },
        initOpt: {
          interval: "1D",
          code: this.$route.query.stock_code || '000711.SZ',
          Authorization: this.$route.query.token
        },
        isOptional: true,
        loginCode: ''
      }
    },
    created() {
      //清楚缓存
      localStorage.setItem('tradingview.chartproperties.mainSeriesProperties', '');
      //计算图标的高度
      this.initOpt.height = document.documentElement.clientHeight-116-47

      this.getFirstTick()
      this.judgeLogin()
    },
    mounted() {

      const {stock_name, stock_code} = this.$route.query
      document.title = stock_code && stock_code !='' && stock_name && stock_name!=''?`${stock_name}(${stock_code.substring(0,6)})`:''
    },
    methods: {
      async getFirstTick(){
        const options = {
          url:`${TV_RESFUL_URL}/Stock`,
          method: 'get',
          data: {
            type: 'tick',
            code: this.initOpt.code
          }
        }
        try {

          let data = await fetch(options)
          this.tickData = data.Items&&data.Items.length>0?data.Items[0]:{}
        } catch (e) {
          console.log(e);
          this.tip({
            msg: "网络错误"
          })
        }
      },
      async judgeLogin(){
        const options = {
          url: '/api/preferred/check_stock',
          method: 'get',
          data: {
            stock_name_id: this.initOpt.code,
            Authorization: `Bearer ${this.initOpt.Authorization}`
          }
        }
        try {
          let data = await pFetch(options)
          this.loginCode = data.code
          if(data.code==2){
            this.isOptional=false
          }else {
            this.isOptional = true
          }
        } catch (e) {
          console.log(e);
        }
      },
      async handlenOptionalStock(val){
        if (this.loginCode==1) {
          this.visable = true
          return
        }
        let addOptions = {
          url: '/api/preferred/add_stock',
          method: 'post',
          data: {
            Authorization: `Bearer ${this.initOpt.Authorization}`,
            stock_name_id: this.initOpt.code,
            stock_name: this.$route.query.stock_name
          }
        }
        let deleteOptions = {
          url: '/api/preferred/del_quotation_stock',
          method: 'post',
          data: {
            Authorization: `Bearer ${this.initOpt.Authorization}`,
            stock_name_id: this.initOpt.code
          }
        }
        const options = val ? addOptions: deleteOptions

        try {
          let data = await pFetch(options)
          this.judgeLogin()
        } catch (e) {
          console.log(e);
        }
      },
      ok(){
        this.visable = false
        wx.miniProgram.navigateTo({
          url: '/pages/public/authorization/index'
        })
      },
      getCoolor(newVal, oldVal){
        return newVal && (newVal-oldVal>=0)?true:false
      },
      getTick(data) {
        if (data.LastPrice) {
          if(data.TurnoverRatio){
            this.tickData = data
          }else {
            this.tickData.LastPrice = data.LastPrice
            this.tickData.PreClosePrice = data.PreClosePrice
            this.tickData.OpenPrice = data.OpenPrice
            this.tickData.HighestPrice = data.HighestPrice
            this.tickData.TotalVolume = data.TotalVolume
            this.tickData.TotalTurnover = data.TotalTurnover
          }
        }
      },
      moneyFormat(num){
        if (num>=10000 && parseFloat(num)<100000000) {
          return parseFloat(num/10000).toFixed(2)+'万'
        }else if(num>=100000000){
          return parseFloat(num/100000000).toFixed(2)+'亿'
        }else {
          return num
        }

      }
    },
    components: {
      Chart,
      Dialog
    }
  }
</script>
<style>
body, ul {
  margin: 0;
}
body{
  background-color: #fff;
}
</style>
<style lang="scss" scoped>
.OptionalStock {
  display: flex;
  justify-content: flex-end;
  span {
    padding: 8px 10px;
    cursor: pointer;
    img {
      width: 18px;
      height: 18px;
      float: left;
      margin:3px 2px 0 0;
    }
  }
}
.Interrupted {
  width: 100%;
  height: 10px;
  background-color: #f3f3f3;
}
.trade_wrap {
  font-family:"PingFang SC Helvetica Neue Microsoft Yahei";
  padding-bottom: 10px;
  background-color: #fff;
  .redColor {
    color: #E14E57;
  }
  .greenColor {
    color: #37BC9C;
  }
  display: flex;
  justify-content: space-between;
  p {
    margin: 0;
  }
  .trade_money {

    width: 35%;
    padding:10px;
    box-sizing: border-box;
    .price {
      font-size: 30px;
    }
    .increase {
      font-size: 14px;
      display: flex;
      text-align: left;
      width: 100%;
      span {
        flex: 1;
      }
    }
  }
  ul.trade_info {
    display: flex;
    width: 65%;
    flex-wrap: wrap;
    padding-left: 10px;
    box-sizing: border-box;
    li {
      list-style: none;
      width: 33.33%;
      text-align: left;
      font-size: 14px;
      padding-top:5px;
      p {
        color:#575757;
      }
    }
  }
}


  .tradeView_outer {


    .tradeView {
    }
  }
  .fullpar {
    width: 100%;
    height: 100%;
  }
</style>
