import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie, encryptData } from "../helpers/Helper";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import crypto from 'crypto'
import { useContext, useEffect, useState } from "react";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import AIR_MSG from "../helpers/AirMsgs";
const Login = (props) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();
  const error = searchParams.get('error') || null
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { updateData } = useContext(LayoutContext)
  const onSubmit = async (data) => {
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (!data.email || data.email == '' || !data.password || data.password == '') {
      return false
    };
    if (data.password) {
      let md5Pass = crypto.createHash('md5').update(data.password).digest('hex');
      data.password = md5Pass
    }
    let payload = data
    payload.type = "login"
    payload.url = "auth/login"
    let res = await ApiService.post(payload.type, payload, Login);
    if (res && res.message == "Success") {
      let userInfo = res.results;
      userInfo.user.org_id = Number(userInfo.user.org_id)
      userInfo.otpVerified = false
      let setcookie = SetCookie('currentUser', JSON.stringify(userInfo))
      let setTimecookie = SetCookie('last_login_activity', JSON.stringify(new Date().getTime()))
      updateData('user')
      navigate("/otp-verification", { replace: true })
    }else{
      
      formRes['err_status'] = true
      formRes['error']['type'] = "login"
      formRes['error']['msg'] = res.message

      setFormRes(formRes)
    }
    // setTimeout(() => {
    //   formRes = { status: false, err_status: false, error: {} }
    //   setFormRes(formRes)
    // }, 3000);
  }

  // useEffect(() => {
  //   testOrg()
  // }, [])
  
  
  const testOrg = async (taskId = null) => {
    
    let payloadUrl = `orgs/checkOrg/`
    let method = "GET";
    let formData = {};
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
    }
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
                <div className="col-md-12 col-12 col-xl-7 col-md-6 col-sm-12 d-flex justify-content-center align-items-center pl-md-0">
                  <form className="w-100 mx-lg-5 mx-md-5 mx-xl-5 my-md-4 mx-2 my-2" name="form1" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                    {/* <h6 className="f-12 fw-600">Login to Account</h6>
                    <p>Please enter your email and password to continue</p> */}
                    <div className="form-group">
                      <label htmlFor="email">email address</label>
                      <input type="email" className="form-control" {...register("email", { required: true })} name="email" autoComplete="off" defaultValue="" />
                      {errors.email?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.email_required}</div>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input type="password" className="form-control" {...register("password", { required: true })} name="password" autoComplete="off" defaultValue="" />
                      {errors.password?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.password_required}</div>}
                    </div>
                    <div className="d-flex justify-content-between form-group">
                      <label htmlFor="" className="checkbox">
                        <input type="checkbox" /> Remember me
                      </label>
                      <Link to="/forgotpassword" className="link text-secondary" >Forgot password?</Link>
                    </div>
                    <button className="btn btn-primary-2 btn_03 btn-block mb-lg-4 mb-md-4 mb-2 max_w_auto" type="submit"> sign in</button>
                    <div className="row m-0">
                      {error && error == 'sess_exp' && <div className="form_err text-danger"><div>{AIR_MSG.session_exp}</div> </div>}
                    </div>
                    <div className="row m-0">
                      {
                        !formRes.status && formRes.err_status && formRes.error?.type == "login"
                          ? <div className="form_err text-danger"><div>{formRes?.error?.msg}</div> </div>
                          : ''
                      }
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

export default Login