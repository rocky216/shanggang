import axios from "axios"
import qs from "qs"

const instance = axios.create({
  timeout: 1000,
  withCredentials:true
});


// 添加响应拦截器
axios.interceptors.response.use((res) => {
  if (res && res.status === 200) {
    return res.data
  } else {}
}, err => {
  console.log(err);
});
function http(data = {url: '', method: '', params: {}}, withQs = true ) {
  if (data.method === "post") {
    const fParams = withQs? qs.stringify(data.params):data.params;
    return axios.post(data.url + `?t=${Math.random()}`, fParams);
    // get
  } else if (data.method === "get") {
    let params = Object.assign({
      t: Math.random()
    }, data.params);
    return axios.get(data.url, {
        params: params
    })
  }
}
export default http;