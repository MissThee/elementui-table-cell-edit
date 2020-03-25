import Vue from 'vue';
import App from './App';
import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css'
Vue.config.productionTip = false;
Vue.use(ElementUI);

require('src/mock/mock');

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
});
