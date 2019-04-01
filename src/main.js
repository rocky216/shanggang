
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */


import Vue from 'vue';
import App from './App';
import router from './router';
import _ from "lodash"
import "@/assets/css/vuejs-dialog.min.css"
import Tips from "@/components/Tips"

window._ = _;
Vue.use(Tips)
/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

window.vm = new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
