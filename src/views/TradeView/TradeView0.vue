<template>
<div class="">
  <div class="trade_wrap" style="height:86px;" >
    <div class="trade_money"  :class="{redColor: getCoolor(tickData.LastPrice,tickData.PreClosePrice), greenColor: !getCoolor(tickData.LastPrice,tickData.PreClosePrice)}">
      <p class="price">{{tickData.LastPrice?tickData.LastPrice:'--'}}</p>
      <div class="increase" v-if="tickData.PreClosePrice" >
        <span >{{tickData.LastPrice?(tickData.LastPrice-tickData.PreClosePrice).toFixed(2):''}}</span>
        <span>{{tickData.LastPrice?((tickData.LastPrice-tickData.PreClosePrice)/tickData.PreClosePrice*100).toFixed(2)+'%':''}}</span>
      </div>
    </div>

    <ul class="trade_info">
      <li>
        <p>今开</p>
        <span class="redColor">{{tickData.OpenPrice}}</span>
      </li>
      <li>
        <p>最高</p>
        <span class="redColor">{{tickData.HighestPrice}}</span>
      </li>
      <li>
        <p>最低</p>
        <span class="greenColor">{{tickData.LowestPrice}}</span>
      </li>
      <li>
        <p>昨收</p>
        <span>{{tickData.PreClosePrice}}</span>
      </li>
      <li>
        <p>总手</p>
        <span>{{moneyFormat(tickData.TotalVolume)}}</span>
      </li>
      <li>
        <p>金额</p>
        <span>{{moneyFormat(tickData.TotalTurnover)}}</span>
      </li>
    </ul>
  </div>
  <div class="Interrupted"></div>

  <div class="tradeView_outer">
    <div class="tradeView fullpar" >
      <TradingView ref="tradingView" class="fullpar" :requestUrl="tvRequestUrl" @getTick="getTick" ></TradingView>
    </div>
  </div>
</div>
</template>
<script>
  import TradingView from '@/components/tradingView';
  import {fetch} from "@/utils"
  import { TV_RESFUL_URL, TV_WEBSOCKET_URL} from '@/config/config'

  export default {
    data() {
      return {
        code: this.$route.query.stock_code || '000711.SZ',
        name: this.$route.query.stock_name ? '('+this.$route.query.stock_name+')':'',
        tickData: {
          LastPrice: '',
          PreClosePrice: '',
          OpenPrice: '',
          HighestPrice: '',
          TurnoverRatio: '',
          TotalVolume: '',
          TotalTurnover: ''
        },
        tvRequestUrl: {
          barUrl: TV_RESFUL_URL, // 历史bar数据接口
          webSocketUrl: TV_WEBSOCKET_URL // socket数据接口
        }
      }
    },
    created() {
      this.getFirstTick()
      this.path = this.$route.fullPath
    },
    mounted() {
      const {stock_name, stock_code} = this.$route.query
      document.title = stock_name && stock_code?`${stock_name}(${stock_code.substring(0,6)})`:''
      this.$nextTick(() => {
        this.$refs.tradingView.init({
          'resolution': '1D',  // 分时分辨率
          'name': this.code,  // 合约号
          'timezone': 'Asia/Shanghai', // 时区
          'session': '0930-1130,1300-1500:23456', // 交易时间
          'description': this.code, // 商品描述
          'pricescale': 100, // 数值精度
          'ticker': this.code, // ticker
          'supported_resolutions': ['1', '5', '15', '30', '60', 'D'] // 支持分辨率
        });
      });
    },
    methods: {
      async getFirstTick(){
        const options = {
          url:`${TV_RESFUL_URL}/Stock`,
          method: 'get',
          data: {
            type: 'tick',
            code: this.code
          }
        }
        try {
          let data = await fetch(options)
          this.tickData = data.Items&&data.Items.length>0?data.Items[0]:{}
        } catch (e) {
          console.log(e);
        }
      },
      getCoolor(newVal, oldVal){
        return newVal-oldVal>=0?true:false
      },
      getTick(data) {
        if (data.Data.LastPrice) {
          if(data.Data.TurnoverRatio){
            this.tickData = data.Data
          }else {
            this.tickData.LastPrice = data.Data.LastPrice
            this.tickData.PreClosePrice = data.Data.PreClosePrice
            this.tickData.OpenPrice = data.Data.OpenPrice
            this.tickData.HighestPrice = data.Data.HighestPrice
            this.tickData.TotalVolume = data.Data.TotalVolume
            this.tickData.TotalTurnover = data.Data.TotalTurnover
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
      TradingView
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
