import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie, decryptData } from "../helpers/Helper";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/partials/Header";
import React, { useEffect, useRef, useState } from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import AIR_MSG from "../helpers/AirMsgs";
import AirModal from "../elements/AirModal";
import SweetAlert from "react-bootstrap-sweetalert";

const ConfigurationScope = (props) => {
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

  const { register, handleSubmit, watch, formState: { errors } } = useForm(); // initialize the hook
  const [formSubmitted, setFormSbmt] = useState(false)
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [errorMsg, setErrorMsg] = useState(false);
  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [uploadfiles, setUploadFiles] = useState(null);
  const [modalData, setModalData] = useState({});
  const [checkFileType, setCheckFileType] = useState(true);
  const [validFileTypes, setValidFileTypes] = useState(process.env.REACT_APP_SUPPORT_UPLOAD_FILE_TYPE.split(","))
  const [uploaded_files, setUploaded_files] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })
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

  const fetchInfo = async (type = '', data = null) => {
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
        let tmpArr = [...res.results];
        if (data && data.defaultLastChecked) {
          tmpArr[tmpArr.length - 1].is_selected = "Y"
        }
        setUtilities(oldVal => {
          return [...tmpArr]
        })
      }
      let {asset} = res;
      if(asset != undefined || asset != null){
        setUploaded_files(asset[0].file_url);
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
  const addTechnologyAssets = async () => {
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let endPointInput = document.getElementById("epInput");
    let serversInput = document.getElementById("serverInput");
    let mobDevicesInput = document.getElementById("mdInput");
    let endpoints = endPointInput.value
    let servers = serversInput.value
    let mobileDevices = mobDevicesInput.value
    if (!endpoints || !servers || !mobileDevices) {
      // let formRes = {status:false,err_status:true,error:{}}
      formRes['err_status'] = true
      if (!endpoints) {
        formRes['error']['endPoints'] = { required: true, msg: AIR_MSG.endpoint_required }
      }
      if (!servers) {
        formRes['error']['servers'] = { required: true, msg: AIR_MSG.server_required }
      }
      if (!mobileDevices) {
        formRes['error']['mobileDevices'] = { required: true, msg: AIR_MSG.mobile_device_required }
      }
      setFormRes(formRes)
      return false;
    }
    let payloadUrl = "configuration/addTechnologyAssets"
    let method = "POST";
    let formData = { endpoints: endpoints, servers: servers, mobile_devices: mobileDevices, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      formRes = { status: true, err_status: false, type: "techAssets", error: {}, msg: AIR_MSG.add_assets_success }
      setFormRes(formRes)
      let scopes = getAllScopes
      scopes.technology_assets = [{ endpoints: formData.endpoints, servers: formData.servers, mobile_devices: formData.mobileDevices }]
      setAllScopes(scopes)
      changePanel(3)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "techAssets"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }

  const addVendor = async () => {
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let vendorInput = document.getElementById("vendorInput");
    let vendor = vendorInput.value
    if (!vendor) {
      // let formRes = {status:false,err_status:true,error:{}}
      formRes['err_status'] = true
      if (!vendor) {
        formRes['error']['vendor'] = { required: true, msg: AIR_MSG.vendor_required }
      }
      setFormRes(formRes)
      return false;
    }
    let payloadUrl = "configuration/addVendor"
    let method = "POST";
    let formData = { vendor: vendor, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      // let accListArr = [Object.assign(formData, { project_id: res.project_id })]
      // setAccountsList(oldVal => {
      //   return [...accListArr]
      // })
      fetchInfo("all")
      vendorInput.value = ""
      // changePanel(4)
      formRes = { status: true, err_status: false, type: "vendor", error: {}, msg: AIR_MSG.add_vendor_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "vendor"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }

  const delVendor = async (index = null) => {
    if (index == null) {
      return false;
    }
    let delVendor = getAllScopes.vendors[index]
    let payloadUrl = `configuration/deleteVendorById/${delVendor.id}`
    let method = "DELETE";
    let formData = {}
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      fetchInfo("all")
    } else {
      formRes['err_status'] = true
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
  }

  const createThirdPartyUtility = async () => {
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let utilityInput = document.getElementById("utilityInput");
    let utility = utilityInput.value
    if (!utility) {
      // let formRes = {status:false,err_status:true,error:{}}
      formRes['err_status'] = true
      if (!utility) {
        formRes['error']['utility'] = { required: true, msg: AIR_MSG.utility_required }
      }
      setFormRes(formRes)
      return false;
    }
    let payloadUrl = "configuration/createThirdPartyUtility"
    let method = "POST";
    let formData = { utility_name: utility, project_id: projectId }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      fetchInfo("tpUtilites", { defaultLastChecked: true })
      utilityInput.value = ""
      formRes = { status: true, err_status: false, type: "utility", error: {}, msg: AIR_MSG.add_utility_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "utility"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }

  const addToUtilityList = (ev = null, index = null) => {
    if (ev == null || index == null || !getAllScopes.third_party_utilities[index]) {
      return
    }

    let id = getAllScopes.third_party_utilities[index].id
    let tempArr = addUtilitiesList;
    tempArr.push(id)
    setUtilitiesList(oldVal => {
      return [...tempArr]
    })
  }
  const removeFromUtilityList = (ev = null, index = null) => {
    if (ev == null || index == null || !getAllScopes.third_party_utilities[index]) {
      return
    }

    let id = getAllScopes.third_party_utilities[index].id
    let tempArr = addUtilitiesList;
    let tempArrIndex = tempArr.indexOf(id)
    tempArr.splice(tempArrIndex, 1)
    setUtilitiesList(oldVal => {
      return [...tempArr]
    })
  }


  const addThirdPartyUtilities = async () => {
    setFormSbmt(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setErrorMsg(false)
    let payloadUrl = "configuration/addThirdPartyUtilities"
    let method = "POST";
    let formData = { project_id: projectId, utility_ids: addUtilitiesList }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      formRes = { status: true, err_status: false, error: {}, type: "util", msg: AIR_MSG.add_utilities_success }
      setFormRes(formRes)
      fetchInfo("all")
      changePanel(5)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "util"
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
      tokenInput.value = ""
    }
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
  const getUpload_DownloadFile = async () => {
    let payloadUrl = uploaded_files;
    let method = "GET";
    let res = await ApiService.fetchFile(payloadUrl, method);
   
    if (res && res?.statusText == "OK") {
      res.blob().then(blob => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = "uploadedFile";
        a.click();
    });
    }
}
  const downloadSample = () => {
    const link = document.createElement('a');
    // create a blobURI pointing to our Blob
   
      let filename = "Asset Register template.xlsx"
      link.href = "/assets/sample_files/Asset Register template.xlsx";
    link.download = filename;
    // some browser needs the anchor to be in the doc
    document.body.append(link);
    link.click();
    link.remove();
  }
  const toggleAlert = (val) => {
    setShowAlert(val)
  }
  const showModal = async (modalName = null, data = null) => {
    if (modalName == null) {
      return false
    }
    switch (modalName) {
      case 'view_upload_documents':
        if (data != null) {
          setModalData({})
        }
        setModalType(modalName)
        setShowModal(true)
        break;
    }
  }
  const hideModal = (data = null) => {
   
    if (modalType == 'view_upload_documents') {
      if (data != null) {
       getUploadedFiles(data)
       setShowAlert({ show: true, type: "success", message: AIR_MSG.asset_upload });
      }
    }
    setModalType(null)
    setShowModal(false)
  }
  const getUploadedFiles = async (projectId = null) => {
    let payloadUrl = `configuration/getScopeDetails/${projectId}`
    let method = "GET";
    let formData = {};
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res.status == 302 || res.status == 404) {
      console.log("error occured");
    }
    if (res && res.message == "Success") {
      let { asset } = res
      setUploaded_files(asset[0].file_url);
      if(uploaded_files != null){
      }
    }

  }
  const uploadFiles = async ( upfiles = null) => {
   

   
  }

  return (
    <>
      <Header />
      <div id="accordion" className="accordion pl-lg-3 pr-lg-3 accordianSec profileSec">
        <div className="card">
          <div className="d-flex align-items-center">
            <div id="ch1" className="card-header flex-grow-1" data-toggle="collapse" href="#cp1">
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
                {getAllScopes && getAllScopes.peoples && getAllScopes.peoples.length > 0
                  ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                  : ''
                }
              </a>

            </div>
            <div className="ml-auto action_item">
              <a onClick={() => addPeople()} className="btn btn-primary-2 btn_03 btn-sm">Save</a>
            </div>
          </div>
          <div id="cp1" className="collapse show" data-parent="#accordion" >
            <div className="card-body">
              <div className="row">
                <div className="form-group col-md-6 formInline">
                  <label htmlFor="">Employees : </label>
                  <input type="text" className="form-control bg-transparent" placeholder="No. of Employees" id="empInput" defaultValue={getAllScopes.peoples && getAllScopes?.peoples[0]?.employees ? getAllScopes?.peoples[0]?.employees : ''} />
                  {
                    formRes.err_status && formRes.error?.employees?.required
                      ? <div className="field_err text-danger"><div>{formRes.error?.employees?.msg}</div> </div>
                      : ''
                  }
                </div>
                <div className="form-group col-md-6 formInline" >
                  <label htmlFor="" className="pl-xl-5">Consultants : </label>
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
                Technology Assets
                <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={`tooltip-right`}>
                      Tooltip for <strong>Technology Assets</strong>.
                    </Tooltip>
                  }
                >
                  {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                  <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                </OverlayTrigger>
                {getAllScopes && getAllScopes.technology_assets && getAllScopes.technology_assets.length > 0 && (getAllScopes.technology_assets[0].endpoints)
                  ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                  : ''
                }
              </a>
            </div>
            <div className="ml-auto action_item">
              <a onClick={() => addTechnologyAssets()} className="btn btn-primary-2 btn_03 btn-sm">Save</a>
            </div>
          </div>
          <div id="cp2" className="collapse" data-parent="#accordion" >
            <div className=" p-3">
              <div className="row">
                <div className="form-group col-md-6 formInline">
                  <label htmlFor="">Endpoints:</label>
                  <input type="text" className="form-control bg-transparent" placeholder="No. of Endpoints" id="epInput" defaultValue={getAllScopes.technology_assets && getAllScopes?.technology_assets[0]?.endpoints ? getAllScopes?.technology_assets[0]?.endpoints : ''} />
                  {
                    formRes.err_status && formRes.error?.endPoints?.required
                      ? <div className="field_err text-danger"><div>{formRes.error?.endPoints?.msg}</div> </div>
                      : ''
                  }
                </div>
                <div className="form-group col-md-6 formInline" >
                  <label htmlFor="" className="pl-xl-5">Servers:</label>
                  <input type="text" className="form-control bg-transparent" placeholder="No. of Servers" id="serverInput" defaultValue={getAllScopes.technology_assets && getAllScopes?.technology_assets[0]?.servers ? getAllScopes?.technology_assets[0]?.servers : ''} />
                  {
                    formRes.err_status && formRes.error?.servers?.required
                      ? <div className="field_err text-danger"><div>{formRes.error?.servers?.msg}</div> </div>
                      : ''
                  }
                </div>
              </div>
              <div className="row">
                <div className="form-group col-md-6 formInline">
                  <label htmlFor="">Mobile Devices:</label>
                  <input type="text" className="form-control bg-transparent" placeholder="No. of Mobile Devices" id="mdInput" defaultValue={getAllScopes.technology_assets && getAllScopes?.technology_assets[0]?.mobile_devices ? getAllScopes?.technology_assets[0]?.mobile_devices : ''} />
                  {
                    formRes.err_status && formRes.error?.mobileDevices?.required
                      ? <div className="field_err text-danger"><div>{formRes.error?.mobileDevices?.msg}</div> </div>
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
        <div className="card">
          <div id="ch3" className="card-header collapsed" data-toggle="collapse" data-parent="#accordion" href="#cp3">
            <a className="card-title w-100 d-flex">
              Vendors
              <OverlayTrigger
                key={"right"}
                placement={"right"}
                overlay={
                  <Tooltip id={`tooltip-right`}>
                    Tooltip for <strong>Vendors</strong>.
                  </Tooltip>
                }
              >
                {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
              </OverlayTrigger>
              {getAllScopes && getAllScopes.vendors && getAllScopes.vendors.length > 0
                ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                : ''
              }
            </a>
          </div>
          <div id="cp3" className="collapse bg_07" data-parent="#accordion" >
            <div className="p-lg-3 m-lg-3 p-2 m-2 bg-white rounded">
              <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                <div className=" mr-2 w-50">
                  <input type="text" className="form-control pl-0" placeholder="Enter Name" id="vendorInput" />
                  {
                    formRes.err_status && formRes.error?.vendor?.required
                      ? <div className="field_err text-danger"><div>{formRes.error?.vendor?.msg}</div> </div>
                      : ''
                  }
                </div>
                <div ><a onClick={() => addVendor()} className="info btn_03"> <img src="/assets/img/plus.svg" alt="" className="plus" /> </a></div>
              </div>
              <div className="row m-0">
                {
                  !formRes.status && formRes.err_status && formRes.error?.type == "vendor" && formRes.error?.msg
                    ? <div className="form_err text-danger"><div>{formRes.error?.msg}</div> </div>
                    : ''
                }
                {
                  formRes.status && formRes?.type == "vendor" && formRes.msg
                    ? <div className="form_success text-success"><div>{formRes.msg}</div> </div>
                    : ''
                }
              </div>
            </div>
            <div className="search_result bg-white ">
              {getAllScopes && getAllScopes?.vendors && getAllScopes?.vendors.length > 0 && getAllScopes?.vendors.map((vendor, vIndex) => {
                return (
                  <div key={vIndex} className=" px-3">
                    <div className="flex-grow-1 ml-lg-3 ml-md-0 ">{vendor.vendor}</div>
                    <div className="mr-lg-3 mr-0"><a onClick={() => delVendor(vIndex)}> <img src="/assets/img/gbl.svg" alt="" className="cls" />  </a></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="card">
          <div id="ch4" className="card-header collapsed" data-toggle="collapse" data-parent="#accordion" href="#cp4">
            <a className="card-title w-100 d-flex">
              Third Party Utility
              <OverlayTrigger
                key={"right"}
                placement={"right"}
                overlay={
                  <Tooltip id={`tooltip-right`}>
                    Tooltip for <strong>Third Party Utility</strong>.
                  </Tooltip>
                }
              >
                {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
              </OverlayTrigger>
              {getAllScopes && getAllScopes.third_party_utilities && getAllScopes?.third_party_utilities.filter(util => util.is_selected == "Y").length > 0
                ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                : ''
              }
            </a>
          </div>
          <div className="ml-auto action_item mt-2">
            <a onClick={() => addThirdPartyUtilities()} className="btn btn-primary-2 btn_03 btn-sm">Save</a>
          </div>
          <div id="cp4" className="collapse bg_07" data-parent="#accordion" >
            <div className="p-lg-3 m-lg-3 p-2 m-2 bg-white rounded">
              <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                <div className=" mr-2 w-50">
                  <input type="text" className="form-control" placeholder="Enter Name" id="utilityInput" {...register(`tpUtilityForm.utility_name`)} />
                  {
                    formRes.err_status && formRes.error?.utility?.required
                      ? <div className="field_err text-danger"><div>{formRes.error?.utility?.msg}</div> </div>
                      : ''
                  }
                </div>
                <div ><a onClick={() => createThirdPartyUtility()} className="info btn_03"> <img src="/assets/img/plus.svg" alt="" className="plus" /> </a></div>
              </div>
              <div className="row m-0">
                {
                  !formRes.status && formRes.err_status && formRes.error?.type == "utility" && formRes.error?.msg
                    ? <div className="form_err text-danger"><div>{formRes.error?.msg}</div> </div>
                    : ''
                }
                {
                  formRes.status && formRes?.type == "utility" && formRes.msg
                    ? <div className="form_success text-success"><div>{formRes.msg}</div> </div>
                    : ''
                }
              </div>
            </div>
            <div className="search_result bg-white ">
              <ul className="list-unstyled">

                {tpUtilities && tpUtilities.length > 0 && tpUtilities.map((utility, uIndex) => {
                  return (
                    <li key={uIndex}>
                      <div className=" ml-lg-3 ml-md-0 ">
                        <input type="checkbox" id={`f${uIndex + 1}`} defaultChecked={utility.is_selected == 'Y'} onClick={(e) => e.target.checked ? addToUtilityList(e, uIndex) : removeFromUtilityList(e, uIndex)} />
                      </div>
                      {/* <img src="/assets/img/utility.svg" alt="" className="p-1" /> */}
                      <label className="mb-0 ml-1 f-12" htmlFor={`f${uIndex + 1}`}>{utility.name}</label>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
        <div className="card">
          <div id="ch5" className="card-header collapsed" data-toggle="collapse" data-parent="#accordion" href="#cp5">
            <a className="card-title w-100 d-flex">
              Asset Register
              <OverlayTrigger
                key={"right"}
                placement={"right"}
                overlay={
                  <Tooltip id={`tooltip-right`}>
                    Tooltip for <strong>Assets</strong>.
                  </Tooltip>
                }
              >
                {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
              </OverlayTrigger>
              {/* {getAllScopes && getAllScopes.peoples && getAllScopes.peoples.length > 0
                ? <span className="success_icon d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                : ''
              } */}
            </a>
          </div>
          <div id="cp5" className="collapse" data-parent="#accordion" >
            <div className="p-3 d-flex justify-content-between">
              <div className="d-flex align-items-center">
                <p className="mb-0 gLbl">
                  {(uploaded_files != null)?<><span className="link_url fw-600" onClick={() => getUpload_DownloadFile()}>Download uploaded file</span><br/></>:""}
                  Download the sample file from <span className="link_url fw-600" onClick={() => downloadSample()}>here</span>.</p>
              </div>
              <div className="d-flex justify-content-end yrscpe">
                {/* <label className="btn btn_1 btn-sm" htmlFor="uploadOption">Upload</label>
                <input type="file" id="uploadOption" className="d-none" /> */}
                <div className="control_button_block pl-3">
                  <Button className="btn_1 btn_small fs-10" variant="outline-dark" onClick={() => showModal('view_upload_documents')}>Upload</Button>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="card">
          <div id="ch6" className="card-header collapsed" data-toggle="collapse" data-parent="#accordion" href="#cp6">
            <a className="card-title w-100 d-flex">
              Members
              <OverlayTrigger
                key={"right"}
                placement={"right"}
                overlay={
                  <Tooltip id={`tooltip-right`}>
                    Tooltip for <strong>Membbers</strong>.
                  </Tooltip>
                }
              >
                {/* <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span> */}
                <span className="info_icon d-none ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
              </OverlayTrigger>

            </a>
          </div>
          <div id="cp6" className="collapse" data-parent="#accordion" >
            <div className="card-body">

              <div className="search_result bg-white fs-14 ">
                <div className="px-3 h_labels">
                  <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0">Name</div>
                  <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text-left text_color_2 mr-0">Member type</div>
                  <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text-left">Gorico Authority</div>
                  <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text-left text_color_3 mr-2">Actual Designation</div>
                  <div className="mr-lg-3 w60"></div>
                </div>
                {internalMembers && internalMembers.length > 0 && React.Children.toArray(internalMembers.map((member, imKey) => {
                  return (
                    <div className="px-3">
                      <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0">{member.emp_name}</div>
                      <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text-left text_color_2 mr-0"> {member.user_type}</div>
                      <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text-left">{member.authority}</div>
                      {(() => {
                        if (modifyIMember && modifyIMember.index == imKey) {
                          return (
                            <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text-left text_color_3 mr-2">
                              <input className="form-control w-auto pl-0" defaultValue={modifyIMember.actual_authority} ref={el => (iMemAuthorityInpRef.current[`${imKey}`] = el)} />
                              {formRes && formRes.err_status && formRes.type == "updateIMember" && formRes.error?.required && <span className="form_err text-danger">{formRes.error?.msg} </span>}
                            </div>
                          )
                        } else {
                          return <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text-left text_color_3 mr-2">{member.designation}</div>
                        }
                      })()}


                      <div className="mr-lg-3 w60">
                        {
                          modifyIMember && modifyIMember.index == imKey
                            ? <><span className="edit text-success link_url" onClick={() => updateIMember(imKey)}><i className="fa fa-check"></i></span><span className="ml-2 edit text-danger link_url" onClick={() => cancelModifyIMember(imKey)}><i className="fa fa-ban"></i></span></>
                            : <span className="edit link_url" onClick={() => onClickEditInternalMember(imKey)}><i className="fa fa-pencil fs-14"></i></span>
                        }
                      </div>
                    </div>
                  )
                }))}
              </div>
            </div>

          </div>
        </div>

        <div className="d-flex justify-content-end yrscpe">
          <Link to={`/configuration`} className="btn btn btn-primary-2 btn_05 submitBtn w100">Back</Link>
        </div>

      </div>
      {(() => {
        if (modalType && modalType != '' && modalType != null) {
          if (modalType == 'view_upload_documents') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={{projectId:projectId}}
              formSubmit={uploadFiles} />
          }
        }
      })()}
       {(() => {
              if (showAlert && showAlert.show && showAlert.type == "admin_status_confirmation") {
                return (
                  <SweetAlert
                    warning
                    showCancel
                    confirmBtnText="Delete"
                    confirmBtnBsStyle="danger"
                    title="Are you sure?"
                    onConfirm={() => toggleAlert({ show: false, type: 'success', message: '' })}
                    confirmBtnCssClass={'btn_05'}
                    onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
                    focusCancelBtn
                  >
                  </SweetAlert>
                )
              } else if (showAlert && showAlert.show && showAlert.type == "success") {
                return (
                  <SweetAlert
                    success
                    title={showAlert.message}
                    onConfirm={() => toggleAlert({ show: false, type: 'success', message: '' })}
                    confirmBtnCssClass={'btn_05'}
                    onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
                    showConfirm={true}
                    focusCancelBtn={false}
                    customClassName={'air_alert'}
                    timeout={3000}
                  />
                )
              } else if (showAlert && showAlert.show && showAlert.type == "danger") {
                return (
                  <SweetAlert
                    danger
                    title={showAlert.message}
                    onConfirm={() => toggleAlert({ show: false, type: 'success', message: '' })}
                    confirmBtnCssClass={'btn_05'}
                    onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
                    showConfirm={true}
                    focusCancelBtn={false}
                    customClassName={'air_alert'}
                    timeout={3000}
                  />
                )
              }
            })()}
    </>
  )
}

export default ConfigurationScope