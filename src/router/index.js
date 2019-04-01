/**
 * Created by jet on 2018/12/20.
 */
import Vue from 'vue'
import Router from 'vue-router'

const Home = r => require(['@/views/Home/home'],r);
const TradeView = r => require(['@/views/TradeView/TradeView'],r);
const TradeView0 = r => require(['@/views/TradeView/TradeView0'],r);
Vue.use(Router)



const routes = [
  {
    path: '/',
    component: r => require(['../views/Index'],r),
    children: [
      {
        path: '',
        component: Home,
      },
      {
        path: '/tradeview',
        component: TradeView
      },
      {
        path: '/tradeview0',
        component: TradeView0
      }
    ],
  },
]





export default new Router({
  mode: 'history',
  routes: routes,
});
