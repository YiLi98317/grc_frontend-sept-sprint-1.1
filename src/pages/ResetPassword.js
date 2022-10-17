import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
// import { SetCookie, GetCookie } from "../helpers/Helper";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AIR_MSG from "../helpers/AirMsgs";
const ResetPassword = (props) => {
  const navigate = useNavigate()
  const { register, handleSubmit, trigger, watch, formState: { errors } } = useForm();
  const [viewType, setViewType] = useState("resetForm")
  const [lastPayload, setLastPayload] = useState({})
  const {token = ""} = useParams()
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [formSubmitted, setFormSbmt] = useState(false)
  const passRegex = new RegExp(/((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,32})/)
  const passCondsObj = { showConds: false, hasLowerChar: false, hasUpperChar: false, hasSpecialChars: false, hasNumber: false }
  const [newPassConds, setNewPassConds] = useState(passCondsObj)
  const [confPassConds, setConfPassConds] = useState(passCondsObj)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfPass, setShowConfPass] = useState(false)
  // const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const newPassInp = watch("password")
  const confPassInp = watch("conf_password")

  useEffect(() => {
    if(token == ""){
      // setViewType("token_err")
    }
  }, [token]);

  useEffect(() => {
    checkValidationConditions(newPassInp, setNewPassConds)
  }, [newPassInp])
  useEffect(() => {
    checkPassMismatch()
  }, [confPassInp])

  const checkValidationConditions = async (passInp, setPassConds) => {
    if (passInp == undefined || passInp == null || !setPassConds || setPassConds == null) {
      return false
    }
    await trigger("password")
    let obj = { ...passCondsObj }
    if (passInp.length > 0) {
      obj.showConds = true;
      let lowerCaseRegex = new RegExp(/[a-z]/)
      let upperCaseRegex = new RegExp(/[A-Z]/)
      let specialCharRegex = new RegExp(/\W/)
      let numberRegex = new RegExp(/\d/)

      obj.hasLowerChar = lowerCaseRegex.test(passInp) ? true : false
      obj.hasUpperChar = upperCaseRegex.test(passInp) ? true : false
      obj.hasSpecialChars = specialCharRegex.test(passInp) ? true : false
      obj.hasNumber = numberRegex.test(passInp) ? true : false
    } else {
      obj.showConds = false
      obj.hasLowerChar = false
      obj.hasUpperChar = false
      obj.hasSpecialChars = false
      obj.hasNumber = false
    }
    // console.log(obj);
    setPassConds(oldVal => {
      return { ...obj }
    })
  }

  const checkPassMismatch = () => {
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if(newPassInp == '' || confPassInp == ''){
      return false
    }
     if(newPassInp != confPassInp){
      formRes = { status: false, err_status: true, error: { pass_not_match: { required: true, msg: AIR_MSG.password_mismatch } } }
      setFormRes(formRes)
     }
  }

  const toggleShowPassword = (field = '') => {
    if (field == '') {
      return false;
    }
    if (field == "password") {
      setShowNewPass(showNewPass ? false : true)
    } else {
      setShowConfPass(showConfPass ? false : true)
    }

  }

  const getPassCondsList = (fieldType = "") => {
    if (fieldType == null) {
      return false
    }

    let inpField = fieldType == "password" ? newPassInp : confPassInp
    let condObj = fieldType == "password" ? newPassConds : confPassConds
    if (!condObj.showConds) {
      return false
    }
    return (
      <>
        <ul className="pass_cond_list fs-11 p-0 row m-0 mt-2">
          {condObj.hasLowerChar}
          <li className={`pl-0 col-6 text-${condObj.hasLowerChar ? "dark" : "muted"}`}>
            <span className={`mr-2 ${condObj.hasLowerChar ? "text-success" : ""}`}>
              <i className={`fa fa-${condObj.hasLowerChar ? "check" : "circle"}`}></i>
            </span>
            One lowercase character
          </li>
          <li className={`pl-0 col-6 text-${condObj.hasUpperChar ? "dark" : "muted"}`}>
            <span className={`mr-2 ${condObj.hasUpperChar ? "text-success" : ""}`}>
              <i className={`fa fa-${condObj.hasUpperChar ? "check" : "circle"}`}></i>
            </span>
            One uppercase character
          </li>
          <li className={`pl-0 col-6 text-${condObj.hasSpecialChars ? "dark" : "muted"}`}>
            <span className={`mr-2 ${condObj.hasSpecialChars ? "text-success" : ""}`}>
              <i className={`fa fa-${condObj.hasSpecialChars ? "check" : "circle"}`}></i>
            </span>
            One special character
          </li>
          <li className={`pl-0 col-6 text-${inpField.length >= 8 ? "dark" : "muted"}`}>
            <span className={`mr-2 ${inpField.length >= 8 ? "text-success" : ""}`}>
              <i className={`fa fa-${inpField.length >= 8 ? "check" : "circle"}`}></i>
            </span>
            8 characters minimum

          </li>
          <li className={`pl-0 col-6 text-${condObj.hasNumber ? "dark" : "muted"}`}>
            <span className={`mr-2 ${condObj.hasNumber ? "text-success" : ""}`}>
              <i className={`fa fa-${condObj.hasNumber ? "check" : "circle"}`}></i>
            </span>
            One number
          </li>
        </ul>
      </>
    )
  }
  
  const onSubmit = async (data) => {
    let formRes =  {status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if(!data.password || data.password == '' || !data.conf_password || data.conf_password == ''){
      return false
    };
    if(data.password != data.conf_password){
      formRes = {status:false,err_status:true,error:{pass_not_match:{required:true,msg: AIR_MSG.password_mismatch}}}
      setFormRes(formRes)
      return
    }
    setFormSbmt(true)
    let payloadUrl = "auth/reset_password"
    let method = "POST";
    let formData = {password:data.password,token:token}
    let res = await ApiService.fetchData(payloadUrl,method,formData);
    if(res && res.message == "Success"){
      formRes = {status:true,err_status:false,error:{},type:"reset_pass",msg:"Password updated successfully"}
      setFormRes(formRes)
      setTimeout(() => {
        changeView("pwd_reset_success");
      }, 3000);
    }else{
      formRes['err_status'] = true
      formRes['error']['type'] = "reset_pass"
      formRes['error']['msg'] = res.message ? res.message :  AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setFormSbmt(false)
  }

  const changeView = (view = null) => {
    if (view == null) {
      return false
    }
    setViewType(view)
  }

  return (
    <>
      <div className=" container-fluid">
        <div className="I_header">
          <div className="logo mt-3">
            {/* <img src="/assets/img/logo_2.svg" alt="logo" className="img-fluid w200" /> */}
          </div>
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
                {(()=>{
                  if(viewType == "resetForm"){
                    return(
                      <>
                        <div className="col-md-12 col-12 col-xl-7 col-md-6 col-sm-12 d-flex justify-content-center align-items-center pl-md-0">
                          <form className="w-100 mx-lg-5 mx-md-5 mx-xl-5 my-md-4 mx-2 my-2" name="form1" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                            <h6 className="f-12 mb-3 fw-600">Reset Password</h6>
                            {/* <p>Enter your registered email below to receive password reset instruction</p> */}
                            <div className="form-group">
                              <label htmlFor="password">New Password</label>
                              <div className="w-100 position-relative">
                                <input type={showNewPass ? "text" : "password"} className="form-control mb-1" {...register("password",{required:true,pattern:passRegex})} name="password" autoComplete="off" defaultValue="" />
                                <span className="show_pass_icn link_url" onClick={() => toggleShowPassword("password")}><i className={`fa fa-${showNewPass ? 'eye-slash' : 'eye'}`}></i></span>
                              </div>
                              {errors.password?.type === 'required' && <div className="field_err text-danger">*{AIR_MSG.password_required}</div>} 
                              {newPassConds.showConds && getPassCondsList("password")}
                              {/* {errors.password?.type === 'pattern' && <div className="field_err text-danger">*Password should be alphanumeric, must contain atleast 1 uppercase and 1 special character and should have atleast 10 characters </div>} */}                          
                            </div>
                            <div className="form-group">
                              <label htmlFor="conf_password">Confirm New Password</label>
                              <div className="w-100 position-relative">
                                <input type={showConfPass ? "text" : "password"} className="form-control mb-1" {...register("conf_password",{required:true})} name="conf_password" autoComplete="off" defaultValue="" />
                                <span className="show_pass_icn link_url" onClick={() => toggleShowPassword("conf_password")}><i className={`fa fa-${showConfPass ? 'eye-slash' : 'eye'}`}></i></span>
                              </div>
                              
                              {errors.conf_password?.type === 'required' && <div className="field_err text-danger">*{AIR_MSG.conf_password_required}</div>}
                              {
                                formRes.err_status && formRes.error?.pass_not_match?.required
                                ? <div className="field_err text-danger"><div>{formRes.error?.pass_not_match?.msg}</div> </div>
                                : ''
                              } 
                            </div>
                            {/* <div className="d-flex justify-content-end form-group">
                              <span>Remember password? &nbsp;</span>
                              <Link to="/login" className="link" >Login</Link>
                            </div> */}
                            <button className="btn btn-primary-2 btn_03 btn-block mb-lg-4 mb-md-4 mb-2 max_w_auto" type="submit" disabled={formSubmitted}> Reset Password</button>
                            {
                              !formRes.status && formRes.err_status && formRes.error?.type =="reset_pass" && formRes.error?.msg
                              ? <div className="form_err text-danger mt-2"><div>{formRes.error?.msg}</div> </div>
                              : ''
                            }
                            {
                              formRes.status && formRes?.type == "reset_pass" && formRes.msg
                              ? <div className="form_success text-success mt-2"><div>{formRes.msg}</div> </div>
                              : ''
                            }
                          </form>
                        </div>
                      </>
                    )
                  }else if(viewType == "pwd_reset_success"){
                    return(
                      <>
                        <div className="col-md-12 col-12 col-xl-7 col-md-6 col-sm-12 d-flex justify-content-center align-items-center pl-md-0">
                          <form className="w-100 mx-lg-5 mx-md-5 mx-xl-5 my-md-4 mx-2 my-2" name="form1" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                            <h6 className="f-12 fw-600">Your password has been successfully reset</h6>
                            <p>Please click below to proceed to the login page</p>
                            <Link to="/login" className="btn btn-primary-2 btn_03 btn-block mb-lg-4 mb-md-4 mb-2 max_w_auto" >Login</Link>
                          </form>
                        </div>
                      </>
                    )
                  }else if(viewType == "token_err"){}
                })()}
                
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

export default ResetPassword