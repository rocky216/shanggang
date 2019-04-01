/**
* Created by jet on 2018/6/29.
*/

<template>
  <div>
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>
<script>
  import { REALISE_VERSION } from '@/config/config'
  export default {
    components: {
    },
    data () {
      return {
      }
    },
    created(){
      console.log('欢迎来到量投小程序：v'+`${REALISE_VERSION}`)
    }
  }
</script>
<style lang="scss" scoped>
</style>
