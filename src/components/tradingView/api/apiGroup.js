import http from './fetch.js';

export async function getBarData(params = {
  url: '',
  symbol: '',
  interval: '',
  type: '',
  startTime,
  endTime
}, next){
  const options = {
    url: `${params.url}/Stock`,
    params: params.data,
    method: 'get'
  }
  let data = await http(options)
  if (next) next(data)
}


