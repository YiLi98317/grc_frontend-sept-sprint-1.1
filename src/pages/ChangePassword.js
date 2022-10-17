import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/partials/Header";
import { useEffect, useState } from "react";
import crypto from 'crypto'
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import AIR_MSG from "../helpers/AirMsgs";

const ChangePassword = (props) => {
  const { user = {} } = useOutletContext()
  const orgId = user?.currentUser?.org_id || 0;
  // const projectId = 1;
  const [getAllScopes, setAllScopes] = useState({})
  const navigate = useNavigate()

  // const { register, handleSubmit, watch, formState: { errors } } = useForm(); // initialize the hook
  const [formSubmitted, setFormSbmt] = useState(false)
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [errorMsg, setErrorMsg] = useState(false);
  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm();
  const passRegex = new RegExp(/((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,32})/)
  const passCondsObj = { showConds: false, hasLowerChar: false, hasUpperChar: false, hasSpecialChars: false, hasNumber: false }
  const [newPassConds, setNewPassConds] = useState(passCondsObj)
  const [confPassConds, setConfPassConds] = useState(passCondsObj)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfPass, setShowConfPass] = useState(false)
  // const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const newPassInp = watch("newPass")
  const confPassInp = watch("confPass")
  useEffect(() => {
    checkValidationConditions(newPassInp, setNewPassConds)
  }, [newPassInp])
  useEffect(() => {
    checkPassMismatch()
  }, [confPassInp])

  const checkValidationConditions = async (passInp, setPassConds) => {
    let obj = { ...passCondsObj }
    obj.showConds = false
    obj.hasLowerChar = false
    obj.hasUpperChar = false
    obj.hasSpecialChars = false
    obj.hasNumber = false
    if (passInp == undefined || passInp == null || passInp.length == 0 || !setPassConds || setPassConds == null) {
      setPassConds(oldVal => {
        return { ...obj }
      })
      return false
    }
    await trigger("newPass")
    
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
    if (field == "newPass") {
      setShowNewPass(showNewPass ? false : true)
    } else {
      setShowConfPass(showConfPass ? false : true)
    }

  }

  const getPassCondsList = (fieldType = "") => {
    if (fieldType == null) {
      return false
    }

    let inpField = fieldType == "newPass" ? newPassInp : confPassInp
    let condObj = fieldType == "newPass" ? newPassConds : confPassConds
    if (!condObj.showConds) {
      return false
    }
    return (
      <>
        <ul className="pass_cond_list fs-11 p-0 row w-50 m-0 mt-2">
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

  const updatePassword = async (data) => {
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (!data.oldPass || data.oldPass == '' || !data.newPass || data.newPass == '' || !data.confPass || data.confPass == '') {
      return false
    };
    if (data.newPass != data.confPass) {
      formRes = { status: false, err_status: true, error: { pass_not_match: { required: true, msg: AIR_MSG.password_mismatch } } }
      setFormRes(formRes)
      return
    }

    if (data.oldPass) {
      let md5Pass = crypto.createHash('md5').update(data.oldPass).digest('hex');
      data.oldPass = md5Pass
    }
    if (data.newPass) {
      let md5Pass = crypto.createHash('md5').update(data.newPass).digest('hex');
      data.newPass = md5Pass
    }
    let payloadUrl = "auth/changePassword"
    let method = "POST";
    let formData = { current_password: data.oldPass, new_password: data.newPass }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      formRes = { status: true, err_status: false, type: "updatePass", error: {}, msg: AIR_MSG.change_pwd_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "updatePass"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }


  return (
    <>
      <Header />
      <div id="accordion" className="profileSec pl-lg-3 pr-lg-3 accordianSec  mt-3">
        <div className="card">
          <form onSubmit={handleSubmit(updatePassword)}>
            <div className="card-header justify-content-between py-4">
              <a className="card-title">
                Change Password
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip className="text-left" id={`tooltip-right`}>
                      <span>&#8226; Password should be alphanumeric</span><br />
                      <span>&#8226; Password must contain atleast 1 uppercase</span><br />
                      <span>&#8226; Password must contain atleast 1 special character</span><br />
                      <span>&#8226; Password should have atleast 10 characters</span><br />
                    </Tooltip>
                  }
                >
                  <span className="info_icon d-inline-block ml-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                </OverlayTrigger>
              </a>
              <button className="btn btn-primary-2 btn_05" type="submit">Update</button>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="formInline m-0">
                    <label htmlFor="">Current Password:</label>
                    <input type="password" className="form-control" {...register("oldPass", { required: true })} name="oldPass" autoComplete="off" defaultValue="" />
                  </div>
                  {errors.oldPass?.type === 'required' && <div className="field_err text-danger">*Old assword is required</div>}
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="formInline m-0">
                    <label htmlFor="">New Password:</label>
                    <div className="w-100 position-relative">
                      <input type={showNewPass ? "text" : "password"} className="form-control bg-transparent" {...register("newPass", { required: true, pattern: passRegex })} name="newPass" autoComplete="off" defaultValue="" />
                      <span className="show_pass_icn link_url" onClick={() => toggleShowPassword("newPass")}><i className={`fa fa-${showNewPass ? 'eye-slash' : 'eye'}`}></i></span>
                    </div>

                  </div>
                  {errors.newPass?.type === 'required' && <div className="field_err text-danger">*{AIR_MSG.password_required}</div>}
                  {
                    formRes.err_status && formRes.error?.pass_not_match?.required
                      ? <div className="field_err text-danger"><div>{formRes.error?.pass_not_match?.msg}</div> </div>
                      : ''
                  }
                </div>
                <div className="col-md-6">
                  <div className="formInline m-0">
                    <label htmlFor="">Confirm Password:</label>
                    <div className="w-100 position-relative">
                      <input type={showConfPass ? "text" : "password"} className="form-control bg-transparent"{...register("confPass", { required: true })} name="confPass" autoComplete="off" defaultValue="" />
                      <span className="show_pass_icn link_url" onClick={() => toggleShowPassword("confPass")}><i className={`fa fa-${showConfPass ? 'eye-slash' : 'eye'}`}></i></span>
                    </div>

                  </div>
                  {errors.confPass?.type === 'required' && <div className="field_err text-danger">*Confirm {AIR_MSG.password_required}</div>}
                </div>
              </div>
              <div className="row">
                <div className="col-auto w150"></div>
                <div className="col">
                    {newPassConds.showConds && getPassCondsList("newPass")}
                    {/* {errors.newPass?.type === 'pattern' && <div className="form_err text-danger">*Password should be alphanumeric, must contain atleast 1 uppercase and 1 special character and should have atleast 10 characters </div>} */}
                    {
                      !formRes.status && formRes.err_status && formRes.error?.type == "updatePass" && formRes.error?.msg
                        ? <div className="form_err text-danger"><div>{formRes.error?.msg}</div> </div>
                        : ''
                    }
                    {
                      formRes.status && formRes?.type == "updatePass" && formRes.msg
                        ? <div className="form_success text-success"><div>{formRes.msg}</div> </div>
                        : ''
                    }
                  </div>

              </div>

            </div>
          </form>

        </div>
      </div>
    </>
  )
}

export default ChangePassword