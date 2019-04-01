<template lang="html">
<div v-if="visable" class="Dialog_wrap">
  <div class="Dialog">
    <h2>提示</h2>
    <p>{{msg}}</p>
    <div class="btn">
      <a @click="cencal">取消</a>
      <a @click="ok">确定</a>
    </div>
  </div>
</div>
</template>

<script>
export default {
  props:{
    msg: {
      type: String,
      default: "请填写提示内容"
    },
    visable: {
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
    }
  },
  watch: {
    visable(val){
      this.Boolean = val
    }
  },
  methods: {
    ok(){
      this.$emit('ok')
    },
    cencal() {
      this.$emit("cencal")
    }
  }
}
</script>

<style lang="scss" scoped>
.Dialog_wrap {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 10000;
  background-color: rgba(0,0,0,0.2);
  .Dialog {
    position: absolute;
    background-color: #fff;
    border-radius: 5px;
    width: 70%;
    left: 15%;
    top: 25%;
    text-align: center;
    h2 {
      margin: 10px;
      font-size: 18px;
    }
    p {
      color: #666;
    }
    .btn {
      display: flex;
      justify-content:space-between;
      border-top: 1px solid #ddd;
      a {
        width: 50%;
        padding: 10px;
        box-sizing: border-box;
      }
      a:nth-child(1){
        border-right: 1px solid #ddd;
      }
      a:nth-child(2){
        color: #E35A59;
      }
    }
  }
}

</style>
