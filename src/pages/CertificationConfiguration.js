import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie, encryptData } from "../helpers/Helper";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Header from "../components/partials/Header";
import React, { lazy, useContext, useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import AIR_MSG from "../helpers/AirMsgs";

// const LayoutContext = lazy(() => import("../ContextProviders/LayoutContext"))


const ComplianceConfiguration = (props) => {
  // const {setShowLoader} = useContext(LayoutContext)
  // const { user = {} } = useOutletContext()
  const { projectId, setProjectId, user = {}, updateData } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const [getAllConfigs, setAllConfigs] = useState({})
  const [selectedProject, setSelectedProject] = useState(null)
  const [accountsList, setAccountsList] = useState(null)
  const [addFrameWorksList, setAddFrameWorksList] = useState([])
  const [domains, setDomains] = useState([])
  const [prioritizeDomains, setPrioritizeDomains] = useState([])

  const [frameWorks, setFrameWorks] = useState([])
  const [tpServices, setTpServices] = useState([])
  const [selectedTPS, setSelTPS] = useState([])
  const [memberRoles, setMemberRoles] = useState([])
  const [ownerRoles, setOwnerRoles] = useState([])
  const [members, setMembers] = useState([])
  const [servicePartners, setServicePartners] = useState([])
  const [auditors, setAuditors] = useState([])
  const [taskOwners, setTaskOwners] = useState([])
  const [tpsAccessTokens, setAccessToken] = useState([])
  const [tokenServiceFields, setTokenServiceFields] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [editTokenArr, setEditTokenArr] = useState([])
  const navigate = useNavigate()
  const { register, handleSubmit, watch, trigger, setValue, resetField, clearErrors, unregister, formState: { errors } } = useForm(); // initialize the hook
  const [formSubmitted, setFormSbmt] = useState(false)
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [errorMsg, setErrorMsg] = useState(false);
  const [bizCateogry, setbizCateogry] = useState(null)
  const [level, setLevel] = useState('')


  const showLoader = false



  const form = watch()
  const accessTokenForm = watch("accessTokenForm")
  useEffect(() => {
    initializeData()
  }, [user])

  const initializeData = () => {
    let projectObj = GetCookie('selectedProject') ? JSON.parse(GetCookie('selectedProject')) : null
    if (selectedProject == null && projectObj) {
      setSelectedProject(projectObj);
      setProjectId(projectObj.project_id)
    }

    if (Object.keys(getAllConfigs).length == 0 && user?.currentUser?.is_onboard == "Y") {
      fetchInfo("all", projectObj)
    }

    if (memberRoles.length == 0) {
      fetchInfo("member_roles")
    }
    if (ownerRoles.length == 0) {
      fetchInfo("owner_roles")
    }
    if (domains.length == 0) {
      getDomains()
    }

  }

  const fetchInfo = async (type = '', projectInfo = null) => {
    if (type == '') {
      return false
    };

    let payloadUrl = ""
    let method = "POST";
    let formData = {};

    if (type == 'all') {
      // https://zp5ffmsibc.us-east-1.awsapprunner.com/configuration/getConfiguration/15/2/2
      let proId = projectId ? projectId : (projectInfo ? projectInfo.project_id : null)
      payloadUrl = proId ? `configuration/getConfiguration/${orgId}/${user?.currentUser?.account_id}/${proId}` : `configuration/getConfiguration/${proId}`
      method = "GET";
    }

    else if (type == 'member_roles') {
      payloadUrl = 'reference/getAuthorities/Y'
      method = "GET";
    } else if (type == 'owner_roles') {
      payloadUrl = 'reference/getAuthorities/N'
      method = "GET";
    }

    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      if (type == 'all') {
        let obj = {
          accounts_and_projects: res.accounts_and_projects,
          auditors: res.auditor,
          frameWorks: res.frameworks,
          keymembers: res.keymembers,
          service_partners: res.service_partners,
          task_owners: res.task_owners,
          third_party_connectors: res.third_party_connectors,
          prioritize_domains: res.domain_prioritization
        }
        // set all users
        obj.keymembers.map((item) => item.type = "key_member")
        obj.service_partners.map((item) => item.type = "service_partner")
        obj.task_owners.map((item) => item.type = "task_owner")
        obj.auditors.map((item) => item.type = "auditor")
        let allUsersArr = [...obj.keymembers, ...obj.service_partners, ...obj.task_owners, ...obj.auditors]
        setAllUsers(oldVal => {
          return [...allUsersArr]
        })
        //set accounts if added

        setAccountsList(obj.accounts_and_projects)
        // add key members
        obj.keymembers && obj.keymembers.length > 0 && setMembers(obj.keymembers)
        // add service partners
        obj.service_partners && obj.service_partners.length > 0 && setServicePartners(obj.service_partners)
        obj.auditors && obj.auditors.length > 0 && setAuditors(obj.auditors)
        // add stask owners
        obj.task_owners && obj.task_owners.length > 0 && setTaskOwners(obj.task_owners)

        //set third party connectors
        setTpServices(oldVal => {
          return [...obj.third_party_connectors]
        })
        let tmpSelectedTPS = [];
        obj.third_party_connectors && obj.third_party_connectors.filter(tps => {
          if (tps.is_selected == "Y") {
            tmpSelectedTPS.push(tps.id)
          }
        })
        setSelTPS(tmpSelectedTPS)
        /* add to framework list if selected */
        let tmpFrmwrkList = [];
        obj.frameWorks && obj.frameWorks.map(frmwrk => {
          if (frmwrk.is_selected == "Y") {
            tmpFrmwrkList.push(frmwrk.id)
          }
        })
        setAddFrameWorksList(tmpFrmwrkList)
        // add prioritize domains
        let prtizeDomains = obj.prioritize_domains.map((pdomain) => Object.assign(pdomain, { is_editable: "N" }))
        setPrioritizeDomains(oldVal => {
          return [...prtizeDomains]
        })

        setTimeout(() => {
          setAllConfigs(oldVal => {
            return { ...obj }
          })
        }, 100);
      }
      else if (type == "member_roles") {
        setMemberRoles(oldVal => {
          return [...res.results]
        })
      } else if (type == "owner_roles") {
        setOwnerRoles(oldVal => {
          return [...res.results]
        })
      }
    }
  }
  const addToFrameWorkList = (ev = null, index = null) => {
    if (ev == null || index == null || !getAllConfigs.frameWorks[index]) {
      return
    }

    let id = getAllConfigs.frameWorks[index].id
    let tempArr = addFrameWorksList;
    tempArr.push(id)
    setAddFrameWorksList(oldVal => {
      return [...tempArr]
    })

  }
  const removeFromFrameworkList = (ev = null, index = null) => {
    if (ev == null || index == null || !getAllConfigs.frameWorks[index]) {
      return
    }

    let id = getAllConfigs.frameWorks[index].id
    let tempArr = addFrameWorksList;
    let tempArrIndex = tempArr.indexOf(id)
    tempArr.splice(tempArrIndex, 1)
    setAddFrameWorksList(oldVal => {
      return [...tempArr]
    })
  }

  const addProjectFramework = async () => {
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let payloadUrl = "configuration/addProjectFrameworks"
    let method = "POST";
    let formData = { project_id: projectId, framework_ids: addFrameWorksList }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let obj = getAllConfigs;
      obj.frameWorks && obj.frameWorks.map(frameWork => {
        frameWork.is_selected = addFrameWorksList.includes(frameWork.id) ? "Y" : "N"
      })
      setAllConfigs(oldVal => {
        return { ...obj }
      })
      // changePanel(2)
      changePanel(8)
      formRes = { status: true, err_status: false, error: {}, type: "framework", msg: AIR_MSG.add_framework_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "framework"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }

  const addProjectTPS = async () => {
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let apiType = selectedTPS.length == 0 ? 'add' : 'update'
    let payloadUrl = "configuration/addThirdPartyConnector"
    let method = "POST";
    let formData = { project_id: projectId, connector_ids: selectedTPS }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let obj = tpServices || []
      obj.map(service => {
        service.is_selected = selectedTPS.includes(service.id) ? "Y" : "N"
      })
      setTpServices(obj)
      changePanel(6)
      formRes = { status: true, err_status: false, error: {}, msg: AIR_MSG.add_framework_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
  }


  const onSelectTokenService = (sIndex = null) => {
    if (sIndex == null) {
      return false
    }
    setTokenServiceFields([])
    let services = [...tpServices]
    let tokenServiceFields = []
    let selectedTokenService = services[sIndex] || null;
    if (selectedTokenService && selectedTokenService.fields_required && selectedTokenService.fields_required != '') {
      tokenServiceFields = selectedTokenService.fields_required.split('|')
    }
    setTokenServiceFields(oldVal => {
      return [...tokenServiceFields]
    })
    // clearData("access_token")
  }
  const addAccessToken = async () => {
    clearErrors("accessTokenForm")

    let isFormValid = await trigger("accessTokenForm")
    if (!isFormValid) {
      return false
    }
    // return false
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)

    let data = accessTokenForm
    let token = accessTokenForm.fieldsValue.join("|")
    let selTPS = tpServices[accessTokenForm.tps]
    if (!token || !selTPS) {
      formRes['err_status'] = true
      if (!token) {
        formRes['error']['aTokenValue'] = { required: true, msg: AIR_MSG.access_token_required }
      }
      if (!selTPS) {
        formRes['error']['aTokenService'] = { required: true, msg: AIR_MSG.third_party_service_required }
      }
      setFormRes(formRes)
      return false;
    }

    let payloadUrl = "configuration/addThirdPartyConnectorToken"
    let method = "POST";
    // let formData = { project_id: accountsList[0].project_id, connector_id: selTPS.id, token: token }
    let formData = { project_id: projectId, connector_id: selTPS.id, token: token }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let listArr = Object.assign([], tpServices);
      listArr[accessTokenForm.tps].is_token_added = "Y"
      listArr[accessTokenForm.tps].token = token;
      setTpServices(listArr)

      setValue("accessTokenForm", { tps: '' })
      // unregister("accessTokenForm.fieldsValue")
      setTokenServiceFields([])
      setValue("accessTokenForm.fieldsValue", accessTokenForm.fieldsValue.map((fieldVal, fvIndex) => ''))
      formRes = { status: true, err_status: false, error: {}, type: "atoken", msg: AIR_MSG.add_access_token_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "atoken"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);
  }
  const clearData = (type = null) => {
    if (type == null) {
      return false;
    }
    if (type == "access_token") {
      let tokenInput = document.getElementById("tpsAccessToken")
      if (tokenInput) {
        tokenInput.value = ""
      }

    }
  }

  const delToken = (index = null) => {

    if (index == null) {
      return false;
    }
    let tpsAccessTokens = [...tpServices]
    let tempArr = [];
    for (let atIndex in tpsAccessTokens) {
      if (index == atIndex) {
        continue
      }
      tempArr.push(tpsAccessTokens[atIndex])
    }
    setAccessToken(oldVal => {
      return [...tempArr]
    })
  }

  const changePanel = (index = null) => {
    if (index == null) {
      return false
    }
    let ele = document.getElementById(`ct${index}`)
    if (ele) {
      ele.click()
    }
  }

  const equalizeArr = (type = null, dataArr = null) => {
    if (type == null || dataArr == null) {
      return false;
    }
    let tempArr = [...dataArr]
    let result = []
    if (type == "access_token") {
      let maxfieldsLengthArr = dataArr.map((connector) => connector.fields_required.split('|').length)
      let maxArrLength = Math.max(...maxfieldsLengthArr)
      for (let connector of tempArr) {
        let fields = connector.fields_required.split('|');
        let token = connector.token.split('|');
        for (let i = 0; i < maxArrLength; i++) {
          let element = fields[i];
          let tokenEle = token[i];
          if (!element && i != 0) {
            fields.push('')
          }
          if (!tokenEle && i != 0) {
            token.push('')
          }
        }
        let obj = { ...connector }
        obj.fields_required = fields.join('|')
        obj.token = token.join('|')
        result.push(obj)
      }
    }
    return result
  }
  const getTokenFields = (service = null) => {
    if (service == null) {
      return false;
    }
    let tokenFields = service.fields_required.split('|')
    let token = service.token.split('|');
    let maxfieldsLengthArr = tokenFields.length
    let result = []
    for (let i = 0; i < maxfieldsLengthArr; i++) {
      let element = tokenFields[i];
      let tokenEle = token[i];
      if (!element && i != 0) {
        tokenFields.push('')
      }
      if (!tokenEle && i != 0) {
        token.push('')
      }
      let obj = {}
      obj.key = !element && i != 0 ? '' : element
      obj.value = !tokenEle && i != 0 ? '' : tokenEle
      result.push(obj)
    }
    return result
  }

  const getDomains = async () => {
    let payloadUrl = `reference/getControlDomains`
    let method = "GET";
    let formData = {};

    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      let domainsArr = res.results
      if (domainsArr.length > 0) {
        setDomains(oldVal => {
          return [...domainsArr]
        })
      }

    }
  }


  const editTPSToken = (tpsIndex = null, showEditFields = false) => {
    if (tpsIndex == null) {
      return false
    }
    let tempArr = editTokenArr;
    let index = editTokenArr.indexOf(tpsIndex)
    if (tempArr.includes(tpsIndex)) {
      if (!showEditFields) {
        tempArr.splice(index, 1)
      }
    } else {
      if (showEditFields) {
        tempArr.push(tpsIndex)
      }
    }
    setEditTokenArr(oldVal => {
      return [...tempArr]
    })
  }

  const onSelectLevel = (type = "") => {
    setLevel(type)
  }
  const onSelectBizCategory = (type = "") => {
    setbizCateogry(type)
  }

  const refreshUsers = (type = '',itemObj = null) => {
    if(type == "" || itemObj == null){
      return false
    }
    itemObj.type = type
    let tmpUsersArr = [...allUsers]
    tmpUsersArr.push(itemObj)
    setAllUsers(oldVal => {
      return [...tmpUsersArr]
    })
  }

  const addBizCategory = async () => {
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let bizCategory =  bizCateogry;
    //let payloadUrl = "configuration/setupAccount"
    let payloadUrl = ""
    let method = "POST";
    let formData = { bizcategoryname: bizCategory}
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      initializeData()

    
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "account"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }
  const addLevel = async () => {
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let bizCategory =  bizCateogry;
    //let payloadUrl = "configuration/setupAccount"
    let payloadUrl = ""
    let method = "POST";
    let formData = { bizcategoryname: bizCategory}
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      initializeData()

    
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "account"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }

  // console.log(form)
  // console.log(errors)
  return (
    <>
      <Header />
      <div id="accordion" className="accordion pl-lg-3 pr-lg-3 accordianSec">
        
       <div className="card ">
          <div className="d-flex align-items-center">
            <div id="ct8" className={`card-header flex-grow-1 collapsed`} data-toggle="collapse" href="#cp8" aria-expanded="true">
              <a className="card-title w-100 d-flex">
                 BIZ Category
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={`tooltip-right`}>
                      Tooltip for <strong>BIZ Category</strong>.
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
            <div className="ml-auto action_item">
             <a onClick={() => addBizCategory()} className="btn btn-primary-2 btn_03 btn-sm ml-2">Save</a>
            </div>
          </div>
          <div id="cp8" className="card-body p-0 collapse" data-parent="#accordion">
          <div className="p-lg-3 m-lg-3 p-2 m-2 bg-white rounded">
              <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                <div className="mr-2 w50 min_w_320 mb-3">
                  <select className="form-control" onChangeCapture={(e) => onSelectBizCategory(e.target.value)}>
                    <option value={``}> Select Category </option>
                    <option value={`Manufacturing`}>Manufacturing</option>
                    <option value={`Production`}>Production </option>
                    <option value={`Technology`}>Technology</option>
                    <option value={`Science`}>Science </option>
                    <option value={`Finance`}>Finance </option>
                    <option value={`Agriculture`}>Agriculture </option>
                    <option value={`Marketing`}>Marketing </option>
                    <option value={`Food`}>Food </option>
                    <option value={`Transport`}>Transport </option>
                    <option value={`Health Care`}>Health Care </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card ">
          <div className="d-flex align-items-center">
            <div id="ct1" className={`card-header flex-grow-1 collapsed`} data-toggle={accountsList && accountsList.length > 0 ? "collapse" : ""} href="#cp1" aria-expanded="true">
              <a className="card-title w-100 d-flex">
                Framework Setup
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={`tooltip-right`}>
                      Tooltip for <strong>Frameworks</strong>.
                    </Tooltip>
                  }
                >
                  {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                  <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                </OverlayTrigger>
                {getAllConfigs && getAllConfigs?.frameWorks && getAllConfigs?.frameWorks.filter(frameWork => frameWork.is_selected == "Y").length > 0
                  ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                  : ''
                }
              </a>
            </div>
            <div className="ml-auto action_item">
              <a onClick={() => addProjectFramework()} className="btn btn-primary-2 btn_03 btn-sm ml-2">Save</a>
            </div>
          </div>
          <div id="cp1" className="card-body p-0 collapse" data-parent="#accordion">
            <div className="search_result bg-white fs-14 ">
              <div className=" px-3">
                <div>
                  {getAllConfigs && getAllConfigs?.frameWorks && getAllConfigs?.frameWorks.length > 0 && getAllConfigs?.frameWorks.map((frameWork, fwIndex) => {
                    return (
                      <label key={fwIndex} htmlFor={`f${fwIndex + 1}`}>
                        <input type="checkbox" id={`f${fwIndex + 1}`} defaultChecked={frameWork.is_selected == 'Y'} onClick={(e) => e.target.checked ? addToFrameWorkList(e, fwIndex) : removeFromFrameworkList(e, fwIndex)} />
                        {/* <img className="mx-1" src="assets/img/m1.svg" alt="" height="20" width="20" /> */}
                        <span className="pl-2">{frameWork.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

      


        <div className="card ">
          <div className="d-flex align-items-center">
            <div id="ct2" className={`card-header flex-grow-1 collapsed`} data-toggle="collapse" href="#cp2" aria-expanded="true">
              <a className="card-title w-100 d-flex">
              What level are we at?
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={`tooltip-right`}>
                      Tooltip for <strong>What level are we at?</strong>.
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
            <div className="ml-auto action_item">
             <a onClick={() => addLevel()} className="btn btn-primary-2 btn_03 btn-sm ml-2">Save</a>
            </div>
          </div>
          <div id="cp2" className="card-body p-0 collapse" data-parent="#accordion">
            <div className="p-lg-3 m-lg-3 p-2 m-2 bg-white rounded">
              <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                <div className="mr-2 w50 min_w_320 mb-3">
                  <select className="form-control" onChangeCapture={(e) => onSelectLevel(e.target.value)}>
                    <option value={``}> Select Level </option>
                    <option value={`scoping`}>Scoping</option>
                    <option value={`gap_analysis`}>Gap Analysis </option>
                    <option value={`remediation`}>Remediation </option>
                    <option value={`pre_audit`}>Pre Audit </option>
                    <option value={`audit_ready`}>Audit Ready </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="d-flex justify-content-end yrscpe">
          {
            accountsList && accountsList.length > 0 && projectId
              ? <Link to={'/certification/configuration_scope'} className="btn btn btn-primary-2 btn_05 submitBtn btn-lg">Define Your Scope</Link>
              : ''
          }

        </div>
      </div>
    </>
  )
}

export default ComplianceConfiguration