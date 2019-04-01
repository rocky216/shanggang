import axios from "axios"
import {PHP_RESFUL_URL} from "@/config/config"

export function fetch(opt){
  const options = {
    url: opt.url,
    method: opt.method,
    [opt.method=='post'?'data':'params']: opt.data
  }
  return new Promise((resolve, reject)=>{
    axios(options).then((res)=>{
      resolve(res.data)
    }).catch((e)=>{
      reject(e)
    })
  })
}

export function pFetch(opt){‘’
  const options = {
    url: PHP_RESFUL_URL+opt.url,
    method: opt.method,
    [opt.method=='post'?'data':'params']: opt.data
  }

  axios.defaults.headers.common['Authorization'] = opt.data && opt.data.Authorization?opt.data.Authorization:''
  return new Promise((resolve, reject)=>{
    axios(options).then((res)=>{
      let {data} = res
      if(data.status==0){
        resolve(data.data)
      }else {
        reject()
      }
    }).catch((e)=>{
      reject(e)
    })
  })

}
