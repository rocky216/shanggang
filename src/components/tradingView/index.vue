<template>
  <div class="tradingView">
    <tradingView ref="tradingView" :requestUrl="requestUrl" @updateComplete="updateComplete" @getTick="getTick" :inital="inital"></tradingView>
  </div>
</template>
<script>
import tradingView from './tradingView.vue';
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
    },
    inital: {
      type: Object,
      default() {
        return {
          symbol: '',
          resolution: ''
        }
      }
    }
  },
  methods: {
    init(params) {
      let para = params || {};
      para = Object.assign({
        pricescale: 10000,
      }, para);
      this.$nextTick(() => {
        this.$refs.tradingView.getSymbol({
          ...para
        });
        this.$refs.tradingView.init(para.name, para.resolution); // 初始化，触发getBars
      });
    },
    changeSymbol(params) {
      let para = params || {};
      para = Object.assign({
        id: '',
        pricescale: 10000
      }, para);
      this.$refs.tradingView.getSymbol({
        ...para
      });
      this.$refs.tradingView.setSymbol(para.name); // 商品转换，触发getbars
    },
    // 添加标记
    addNoteShape(shapeArr) {
      this.$refs.tradingView.addNoteShape(shapeArr)
    },
    updateComplete() {
      this.$emit('updateComplete');
    },
    getTick(data){
      this.$emit('getTick', data);
    }
  },
  components: {
    tradingView
  }
}
</script>
<style lang="scss"  scoped="scoped">
  .tradingView {
    width: 100%;
    height: 100%;
  }
</style>
