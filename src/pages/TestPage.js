import moment from "moment"
import React, { lazy, useContext, useEffect, useState } from "react"
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from "react-bootstrap"
import SweetAlert from "react-bootstrap-sweetalert"
import { useForm } from "react-hook-form"
import { useNavigate, useParams } from "react-router-dom"
import Header from "../components/partials/Header"
import Loader from "../components/partials/Loader"
import { LayoutContext } from "../ContextProviders/LayoutContext"
import AirModal from "../elements/AirModal"
import AIR_MSG from "../helpers/AirMsgs"
import { GenMD5Hash, IsValidImgUrl } from "../helpers/Helper"
import ApiService from "../services/ApiServices"
import "../styles/EnqForm.css"

const TestPage = (props) => {
  const navigate = useNavigate()
  const { guid = null, shareId = null } = useParams()
  const { showLoader, setShowLoader, user } = useContext(LayoutContext)
  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [showEnqForm, setShowEnqForm] = useState(false);
  const [viewFile, setViewFile] = useState(null)
  const [fileType, setFileType] = useState(null)
  const [modalData, setModalData] = useState({})
  const [enqData, setEnqData] = useState(null)
  const [enqForm, setEnqForm] = useState(null)
  const [formSubmitted, setFormSbmt] = useState(false)
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [errorMsg, setErrorMsg] = useState(false);
  const [companyLogo, setCompanyLogo] = useState("/assets/img/company_logo.png");
  const { register, handleSubmit, watch, setValue, resetField, trigger, clearErrors, formState: { errors } } = useForm();
  const enquiryForm = watch('enqForm')
  const uniqGuid = guid;
  const [disableForm, setDisableForm] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })

  useEffect(() => {
    if (!showEnqForm) {
      showModal('document_verify_password_modal')
    } else {
      hideModal()
    }
  }, [showEnqForm])

  useEffect(() => {
    if (enqForm == null) {
      // initializeData()
    }
  }, [])


  const initializeData = async (data = null) => {
    if (!data.password || data.password == '') {
      return false
    }
    let password = GenMD5Hash(data.password)
    // let password = data.password
    let payloadUrl = `vendor/getVendorQuestionnaire/${uniqGuid}/${shareId ? shareId : "NA"}/${password}`
    let method = "GET";
    let formData = {}
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let data = res.results
      fetchLogo(data[0]?.client_logo)
      // if(isImgUrlValid(data[0]?.client_logo)){
      //   setCompanyLogo(data[0]?.client_logo)
      // }
      setEnqData(oldVal => {
        return { ...data[0] }
      })
      let disForm = data[0] && (data[0].vendor_status == "complete" || data[0].access_level == "R") ? true : false;
      setDisableForm(disForm)
      if (data[0].template) {
        let template = JSON.parse(data[0].template).page
        // console.log(template)
        setEnqForm(template)
        // console.log(template)
        for (let gKey in template) {
          let group = template[gKey]
          for (let qKey in group.questions) {
            let question = group.questions[qKey]
            register(`enqForm.${gKey}.questions.${qKey}.files`, { required: false, disabled: disableForm })
            setValue(`enqForm.${gKey}.questions.${qKey}.files`, question.files && question.files.length > 0 ? question.files : [])
          }

        }
      }
      setShowEnqForm(true)
    } else {
      return res
    }
  }

  const toggleLoader = () => {
    let toggle = !showLoader
    setShowLoader(toggle)
  }
  const uploadFiles = async (groupIndex = null, questionIndex = null, upfiles = null) => {
    if (groupIndex == null || questionIndex == null) {
      return false
    }
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setFormSbmt(true)
    // let uploadfiles = enquiryForm[groupIndex]['questions'][questionIndex].filesList.length > 0 ? enquiryForm[groupIndex]['questions'][questionIndex].filesList : null
    let uploadfiles = upfiles && upfiles.length > 0 ? upfiles : null
    if (uploadfiles == '' || uploadfiles == null || uploadfiles == undefined) {
      formRes['err_status'] = true
      formRes['error']['type'] = "no_file_select"
      formRes['error']['path'] = `${groupIndex}_${questionIndex}`
      formRes['error']['msg'] = AIR_MSG.files_required
      setFormRes(formRes)
      setFormSbmt(false)
      return
    }
    let formData = new FormData();
    let files = []
    if (uploadfiles && uploadfiles.length > 0) {
      for (var i = 0; i < uploadfiles.length; i++) {
        formData.append(`file[${i}]`, uploadfiles[i])
      }
    }
    // formData.append(`file`, uploadfiles)
    let payloadUrl = `vendor/uploadVendorDocument`;
    let method = "POST"
    let res = await ApiService.fetchData(payloadUrl, method, formData, 'form');
    if (res && res.message == "Success") {
      setFormSbmt(false)
      files = res.files
      // enquiryForm[groupIndex]['questions'][questionIndex].files = files
      let prevFiles = enqForm[groupIndex]['questions'][questionIndex].files
      if (prevFiles && prevFiles.length > 0) {
        files = [...prevFiles, ...files]
      }
      if (!enquiryForm[groupIndex]['questions'][questionIndex].files) {
        register(`enqForm.${groupIndex}.questions.${questionIndex}.files`, { required: enquiryForm && enquiryForm[groupIndex]?.questions[questionIndex]?.fields[0]?.value == "Yes" ? true : false, disabled: disableForm })
      }

      setValue(`enqForm.${groupIndex}.questions.${questionIndex}.files`, files)
      resetField(`enqForm.${groupIndex}.questions.${questionIndex}.filesList`, { defaultValue: null })
      let enqFormData = Object.assign([], enqForm)
      enqFormData[groupIndex]['questions'][questionIndex].files = files
      setEnqForm(oldVal => {
        return [...enqFormData]
      })
      hideModal();
      // setUploadErr('We are not able to create your profile at this moment. Please continue by filling in fields manually')
    }

  }

  const submitForm = async (type = '') => {
    if (type == '') {
      return false
    }
    toggleAlert({ show: false, type: 'success', message: '' })
    setFormSbmt(true)
    let pageData = Object.assign([], enqForm)
    for (let gKey in pageData) {
      let enqGrp = pageData[gKey]
      if (enqGrp.questions && enqGrp.questions.length > 0) {
        for (let qKey in enqGrp.questions) {
          let formQues = enqGrp.questions[qKey]
          formQues.is_complete = "N"
          if (formQues.fields && formQues.fields.length > 0) {
            for (let fKey in formQues.fields) {
              let formField = formQues.fields[fKey]
              let userRplyEznquiryForm = invertArr(enquiryForm[gKey]['questions'][qKey]['fields'])
              formField.value = userRplyEznquiryForm[fKey].value
              if (formField.type == "radio" && formField.value != null) {
                formQues.is_complete = "Y";
              }
            }
          }
          if (enquiryForm[gKey]['questions'][qKey].files && enquiryForm[gKey]['questions'][qKey].files.length > 0) {
            formQues.files = enquiryForm[gKey]['questions'][qKey].files
          }
          // new code for reverting the answer
          if (formQues.notes != '') {
            formQues.reverted_answer = "Y"
          }
        }
      }

    }
    // return
    let payloadUrl = `vendor/updateVendorQuestionnaire/${uniqGuid}/${type}`
    let method = "POST";
    let formData = { page: pageData }
    let res = await ApiService.fetchData(payloadUrl, method, { template: btoa(JSON.stringify(formData)) });
    // let res = await ApiService.fetchData(payloadUrl, method, {template: 'aaaaa'});
    if (res && res.message == "Success") {
      if (type == 'draft') {
        setShowAlert({ show: true, type: "success", message: "Assessment saved" })
      } else {
        setShowAlert({ show: true, type: "success", message: "Assessment submitted successfully", redirectToThankYou: true })
      }
    } else {
      setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
    }
    setFormSbmt(false)

  }

  const onSelectAnswer = (data = null) => {
    if (data == null) {
      return false
    }
    let { gKey = null, qKey = null, value = null } = data
    if (gKey == null || qKey == null || value == null) {
      return false
    }
    let is_mandatory = enqForm[gKey]?.questions[qKey]?.is_mandatory || "N";
    register(`enqForm.${gKey}.questions.${qKey}.files`, { required: value == "Yes" && is_mandatory == "Y" ? true : false, disabled: disableForm })
    setValue(`enqForm.${gKey}.questions.${qKey}.files`, enqForm[gKey]?.questions[qKey]?.files.length > 0 ? enqForm[gKey]?.questions[qKey]?.files : [])

  }

  const getFileDetails = async (data = null) => {
    if (data != null) {

      let payloadUrl = `${data.file}`
      let method = "GET";
      let response = await ApiService.fetchFile(payloadUrl, method);
      let jsonResponse = response.clone()
      let res = await response.arrayBuffer();
      if (res) {
        let contentType = response && response.headers.get('content-type') ? response.headers.get('content-type') : 'application/pdf';
        if (contentType.indexOf('application/json') == -1) {
          var blob = new Blob([res], { type: contentType });
          let reader = new FileReader();
          let url = reader.readAsDataURL(blob);
          let fileType = contentType ? contentType.substr(contentType.lastIndexOf('/') + 1) : null;
          // let fileUrl = reader.result;
          let fileUrl = window.URL.createObjectURL(blob);

          if (fileType == 'xls' || fileType == 'xlsx' || fileType == 'vnd.ms-excel' || fileType == 'vnd.ms-word' || fileType == 'vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType == 'doc' || fileType == 'docx') {
            fileType = 'officeDocument';
            fileUrl = data.file
          }
          setFileType(fileType)
          setViewFile(fileUrl)
          return { status: true, message: "Success" }
        } else {
          let jres = await jsonResponse.json();
          return { status: false, message: jres.message }
        }

      }


    }
  }

  const showModal = async (modalName = null, data = null) => {
    if (modalName == null) {
      return false
    }
    // setEvidenceTypeId(null)
    let fileType = null
    switch (modalName) {
      case 'view_upload_documents':
        if (data != null) {
          data.isFileRequired = (enquiryForm && enquiryForm[data.gKey]?.questions[data.qKey]?.fields[0]?.value == "Yes") ? true : false
          setModalData(data)
        }
        setModalType(modalName)
        setShowModal(true)
        break;
      case 'view_documents':
        setFileType(null)
        setViewFile(null)
        if (data != null) {
          getFileDetails(data)
          // setViewFile(data.file);
          // fileType = (data.file).substr((data.file).lastIndexOf('.') + 1)
          // setFileType(fileType)
          setModalType(modalName)
          setShowModal(true)
        }
        break;
      case 'document_verify_password_modal':
        setModalType(modalName)
        setShowModal(true)
        break;
      case 'view_remediation_steps':
        setModalType(modalName)
        getRemediationSteps();
        break;
      case 'share_modal':
        setModalType(modalName);
        setShowModal(true);
        break;
      case 'review_call_modal':
        let getData = await getReviewCallData()
        if (getData && getData.message == "Success" && getData.results.length > 0) {
          setModalData({ timeSlots: getData.results[0].available_timeslot })
          setModalType(modalName);
          setShowModal(true);
        }
        break;
    }
  }

  const hideModal = () => {
    setModalType(null)
    setShowModal(false)
  }

  const invertArr = (arr = null) => {
    if (arr == null) {
      return []
    }

    let tempArr = Object.assign([], arr)
    // console.log("inverse", tempArr.reverse())
    return tempArr.reverse()
  }

  const getFileName = (file = null) => {
    if (file == null) {
      return '';
    }
    return (file).substr((file).lastIndexOf('/') + 1)
  }

  const toggleAlert = (val) => {
    setShowAlert(val)
    if (val && val.redirectToThankYou) {
      navigate("/thankyou")
    }
  }
  const onFormSbmt = async (type = '') => {
    if (type == '') {
      return false
    }
    if (type == 'complete') {
      clearErrors()
      let isValid = await trigger()
      if (isValid) {
        setShowAlert({ show: true, type: "complete_confirmation", message: "" })
      }
    } else if (type == 'draft') {
      submitForm('draft')
    }
  }

  const delFile = async (data = null) => {
    if (data == null) {
      return false
    }
    let { gKey: groupIndex = null, qKey: questionIndex = null, iKey: fileIndex = null } = data
    if (groupIndex == null || questionIndex == null || fileIndex == null) {
      return false
    }
    let filesArr = (enqForm && enqForm[groupIndex]['questions'][questionIndex].files) || []
    if (filesArr.length > 0) {
      filesArr.splice(fileIndex, 1)
      let enqFormData = Object.assign([], enqForm)
      enqFormData[groupIndex]['questions'][questionIndex].files = filesArr
      setEnqForm(oldVal => {
        return [...enqFormData]
      })
    }

  }

  const isImgUrlValid = async (url = null) => {
    if (url == null) {
      return false
    }
    let res = false
    res = await IsValidImgUrl(enqData?.client_logo)
    return res
  }

  const formatFieldDate = (ev = null) => {
    if (ev == null) {
      return false
    }
    let ele = ev.target;
    if (ele) {
      if (ele.value && ele.value != '') {
        ele.setAttribute("data-date", moment(ele.value, "YYYY-MM-DD").format(ele.getAttribute("data-date-format")))
      } else {
        ele.setAttribute("data-date", ele.placeholder)
      }

    }
  }

  const fetchLogo = async (url = null) => {
    if (url == null) {
      setCompanyLogo("/assets/img/company_logo.png")
    }
    let logoUrl = `${url}`
    var img = new Image();
    let result = false
    img.src = logoUrl;
    // console.log(logoUrl)
    img.onload = function (e) { setCompanyLogo(logoUrl) };
    img.onerror = function (e) { setCompanyLogo("/assets/img/company_logo.png") };
  }

  const getRemediationSteps = async () => {
    setFormSbmt(true)
    let payloadUrl = `vendor/getRemediationSteps/${uniqGuid}/`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    // let res = await ApiService.fetchData(payloadUrl, method, {template: 'aaaaa'});
    if (res && res.message == "Success") {
      let data = res.results
      if (data.length > 0 && data[0].remediation_steps) {
        let mdata = data[0]
        setModalData(mdata)
        setShowModal(true)
      } else {
        setShowAlert({ show: true, type: "danger", message: "No Remediation Steps Found" })
      }

    } else {
      setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
    }
    setFormSbmt(false)
  }

  const requestResubmission = async () => {
    setFormSbmt(true)
    let payloadUrl = `vendor/resubmissionRequest/${uniqGuid}/`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    // let res = await ApiService.fetchData(payloadUrl, method, {template: 'aaaaa'});
    if (res && res.message == "Success") {
      setShowAlert({ show: true, type: "success", message: "Request for Re-Submission has been sent successfully" })
    } else {
      setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
    }
    setFormSbmt(false)
  }

  const shareEnqForm = async (data = null) => {
    if (!data.password || data.password == '' || !data.email || data.email == "" || !data.access_type || data.access_type == "") {
      return false
    }
    toggleAlert({ show: false, type: 'success', message: '' })
    setFormSbmt(true)
    let password = GenMD5Hash(data.password)
    // let password = data.password
    let payloadUrl = `vendor/shareAssessment`
    let method = "POST";
    let formData = { unique_guid: uniqGuid, email: data.email, access: data.access_type, passwd: password }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      setShowAlert({ show: true, type: "success", message: "Assessment shared successfully", redirectToThankYou: false })
      setFormSbmt(false)
      return { message: "Success" }
    } else {
      setFormSbmt(false)
      return res
    }
  }
  const getReviewCallData = async () => {
    // vendor/getAvailableTimeslots/:unique_guid
    let payloadUrl = `vendor/getAvailableTimeslots/${uniqGuid}`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    return res
  }
  const setupReviewCall = async (data = null) => {
    if (data == null) {
      return false
    }
    data.selected_timeslot = JSON.parse(data.selected_timeslot)
    if (!data.selected_timeslot || data.selected_timeslot == '') {
      return false
    }
    let timeslotData = data.selected_timeslot
    toggleAlert({ show: false, type: 'success', message: '' })
    setFormSbmt(true)
    let payloadUrl = `vendor/sendInvite`
    let method = "POST";
    let formData = { unique_guid: uniqGuid, date: timeslotData.date, start_time: timeslotData.from, end_time: timeslotData.to }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      setShowAlert({ show: true, type: "success", message: "Invite Send successfully", redirectToThankYou: false })
      setFormSbmt(false)
      return { message: "Success" }
    } else {
      setFormSbmt(false)
      return res
    }
  }
  return (
    <>
      {/* <Header /> */}

      {(() => {
        if (showEnqForm) {
          return (
            <div id="enq_form_sec" className="py-3">
              <div className="container-fluid">
                <div className="enq_info_block px-lg-3 rounded">
                  <div className="card">
                    <div className="card-body p-0">
                      <div className="card_block py-3">
                        <div className="d-flex justify-content-between align-items-center px-3">
                          <div className="client_logo_block">
                            {
                              companyLogo
                                // ? <img className="img-fluid" src={enqData?.client_logo} />
                                ? <img className="img-fluid" src={companyLogo} />
                                : <img className="img-fluid" src={"/assets/img/demo_user.svg"} />
                            }

                          </div>
                          <div>
                            <span className="d-block">Triggered On</span>
                            <span className="d-block">{enqData?.triggered_on}</span>
                          </div>
                          <div>
                            <span className="d-block">Due Date</span>
                            <span className="d-block">{enqData?.deadline}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="accordion" className="profileSec pl-lg-3 pr-lg-3 accordianSec  mt-3">
                  <div className="card">
                    <form onSubmit={handleSubmit(null)}>
                      <div className="card-header justify-content-between py-4">
                        <a className="card-title">
                          Assessment Form
                          <OverlayTrigger
                            key={"right"}
                            placement={"right"}
                            overlay={
                              <Tooltip className="text-left" id={`tooltip-right`}>
                                <span> Assessment form</span>
                              </Tooltip>
                            }
                          >
                            <span className="info_icon d-inline-block ml-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                          </OverlayTrigger>
                        </a>
                        <div>
                          {
                            disableForm
                              ? enqData.access_level == "W" && <button className="btn btn-primary-2 bg_03 mr-3" type="button" onClick={() => requestResubmission()} disabled={formSubmitted}>Re-Submission Request </button>
                              : (
                                
                                <>
                                  
                                  <button className="btn btn-primary-2 bg_03 mr-3" type="button" onClick={() => onFormSbmt('draft')} disabled={formSubmitted}>Save Draft </button>
                                  <button className="btn btn-primary-2 bg_03 mr-3" type="button" onClick={() => onFormSbmt('complete')} disabled={formSubmitted}>Complete</button>
                                  <DropdownButton
                                    key={"primary"}
                                    id={`dropdown-variants-${"primary"}`}
                                    variant="primary-2 btn_03 mr-3"
                                    title={"More"}
                                    drop={"down"}
                                    align="start"
                                    className="dropdown_toggle_custom2 d-inline-block"
                                  >
                                    <Dropdown.Item onClick={() => showModal("review_call_modal")}> <i className="fa fa-phone mr-2" aria-hidden="true" ></i>Request Review Call</Dropdown.Item>
                                    {enqData?.admin_status == "failed" && <Dropdown.Item onClick={() => showModal("view_remediation_steps")}><i className="fa fa-hand-paper-o mr-2" aria-hidden="true"></i>View Remediation Steps</Dropdown.Item> }
                                    {/* <Dropdown.Item onClick={() => onFormSbmt('draft')}> <i className="fa fa-book mr-2" aria-hidden="true" ></i>Save Draft</Dropdown.Item>
                                    <Dropdown.Item onClick={() => onFormSbmt('complete')}> <i className="fa fa-list-alt mr-2" aria-hidden="true" ></i>Complete</Dropdown.Item> */}
                                    {!shareId && <Dropdown.Item onClick={() => showModal('share_modal')}> <i className="fa fa-share-alt mr-2" aria-hidden="true" ></i>Share</Dropdown.Item>}


                                  </DropdownButton>
                                  {/* <button className="btn btn-primary-2 bg_03 mr-3" type="button" onClick={() => showModal("review_call_modal")} disabled={formSubmitted}>Request Review Call </button>
                                  {enqData?.admin_status == "failed" && <button className="btn btn-primary-2 bg_03 mr-3" type="button" onClick={() => showModal("view_remediation_steps")} disabled={formSubmitted}>View Remediation Steps </button>}
                                  <button className="btn btn-primary-2 bg_03 mr-3" type="button" onClick={() => onFormSbmt('draft')} disabled={formSubmitted}>Save Draft </button>
                                  <button className="btn btn-primary-2 bg_03 mr-3" type="button" onClick={() => onFormSbmt('complete')} disabled={formSubmitted}>Complete</button>
                                  {!shareId && <button className="btn btn-primary-2 bg_03" type="button" onClick={() => showModal('share_modal')} disabled={formSubmitted}>Share</button>} */}
                                </>
                              )
                          }
                        </div>
                      </div>
                      <div className="card-body">
                        <div id="dynamicForm" className="border border-secondary p-3 rounded">
                          <div className="row mb-4">
                            <div className="enqFormGrp col-md-12 mt-3">
                              {errors && errors.enqForm && <div className="field_err text-danger">* Please answer all mandatory questions</div>}
                            </div>

                            {enqForm && enqForm.length > 0 && enqForm.map((enqGrp, gKey) => {
                              return (
                                <div key={gKey} className="enqFormGrp col-md-12 mt-3">
                                  <fieldset className="border rounded p-3">
                                    <legend className="w-auto m-0">{gKey + 1}. {enqGrp.group}</legend>
                                    <div className="row m-0">
                                      {enqGrp.questions && enqGrp.questions.length > 0 && enqGrp.questions.map((formQues, qKey) => {
                                        return (
                                          <div key={qKey} className={`col-md-12 pt-2 ${formQues.notes && formQues.notes != '' && (formQues.reverted_answer && formQues.reverted_answer == "Y") ? 'bg_color_8' : (formQues.notes && formQues.notes != '' ? 'bg_color_3' : '')}`}>
                                            <div className="form_question_block mb-2"><label htmlFor="">{gKey + 1}.{qKey + 1} ) {formQues.question} {formQues.is_mandatory == "Y" ? <span className="text-danger">*</span> : ''}:</label></div>
                                            {
                                              formQues.notes
                                                ? <div className="text-danger ml-2">(Revert Notes:&nbsp;&nbsp; {formQues.notes})</div>
                                                : ''
                                            }

                                            <div className="row m-0">
                                              {formQues.fields && formQues.fields.length > 0 && invertArr(formQues.fields).map((formField, fKey) => {
                                                if (formField.type == "radio") {
                                                  return (
                                                    <div key={fKey} className="col-md-12">
                                                      <div className="form-group m- mt-3">
                                                        <div>
                                                          {formField.radio_options && formField.radio_options.map((option, oKey) => {
                                                            return (
                                                              <label key={oKey} className={`d-inline-flex align-items-center w-auto mr-2`}>
                                                                <input type={formField.type}
                                                                  className="" {...register(`enqForm.${gKey}.questions.${qKey}.fields.${fKey}.value`, { required: formQues.is_mandatory == "Y", disabled: disableForm })}
                                                                  autoComplete="off"
                                                                  defaultValue={option}
                                                                  defaultChecked={formField.value == option}
                                                                  onClickCapture={(e) => onSelectAnswer({ gKey, qKey, value: e.target.value })} />

                                                                <span className="ml-2">{option}</span>
                                                              </label>
                                                            )
                                                          })}
                                                        </div>
                                                        {errors && errors.enqForm && errors?.enqForm[gKey]?.questions[qKey]?.fields && errors?.enqForm[gKey]?.questions[qKey]?.fields[fKey]?.value?.type === 'required' && <div className="field_err text-danger">*Field is required</div>}
                                                      </div>
                                                    </div>
                                                  )
                                                } else if (formField.type == "text") {
                                                  return (
                                                    <div key={fKey} className="col-md-6">
                                                      <div className="form-group">
                                                        <input type={formField.type} className="form-control" {...register(`enqForm.${gKey}.questions.${qKey}.fields.${fKey}.value`, { disabled: disableForm })} autoComplete="off" defaultValue={formField.value} placeholder={formField.label} />
                                                      </div>
                                                    </div>
                                                  )
                                                } else if (formField.type == "date") {
                                                  // if()
                                                  return (
                                                    <div key={fKey} className="col-md-6">
                                                      <div className="form-group">
                                                        <input className="form-control" type="date" {...register(`enqForm.${gKey}.questions.${qKey}.fields.${fKey}.value`, { required: enquiryForm && enquiryForm[gKey] && enquiryForm[gKey].questions[qKey] && enquiryForm[gKey].questions[qKey].fields && enquiryForm[gKey]?.questions[qKey]?.fields[0]?.value == "Yes" ? true : false, disabled: disableForm })} autoComplete="off" defaultValue={formField.value} data-date={formField.label} placeholder={formField.label} data-date-format="MM-DD-YYYY" onChangeCapture={(e) => formatFieldDate(e)} />
                                                        {errors && errors.enqForm && errors?.enqForm[gKey]?.questions[qKey]?.fields && errors?.enqForm[gKey]?.questions[qKey]?.fields[fKey]?.value?.type === 'required' && <div className="field_err text-danger">*Date is required</div>}
                                                      </div>
                                                    </div>
                                                  )
                                                } else if (formField.type == "textarea") {
                                                  return (
                                                    <div key={fKey} className="col-md-6">
                                                      <div className="form-group">
                                                        <textarea className="form-control" {...register(`enqForm.${gKey}.questions.${qKey}.fields.${fKey}.value`, { disabled: disableForm })} placeholder={formField.label} >{formField.value}</textarea>
                                                        {errors && errors.enqForm && errors?.enqForm[gKey]?.questions[qKey]?.fields && errors?.enqForm[gKey]?.questions[qKey]?.fields[fKey]?.value?.type === 'required' && <div className="field_err text-danger">*Field is required</div>}
                                                      </div>
                                                    </div>
                                                  )
                                                }
                                              })}
                                              {(() => {
                                                if (formQues.files) {
                                                  return (
                                                    <div className="col-md-12">
                                                      <div className="form-group">
                                                        <label className="mb-3">{formQues.doc_upload_label}</label>
                                                        <div className="row">
                                                          <div className="col-auto">
                                                            {/* <button className="btn btn-primary btn_wide" type="button" onClick={() => uploadFiles(gKey, qKey)} disabled={formSubmitted}>Upload Files</button> */}
                                                            <button className="btn btn-primary-2 bg_04 btn_wide" type="button" onClick={() => showModal('view_upload_documents', { gKey, qKey })} disabled={formSubmitted || disableForm}>Upload Files</button>
                                                          </div>
                                                          <div className="col-md-8 d-flex align-items-center">
                                                            {
                                                              formRes.err_status && formRes.error?.type == "no_file_select" && formRes.error?.path == `${gKey}_${qKey}`
                                                                ? <div className="field_err text-danger"><div>{formRes.error?.msg}</div> </div>
                                                                : ''
                                                            }
                                                            {(() => {
                                                              if (enqForm && enqForm[gKey]['questions'][qKey].files && enqForm[gKey]['questions'][qKey].files.length > 0) {
                                                                return (
                                                                  <div className="img_prev_block">
                                                                    <span>
                                                                      (
                                                                      {
                                                                        React.Children.toArray(enqForm[gKey]['questions'][qKey].files.map((file, iKey) => {
                                                                          return (
                                                                            <>
                                                                              {
                                                                                iKey != 0 && iKey != enqForm[gKey]['questions'][qKey].files.length
                                                                                  ? ','
                                                                                  : ''
                                                                              }
                                                                              <span className="img_box link_url text-underline"> <u onClick={() => showModal('view_documents', { file })}>{getFileName(file)}</u><sup onClick={() => delFile({ gKey, qKey, iKey })}><i className="fa fa-times link_url fs-11"></i></sup> </span>
                                                                            </>
                                                                          )
                                                                        }))
                                                                      }
                                                                      {/* {enqForm[gKey]['questions'][qKey].files.map((file, iKey) => {
                                                                        // return <span className="img_box link_url" onClick={() => showModal('view_documents', { file })}><i className="fa fa-file" ></i> </span>
                                                                        return (
                                                                          <React.Fragment key={iKey}>
                                                                            {
                                                                              iKey != 0 && iKey != enqForm[gKey]['questions'][qKey].files.length
                                                                                ? ','
                                                                                : ''
                                                                            }
                                                                            <span  className="img_box link_url text-underline"> <u onClick={() => showModal('view_documents', { file })}>{getFileName(file)}</u><sup onClick={() => delFile({gKey,qKey,iKey})}><i className="fa fa-times link_url fs-11"></i></sup> </span>
                                                                          </React.Fragment>
                                                                        )
                                                                      })} */}
                                                                      )
                                                                    </span>
                                                                  </div>
                                                                )
                                                              }
                                                            })()}
                                                          </div>
                                                          <div className="col-12">
                                                            {errors && errors.enqForm && errors?.enqForm[gKey]?.questions[qKey]?.files?.type === 'required' && <div className="field_err text-danger">*Please upload required documents</div>}
                                                          </div>

                                                        </div>
                                                      </div>
                                                    </div>
                                                  )
                                                }
                                              })()}
                                            </div>
                                            {errors.oldPass?.type === 'required' && <div className="field_err text-danger">*Old assword is required</div>}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </fieldset>
                                </div>
                              )
                            })}
                          </div>

                          <div className="row">
                            {errors.newPass?.type === 'pattern' && <div className="form_err text-danger">*Password should be alphanumeric, must contain atleast 1 uppercase and 1 special character and should have atleast 10 characters </div>}
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
              </div>
            </div>
          )
        } else {
        }
      })()}

      {(() => {
        if (showAlert && showAlert.show && showAlert.type == "complete_confirmation") {
          return (
            <SweetAlert
              warning
              showCancel
              confirmBtnText="Confirm"
              confirmBtnBsStyle="warning"
              cancelBtnCssClass="btn btn-outline-secondary text_color_2"
              title="Are you sure  you want complete the assessment ?"
              onConfirm={() => submitForm('complete')}
              confirmBtnCssClass={'btn_05'}
              onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
              focusConfirmBtn
            >
            </SweetAlert>
          )
        } else if (showAlert && showAlert.show && showAlert.type == "success") {
          return (
            <SweetAlert
              success
              title={showAlert.message}
              onConfirm={() => toggleAlert({ show: false, type: 'success', message: '', redirectToThankYou: showAlert.redirectToThankYou })}
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

      {(() => {
        if (modalType && modalType != '' && modalType != null) {
          if (modalType == 'view_upload_documents') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={modalData}
              formSubmit={uploadFiles} />
          }
          if (modalType == 'view_documents') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={{ viewFile: viewFile, fileType: fileType }}
              formSubmit={() => { }} />
          }
          if (modalType == 'document_verify_password_modal') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={{}}
              formSubmit={initializeData} />
          }
          if (modalType == 'view_remediation_steps') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={modalData}
              formSubmit={() => null} />
          }
          if (modalType == 'share_modal') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={modalData}
              formSubmit={shareEnqForm} />
          }
          if (modalType == 'review_call_modal') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={modalData}
              formSubmit={setupReviewCall} />
          }
        }
      })()}
    </>
  )
}

export default TestPage