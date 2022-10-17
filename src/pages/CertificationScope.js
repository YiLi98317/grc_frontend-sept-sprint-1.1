import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie, decryptData } from "../helpers/Helper";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/partials/Header";
import React, { useEffect, useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import AIR_MSG from "../helpers/AirMsgs";

const CompianceConfigScope = (props) => {
  const { user = {} } = useOutletContext()
  const { token = '' } = useParams()
  const orgId = user?.currentUser?.org_id || 0;
  // const projectId = Number(token);
  // const projectId = 1;
  const [projectId, setProjectId] = useState(null)
  const [getAllScopes, setAllScopes] = useState({})
  const [addUtilitiesList, setUtilitiesList] = useState([])

  const [tpUtilities, setUtilities] = useState([])
  const [internalMembers, setInternalMembers] = useState([])
  const [modifyIMember, setModifyIMember] = useState([])
  const iMemAuthorityInpRef = useRef([])
  const navigate = useNavigate()

  const { register, handleSubmit, watch,clearErrors,trigger, formState: { errors } } = useForm(); // initialize the hook
  const [formSubmitted, setFormSbmt] = useState(false)
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [errorMsg, setErrorMsg] = useState(false);
  const [userType, setUserType] = useState('key_member')
  const [accountsList, setAccountsList] = useState(null);
  const [check3rdParty, setcheck3rdParty] = useState(false);
  const [checkOthers, setcheckOthers] = useState(false);
  const [checkEndpoint, setcheckEndpoint] = useState(false);
  const [checkMobile, setcheckMobile] = useState(false);
  const [checkServer, setCheckServer] = useState(false);

  // const { register, handleSubmit, watch, formState: { errors } } = useForm();
  useEffect(() => {
    if (token != '') {
      let id = decryptData(token)
      setProjectId(oldVal => {
        return Number(id)
      })
    }
  })
  useEffect(() => {
    if (Object.keys(getAllScopes).length == 0 && projectId != null) {
      fetchInfo("all")
    }
    if (tpUtilities.length == 0 && projectId != null) {
      fetchInfo("tpUtilites")
    }
    // if (tpServices.length == 0) {
    //   fetchInfo("get_tps")
    // }
    if (internalMembers.length == 0 && projectId != null) {
      getInternalMembers()
    }

  }, [projectId])

  const fetchInfo = async (type = '') => {
    if (type == '') {
      return false
    };

    let payloadUrl = ""
    let method = "POST";
    let formData = {};

    if (type == 'all') {
      // https://zp5ffmsibc.us-east-1.awsapprunner.com/configuration/getConfiguration/15/2/2
      payloadUrl = `configuration/getScopeDetails/${projectId}`
      method = "GET";
    }
    else if (type == 'tpUtilites') {
      payloadUrl = `configuration/getThirdPartyUtilities/${projectId}`
      method = "GET";
    }

    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      if (type == 'all') {
        let obj = {
          peoples: res.peoples,
          technology_assets: res.technology_assets,
          third_party_utilities: res.third_party_utilities,
          vendors: res.vendors,
        }
        //set accounts if added

        /* add to framework list if selected */
        let tmpUtilityList = [];
        obj.third_party_utilities && obj.third_party_utilities.map(utility => {
          if (utility.is_selected == "Y") {
            tmpUtilityList.push(utility.id)
          }
        })
        setUtilitiesList(tmpUtilityList)

        setTimeout(() => {
          setAllScopes(oldVal => {
            return { ...obj }
          })
        }, 100);
      }
      else if (type == "tpUtilites") {
        setUtilities(oldVal => {
          return [...res.results]
        })
      }
    }
  }

  
  const addPeople = async () => {
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let empInput = document.getElementById("empInput");
    let consultantInput = document.getElementById("consultantInput");
    let employees = empInput.value
    let consultants = consultantInput.value
    if (!employees || !consultants) {
      // let formRes = {status:false,err_status:true,error:{}}
      formRes['err_status'] = true
      if (!employees) {
        formRes['error']['employees'] = { required: true, msg: AIR_MSG.employee_required }
      }
      if (!consultants) {
        formRes['error']['consultants'] = { required: true, msg: AIR_MSG.consultant_required }
      }
      setFormRes(formRes)
      return false;
    }
    let payloadUrl = "configuration/addPeople"
    let method = "POST";
    let formData = { employees: employees, consultants: consultants, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      formRes = { status: true, err_status: false, type: "people", error: {}, msg: AIR_MSG.add_people_success }
      setFormRes(formRes)

      let scopes = getAllScopes
      scopes.peoples = [{ employees: formData.employees, consultants: formData.consultants }]
      setAllScopes(scopes)
      changePanel(2)

    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "people"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }
  const addLocation = async () => {
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let locationInput = document.getElementById("locInput");
    let headquaterInput = document.getElementById("headquaterInput");
    let locationCount = locationInput.value
    let consultants = headquaterInput.value
    if (!locationCount || !consultants) {
      // let formRes = {status:false,err_status:true,error:{}}
      formRes['err_status'] = true
      if (!locationCount) {
        formRes['error']['locationCount'] = { required: true, msg: AIR_MSG.employee_required }
      }
      if (!consultants) {
        formRes['error']['consultants'] = { required: true, msg: AIR_MSG.consultant_required }
      }
      setFormRes(formRes)
      return false;
    }
   // let payloadUrl = "configuration/addPeople"
    let payloadUrl = ""
    let method = "POST";
    let formData = { locationCount: locationCount, consultants: consultants, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      // formRes = { status: true, err_status: false, type: "people", error: {}, msg: AIR_MSG.add_people_success }
      // setFormRes(formRes)

      // let scopes = getAllScopes
      // scopes.peoples = [{ locationCount: formData.employees, consultants: formData.consultants }]
      // setAllScopes(scopes)
      // changePanel(2)

    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "people"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }
 

  const changePanel = (index = null) => {
    if (index == null) {
      return false
    }
    let ele = document.getElementById(`ch${index}`)
    ele.click()
  }

  const getInternalMembers = async () => {
    let payloadUrl = `tasks/getProjectMembers/${projectId}/internal`
    let method = "GET";
    let formData = {};
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      setInternalMembers(oldVal => {
        return [...res.results]
      })
    }

  }
  const onClickEditInternalMember = (imIndex) => {
    if (imIndex == null) {
      return false
    }
    let iMember = internalMembers[imIndex] ? internalMembers[imIndex] : false;
    if (iMember) {
      let formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
      iMember.index = imIndex
      setModifyIMember(oldVal => {
        return { ...iMember }
      })
    }
  }
  const cancelModifyIMember = (imIndex) => {
    if (imIndex == null) {
      return false
    }
    let iMember = internalMembers[imIndex] ? internalMembers[imIndex] : false;
    if (iMember) {
      let formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
      setModifyIMember({})
    }
  }

  const updateIMember = async (imIndex = null, data = null) => {
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (imIndex == null) {
      return false
    }
    let iMember = internalMembers[imIndex] || false
    if (iMember) {
      setFormSbmt(true)
      let payloadUrl = `configuration/updateEmpDesignation/`
      let method = "POST";

      let formData = {}
      formData.emp_id = modifyIMember.emp_id
      if (iMemAuthorityInpRef && iMemAuthorityInpRef.current[imIndex] && iMemAuthorityInpRef.current[imIndex].value) {
        formData.designation = iMemAuthorityInpRef.current[imIndex].value
      } else {
        formRes = { status: true, err_status: true, type: "updateIMember", error: {}, msg: "" }
        formRes['error']['required'] = true
        formRes['error']['msg'] = AIR_MSG.designation_required
        setFormRes(formRes)
        return false
      }

      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "updateIMember", error: {}, msg: "" }
        setFormRes(formRes)
        setModifyIMember({})
        getInternalMembers()
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "updateIMember"
        formRes['error']['msg'] = ""
        setFormRes(formRes)
      }
      setTimeout(() => {
        formRes = { status: false, err_status: false, error: {} }
        setFormRes(formRes)
      }, 3000);
      setFormSbmt(false)
    }


  }
  const onSelectUserType = (type = "") => {
    setUserType(type)
  }

  const addKeyPerson = async () => {
    clearErrors()
    let isValid = await trigger("keyMemForm")
    if (!isValid) {
      return false
    }
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let memFnInput = document.getElementById("memFnInp")
    let memLnInput = document.getElementById("memLnInp")
    let memEmailInput = document.getElementById("memberEmail")
    let memRoleInput = document.getElementById("memberRole")
    let memFirstName = memFnInput.value
    let memLastName = memLnInput.value
    let memEmail = memEmailInput.value
    //let memRole = memberRoles[memRoleInput.value]
     let memRole = ""
    if (!memFirstName || !memLastName || !memEmail || !memRole) {
      formRes['err_status'] = true
      if (!memFirstName) {
        formRes['error']['memberFname'] = { required: true, msg: AIR_MSG.fname_required }
      }
      if (!memLastName) {
        formRes['error']['memberLname'] = { required: true, msg: AIR_MSG.lname_required }
      }
      if (!memEmail) {
        formRes['error']['memberEmail'] = { required: true, msg: AIR_MSG.email_required }
      }
      if (!memRole) {
        formRes['error']['memberRole'] = { required: true, msg: AIR_MSG.role_required }
      }
      setFormRes(formRes)
      return false;
    }
    //let payloadUrl = "configuration/addKeyMember"
    let payloadUrl = ""
    let method = "POST";
    let formData = { first_name: memFirstName, last_name: memLastName, email: memEmail, department_name: memRole.name, authority_id: memRole.id, project_id: projectId, org_id: orgId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
     // let memListArr = Object.assign([], members);
     // let memObj = { emp_id: res.emp_id, first_name: formData.first_name, last_name: formData.last_name, email: formData.email, department_name: formData.department_name }
     // memListArr.push(memObj)
     // refreshUsers("key_member", memObj)
     // setMembers(oldVal => {
     //   return [...memListArr]
     // })
      memFnInput.value = ""
      memLnInput.value = ""
      memEmailInput.value = ""
      memRoleInput.value = ""
      // changePanel(3)
      formRes = { status: true, err_status: false, error: {}, type: "member", msg: AIR_MSG.add_member_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "member"
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
      <div id="accordion" className="accordion pl-lg-3 pr-lg-3 accordianSec profileSec">
      
        <div className="card ">
          <div className="d-flex align-items-center">
            <div id="ct3" className={`card-header flex-grow-1 collapsed`} data-toggle="collapse" href="#cp3" aria-expanded="true">
              <a className="card-title w-100 d-flex">
                Key Member
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={`tooltip-right`}>
                      Tooltip for <strong>Key Member</strong>.
                    </Tooltip>
                  }
                >
                  {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                  <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                </OverlayTrigger>
                {/* {members && members.length > 0
                  ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                  : ''
                } */}
              </a>
            </div>

          </div>
          <div id="cp3" className="card-body p-0 collapse" data-parent="#accordion">
            <div className="p-lg-3 m-lg-3 p-2 m-2 bg-white rounded">
              <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                {/* <div className="mr-2 w50 min_w_320 mb-3">
                  <select className="form-control" onChangeCapture={(e) => onSelectUserType(e.target.value)}>
                    <option value={``}> Select User Type </option>
                    <option value={`key_member`}> Key Member </option>
                  </select>
                </div> */}
              </div>
              {userType == "key_member" &&
                <div>
                  <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="memFnInp" type="text" className="form-control" placeholder="First Name" />
                      {errors.keyMemForm?.fname && errors.keyMemForm?.fname.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.fname_required}</div></div>}

                      {errors.keyMemForm?.fname && errors.keyMemForm?.fname.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.fname_invalid}</div></div>}
                      {
                        formRes.err_status && formRes.error?.memberFname?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.memberFname?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="memLnInp" type="text" className="form-control" placeholder="Last Name" />
                      {errors.keyMemForm?.lname && errors.keyMemForm?.lname.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.lname_required}</div></div>}

                      {errors.keyMemForm?.lname && errors.keyMemForm?.lname.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.lname_invalid}</div></div>}
                      {
                        formRes.err_status && formRes.error?.memberLname?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.memberLname?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="memberEmail" type="text" className="form-control" placeholder="Email Address"  />
                      {errors.keyMemForm?.email && errors.keyMemForm?.email.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.email_required}</div></div>}

                      {errors.keyMemForm?.email && errors.keyMemForm?.email.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.email_invalid}</div></div>}
                      {
                        formRes.err_status && formRes.error?.memberEmail?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.memberEmail?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 w-75 mr-2">
                      <select name="" id="memberRole" className="form-control">
                        <option value="">Select Authority</option>
                        {/* {memberRoles && memberRoles.length > 0 && memberRoles.map((role, mrIndex) => {
                          return (
                            <option key={mrIndex} value={mrIndex}>{role.name}</option>
                          )
                        })} */}
                      </select>
                      {/* {
                        formRes.err_status && formRes.error?.memberRole?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.memberRole?.msg}</div> </div>
                          : ''
                      } */}
                    </div>
                    <div><a onClick={() => addKeyPerson()} className="info btn_03"> <img src="/assets/img/plus.svg" alt="" className="plus" /> </a></div>
                  </div>
                  {/* {
                    !formRes.status && formRes.err_status && formRes.error?.type == "member" && formRes.error?.msg
                      ? <div className="form_err text-danger mt-2"><div>{formRes.error?.msg}</div> </div>
                      : ''
                  }
                  {
                    formRes.status && formRes?.type == "member" && formRes.msg
                      ? <div className="form_success text-success mt-2"><div>{formRes.msg}</div> </div>
                      : ''
                  } */}
                </div>
              }
             
            </div>

            {/* {allUsers.length > 0 &&
              <div className="search_result bg-white fs-14 ">
                <div className="px-3 h_labels">
                  <div className="w120 flex-xl-grow-1 ml-lg-3 ml-md-0">First Name</div>
                  <div className="w120 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left text_color_2 mr-0">Last Name</div>
                  <div className="w100 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left text_color_2 mr-0">Type</div>
                  <div className="w150 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left">Authority</div>
                  <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text-left text_color_3 mr-2">Email</div>
                  <div className="w200 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left text_color_3 mr-2">Label</div>
                  <div className="mr-lg-3 w20"></div>
                </div>
                {allUsers && allUsers.length > 0 && allUsers.map((user, uIndex) => {
                  return (
                    <div key={uIndex} className=" px-3">
                      <div className="w120 flex-xl-grow-1 ml-lg-3 ml-md-0 ">{user?.first_name}</div>
                      <div className="w120 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left text_color_2 mr-0">{user?.last_name}</div>
                      <div className="w100 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left text_color_2 mr-0">{user?.type == "key_member" ? "Key Member" : (user?.type == "service_partner" ? "Service Partner" : (user?.type == "task_owner" ? "Task Owner" : "Auditor"))}</div>
                      <div className="w150 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left">{user?.department_name}</div>
                      <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text-left text_color_3 mr-2">{user?.email}</div>
                      <div className="w200 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left text_color_3 mr-2">{user?.label}</div>
                      <div className="mr-lg-3 w20"><a onClick={() => delUser(uIndex, user)}> <img src="/assets/img/times.svg" alt="" className="plus" />  </a></div>
                    </div>
                  )
                 })
                }
              </div>
            } */}

          </div>
        </div>

       <div className="card ">
          <div className="d-flex align-items-center">
            <div id="ch1" className="card-header collapsed flex-grow-1" data-toggle="collapse" data-parent="#accordion" href="#cp1">
              <a className="card-title w-100 d-flex">
                People
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={`tooltip-right`}>
                      Tooltip for <strong>People</strong>.
                    </Tooltip>
                  }
                >
                  {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                  <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                </OverlayTrigger>
                {/* {getAllScopes && getAllScopes.technology_assets && getAllScopes.technology_assets.length > 0 && (getAllScopes.technology_assets[0].endpoints)
                  ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                  : ''
                } */}
              </a>
            </div>
            <div className="ml-auto action_item">
              <a onClick={() => addPeople()} className="btn btn-primary-2 btn_03 btn-sm">Save</a>
            </div>
          </div>
          <div id="cp1" className="collapse" data-parent="#accordion" >
          <div className="card-body">
              <div className="row">
                <div className="form-group col-md-6 formInline">
                  <label htmlFor="">Employees:</label>
                  <input type="text" className="form-control bg-transparent" placeholder="No. of Employees" id="empInput" defaultValue={getAllScopes.peoples && getAllScopes?.peoples[0]?.employees ? getAllScopes?.peoples[0]?.employees : ''} />
                  {
                    formRes.err_status && formRes.error?.employees?.required
                      ? <div className="field_err text-danger"><div>{formRes.error?.employees?.msg}</div> </div>
                      : ''
                  }
                </div>
                <div className="form-group col-md-6 formInline" >
                  <label htmlFor="" className="pl-xl-5">Consultants :</label>
                  <input type="text" className="form-control bg-transparent" placeholder="No. of Consultants" id="consultantInput" defaultValue={getAllScopes.peoples && getAllScopes?.peoples[0]?.consultants ? getAllScopes?.peoples[0]?.consultants : ''} />
                  {
                    formRes.err_status && formRes.error?.consultants?.required
                      ? <div className="field_err text-danger"><div>{formRes.error?.consultants?.msg}</div> </div>
                      : ''
                  }
                </div>
              </div>
              <div className="row">
                {
                  !formRes.status && formRes.err_status && formRes.error?.type == "people" && formRes.error?.msg
                    ? <div className="form_err text-danger"><div>{formRes.error?.msg}</div> </div>
                    : ''
                }
                {
                  formRes.status && formRes?.type == "people" && formRes.msg
                    ? <div className="form_success text-success"><div>{formRes.msg}</div> </div>
                    : ''
                }
              </div>
            </div>

          </div>
        </div>

        <div className="card ">
          <div className="d-flex align-items-center">
            <div id="ch2" className="card-header collapsed flex-grow-1" data-toggle="collapse" data-parent="#accordion" href="#cp2">
              <a className="card-title w-100 d-flex">
                Location
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={`tooltip-right`}>
                      Tooltip for <strong>Location</strong>.
                    </Tooltip>
                  }
                >
                  {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                  <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                </OverlayTrigger>
                {/* {getAllScopes && getAllScopes.technology_assets && getAllScopes.technology_assets.length > 0 && (getAllScopes.technology_assets[0].endpoints)
                  ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                  : ''
                } */}
              </a>
            </div>
            <div className="ml-auto action_item">
              <a onClick={() => addLocation()} className="btn btn-primary-2 btn_03 btn-sm">Save</a>
            </div>
          </div>
          <div id="cp2" className="collapse" data-parent="#accordion" >
            <div className=" p-3">
              <div className="row">
                <div className="form-group col-md-6 formInline">
                  <label htmlFor="" style={{"max-width":"200px"}}>Physical Locations Count:</label>
                  <input type="text" className="form-control bg-transparent" placeholder="No. of Locations" id="locInput" defaultValue={""} />
                  {
                    formRes.err_status && formRes.error?.endPoints?.required
                      ? <div className="field_err text-danger"><div>{formRes.error?.endPoints?.msg}</div> </div>
                      : ''
                  }
                </div>
                <div className="form-group col-md-6 formInline" >
                  <label htmlFor="" className="pl-xl-1">Headquaters Count:</label>
                  <input type="text" className="form-control bg-transparent" placeholder="No. of Headquaters" id="headquaterInput" defaultValue={""} />
                  {
                    formRes.err_status && formRes.error?.servers?.required
                      ? <div className="field_err text-danger"><div>{formRes.error?.servers?.msg}</div> </div>
                      : ''
                  }
                </div>
              </div>
              <div className="row">
                {
                  !formRes.status && formRes.err_status && formRes.error?.type == "techAssets" && formRes.error?.msg
                    ? <div className="form_err text-danger"><div>{formRes.error?.msg}</div> </div>
                    : ''
                }
                {
                  formRes.status && formRes?.type == "techAssets" && formRes.msg
                    ? <div className="form_success text-success"><div>{formRes.msg}</div> </div>
                    : ''
                }
              </div>
            </div>

          </div>
        </div>

        <div className="card ">
          <div className="d-flex align-items-center">
            <div id="ct4" className={`card-header flex-grow-1 collapsed`} data-toggle="collapse" href="#cp4" aria-expanded="true">
              <a className="card-title w-100 d-flex">
                Technology
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={`tooltip-right`}>
                      Tooltip for <strong>Technology</strong>.
                    </Tooltip>
                  }
                >
                  {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                  <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                </OverlayTrigger>
                {/* {members && members.length > 0
                  ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                  : ''
                } */}
              </a>
            </div>

          </div>
          <div id="cp4" className="card-body p-0 collapse" data-parent="#accordion">
          <div className="pt-4 bg-white fs-14 ">
              <div className="tps_service_block">
               
                    <div className="tps_service_box">
                      <div className={`row m-0 align-items-start mb-3}`}>
                        <div className="col-auto w200">
                          <label className="mt-2 mb-0" key={'1'} htmlFor={'1'}>
                            <input type="checkbox" id="id1" defaultChecked={check3rdParty} onClick={()=>{setcheck3rdParty((check3rdParty)?false:true)}} />
                            <span className="ml-1">3rd Parties/Saas</span>
                          </label>
                        </div>
                        <div className="col">
                          { (check3rdParty)?
                                  <>
                                    <div className="d-flex">
                                      <input type="text" className="form-control bg-transparent" placeholder="3rd parties/Saas" id="locInput" defaultValue={""} />
                                        <div className="mt-2 w60">
                                            <span className="link_url" onClick={""}><i className="fa fa-pencil"></i></span>
                                            <span className="link_url" onClick={""}><i className="fa fa-ban"></i></span>
                                        </div>
                                      
                                    </div>
                                   </>: <></>
                           }
                          
                        </div>
                      </div>

                      <div className={`row m-0 align-items-start mb-3}`}>
                        <div className="col-auto w200">
                          <label className="mt-2 mb-0" key={'1'} htmlFor={'1'}>
                            <input type="checkbox" id="id2" defaultChecked={checkOthers} onClick={()=>{setcheckOthers((checkOthers)?false:true)}}/>
                            <span className="ml-1">Others (Manual)</span>
                          </label>
                        </div>
                        <div className="col">
                          {(checkOthers)?
                                  <>
                                    <div className="d-flex">
                                    <input type="text" className="form-control bg-transparent" placeholder="Others" id="locInput" defaultValue={""} />
                                        <div className="mt-2 w60">
                                            <span className="link_url" onClick={""}><i className="fa fa-pencil"></i></span>
                                            <span className="link_url" onClick={""}><i className="fa fa-ban"></i></span>
                                        </div>
                                      
                                    </div>
                                  </>
                                  :<></>
                          }
                          
                        </div>
                      </div>

                      <div className={`row m-0 align-items-start mb-3}`}>
                        <div className="col-auto w200">
                          <label className="mt-2 mb-0" key={'1'} htmlFor={'1'}>
                            <input type="checkbox" id="id2" defaultChecked={checkEndpoint} onClick={()=>{setcheckEndpoint((checkEndpoint)?false:true)}}/>
                            <span className="ml-1">Endpoints</span>
                          </label>
                        </div>
                        <div className="col">
                          {(checkEndpoint)?
                                  <>
                                    <div className="d-flex">
                                    <input type="text" className="form-control bg-transparent" placeholder="enter endpoints" id="locInput" defaultValue={""} />
                                        <div className="mt-2 w60">
                                            <span className="link_url" onClick={""}><i className="fa fa-pencil"></i></span>
                                            <span className="link_url" onClick={""}><i className="fa fa-ban"></i></span>
                                        </div>
                                      
                                    </div>
                                  </>
                                  :<></>
                          }
                          
                        </div>
                      </div>

                      <div className={`row m-0 align-items-start mb-3}`}>
                        <div className="col-auto w200">
                          <label className="mt-2 mb-0" key={'1'} htmlFor={'1'}>
                            <input type="checkbox" id="id2" defaultChecked={checkMobile} onClick={()=>{setcheckMobile((checkMobile)?false:true)}}/>
                            <span className="ml-1">Mobile Devices</span>
                          </label>
                        </div>
                        <div className="col">
                          {(checkMobile)?
                                  <>
                                    <div className="d-flex">
                                    <input type="text" className="form-control bg-transparent" placeholder="mobile devices" id="locInput" defaultValue={""} />
                                        <div className="mt-2 w60">
                                            <span className="link_url" onClick={""}><i className="fa fa-pencil"></i></span>
                                            <span className="link_url" onClick={""}><i className="fa fa-ban"></i></span>
                                        </div>
                                      
                                    </div>
                                  </>
                                  :<></>
                          }
                          
                        </div>
                      </div>

                      <div className={`row m-0 align-items-start mb-3}`}>
                        <div className="col-auto w200">
                          <label className="mt-2 mb-0" key={'1'} htmlFor={'1'}>
                            <input type="checkbox" id="id2" defaultChecked={checkServer} onClick={()=>{setCheckServer((checkServer)?false:true)}}/>
                            <span className="ml-1">Servers</span>
                          </label>
                        </div>
                        <div className="col">
                          {(checkServer)?
                                  <>
                                    <div className="d-flex">
                                    <input type="text" className="form-control bg-transparent" placeholder="servers" id="locInput" defaultValue={""} />
                                        <div className="mt-2 w60">
                                            <span className="link_url" onClick={""}><i className="fa fa-pencil"></i></span>
                                            <span className="link_url" onClick={""}><i className="fa fa-ban"></i></span>
                                        </div>
                                      
                                    </div>
                                  </>
                                  :<></>
                          }
                          
                        </div>
                      </div>

                     
                      <br></br>
                    </div>

                  
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default CompianceConfigScope