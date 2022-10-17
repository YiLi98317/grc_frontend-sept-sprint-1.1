import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie, DelCookie } from "../helpers/Helper";
import { Link, useNavigate } from "react-router-dom";
import crypto from 'crypto'
import { useContext, useEffect, useState } from "react";
import { IsAuthenticated } from "../helpers/Auth";
import { LayoutContext } from "../ContextProviders/LayoutContext"


const Login2 = (props) => {
  const { updateData } = useContext(LayoutContext)
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState(null)
  const [errMsg, setErrMsg] = useState('')
  const { register, handleSubmit, setValue, setFocus, watch, formState: { errors } } = useForm();
  const [modules, setModules] = useState([])

  useEffect(() => {
    // if (modules.length === 0) {
    //   getModules()
    // }
    if (userInfo == null) {
      let userData = GetCookie('currentUser') ? JSON.parse(GetCookie('currentUser')) : null
      if (!userData || userData == null) {
        navigate("/login")
      } else if (userData.otpVerified) {
        if (userData.user.is_onboard == 'N') {

          navigate('/onboarding', { replace: true })
        } else {
          if (userData.user.access_role == 'auditor' || userData.user.access_role == 'service partner') {
            navigate('/task-manager', { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        }
      }
      setUserInfo(oldVal => {
        return { ...userData }
      })
    }
  })

  useEffect(() => {
    let lastLogin = GetCookie('last_login_activity') ? JSON.parse(GetCookie('last_login_activity')) : 0
    if (lastLogin) {
      let now = new Date().getTime();
      let diff = Math.floor((now - lastLogin) / 1000)
      if (diff > 1800) {
        logOut()
      }
    }
  }, [])
  const onSubmit = async (data) => {
    setErrMsg('')
    if (
      !data.otpInp1 || data.otpInp1 == '',
      !data.otpInp2 || data.otpInp2 == '',
      !data.otpInp3 || data.otpInp3 == '',
      !data.otpInp4 || data.otpInp4 == '',
      !data.otpInp5 || data.otpInp5 == '',
      !data.otpInp6 || data.otpInp6 == ''
    ) {
      return false
    };
    let otp = Object.values(data).join('')
    if (!otp || otp == '') {
      return false
    }
    let payloadUrl = `auth/validateOTP`
    let method = "POST"
    let formData = { otp }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let userData = userInfo
      userData.otpVerified = true
      let setcookie = SetCookie('currentUser', JSON.stringify(userData))
      let user = userData?.user || {}
      let redirectUrl  = GetCookie("redirect_url")
      // console.log(redirectUrl);
      // console.log(user);
      if(redirectUrl && redirectUrl != null){
        // console.log(redirectUrl);
        navigate(redirectUrl, { replace: true })
        DelCookie("redirect_url")
      }else if(user.org_modules.includes(1)){
        if (userData.user.is_onboard == 'N') {
          navigate('/onboarding', { replace: true })
        } else if (userData.user.first_login == "Y") {
          navigate('/settings', { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      }else if(user.org_modules.includes(2)){
        if (userData.user.is_vendor_onboard == 'N') {
          navigate('/vendors/onboarding', { replace: true })
        } else if (userData.user.first_login == "Y") {
          navigate('/settings', { replace: true })
        } else {
          navigate('/vendors/dashboard', { replace: true })
        }
      }else if(user.org_modules.includes(3)){
        if (userData.user.is_certification_onboard == 'N') {
          navigate('/certification/configuration', { replace: true })
        } else if (userData.user.first_login == "Y") {
          navigate('/certification/configuration', { replace: true })
        } else {
          navigate('/certification/configuration', { replace: true })
        }
      }
      

    } else {
      setErrMsg(res.message)
    }
  }

  const checkOtpValidation = (event, index) => {
    let inptVal = event.key
    let pattern = new RegExp(/^[0-9]$/);
    if (event.keyCode == 8) {
      event.target.value = ''
      if (event.target.value.length == 0) {
        let ele = document.getElementById(`authOtp${index + 1}`)
        if (ele.previousElementSibling) {
          ele.previousElementSibling.focus()
        }
      } 

    }
    if((event.metaKey || event.ctrlKey) && event.keyCode == 86){
      return false
    }
    let numbers = inptVal.replace(/[^0-9]/g, "");
    if(event.keyCode == 13){
      handleSubmit(onSubmit)
      return false
    }
    if (numbers.length == 0 || !pattern.test(numbers)) {
      event.preventDefault();
      return false
    }
    if (inptVal.length > 0) {
      let ele = document.getElementById(`authOtp${index + 1}`)
      // Focus on the next sibling
      if (ele.nextElementSibling) {
        setTimeout(() => {
          ele.nextElementSibling.focus()
        }, 50);
      }
    }
    // if(this.authOtp.te)
  }

  const resendOTP = async () => {
    let payloadUrl = `auth/resendOTP`
    let method = "GET"
    let formData = {}
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      window.location.reload()
    }
  }

  const logOut = () => {
    let loggedInUser = IsAuthenticated(true);
    if (loggedInUser.isLoggedIn) {
      let del = DelCookie('currentUser')
      let delProject = DelCookie('selectedProject')
      let delOrg = DelCookie('selectedOrg')
      updateData('clear')
      if (del) {
        navigate("/login")
      }
    }
  }

  const onPaste = (event) => {
    let pastedData = event.clipboardData.getData("text/plain")
    let numbers = pastedData.replace(/[^0-9]/g, "");
    if(numbers.length == 0 || numbers.length < 6){
      event.preventDefault()
      return false
    }
    let copiedOtp = pastedData.split("")
    setValue("otpInp1", numbers[0]); 
    setValue("otpInp2", numbers[1]); 
    setValue("otpInp3", numbers[2]); 
    setValue("otpInp4", numbers[3]); 
    setValue("otpInp5", numbers[4]); 
    setValue("otpInp6", numbers[5]); 
    setFocus("otpInp6", { shouldSelect: true })
    // setSegments(pasted.split("").slice(0, segments.length))
  }

  // console.log(userInfo)
  return (
    <>
      <div className=" container-fluid">
        <div className="I_header">
          <div className="logo mt-3">
            {/* <img src="/assets/img/logo_2.svg" alt="logo" className="img-fluid w200" /> */}
          </div>
          {/* <div className="userProfile">
            <h6>Welcome Back!</h6>
            <img src="/assets/img/userProfile.png" alt="profile" className="img-fluid" />
          </div> */}
        </div>
        <div className="align-items-center d-flex row hv-100">
          <div className="col-md-8 col-lg-8 col-12 offset-md-2 col-xl-8 offset-xl-2 offset-lg-3 loginForm">
            <h4 className="text-center mb-4 f-18">Protect the Future of Your Business</h4>
            <div className="login_box">
              <div className="row">
                <div className="col-md-12 col-12 col-xl-5 col-md-6 col-sm-12 d-none d-lg-block d-xl-block d-md-block">
                  {/* <div className="lbanner">
                    <img src="/assets/img/l_banner2.png" className="img-fluid" />
                    <div className="captText">
                      <h4>Cloud Security</h4>
                      <p>GoRICO is a team of experts that helps companies of all sizes navigate today’s complex technology landscape.</p>
                    </div>
                  </div> */}
                  <div className="h-100 d-flex justify-content-end align-items-stretch py-4">
                    <div className="login_box_left w-100">
                      <div className="lg_left_img m-auto">
                        <img src="/assets/img/logo_10.png" className="img-fluid" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 col-12 col-xl-7 col-md-6 col-sm-12 d-flex justify-content-center align-items-center pl-md-0">

                  <form className="w-100 mx-lg-5 mx-md-5 mx-xl-5 my-md-4 mx-2 my-2 form_block" name="form1" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                    <h6 className="f-12 fw-600">OTP Authentication</h6>
                    <p className="p-0">Please enter the One Time Password (OTP) sent to your registered email. </p>
                    <div className="form-group mt-3 otp_box">
                      <input type="text" className="otp_input_field" {...register("otpInp1")} id="authOtp1" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 0)} onPasteCapture={onPaste} />
                      <input type="text" className="otp_input_field" {...register("otpInp2")} id="authOtp2" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 1)} onPaste={onPaste}/>
                      <input type="text" className="otp_input_field" {...register("otpInp3")} id="authOtp3" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 2)} onPaste={onPaste}/>
                      <input type="text" className="otp_input_field" {...register("otpInp4")} id="authOtp4" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 3)} onPaste={onPaste}/>
                      <input type="text" className="otp_input_field" {...register("otpInp5")} id="authOtp5" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 4)} onPaste={onPaste}/>
                      <input type="text" className="otp_input_field" {...register("otpInp6")} id="authOtp6" maxLength="1" onKeyDownCapture={(e) => checkOtpValidation(e, 5)} onPaste={onPaste}/>
                    </div>
                    {
                      errMsg && errMsg != ''
                        ? <span className="form_err text-danger d-block mb-3">{errMsg}</span>
                        : ''
                    }
                    <div className="d-flex justify-content-end form-group">
                      <span className="link link_url text-secondary" onClick={() => resendOTP()} >Resend OTP</span>
                    </div>
                    <div className="form_submit_btn mt-3">
                      <button type="submit" className="btn btn-primary-2 btn_03 btn-block mb-lg-4 mb-md-4 mb-2 max_w_auto mw-100" >Verify</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="I_header I_footer container-fluid">
        <div className="copy">
          <p className="mb-0">© 2022 GoRICO - All Rights Reserved</p>
        </div>
        <div className="logo d-none d-lg-block d-xl-block d-md-block">
          <img src="/assets/img/logo_2.svg" alt="logo" className="img-fluid" />
        </div>
      </div>
    </>
  )
}

export default Login2