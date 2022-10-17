import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/partials/Header";
import Styles from "../styles/Settings.module.css"
import React, { useContext, useEffect, useRef, useState } from "react";
import crypto from 'crypto'
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import AirModal from "../elements/AirModal";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import AIR_MSG from "../helpers/AirMsgs";

const ProfileSettings = (props) => {
  const { user = {} } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const superUser = user?.currentUser?.super_user
  // const projectId = 1;
  const [getAllScopes, setAllScopes] = useState({})
  const navigate = useNavigate()

  // const { register, handleSubmit, watch, formState: { errors } } = useForm(); // initialize the hook
  const [formSubmitted, setFormSbmt] = useState(false)
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [errorMsg, setErrorMsg] = useState(false);
  const { register, handleSubmit, watch, trigger, setValue, clearErrors, formState: { errors } } = useForm();
  const passRegex = new RegExp(/((?=.*\d)(?=.*[A-Z])(?=.*\W).{8,32})/)
  const passCondsObj = { showConds: false, hasLowerChar: false, hasUpperChar: false, hasSpecialChars: false, hasNumber: false }
  const [newPassConds, setNewPassConds] = useState(passCondsObj)
  const [confPassConds, setConfPassConds] = useState(passCondsObj)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfPass, setShowConfPass] = useState(false)
  // const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const changePasswordForm = watch("changePasswordForm")
  const updateProfileForm = watch("updateProfileForm")
  const newPassInp = watch("changePasswordForm.newPass")
  const confPassInp = watch("changePasswordForm.confPass")

  const [viewType, setViewType] = useState(1)

  const [openModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null)
  const [logo, setLogo] = useState(null)
  const [settings, setSettings] = useState(null)
  const [timezones, setTimezones] = useState([])
  const defaultTimeZone = "EST"
  const [notificationTypes, setNotificationTypes] = useState([])
  const notificationInpref = useRef([]);

  useEffect(() => {
    if (!logo) {
      fetchLogo()
    }
    if (!settings) {
      getUserSettings()
    }
    if (timezones.length == 0) {
      getTimeZones()
    }
    if (notificationTypes.length == 0) {
      getNotificationTypes()
    }
  }, [])

  useEffect(() => {
    checkValidationConditions(newPassInp, setNewPassConds)
  }, [newPassInp])
  useEffect(() => {
    checkPassMismatch()
  }, [confPassInp])

  const getTimeZones = () => {
    let tempArr = [
      { timezone: "HST", name: "HST (Hawaii Standard Time)", value: "GMT-10:00" },
      { timezone: "AST", name: "AST (Alaska Standard Time)", value: "GMT-9:00" },
      { timezone: "PST", name: "PST (Pacific Standard Time)", value: "GMT-8:00" },
      { timezone: "PNT", name: "PNT (Phoenix Standard Time)", value: "GMT-7:00" },
      { timezone: "MST", name: "MST (Mountain Standard Time)", value: "GMT-7:00" },
      { timezone: "CST", name: "CST (Central Standard Time)", value: "GMT-6:00" },
      { timezone: "EST", name: "EST (Eastern Standard Time)", value: "GMT-5:00" },
      
      { timezone: "GMT", name: "GMT (Greenwich Mean Time)", value: "GMT" },
      { timezone: "UTC", name: "UTC (Universal Coordinated Time)", value: "GMT" },
      { timezone: "ECT", name: "ECT (European Central Time)", value: "GMT+1:00" },
      { timezone: "EET", name: "EET (Eastern European Time)", value: "GMT+2:00" },
      { timezone: "ART", name: "ART ((Arabic) Egypt Standard Time)", value: "GMT+2:00" },
      { timezone: "EAT", name: "EAT (Eastern African Time)", value: "GMT+3:00" },
      { timezone: "MET", name: "MET (Middle East Time)", value: "GMT+3:30" },
      { timezone: "NET", name: "NET (Near East Time)", value: "GMT+4:00" },
      { timezone: "PLT", name: "PLT (Pakistan Lahore Time)", value: "GMT+5:00" },
      { timezone: "IST", name: "IST (India Standard Time)", value: "GMT+5:30" },
      { timezone: "BST", name: "BST (Bangladesh Standard Time)", value: "GMT+6:00" },
      { timezone: "VST", name: "VST (Vietnam Standard Time)", value: "GMT+7:00" },
      { timezone: "CTT", name: "CTT (China Taiwan Time)", value: "GMT+8:00" },
      { timezone: "JST", name: "JST (Japan Standard Time)", value: "GMT+9:00" },
      { timezone: "ACT", name: "ACT (Australia Central Time)", value: "GMT+9:30" },
      { timezone: "AET", name: "AET (Australia Eastern Time)", value: "GMT+10:00" },
      { timezone: "SST", name: "SST (Solomon Standard Time)", value: "GMT+11:00" },
      { timezone: "NST", name: "NST (New Zealand Standard Time)", value: "GMT+12:00" },
      { timezone: "MIT", name: "MIT (Midway Islands Time)", value: "GMT-11:00" },
      { timezone: "IET", name: "IET (Indiana Eastern Standard Time)", value: "GMT-5:00" },
      { timezone: "PRT", name: "PRT (Puerto Rico and US Virgin Islands Time)", value: "GMT-4:00" },
      { timezone: "CNT", name: "CNT (Canada Newfoundland Time)", value: "GMT-3:30" },
      { timezone: "AGT", name: "AGT (Argentina Standard Time)", value: "GMT-3:00" },
      { timezone: "BET", name: "BET (Brazil Eastern Time)", value: "GMT-3:00" },
      { timezone: "CAT", name: "CAT (Central African Time)", value: "GMT-1:00" }
    ]
    setTimezones(oldVal => {
      return [...tempArr]
    })
  }

  const getUserSettings = async () => {
    let payloadUrl = "employees/getProfile"
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success" && res.results.length > 0) {
      let data = res.results[0]
      setSettings(oldVal => {
        return { ...data }
      })

      setValue("updateProfileForm.first_name", data.first_name)
      setValue("updateProfileForm.last_name", data.last_name)
      setValue("updateProfileForm.nick_name", data.nick_name)
      setValue("updateProfileForm.phone", data.phone)
      setValue("updateProfileForm.timezone", data.timezone)
    }
  }
  const showModal = async (modalName = null, data = null) => {
    if (modalName == null) {
      return false
    }
    setModalType(modalName)
    setShowModal(true)
  }
  const hideModal = (tskId = null, data = null) => {
    if (modalType == "upload_logo") {
      fetchLogo()
    }
    setModalType(null)
    setShowModal(false)
  }

  const uploadLogo = async (files = null) => {
    if (files == null) {
      return false
    }
    let file = files[0]
    let payloadUrl = `orgs/uploadLogo/${orgId}`
    if (superUser == "N") {
      payloadUrl = `employees/uploadLogo`
    }
    let method = "POST";
    let formData = new FormData();
    formData.append("file", file)
    let res = await ApiService.fetchData(payloadUrl, method, formData, "form");
    if (res && res.message == "Success") {
      hideModal()
    }
  }

  const fetchLogo = async () => {
    let payloadUrl = `${process.env.REACT_APP_API_URL}orgs/getLogo/${orgId}`
    if (superUser == "N") {
      payloadUrl = `${process.env.REACT_APP_API_URL}employees/getLogo`
    }
    let method = "GET";
    let response = await ApiService.fetchFile(payloadUrl, method);
    if (response) {
      let jsonResponse = response.clone()
      let res = await response.arrayBuffer();
      if (res) {
        let contentType = response && response.headers.get('content-type') ? response.headers.get('content-type') : 'image/png';
        if (contentType.indexOf('application/json') == -1) {
          var blob = new Blob([res], { type: contentType });
          let fileType = contentType ? contentType.substr(contentType.lastIndexOf('/') + 1) : null;
          let fileUrl = window.URL.createObjectURL(blob);
          setLogo(fileUrl)
        } else {
          setLogo("/assets/img/demo_user.svg")
        }
      } else {
        setLogo("/assets/img/demo_user.svg")
      }
    }
  }

  const checkValidationConditions = async (passInp, setPassConds = null) => {
    let obj = { ...passCondsObj }
    obj.showConds = false
    obj.hasLowerChar = false
    obj.hasUpperChar = false
    obj.hasSpecialChars = false
    obj.hasNumber = false
    if (passInp == undefined || passInp == null || passInp.length == 0 || setPassConds == null) {
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
    if (newPassInp == '' || confPassInp == '') {
      return false
    }
    if (newPassInp != confPassInp) {
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

  const updatePassword = async () => {
    // console.log(changePasswordForm);
    clearErrors()
    let isValid = await trigger("changePasswordForm")
    if (!isValid) {
      return false
    }
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    let data = changePasswordForm
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
      setValue("changePasswordForm.newPass", "")
      setValue("changePasswordForm.oldPass", "")
      setValue("changePasswordForm.confPass", "")
      setNewPassConds(passCondsObj)
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
  const updateProfile = async () => {
    // console.log(updateProfileForm);
    clearErrors()
    let isValid = await trigger("updateProfileForm")
    if (!isValid) {
      return false
    }
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    let data = updateProfileForm

    let payloadUrl = "employees/updateProfile"
    let method = "POST";
    let formData = { ...data }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      formRes = { status: true, err_status: false, type: "updateProfile", error: {}, msg: AIR_MSG.update_profile_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "updateProfile"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }

  const switchView = (type = null) => {
    if (type == null) {
      return false
    }
    if(type ==2){
      getNotificationTypes();
    }
    setViewType(type)

  }

  const getNotificationTypes = async () => {
    let payloadUrl = "employees/getNotificationSetting"
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success" && res.results.length > 0) {
      let data = res.results
      for (let key in data) {
        let item = data[key];
        if(notificationInpref.current[key] != undefined){
          notificationInpref.current[key].checked = item.is_enabled == 'Y'?true:false;
        }
        
      }
      setNotificationTypes(oldVal => {
        return [...data]
      })
    }
  }

  const addOrUpdateNotificationSetting = async (index = null, element = null) => {
    if (index == null || element == null) {
      return false
    }
    let notificationType = notificationTypes[index]
    if (notificationType) {
      let is_enabled = element.checked ? "Y" : "N";
      let payloadUrl = `employees/enableNotification/${notificationType.notification_id}/${is_enabled}`
      let method = "GET";
      let res = await ApiService.fetchData(payloadUrl, method);
      if (res && res.message == "Success") {
        let formRes = { status: true, err_status: false, type: "updateNotification", error: {}, msg: "Notification updated successfully" }
        setFormRes(formRes)
      }
    }
    

  }


  return (
    <>
      <Header updatedLogo={logo} />
      {/* <div id="accordion" className="profileSec pl-lg-3 pr-lg-3 accordianSec  mt-3"> */}
      <div id="accordion" className="pl-lg-3 pr-lg-3 mt-3">
        <div className="card card_shadow_none p-2">
          <div className="card-header justify-content-between py-2 bg_color_2 border-0">
            <div className={`${Styles.config_tabs_box}`}>
              <a className={`link_url border text_color_2 ${viewType == 1 ? Styles.active : ''}`} onClick={() => switchView(1)}>User Settings</a>
              <a className={`link_url border text_color_2 ${viewType == 2 ? Styles.active : ''}`} onClick={() => switchView(2)}>Notification Settings</a>
            </div>
          </div>
          <div className="card-body">
            {(() => {
              if (viewType == 1) {
                return (
                  <>
                    <div className="row">
                      <div className="col-6 order-md-2">
                        <fieldset className="border rounded p-3">
                          <legend className="w-auto m-0 fs-14 fw-600">Upload Logo</legend>
                          <div className="row">
                            <div className="col-md-12">
                              <div className={`${Styles.emp_img_box} m-auto link_url position-relative`} onClick={() => showModal('upload_logo', '')}>
                                {logo && 
                                  <>
                                    <img src={logo} alt="empLogo" className="" />
                                    <span className={`link_url position-absolute ${Styles.edit_icn}`}><i className="fa fa-pencil"></i></span>
                                  </>
                              }
                              </div>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                      <div className="col-6 order-md-1">
                        <fieldset className="border rounded p-3">
                          <legend className="w-auto m-0 fs-14 fw-600">Change Password</legend>
                          {/* <form onSubmit={handleSubmit(updatePassword)}> */}
                          <form>
                            <div className="row">
                              <div className="col-md-12 mb-4">
                                <div className="formInline m-0">
                                  {/* <label htmlFor="">Current Password:</label> */}
                                  <input type="password" className="form-control" {...register("changePasswordForm.oldPass", { required: true })} autoComplete="off" defaultValue="" placeholder="Current Password" />
                                </div>
                                {errors.changePasswordForm?.oldPass?.type === 'required' && <div className="field_err text-danger">*Old assword is required</div>}
                              </div>
                              <div className="col-md-6">
                                <div className="formInline m-0">
                                  {/* <label htmlFor="">New Password:</label> */}
                                  <div className="w-100 position-relative">
                                    <input type={showNewPass ? "text" : "password"} className="form-control bg-transparent" {...register("changePasswordForm.newPass", { required: true, pattern: passRegex })} autoComplete="off" defaultValue="" placeholder="New Password" />
                                    <span className="show_pass_icn link_url" onClick={() => toggleShowPassword("newPass")}><i className={`fa fa-${showNewPass ? 'eye-slash' : 'eye'}`}></i></span>
                                  </div>

                                </div>
                                {errors.changePasswordForm?.newPass?.type === 'required' && <div className="field_err text-danger">*{AIR_MSG.password_required}</div>}
                                {
                                  formRes.err_status && formRes.error?.pass_not_match?.required
                                    ? <div className="field_err text-danger"><div>{formRes.error?.pass_not_match?.msg}</div> </div>
                                    : ''
                                }
                              </div>
                              <div className="col-md-6">
                                <div className="formInline m-0">
                                  {/* <label htmlFor="">Confirm Password:</label> */}
                                  <div className="w-100 position-relative">
                                    <input type={showConfPass ? "text" : "password"} className="form-control bg-transparent"{...register("changePasswordForm.confPass", { required: true })} autoComplete="off" defaultValue="" placeholder="Confirm New Password" />
                                    <span className="show_pass_icn link_url" onClick={() => toggleShowPassword("confPass")}><i className={`fa fa-${showConfPass ? 'eye-slash' : 'eye'}`}></i></span>
                                  </div>

                                </div>
                                {errors.changePasswordForm?.confPass?.type === 'required' && <div className="field_err text-danger">*{AIR_MSG.conf_password_required}</div>}
                              </div>
                              <div className="col-md-12">{newPassConds.showConds && getPassCondsList("newPass")}</div>
                              <div className="col-md-12 mt-3">
                                <button type="button" className="btn btn-primary-2 btn_04" onClick={() => updatePassword()}>Change Password</button>
                              </div>
                            </div>

                            <div className="row">
                              <div className="col">
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
                          </form>
                        </fieldset>
                        <fieldset className="border rounded p-3 mt-3">
                          <legend className="w-auto m-0 fs-14 fw-600">User Profile</legend>
                          <form action="#">
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <div className="formInline m-0">
                                  <input type="text" className="form-control" {...register("updateProfileForm.first_name", { required: true })} autoComplete="off" defaultValue="" placeholder="First Name" />
                                </div>
                                {errors.updateProfileForm?.first_name?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.fname_required}</div>}
                              </div>
                              <div className="col-md-6 mb-3">
                                <div className="formInline m-0">
                                  <input type="text" className="form-control" {...register("updateProfileForm.last_name", { required: true })} autoComplete="off" defaultValue="" placeholder="Last Name" />
                                </div>
                                {errors.updateProfileForm?.last_name?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.lname_required}</div>}
                              </div>
                              <div className="col-md-6 mb-3">
                                <div className="formInline m-0">
                                  <input type="text" className="form-control" {...register("updateProfileForm.nick_name")} autoComplete="off" defaultValue="" placeholder="Nick Name" />
                                </div>
                                {errors.updateProfileForm?.nick_name?.type === 'required' && <div className="field_err text-danger">* Nick Name is required</div>}
                              </div>
                              <div className="col-md-6 mb-3">
                                <div className="formInline m-0">
                                  <input type="text" className="form-control" {...register("updateProfileForm.phone")} autoComplete="off" defaultValue="" placeholder="Phone Number" />
                                </div>
                                {errors.updateProfileForm?.phone?.type === 'required' && <div className="field_err text-danger">* Phone Number is required</div>}
                              </div>
                              <div className="col-md-12 mb-3">
                                <div className="formInline m-0">
                                  {timezones && timezones.length > 0 &&
                                    <select className="form-control" {...register("updateProfileForm.timezone", { required: false, value: defaultTimeZone })} >
                                      <option value={""}>Select Timezone</option>
                                      {React.Children.toArray(timezones.map((item) => {
                                        return <option value={item.timezone}>{item.name} ({item.value})</option>
                                      }))}
                                    </select>
                                  }

                                </div>
                                {errors.updateProfileForm?.timezone?.type === 'required' && <div className="field_err text-danger">* Timezone is required</div>}
                              </div>

                              <div className="col-md-12 mt-3">
                                <button type="button" className="btn btn-primary-2 btn_04" onClick={() => updateProfile()}>Update Profile</button>
                              </div>
                            </div>

                            <div className="row">
                              <div className="col">
                                {/* {errors.newPass?.type === 'pattern' && <div className="form_err text-danger">*Password should be alphanumeric, must contain atleast 1 uppercase and 1 special character and should have atleast 10 characters </div>} */}
                                {
                                  !formRes.status && formRes.err_status && formRes.error?.type == "updateProfile" && formRes.error?.msg
                                    ? <div className="form_err text-danger"><div>{formRes.error?.msg}</div> </div>
                                    : ''
                                }
                                {
                                  formRes.status && formRes?.type == "updateProfile" && formRes.msg
                                    ? <div className="form_success text-success"><div>{formRes?.msg}</div> </div>
                                    : ''
                                }
                              </div>

                            </div>
                          </form>
                        </fieldset>
                      </div>
                    </div>

                  </>
                )

              } else if (viewType == 2) {
                return (
                  <div className="card bg-transparent air_vendor rounded mt-3">
                    <div className="card-body p-0">
                      <div className="grc_table_section">
                        <div className={`vendor_certificatons_block grc_table_block ${Styles.vendor_table_block}`}>
                          <div className="table-responsive">
                            <table className="table table-sm table-borderless mb-0">
                              <thead>
                                <tr>
                                  <th className="pl-3 pl-md-4">Platform Event</th>
                                  <th className="pl-3 pl-md-4">Email Alert</th>
                                </tr>
                              </thead>
                              <tbody>
                                {notificationTypes && notificationTypes.length > 0 && notificationTypes.map((item, ntIndex) => {
                                  return (
                                    <tr key={ntIndex}>
                                      <td className="pl-3 pl-md-4 text-dark">{item.notification_name}</td>
                                      <td className="pl-3 pl-md-4">
                                        <div className="custom-control custom-switch">
                                          <input type="checkbox" className="custom-control-input" id={`customSwitch${ntIndex}`} ref={el=>notificationInpref.current[ntIndex]=el} defaultChecked={item.is_enabled == "Y" ? true : false} onChange={(e) => addOrUpdateNotificationSetting(ntIndex, e.target)} />
                                          <label className="custom-control-label" htmlFor={`customSwitch${ntIndex}`} ></label>
                                        </div>
                                      </td>

                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
            })()}


          </div>

        </div>
      </div>
      {(() => {
        if (modalType && modalType != '' && modalType != null) {
          if (modalType == 'upload_logo') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={{}}
              formSubmit={uploadLogo} />
          }
        }
      })()}
    </>
  )
}

export default ProfileSettings