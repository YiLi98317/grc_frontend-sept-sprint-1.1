import { IsAuthenticated, RedirectToLogin } from "../helpers/Auth";
import { encryptData,GetCookie, GetServerCookie, SetCookie } from "../helpers/Helper"
class ApiService {
    static post = async (type, payload, Component,customHeader=false, handleSuccess, handleError) => {

        let isServer = false;
        if(Component && Component.apiObj){
          let {req} = Component.apiObj
          isServer = !!req
        }
        try {
            // let token = encryptData(new Date().getTime());
            let config = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
              }
            if(customHeader){
              config['headers']['token'] = ""
            }
            config['headers']['apikey'] = process.env.REACT_APP_API_KEY;
            // if(customHeader || auth){
              if(!isServer){
                let userData = GetCookie('currentUserValue')
                userData  = userData ? JSON.parse(userData) : false;
                if(userData){
                  let authToken = `Bearer ${userData.accessToken}`
                  config['headers']['Authorization'] = authToken
                }
              }else{
                let {req} = Component.apiObj
                let userData = GetServerCookie(req,'currentUserValue')
                userData  = userData ? JSON.parse(userData) : false;
                if(userData){
                  let authToken = `Bearer ${userData.accessToken}`
                  config['headers']['Authorization'] = authToken
                }
              }
              // if(type == 'login'){
              //   config['headers']['Access-Control-Allow-Origin'] = process.env.REACT_APP_ALLOWED_ORIGIN;
              //   config['credentials'] ='include';
              // }
              
            // }
          const response = await fetch(`${process.env.REACT_APP_API_URL}${payload.url}`,config);
          let res = null
          if(payload.responseType && payload.responseType == 'file'){
            res = await response.arrayBuffer();
          }else{
            res = await response.json();
          }
          // response.status = 440;
          // console.log(response)
          if(response.status != 200){
            if(response.status == 440){
              // RedirectToLogin()
              // return false
            }
            return res
          }
          if (type === 'login_form' || type == 'signup') { 
            if(res.message == 'Success'){
              let token = res.results.accessToken;
              let user = JSON.stringify(res.results);
              token ? handleSuccess({ res, token }) : handleError(res);
            }else{
              return res
            }
          }else {
            return res
          }
        }
        catch (err) {
          return err;
          
        }
    }

    
    static fetchData = async (url ='', method ='',data= {},formType = '',apiUrl = '',tpUrl=null) => {
        if(url == '' && method == ''){
          return false
        }
        try {
            let formData = new FormData();
            if(formType != 'form'){
              formData = JSON.stringify(data)
            }else{
              formData = data
            }
            
            let config = {
                method: method,
                // body: formData,
               
              }
           
            if(method == 'POST' || method == 'PATCH' || method == 'DELETE'){
              config.body = formData
            }
            let userData = GetCookie('currentUser')
            userData  = userData ? JSON.parse(userData) : false;
            if(!config['headers']){
              config['headers'] = {}
            }
            if(userData){
              let authToken = `Bearer ${userData.accessToken}`
              config['headers']['Authorization'] = authToken
            }
            if(formType != 'form'){
              config['headers']['Content-Type'] = 'application/json'
            }
            config['headers']['apikey'] = process.env.REACT_APP_API_KEY;
            let fullURL = `${apiUrl != '' ? apiUrl : process.env.REACT_APP_API_URL}${url}`;
           if(tpUrl){
           fullURL = tpUrl
           }
          const response = await fetch(fullURL,config);
          let res = await response.json();
          res.status = response.status
          if(response.status != 200){
            if(response.status == 440){
              SetCookie("redirect_url",window.location.pathname)
              RedirectToLogin(response.status)
              // return false
              // console.log(response)
              // console.log(res)
            }
          }
          // SetCookie("redirect_url",window.location.pathname)
          return res
        }
        catch (err) {
          console.log(err);
        }
    }
    static fetchFile = async (url ='', method ='',data= {},customHeader= false,auth=false,formType = '') => {
        if(url == '' && method == ''){
          return false
        }
        try {
            let formData = new FormData();
            if(formType == 'form'){
              if(Object.keys(data).length > 0){
                for (let [key, value] of Object.entries(data)) {
                  formData.append(key,value)
                }
              }
            }else{
              formData = JSON.stringify(data)
            }
            
            let config = {
                method: method,
                // body: formData,
                headers:{'Content-Type': 'application/json'},
              }
            if(method == 'POST' || method == 'PATCH' || method == 'DELETE'){
              config.body = formData
            }
            let userData = GetCookie('currentUser')
            userData  = userData ? JSON.parse(userData) : false;
            if(userData){
              let authToken = `Bearer ${userData.accessToken}`
              if(!config['headers']){
                config['headers'] = {}
              }
              config['headers']['Authorization'] = authToken
            }
            config['headers']['apikey'] = process.env.REACT_APP_API_KEY;
          const response = await fetch(`${url}`,config);
          // let res = await response.json();
          return response
        }
        catch (err) {
          console.log(err);
        }
    }
}

export default ApiService