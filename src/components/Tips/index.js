export default {
  install(Vue, options){
    Vue.prototype.tip = function(options){
      let div = document.createElement ("div")
      div.innerHTML = options.msg
      div.style.color = "#fff"
      div.style.width = "30%"
      div.style.padding = "8px"
      div.style.borderRadius = "3px"
      div.style.textAlign = "center"
      div.style.boxSizing = "border-box"
      div.style.position = "fixed"
      div.style.top = "40%"
      div.style.left = "35%"
      div.style.background= "rgba(0,0,0,0.7)"
      document.body.appendChild(div)
      if (div) {
        setTimeout(()=>{
          document.body.removeChild(div)
        }, options.delay||2000)
      }

    }
  }
}
