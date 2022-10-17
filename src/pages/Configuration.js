import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie, encryptData } from "../helpers/Helper";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Header from "../components/partials/Header";
import React, { lazy, useContext, useEffect, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import AIR_MSG from "../helpers/AirMsgs";
import AirVendorModal from "../elements/AirVendorModal";
import SweetAlert from "react-bootstrap-sweetalert";

// const LayoutContext = lazy(() => import("../ContextProviders/LayoutContext"))


const Configuration = (props) => {
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
  const [userType, setUserType] = useState('')
  const [allUsers, setAllUsers] = useState([])
  const [editTokenArr, setEditTokenArr] = useState([])
  const navigate = useNavigate()
  const { register, handleSubmit, watch, trigger, setValue, resetField, clearErrors, unregister, formState: { errors } } = useForm(); // initialize the hook
  const [formSubmitted, setFormSbmt] = useState(false)
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [errorMsg, setErrorMsg] = useState(false);
  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })
  const showLoader = false

  const keyMembersForm = watch("keyMemForm")
  const taskOwnerForm = watch("taskOwnerForm")
  const inviteAuditorsForm = watch("inviteAuditorsForm")
  const addPartnerForm = watch("addPartnerForm")




  const form = watch()
  const accessTokenForm = watch("accessTokenForm")
  const monthArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

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
        let tmpEditTokenArr = editTokenArr;
        obj.third_party_connectors && obj.third_party_connectors.map((tps,index) => {
          if (!tmpEditTokenArr.includes(tps.id) && tps.token.replace(/\|/g,"").length == 0 && tps.is_selected == "Y") {
            tmpEditTokenArr.push(index)
          }
        })
        setEditTokenArr(oldVal => {
          return [...tmpEditTokenArr]
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

  const addAccount = async () => {
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let accInput = document.getElementById("accName");
    let accProjectInput = document.getElementById("accProject");
    let accName = accInput.value
    let accProject = accProjectInput.value
    if (!accName || !accProject) {
      // let formRes = {status:false,err_status:true,error:{}}
      formRes['err_status'] = true
      if (!accName) {
        formRes['error']['account_name'] = { required: true, msg: AIR_MSG.acc_name_required }
      }
      if (!accProject) {
        formRes['error']['project_name'] = { required: true, msg: AIR_MSG.project_name_required }
      }
      setFormRes(formRes)
      return false;
    }
    let payloadUrl = "configuration/setupAccount"
    let method = "POST";
    let formData = { account_name: accName, project_name: accProject, org_id: orgId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let accListArr = [Object.assign(formData, { project_id: res.project_id })]
      setAccountsList(oldVal => {
        return [...accListArr]
      })
      SetCookie('selectedProject', JSON.stringify(accListArr[0]))
      setProjectId(res.project_id)
      if (res.account_id) {
        let userDet = GetCookie("currentUser") ? JSON.parse(GetCookie("currentUser")) : null
        if (userDet) {
          userDet.user.account_id = Number(res.account_id)
          userDet.user.account_name = formData.account_name
          userDet.user.is_onboard = "Y"
        }
        SetCookie("currentUser", JSON.stringify(userDet))
        updateData("user")
      }
      initializeData()

      accInput.value = ""
      accProjectInput.value = ""
      setTimeout(() => {
        changePanel(1)
      }, 400);
      formRes = { status: true, err_status: false, type: "account", error: {}, msg: AIR_MSG.add_account_success }
      setFormRes(formRes)
      // fetchInfo('all')
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
    // if (addFrameWorksList.length == 0) {
    //   return false;
    // }
    let payloadUrl = "configuration/addProjectFrameworks"
    let method = "POST";
    // let frmwrkIds = addFrameWorksList.map(({ id }) => id)
    // let formData = { project_id: accountsList[0].project_id, framework_ids: addFrameWorksList }
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
  const addMember = async () => {
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
    let memRole = memberRoles[memRoleInput.value]
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
    let payloadUrl = "configuration/addKeyMember"
    let method = "POST";
    // let formData = { first_name: memFirstName, last_name: memLastName, email: memEmail, department_name: memRole.name, authority_id: memRole.id, project_id: accountsList[0].project_id, org_id: orgId }
    let formData = { first_name: memFirstName, last_name: memLastName, email: memEmail, department_name: memRole.name, authority_id: memRole.id, project_id: projectId, org_id: Number(orgId) }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let memListArr = Object.assign([], members);
      let memObj = { emp_id: res.emp_id, first_name: formData.first_name, last_name: formData.last_name, email: formData.email, department_name: formData.department_name }
      memListArr.push(memObj)
      refreshUsers("key_member", memObj)
      setMembers(oldVal => {
        return [...memListArr]
      })
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
  const delMember = async (index = null) => {
    if (index == null) {
      return false;
    }
    let delMem = members[index]
    let payloadUrl = "configuration/deleteKeyMember"
    let method = "DELETE";
    // let formData = { emp_id: delMem.emp_id, org_id: orgId, project_id: accountsList[0].project_id }
    let formData = { emp_id: delMem.emp_id, org_id: orgId, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let tempArr = members;
      tempArr.splice(index, 1)
      setMembers(oldVal => {
        return [...tempArr]
      })
    } else {
      formRes['err_status'] = true
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
  }

  const addPartner = async () => {
    clearErrors()
    let isValid = await trigger("addPartnerForm")
    if (!isValid) {
      return false
    }
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let partnerFnInput = document.getElementById("partnerFnameInp")
    let partnerLnInput = document.getElementById("partnerLnameInp")
    let partnerEmailInput = document.getElementById("partnerEmail")
    let partnerFn = partnerFnInput.value
    let partnerLn = partnerLnInput.value
    let partnerEmail = partnerEmailInput.value
    if (!partnerFn || !partnerLn || !partnerEmail) {
      formRes['err_status'] = true
      if (!partnerEmail) {
        formRes['error']['partnerEmail'] = { required: true, msg: AIR_MSG.email_required }
      }
      if (!partnerFn) {
        formRes['error']['partnerFname'] = { required: true, msg: AIR_MSG.fname_required }
      }
      if (!partnerLn) {
        formRes['error']['partnerLname'] = { required: true, msg: AIR_MSG.lname_required }
      }
      setFormRes(formRes)
      return false;
    }

    let payloadUrl = "configuration/addServicePartner"
    let method = "POST";
    // let formData = { first_name: partnerFn, last_name: partnerLn, email: partnerEmail, project_id: accountsList[0].project_id }
    let formData = { first_name: partnerFn, last_name: partnerLn, email: partnerEmail, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let listArr = Object.assign([], servicePartners);
      let partnerObj = { emp_id: res.emp_id, partner_id: res.partner_id, email: formData.email, first_name: formData.first_name, last_name: formData.last_name }
      listArr.push(partnerObj)
      setServicePartners(oldVal => {
        return [...listArr]
      })
      refreshUsers("service_partner", partnerObj)
      partnerFnInput.value = ""
      partnerLnInput.value = ""
      partnerEmailInput.value = ""
      // changePanel(4)
      formRes = { status: true, err_status: false, error: {}, type: "partner", msg: AIR_MSG.add_service_partner_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "partner"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }
  const delPartner = async (index = null) => {
    if (index == null) {
      return false;
    }

    let delPartner = servicePartners[index]
    let payloadUrl = "configuration/deleteServicePartner"
    let method = "DELETE";
    // let formData = { emp_id: delPartner.emp_id, org_id: orgId, project_id: accountsList[0].project_id }
    let formData = { emp_id: delPartner.emp_id, org_id: orgId, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let tempArr = servicePartners;
      tempArr.splice(index, 1)
      setServicePartners(oldVal => {
        return [...tempArr]
      })
    } else {
      formRes['err_status'] = true
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
  }

  const addAuditor = async () => {
    clearErrors()
    let isValid = await trigger("inviteAuditorsForm")
    if (!isValid) {
      return false
    }
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let auditorFnInput = document.getElementById("auditorFnameInp")
    let auditorLnInput = document.getElementById("auditorLnameInp")
    let auditorEmailInput = document.getElementById("auditorEmail")
    let auditorFn = auditorFnInput.value
    let auditorLn = auditorLnInput.value
    let auditorEmail = auditorEmailInput.value
    if (!auditorFn || !auditorLn || !auditorEmail) {
      formRes['err_status'] = true
      if (!auditorEmail) {
        formRes['error']['auditorEmail'] = { required: true, msg: AIR_MSG.email_required }
      }
      if (!auditorFn) {
        formRes['error']['auditorFname'] = { required: true, msg: AIR_MSG.fname_required }
      }
      if (!auditorLn) {
        formRes['error']['auditorLname'] = { required: true, msg: AIR_MSG.lname_required }
      }
      setFormRes(formRes)
      return false;
    }

    let payloadUrl = "configuration/addAuditor"
    let method = "POST";
    // let formData = { first_name: auditorFn, last_name: auditorLn, email: auditorEmail, project_id: accountsList[0].project_id }
    let formData = { first_name: auditorFn, last_name: auditorLn, email: auditorEmail, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let listArr = Object.assign([], auditors);
      let auditorObj = { emp_id: res.emp_id, auditor_id: res.auditor_id, email: formData.email, first_name: formData.first_name, last_name: formData.last_name }
      listArr.push(auditorObj)
      setAuditors(oldVal => {
        return [...listArr]
      })
      refreshUsers("auditor", auditorObj)
      auditorFnInput.value = ""
      auditorLnInput.value = ""
      auditorEmailInput.value = ""
      // changePanel(4)
      formRes = { status: true, err_status: false, error: {}, type: "auditor", msg: AIR_MSG.add_auditor_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "auditor"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }
  const delAuditor = async (index = null) => {
    if (index == null) {
      return false;
    }

    let delAuditor = auditors[index]
    let payloadUrl = "configuration/deleteAuditor"
    let method = "DELETE";
    // let formData = { emp_id: delAuditor.emp_id, org_id: orgId, project_id: accountsList[0].project_id }
    let formData = { emp_id: delAuditor.emp_id, org_id: orgId, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let tempArr = auditors;
      tempArr.splice(index, 1)
      setAuditors(oldVal => {
        return [...tempArr]
      })
    } else {
      formRes['err_status'] = true
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
  }

  const addTaskOwner = async () => {
    clearErrors()
    let form = taskOwnerForm
    let isValid = await trigger("taskOwnerForm")
    if (!isValid) {
      return false
    }
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let toFnInput = document.getElementById("toFirstname")
    let toLnInput = document.getElementById("toLastname")
    let toEmailInput = document.getElementById("toEmail")
    let oRoleInput = document.getElementById("ownerRole")
    let toFn = toFnInput.value
    let toLn = toLnInput.value
    let toEmail = toEmailInput.value
    let oRole = ownerRoles[oRoleInput.value]
    if (!toFn || !toLn || !toEmail || !oRole) {
      formRes['err_status'] = true
      if (!toFn) {
        formRes['error']['ownerFirstName'] = { required: true, msg: AIR_MSG.fname_required }
      }
      if (!toLn) {
        formRes['error']['ownerLastName'] = { required: true, msg: AIR_MSG.lname_required }
      }
      if (!toEmail) {
        formRes['error']['ownerEmail'] = { required: true, msg: AIR_MSG.email_required }
      }
      if (!oRole) {
        formRes['error']['ownerRole'] = { required: true, msg: AIR_MSG.role_required }
      }
      setFormRes(formRes)
      return false;
    }

    let payloadUrl = "configuration/addTaskOwner"
    let method = "POST";
    // let formData = { first_name: toFn, last_name: toLn, email: toEmail, department_name: oRole.name, authority_id: oRole.id, project_id: accountsList[0].project_id, org_id: orgId }
    let formData = { first_name: toFn, last_name: toLn, email: toEmail, label: form.label, department_name: oRole.name, authority_id: oRole.id, project_id: projectId, org_id: orgId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let listArr = Object.assign([], taskOwners);
      let toObj = { first_name: formData.first_name, last_name: formData.last_name, email: formData.email, label: form.label, department_name: formData.department_name, emp_id: res.emp_id }
      listArr.push(toObj)
      setTaskOwners(oldVal => {
        return [...listArr]
      })
      refreshUsers("task_owner", toObj)
      toFnInput.value = ""
      toLnInput.value = ""
      toEmailInput.value = ""
      oRoleInput.value = ""
      setValue("taskOwnerForm.label", "")
      // changePanel(5)
      formRes = { status: true, err_status: false, error: {}, type: "owner", msg: AIR_MSG.add_task_owner_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "owner"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }
  const delTaskOwner = async (index = null) => {
    if (index == null) {
      return false;
    }

    let delOwner = taskOwners[index]
    let payloadUrl = "configuration/deleteTaskOwner"
    let method = "DELETE";
    // let formData = { emp_id: delOwner.emp_id, org_id: orgId, project_id: accountsList[0].project_id }
    let formData = { emp_id: delOwner.emp_id, org_id: orgId, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let tempArr = taskOwners;
      tempArr.splice(index, 1)
      setTaskOwners(oldVal => {
        return [...tempArr]
      })
    } else {
      formRes['err_status'] = true
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
  }
  const onSelectTPS = async (event = null, index = null) => {
    if (index == null) {
      return false;
    }
    let tpsCheckInput = event.target
    let tpsCheck = tpsCheckInput.checked
    let tempArr = selectedTPS;
    // let tempArrIds = tempArr.map(tps => tps.id)
    if (tpsCheck) {
      if (!tempArr.includes(tpServices[index].id)) {
        tempArr.push(tpServices[index].id)
      }
    } else {
      let arrIndex = tempArr.indexOf(tpServices[index].id)
      if (arrIndex != -1) {
        tempArr.splice(arrIndex, 1)
        if (accessTokenForm && accessTokenForm[tpServices[index].id]) {
          unregister(`accessTokenForm[${tpServices[index].id}]`)
        }

      }
    }
    setSelTPS(oldVal => {
      return [...tempArr]
    })

    let tmpEditTokenArr = editTokenArr
    if (tmpEditTokenArr.includes(index) && !tpsCheck) {
      let eIndex = editTokenArr.indexOf(index)
      tmpEditTokenArr.splice(eIndex, 1)
      setEditTokenArr(oldVal => {
        return [...tmpEditTokenArr]
      })
    }else{
      if(tpsCheck && !tmpEditTokenArr.includes(index) &&  tpServices[index].token.replace(/\|/g,"").length == 0){
        tmpEditTokenArr.push(index)
        setEditTokenArr(oldVal => {
          return [...tmpEditTokenArr]
        })
        // editTPSToken(index,true)
      }
    }
    

  }

  // const addProjectTPS = async () => {
  //   setFormSbmt(true)
  //   let formRes = { status: false, err_status: false, error: {} }
  //   setFormRes(formRes)
  //   setErrorMsg(false)
  //   let apiType = selectedTPS.length == 0 ? 'add' : 'update'
  //   let payloadUrl = "configuration/addThirdPartyConnector"
  //   let method = "POST";
  //   let formData = { project_id: projectId, connector_ids: selectedTPS }
  //   let res = await ApiService.fetchData(payloadUrl, method, formData);
  //   if (res && res.message == "Success") {
  //     let obj = tpServices || []
  //     obj.map(service => {
  //       service.is_selected = selectedTPS.includes(service.id) ? "Y" : "N"
  //     })
  //     setTpServices(obj)
  //     changePanel(6)
  //     formRes = { status: true, err_status: false, error: {}, msg: AIR_MSG.add_framework_success }
  //     setFormRes(formRes)
  //   } else {
  //     formRes['err_status'] = true
  //     formRes['error']['msg'] = AIR_MSG.technical_err
  //     setFormRes(formRes)
  //   }
  // }
  const addProjectTPS = async () => {
    clearErrors("accessTokenForm")

    let isFormValid = await trigger("accessTokenForm")
    if(!isFormValid){
      return false
    }
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let payloadUrl = "configuration/addThirdPartyConnector"
    let method = "POST";
    // let formData = [];
    let connectors = []
    let formData = { project_id: projectId, connectors: [] }
    let data = accessTokenForm
    let addServicesInForm = []
    data && data.map((item, key) => {
      if (item) {
        let token = item.fieldsValue.join('|')
        connectors.push({ id: key, token: token })
        addServicesInForm.push(key)
      }

    })
    tpServices && tpServices.map((item, tpkey) => {
      if (!addServicesInForm.includes(item.id) && selectedTPS.includes(item.id)) {
        connectors.push({ id: item.id, token: item.token })
      }
    })
    formData.connectors = connectors
    // return
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let obj = [...tpServices]
      obj.map((service) => {
        let serviceInformIndex = addServicesInForm.indexOf(service.id)
        service.is_selected = selectedTPS.includes(service.id) ? "Y" : "N"
        if(serviceInformIndex != -1){
          service.token = connectors[serviceInformIndex]?.token || ""
        }
      })
      setTpServices(obj)
      formRes = { status: true, err_status: false, error: {}, type: "tpstoken", msg: AIR_MSG.update_tps_token_success }
      setFormRes(formRes)
      setEditTokenArr([])
      //call gcp api if preseent
       if(addServicesInForm.includes(8)){
          let payloadUrl = `${process.env.REACT_APP_CONNECTOR_API_URL}goole_sign_in/oauth2/${projectId}/8`;
          let method = "GET";
          let formData = {};
          let res = await ApiService.fetchData(false,method,"","","",payloadUrl);
          if (res && res.message == "Success") {
            if(res.show_consent_screen == true && res.auth_url !="already authorized"){
              showModal('gcp_modal',res.auth_url);
            } 
          }
        }
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "tpstoken"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);
    setFormSbmt(false)
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

  const addPrioritizeDomain = async () => {
    let form = watch("prioritizeDomainForm")
    let isValid = await trigger("prioritizeDomainForm")
    let selectedDomain = domains.find((domain) => domain.id == form.domain_id)
    // console.log(form,selectedDomain)
    if (form && isValid && selectedDomain) {
      let arrObj = { ...form };
      arrObj.domain = selectedDomain.name;
      arrObj.domain_name = selectedDomain.name;
      arrObj.is_editable = "Y"
      let tempArr = [...prioritizeDomains]
      tempArr.push(arrObj)
      setPrioritizeDomains(oldVal => {
        return [...tempArr]
      })
      resetField("prioritizeDomainForm.domain_id")
      resetField("prioritizeDomainForm.month")
    }
  }

  const savePriroritizeDomains = async () => {
    if (prioritizeDomains.length == 0) {
      return false
    }
    let payloadUrl = `configuration/prioritizeDomains`
    let method = "POST";
    let formData = {};
    formData.project_id = projectId
    formData.data = prioritizeDomains.map((domain) => Object.assign({ domain_id: domain.domain_id, month: domain.month }))
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      changePanel(2)
    }
  }

  const delPrioritizeDomain = (index = null) => {
    toggleAlert({ show: false, type: 'success', message: '' });
    if (index == null) {
      return false
    }
    let domain = prioritizeDomains[index] || false
    if (domain) {
      let tempArr = [...prioritizeDomains]
      tempArr.splice(index, 1)
      setPrioritizeDomains(oldVal => {
        return [...tempArr]
      })
    }
  }

  const editTPSToken = async (tpsIndex = null, showEditFields = false) => {
    if (tpsIndex == null) {
      return false
    }
    
    let tpService = tpServices[tpsIndex]
    let id = tpService.id
    if(accessTokenForm && accessTokenForm[tpService.id]){
      let tokenFields = getTokenFields(tpService)
      clearErrors(tokenFields.map((field,fIndex) => `accessTokenForm[${id}].fieldsValue[${fIndex}]`))
      let isValid = await trigger(tokenFields.map((field,fIndex) => `accessTokenForm[${id}].fieldsValue[${fIndex}]`))
      if(!isValid){
        return false
      }
      
    }
    let tempArr = editTokenArr;
    let index = editTokenArr.indexOf(tpsIndex)
    let form = accessTokenForm

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

     //condition to check for GCP 
    //  if(id == 8){
    //   let payloadUrl = `https://zmabevt6dv.us-east-1.awsapprunner.com/goole_sign_in/oauth2/${projectId}/${id}`;
    //   let method = "GET";
    //   let formData = {};
    //   let res = await ApiService.fetchData(false,method,"","","",payloadUrl);
    //   if (res && res.message == "Success") {
    //     if(res.show_consent_screen == true && res.auth_url !="already authorized"){
    //       showModal('gcp_modal',res.auth_url);
    //     }
    //     else{
    //       if (tempArr.includes(tpsIndex)) {
    //         if (!showEditFields) {
    //           tempArr.splice(index, 1)
    //         }
    //       } else {
    //         if (showEditFields) {
    //           tempArr.push(tpsIndex)
    //         }
    //       }
    //       setEditTokenArr(oldVal => {
    //         return [...tempArr]
    //       })
    //     }
       
    //   }
    
      
    //  }
    //  else{
   
    // if (tempArr.includes(tpsIndex)) {
    //   if (!showEditFields) {
    //     tempArr.splice(index, 1)
    //   }
    // } else {
    //   if (showEditFields) {
    //     tempArr.push(tpsIndex)
    //   }
    // }
    // setEditTokenArr(oldVal => {
    //   return [...tempArr]
    // })
    //   }
}

  const onSelectUserType = (type = "") => {
    setUserType(type)
  }

  const toggleAlert = (val) => {
    setShowAlert(val)
  }
  const onDel_Confirmation = async (event, type = '', data) => {
    event.stopPropagation()
    if (type == '') {
      return false
    }
    setShowAlert({ show: true, type: "del_user", message: "", data })
  }

  const onDel_PriorityDomain_Confirmation = async (event, type = '', data) => {
    event.stopPropagation()
    if (type == '') {
      return false
    }
    setShowAlert({ show: true, type: "del_priority_domain", message: "", data })
  }



  const delUser = async (index = null, item = null) => {
    toggleAlert({ show: false, type: 'success', message: '' });
    if (index == null || item == null) {
      return false;
    }
    setFormSbmt(true)
    let type = item.type
    let delUser = allUsers[index]
    let payloadUrl = ""
    if (type == "key_member") {
      payloadUrl = "configuration/deleteKeyMember"
    } else if (type == "service_partner") {
      payloadUrl = "configuration/deleteServicePartner"
    } else if (type == "task_owner") {
      payloadUrl = "configuration/deleteTaskOwner"
    } else if (type == "auditor") {
      payloadUrl = "configuration/deleteAuditor"
    }
    if (payloadUrl == "") {
      return false
    }
    let method = "DELETE";
    // let formData = { emp_id: delMem.emp_id, org_id: orgId, project_id: accountsList[0].project_id }
    let formData = { emp_id: delUser.emp_id, org_id: orgId, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let tempArr = allUsers;
      tempArr.splice(index, 1)
      setMembers(oldVal => {
        return [...tempArr]
      })
    } else {
      formRes['err_status'] = true
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setFormSbmt(false)
   
  }
  const refreshUsers = (type = '', itemObj = null) => {
    if (type == "" || itemObj == null) {
      return false
    }
    itemObj.type = type
    let tmpUsersArr = [...allUsers]
    tmpUsersArr.push(itemObj)
    setAllUsers(oldVal => {
      return [...tmpUsersArr]
    })
  }
  const showModal = async (modalName = null, data = null) => {
    if (modalName == null) {
      return false
    }
    switch (modalName) {
      case 'gcp_modal':
        if (data != null) {
          setModalData(data)
        }
        setModalType(modalName)
        setShowModal(true)
        break;
    }
  }
  const hideModal = (data = null) => {
    setModalType(null)
    setShowModal(false)
  }

  // console.log(form)
  // console.log(errors)
  return (
    <>
      <Header />
      <div id="accordion" className="accordion pl-lg-3 pr-lg-3 accordianSec">
        {(() => {
          if (user?.currentUser?.is_onboard == "N" && (!accountsList || accountsList.length == 0)) {
            return (
              <div className="card ">
                <div className="d-flex align-items-center">
                  <div id="ct0" className="card-header flex-grow-1" data-toggle="collapse" href="#cp0" aria-expanded="true">
                    <a className="card-title w-100 d-flex">
                      Account Setup
                      <OverlayTrigger
                        key={"right"}
                        placement={"right"}
                        overlay={
                          <Tooltip id={`tooltip-right`}>
                            Tooltip for <strong>Account</strong>.
                          </Tooltip>
                        }
                        show={false}
                      >
                        <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                      </OverlayTrigger>
                    </a>
                  </div>
                  <div className="ml-auto action_item">
                    <a onClick={() => addAccount()} className={`btn btn-primary-2 btn_03 btn-sm ml-2 ${accountsList && accountsList.length > 0 ? 'd-none' : ''}`} >Save</a>
                  </div>
                </div>
                <div id="cp0" className="card-body p-0 collapse show" data-parent="#accordion">

                  <div className={`p-lg-3 m-lg-3 p-2 m-2 bg-white rounded ${accountsList && accountsList.length > 0 ? 'd-none' : ''}`}>
                    <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                      <div className="flex-grow-1 mr-2 w-75">
                        <input id="accName" type="text" className="form-control" placeholder="Enter Account name" disabled={accountsList && accountsList.length > 0} />
                        {
                          formRes.err_status && formRes.error?.account_name?.required
                            ? <div className="field_err text-danger"><div>{formRes.error?.account_name?.msg}</div> </div>
                            : ''
                        }

                      </div>
                      <div className="flex-grow-1 mr-2 w-75">
                        <input id="accProject" type="text" className="form-control" placeholder="Enter Project" disabled={accountsList && accountsList.length > 0} />
                        {
                          formRes.err_status && formRes.error?.project_name?.required
                            ? <div className="field_err text-danger"><div>{formRes.error?.account_name?.msg}</div> </div>
                            : ''
                        }
                      </div>
                      {/* <div><a href="" className="info btn_03"> <img src="assets/img/plus.svg" alt="" className="plus" /> </a></div> */}
                    </div>
                    {
                      !formRes.status && formRes.err_status && formRes.error?.type == "account" && formRes.error?.msg
                        ? <div className="form_err text-danger"><div>{formRes.error?.msg}</div> </div>
                        : ''
                    }
                    {
                      formRes.status && formRes?.type == "account" && formRes.msg
                        ? <div className="form_success text-success"><div>{formRes.msg}</div> </div>
                        : ''
                    }
                  </div>
                  <div className="search_result bg-white fs-14 ">
                    <div className="px-3 h_labels">
                      <div className="flex-grow-1 ml-lg-3 ml-md-0 ">Account Name</div>
                      <div>Project Name </div>
                      {/* <div className="mr-lg-3"><a href="#"> <img src="/assets/img/times.svg" alt="" className="plus" />  </a></div> */}
                    </div>
                    {accountsList && accountsList.length > 0 && accountsList.map((account, accIndex) => {
                      return (
                        <div key={accIndex} className=" px-3">
                          <div className="flex-grow-1 ml-lg-3 ml-md-0 ">{account.account_name}</div>
                          <div>{account.project_name} </div>
                          {/* <div className="mr-lg-3"><a href="#"> <img src="/assets/img/times.svg" alt="" className="plus" />  </a></div> */}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          }
        })()}

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
                  <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                  {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
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
            <div id="ct8" className={`card-header flex-grow-1 collapsed`} data-toggle={accountsList && accountsList.length > 0 ? "collapse" : ""} href="#cp8" aria-expanded="true">
              <a className="card-title w-100 d-flex">
                Prioritize Domains
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={`tooltip-right`}>
                      Tooltip for <strong>Prioritize Domains</strong>.
                    </Tooltip>
                  }
                >
                  {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                  <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                </OverlayTrigger>
                {prioritizeDomains && prioritizeDomains.length > 0
                  ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                  : ''
                }
              </a>
            </div>
            <div className="ml-auto action_item">
              {prioritizeDomains && prioritizeDomains.length > 0 && <a onClick={() => savePriroritizeDomains()} className="btn btn-primary-2 btn_03 btn-sm ml-2">Save</a>}
            </div>
          </div>
          <div id="cp8" className="card-body p-0 collapse" data-parent="#accordion">
            <div className="p-lg-3 m-lg-3 p-2 m-2 bg-white rounded">
              <div className="d-flex  align-items-start justify-content-between  flex-lg-row  ">
                <div className="flex-grow-1 mr-2 w-75">
                  <select className="form-control" {...register("prioritizeDomainForm.domain_id", { required: true })}>
                    <option value={""}>Select Domain </option>
                    {domains && domains.length > 0 && React.Children.toArray(domains.map((domain, dKey) => {
                      return <option value={domain.id}>{domain.name} </option>
                    }))}
                  </select>
                  {errors.prioritizeDomainForm?.domain_id && errors.prioritizeDomainForm?.domain_id.type == "required" && <div className="field_err text-danger"><div>Domain is Required</div></div>}

                </div>
                <div className="flex-grow-1 mr-2 w-75">
                  <select className="form-control" {...register("prioritizeDomainForm.month", { required: true })}>
                    <option value={""}>Select Month </option>
                    {monthArr && monthArr.length > 0 && React.Children.toArray(monthArr.map((month, monthKey) => {
                      return <option value={monthKey + 1}>{month} </option>
                    }))}
                  </select>
                  {errors.prioritizeDomainForm?.month && errors.prioritizeDomainForm?.month.type == "required" && <div className="field_err text-danger"><div>Month is Required</div></div>}

                </div>

                <div><a onClick={() => addPrioritizeDomain()} className="info btn_03"> <img src="/assets/img/plus.svg" alt="" className="plus" /> </a></div>
              </div>
              {
                !formRes.status && formRes.err_status && formRes.error?.type == "member" && formRes.error?.msg
                  ? <div className="form_err text-danger mt-2"><div>{formRes.error?.msg}</div> </div>
                  : ''
              }
              {
                formRes.status && formRes?.type == "member" && formRes.msg
                  ? <div className="form_success text-success mt-2"><div>{formRes.msg}</div> </div>
                  : ''
              }
            </div>
            {prioritizeDomains.length > 0 &&
              <div className="search_result bg-white fs-14 ">
                <div className="px-3 h_labels">
                  <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0">Domain</div>
                  <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text_color_2 mr-0 text-left ">Month</div>
                  <div className="mr-lg-3 w20" style={{ width: '20px' }}></div>
                </div>
                {prioritizeDomains && prioritizeDomains.length > 0 && prioritizeDomains.map((item, pdIndex) => {
                  return (
                    <div key={pdIndex} className="px-3">
                      <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0">{item.domain || item.domain_name}</div>
                      <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text_color_2 mr-0 text-left">{monthArr[item.month - 1]}</div>
                      <div className="mr-lg-3 w20"> {item && item?.is_editable == "Y" && 
                      // <button className="border-0 bg-transparent" onClick={() => delPrioritizeDomain(pdIndex)}> <i className="fa fa-trash"></i></button>
                      <button className="border-0 bg-transparent" onClick={(e) => onDel_PriorityDomain_Confirmation(e, "del_priority_domain",{pdIndex})}> <i className="fa fa-trash"></i></button>
                      }
                      </div>
                    </div>
                  )
                })}
              </div>
            }
          </div>
        </div>


        <div className="card ">
          <div className="d-flex align-items-center">
            <div id="ct2" className={`card-header flex-grow-1 collapsed`} data-toggle={accountsList && accountsList.length > 0 ? "collapse" : ""} href="#cp2" aria-expanded="true">
              <a className="card-title w-100 d-flex">
                Users
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={`tooltip-right`}>
                      Tooltip for <strong>Users</strong>.
                    </Tooltip>
                  }
                >
                  {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                  <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                </OverlayTrigger>
                {allUsers && allUsers.length > 0
                  ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                  : ''
                }
              </a>
            </div>

          </div>
          <div id="cp2" className="card-body p-0 collapse" data-parent="#accordion">
            <div className="p-lg-3 m-lg-3 p-2 m-2 bg-white rounded">
              <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                <div className="mr-2 w50 min_w_320 mb-3">
                  <select className="form-control" onChangeCapture={(e) => onSelectUserType(e.target.value)}>
                    <option value={``}> Select User Type </option>
                    <option value={`key_member`}> Key Member </option>
                    <option value={`service_partner`}> Service Partner </option>
                    <option value={`task_owner`}> Task Owner </option>
                    <option value={`auditor`}> Auditor </option>
                  </select>
                </div>
              </div>
              {userType == "key_member" &&
                <div>
                  <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="memFnInp" type="text" className="form-control" placeholder="First Name" {...register("keyMemForm.fname", { required: true, pattern: /^[A-Za-z]+$/i })} />
                      {errors.keyMemForm?.fname && errors.keyMemForm?.fname.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.fname_required}</div></div>}

                      {errors.keyMemForm?.fname && errors.keyMemForm?.fname.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.fname_invalid}</div></div>}
                      {
                        formRes.err_status && formRes.error?.memberFname?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.memberFname?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="memLnInp" type="text" className="form-control" placeholder="Last Name" {...register("keyMemForm.lname", { required: true, pattern: /^[A-Za-z]+$/i })} />
                      {errors.keyMemForm?.lname && errors.keyMemForm?.lname.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.lname_required}</div></div>}

                      {errors.keyMemForm?.lname && errors.keyMemForm?.lname.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.lname_invalid}</div></div>}
                      {
                        formRes.err_status && formRes.error?.memberLname?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.memberLname?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="memberEmail" type="text" className="form-control" placeholder="Email Address" {...register("keyMemForm.email", { required: true, pattern: /^\S+@\S+$/i })} />
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
                        {memberRoles && memberRoles.length > 0 && memberRoles.map((role, mrIndex) => {
                          return (
                            <option key={mrIndex} value={mrIndex}>{role.name}</option>
                          )
                        })}
                      </select>
                      {
                        formRes.err_status && formRes.error?.memberRole?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.memberRole?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div><a onClick={() => addMember()} className="info btn_03"> <img src="/assets/img/plus.svg" alt="" className="plus" /> </a></div>
                  </div>
                  {
                    !formRes.status && formRes.err_status && formRes.error?.type == "member" && formRes.error?.msg
                      ? <div className="form_err text-danger mt-2"><div>{formRes.error?.msg}</div> </div>
                      : ''
                  }
                  {
                    formRes.status && formRes?.type == "member" && formRes.msg
                      ? <div className="form_success text-success mt-2"><div>{formRes.msg}</div> </div>
                      : ''
                  }
                </div>
              }
              {userType == "service_partner" &&
                <div>
                  <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="partnerFnameInp" type="text" className="form-control" placeholder="First Name" {...register("addPartnerForm.fname", { required: true, pattern: /^[A-Za-z]+$/i })} />
                      {errors.addPartnerForm?.fname && errors.addPartnerForm?.fname.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.fname_invalid}</div></div>}
                      {errors.addPartnerForm?.fname && errors.addPartnerForm?.fname.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.fname_required}</div></div>}

                      {
                        formRes.err_status && formRes.error?.partnerFname?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.partnerFname?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="partnerLnameInp" type="text" className="form-control" placeholder="Last Name" {...register("addPartnerForm.lname", { required: true, pattern: /^[A-Za-z]+$/i })} />
                      {errors.addPartnerForm?.lname && errors.addPartnerForm?.lname.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.lname_invalid}</div></div>}
                      {errors.addPartnerForm?.lname && errors.addPartnerForm?.lname.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.lname_required}</div></div>}

                      {
                        formRes.err_status && formRes.error?.partnerLname?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.partnerLname?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="partnerEmail" type="text" className="form-control" placeholder="Email Address" {...register("addPartnerForm.email", { required: true, pattern: /^\S+@\S+$/i })} />
                      {errors.addPartnerForm?.email && errors.addPartnerForm?.email.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.email_invalid}</div></div>}
                      {errors.addPartnerForm?.email && errors.addPartnerForm?.email.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.email_required}</div></div>}

                      {
                        formRes.err_status && formRes.error?.partnerEmail?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.partnerEmail?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div><a onClick={() => addPartner()} className="info btn_03"> <img src="/assets/img/plus.svg" alt="" className="plus" /> </a></div>
                  </div>
                  {
                    !formRes.status && formRes.err_status && formRes.error?.type == "partner" && formRes.error?.msg
                      ? <div className="form_err text-danger mt-2"><div>{formRes.error?.msg}</div> </div>
                      : ''
                  }
                  {
                    formRes.status && formRes?.type == "partner" && formRes.msg
                      ? <div className="form_success text-success mt-2"><div>{formRes.msg}</div> </div>
                      : ''
                  }
                </div>
              }
              {userType == "task_owner" &&
                <div>
                  <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="toFirstname" type="text" className="form-control" placeholder="First Name"  {...register("taskOwnerForm.fname", { required: true, pattern: /^[A-Za-z]+$/i })} />
                      {errors.taskOwnerForm?.fname && errors.taskOwnerForm?.fname.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.fname_required}</div></div>}

                      {errors.taskOwnerForm?.fname && errors.taskOwnerForm?.fname.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.fname_invalid}</div></div>}

                      {
                        formRes.err_status && formRes.error?.ownerFirstName?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.ownerFirstName?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="toLastname" type="text" className="form-control" placeholder="Last Name" {...register("taskOwnerForm.lname", { required: true, pattern: /^[A-Za-z]+$/i })} />
                      {errors.taskOwnerForm?.lname && errors.taskOwnerForm?.lname.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.lname_required}</div></div>}

                      {errors.taskOwnerForm?.lname && errors.taskOwnerForm?.lname.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.lname_invalid}</div></div>}

                      {
                        formRes.err_status && formRes.error?.ownerLastName?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.ownerLastName?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="toEmail" type="text" className="form-control" placeholder="Email Address" {...register("taskOwnerForm.email", { required: true, pattern: /^\S+@\S+$/i })} />
                      {errors.taskOwnerForm?.email && errors.taskOwnerForm?.email.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.email_required}</div></div>}
                      {errors.taskOwnerForm?.email && errors.taskOwnerForm?.email.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.email_invalid}</div></div>}

                      {
                        formRes.err_status && formRes.error?.ownerEmail?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.ownerEmail?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="tolabel" type="text" className="form-control" placeholder="Label (Optional)" {...register("taskOwnerForm.label", { required: false, pattern: /^[A-Za-z\ ]+$/i })} />
                      {errors.taskOwnerForm?.label && errors.taskOwnerForm?.label.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.label_required}</div></div>}
                      {errors.taskOwnerForm?.label && errors.taskOwnerForm?.label.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.label_invalid}</div></div>}

                      {
                        formRes.err_status && formRes.error?.ownerEmail?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.ownerEmail?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <select name="" id="ownerRole" className="form-control">
                        <option value="">Select Authority</option>
                        {ownerRoles && ownerRoles.length > 0 && ownerRoles.map((role, orIndex) => {
                          return (
                            <option key={orIndex} value={orIndex}>{role.name}</option>
                          )
                        })}
                      </select>
                      {
                        formRes.err_status && formRes.error?.ownerRole?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.ownerRole?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div><a onClick={() => addTaskOwner()} className="info btn_03"> <img src="assets/img/plus.svg" alt="" className="plus" /> </a></div>
                  </div>
                  {
                    !formRes.status && formRes.err_status && formRes.error?.type == "owner" && formRes.error?.msg
                      ? <div className="form_err text-danger mt-2"><div>{formRes.error?.msg}</div> </div>
                      : ''
                  }
                  {
                    formRes.status && formRes?.type == "owner" && formRes.msg
                      ? <div className="form_success text-success mt-2"><div>{formRes.msg}</div> </div>
                      : ''
                  }
                </div>
              }
              {userType == "auditor" &&
                <div>
                  <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="auditorFnameInp" type="text" className="form-control" placeholder="First Name"  {...register("inviteAuditorsForm.fname", { required: true, pattern: /^[A-Za-z]+$/i })} />
                      {errors.inviteAuditorsForm?.fname && errors.inviteAuditorsForm?.fname.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.fname_required}</div></div>}
                      {errors.inviteAuditorsForm?.fname && errors.inviteAuditorsForm?.fname.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.fname_invalid}</div></div>}

                      {
                        formRes.err_status && formRes.error?.auditorFname?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.auditorFname?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="auditorLnameInp" type="text" className="form-control" placeholder="Last Name"  {...register("inviteAuditorsForm.lname", { required: true, pattern: /^[A-Za-z]+$/i })} />
                      {errors.inviteAuditorsForm?.lname && errors.inviteAuditorsForm?.lname.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.lname_required}</div></div>}
                      {errors.inviteAuditorsForm?.lname && errors.inviteAuditorsForm?.lname.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.lname_invalid}</div></div>}

                      {
                        formRes.err_status && formRes.error?.auditorLname?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.auditorLname?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div className="flex-grow-1 mr-2 w-75">
                      <input id="auditorEmail" type="text" className="form-control" placeholder="Email Address" {...register("inviteAuditorsForm.email", { required: true, pattern: /^\S+@\S+$/i })} />
                      {errors.inviteAuditorsForm?.email && errors.inviteAuditorsForm?.email.type == "required" && <div className="field_err text-danger"><div>{AIR_MSG.email_required}</div></div>}
                      {errors.inviteAuditorsForm?.email && errors.inviteAuditorsForm?.email.type == "pattern" && <div className="field_err text-danger"><div>{AIR_MSG.email_invalid}</div></div>}
                      {
                        formRes.err_status && formRes.error?.auditorEmail?.required
                          ? <div className="field_err text-danger"><div>{formRes.error?.auditorEmail?.msg}</div> </div>
                          : ''
                      }
                    </div>
                    <div><a onClick={() => addAuditor()} className="info btn_03"> <img src="/assets/img/plus.svg" alt="" className="plus" /> </a></div>
                  </div>
                  {
                    !formRes.status && formRes.err_status && formRes.error?.type == "auditor" && formRes.error?.msg
                      ? <div className="form_err text-danger mt-2"><div>{formRes.error?.msg}</div> </div>
                      : ''
                  }
                  {
                    formRes.status && formRes?.type == "auditor" && formRes.msg
                      ? <div className="form_success text-success mt-2"><div>{formRes.msg}</div> </div>
                      : ''
                  }
                </div>
              }
            </div>

            {allUsers.length > 0 &&
              <div className="search_result bg-white fs-14 ">
                <div className="px-3 h_labels">
                  <div className="w150 flex-xl-grow-1 ml-lg-3 ml-md-0">Name</div>
                  <div className="w85 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left text_color_2 mr-0">Type</div>
                  <div className="w150 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left">Authority</div>
                  <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text-left text_color_3 mr-2">Email</div>
                  <div className="w200 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left text_color_3 mr-2">Label</div>
                  <div className="mr-lg-3 w20"></div>
                </div>
                {allUsers && allUsers.length > 0 && allUsers.map((user, uIndex) => {
                  return (
                    <div key={uIndex} className=" px-3">
                      <div className="w150 flex-xl-grow-1 ml-lg-3 ml-md-0 ">{user?.first_name} {user?.last_name}</div>
                      <div className="w85 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left text_color_2 mr-0">{user?.type == "key_member" ? "Key Member" : (user?.type == "service_partner" ? "Service Partner" : (user?.type == "task_owner" ? "Task Owner" : "Auditor"))}</div>
                      <div className="w150 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left">{user?.department_name}</div>
                      <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text-left text_color_3 mr-2">{user?.email}</div>
                      <div className="w200 flex-xl-grow-1 ml-lg-3 ml-md-0 text-left text_color_3 mr-2">{user?.label}</div>
                      <div className="mr-lg-3 w20">
                        {/* <a onClick={() => delUser(uIndex, user)}> <img src="/assets/img/times.svg" alt="" className="plus" />  </a> */}
                        <button className="border-0 bg-transparent" onClick={(e) => onDel_Confirmation(e, "del_user",{uIndex, user})}> <i className="fa fa-trash"></i></button>
                        </div>
                    </div>
                  )
                })}
              </div>
            }

          </div>
        </div>

        <div className="card">
          <div className="d-flex align-items-center">
            <div id="ct5" className={`card-header flex-grow-1 collapsed`} data-toggle={accountsList && accountsList.length > 0 ? "collapse" : ""} href="#cp5" aria-expanded="true">
              <a className="card-title w-100 d-flex">
                Third Party Services
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={`tooltip-right`}>
                      Tooltip for <strong>Third Party services</strong>.
                    </Tooltip>
                  }
                >
                  {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                  <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                </OverlayTrigger>
                {tpServices && tpServices.filter(tpService => tpService.is_selected == "Y").length > 0
                  ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                  : ''
                }
              </a>
            </div>
            <div className="ml-auto action_item">
              <a onClick={() => addProjectTPS()} className="btn btn-primary-2 btn_03 btn-sm ml-2" disabled={formSubmitted}>Save</a>
            </div>
          </div>

          <div id="cp5" className="card-body p-0 collapse" data-parent="#accordion">
            <div className="pt-4 bg-white fs-14 ">
              <div className="tps_service_block">
                {tpServices && tpServices.length > 0 && tpServices.map((tpService, tpIndex) => {
                  return (
                    <div className="tps_service_box">
                      <div className={`row m-0 align-items-start ${tpIndex + 1 == tpServices.length ? 'mb-3' : 'mb-2'}`}>
                        <div className="col-auto w200">
                          <label className="mt-2 mb-0" key={tpIndex} htmlFor={`f${tpIndex + 1}`}>
                            <input type="checkbox" id={`f${tpIndex + 1}`} onClick={(e) => onSelectTPS(e, tpIndex)} defaultChecked={tpService.is_selected == "Y"} />
                            <span className="ml-1">{tpService.name}</span>
                          </label>
                        </div>
                        <div className="col">
                          {(() => {
                            if (selectedTPS.find((stps) => stps == tpService.id) != undefined) {
                              if (tpService && tpService.fields_required && tpService.fields_required != '') {
                                return (
                                  <>
                                    <div className="d-flex">
                                      {tpService.fields_required && tpService.fields_required.split('|').length > 0 && React.Children.toArray(getTokenFields(tpService).map((field, fIndex) => {
                                        return (
                                          <div className="flex-grow-1 mr-2">
                                            {(() => {
                                              if (editTokenArr && editTokenArr.includes(tpIndex) ) {
                                                return (
                                                  <>
                                                    <input type="text" className="form-control" {...register(`accessTokenForm[${tpService.id}].fieldsValue[${fIndex}]`, { required: true })} placeholder={`${field.key}`} defaultValue={field.value ? field.value : ""} />
                                                    {errors && errors.accessTokenForm && errors.accessTokenForm[tpService.id] && errors.accessTokenForm[tpService.id]?.fieldsValue && errors.accessTokenForm[tpService.id]?.fieldsValue[fIndex] && errors.accessTokenForm[tpService.id]?.fieldsValue[fIndex].type == "required" && <div className="field_err text-danger"><div>field is required</div></div>}
                                                  </>
                                                )

                                              } else {
                                                let formFieldVal = (accessTokenForm && accessTokenForm[tpService.id] && accessTokenForm[tpService.id].fieldsValue && accessTokenForm[tpService.id].fieldsValue[fIndex]) || ""
                                                return (
                                                  <>
                                                    {
                                                      field.key == "region"
                                                        ? <div className="text-left mt-2 text_color_2">{field.value || (accessTokenForm && accessTokenForm[tpService.id]?.fieldsValue && accessTokenForm[tpService.id]?.fieldsValue[fIndex])}</div>
                                                        : <div className="text-left mt-2 text_color_2">{field.value.length > 0 ? (`***************${field.value.substr(field.value.length - 3, 3)}`) : (formFieldVal.length > 0 &&  `***************${formFieldVal.substr(formFieldVal.length - 3, 3)}`)} </div>
                                                    }
                                                  </>
                                                )
                                              }
                                            })()}
                                          </div>
                                        )
                                      }))}

                                      <div className="mt-2 w60">
                                        {
                                          (!editTokenArr || !editTokenArr.includes(tpIndex) )
                                            ? <span className="link_url" onClick={() => editTPSToken(tpIndex, true)}><i className="fa fa-pencil"></i></span>
                                            : <span className="link_url" onClick={() => editTPSToken(tpIndex, false)}><i className="fa fa-check text-success"></i></span>
                                        }

                                      </div>

                                    </div>
                                  </>
                                )
                              }
                            }
                          })()}
                        </div>
                      </div>
                    </div>

                  )
                })}
              </div>
              <div className="row m-0 mb-3">
                <div className="col-12">
                  {
                    !formRes.status && formRes.err_status && formRes.error?.type == "tpstoken" && formRes.error?.msg
                      ? <div className="form_err text-danger mt-2"><div>{formRes.error?.msg}</div> </div>
                      : ''
                  }
                  {
                    formRes.status && formRes?.type == "tpstoken" && formRes.msg
                      ? <div className="form_success text-success mt-2"><div>{formRes.msg}</div> </div>
                      : ''
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end yrscpe">
          {
            accountsList && accountsList.length > 0 && projectId
              ? <Link to={`/${user?.currentUser?.is_onboard == "Y" ? 'configuration_scope' : 'onboarding_scope'}/${encryptData(projectId)}`} className="btn btn btn-primary-2 btn_05 submitBtn btn-lg">Define Your Scope</Link>
              : ''
          }

        </div>
      </div>
      {(() => {
              if (modalType && modalType != '' && modalType != null) {
                if (modalType == 'gcp_modal') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={modalData}
                     />
                }

              }
              if (showAlert && showAlert.show && showAlert.type == "del_user") {
                return (
                  <SweetAlert
                    danger
                    showCancel
                    confirmBtnText="Delete"
                    confirmBtnBsStyle="danger"
                    cancelBtnCssClass="btn btn-outline-secondary text_color_2"
                    title={`Are you sure  you want delete this user?`}
                    onConfirm={() => delUser(showAlert?.data?.uIndex, showAlert?.data?.user)}
                    confirmBtnCssClass={'btn_05'}
                    onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
                    focusConfirmBtn
                  >
                  </SweetAlert>
                )
              } 
              if (showAlert && showAlert.show && showAlert.type == "del_priority_domain") {
                return (
                  <SweetAlert
                    danger
                    showCancel
                    confirmBtnText="Delete"
                    confirmBtnBsStyle="danger"
                    cancelBtnCssClass="btn btn-outline-secondary text_color_2"
                    title={`Are you sure  you want delete this ?`}
                    onConfirm={() => delPrioritizeDomain(showAlert?.data?.pdIndex)}
                    confirmBtnCssClass={'btn_05'}
                    onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
                    focusConfirmBtn
                  >
                  </SweetAlert>
                )
              } 
            }
            )()}
    </>
  )
}

export default Configuration