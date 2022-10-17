import { useForm } from "react-hook-form";
import ApiService from "../../services/ApiServices";
import { SetCookie, GetCookie, encryptData } from "../../helpers/Helper";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Header from "../../components/partials/Header";
import { lazy, useContext, useEffect, useRef, useState } from "react";
import { Button, OverlayTrigger, ProgressBar, Tooltip } from "react-bootstrap";
import { LayoutContext } from "../../ContextProviders/LayoutContext";
import AirPagination from "../../elements/AirPagination";
import Styles from "../../styles/VendorsEvidenceManager.module.css"
import AirSelect from "../../elements/AirSelect";
import AIR_MSG from "../../helpers/AirMsgs";
import AirCalender from "../../elements/AirCalender";
import AirVendorModal from "../../elements/AirVendorModal";
import SweetAlert from "react-bootstrap-sweetalert";
import { format } from "date-fns";
import Loader from "../../components/partials/Loader";
// const LayoutContext = lazy(() => import("../ContextProviders/LayoutContext"))


const VendorsEvidenceManager = (props) => {
  // const {setShowLoader} = useContext(LayoutContext)
  // const { user = {} } = useOutletContext()
  const { showLoader, setShowLoader, projectId, setProjectId, user = {}, updateData } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const [view, setView] = useState('assessment_trigger_list')
  const [assessmentList, setAssessmentList] = useState([])
  const [templateQuestions, setTemplateQuest] = useState([])
  const [downloadGrpFilesList, setDownloadGrpFilesList] = useState({})

  const { register, handleSubmit, watch, setValue, resetField, formState: { errors } } = useForm();
  const enquiryForm = watch('enqForm')

  const navigate = useNavigate()

  // const { register, handleSubmit, watch, formState: { errors } } = useForm(); // initialize the hook
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const form = watch()
  const [formSubmitted, setFormSbmt] = useState(false)
  const [errorMsg, setErrorMsg] = useState(false);
  // const showLoader = false

  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({})
  const [viewFile, setViewFile] = useState(null)
  const [fileType, setFileType] = useState(null)
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })
  const [showContentLoader, setShowContentLoader] = useState(false);

  useEffect(() => {

    initializeData()
  }, [user])

  const initializeData = () => {
    if (assessmentList.length == 0) {
      fetchInfo('assessment_list')
    }
  }


  const fetchInfo = async (type = '', projectInfo = null) => {
    if (type == '') {
      return false
    };

    let payloadUrl = ""
    let method = "POST";
    let formData = {};

    if (type == 'assessment_list') {
      payloadUrl = `assessment/getVendorAssessment/${orgId}`
      method = "GET";
    }

    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      if (type == 'assessment_list') {
        setAssessmentList(oldVal => {
          return [...res.results]
        })
      }
    }
  }


  const getVendorQuestionnaires = async (assessment = null) => {
    if (assessment?.value == null) {
      return
    }
    // assessment = JSON.parse(assessment)
    assessment = assessmentList[assessment.value]
    let uniqGuid = assessment.unique_guid
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    let payloadUrl = `assessment/getVendorQuestionnaire/${uniqGuid}`
    let method = "GET";
    // let formData = {org_id: orgId}
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      let vendorQuesStat = res.results[0];
      vendorQuesStat.vendor = assessment
      vendorQuesStat.template = JSON.parse(vendorQuesStat.template)
      setTemplateQuest(oldVal => {
        return { ...vendorQuesStat }
      })

      changeView('view_questionnnaire')

      formRes = { status: true, err_status: false, type: "vendorQuest", error: {}, msg: "" }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "vendorQuest"
      formRes['error']['msg'] = ""
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }

  const downloadFile = async (data = null) => {
    if (data != null) {
      setFormSbmt(true)
      setShowContentLoader(true)
      let payloadUrl = `${data.file}`
      let method = "GET";
      let response = await ApiService.fetchFile(payloadUrl, method);
      let res = await response.arrayBuffer();
      if (res) {
        let contentType = response && response.headers.get('content-type') ? response.headers.get('content-type') : 'application/pdf';
        if (contentType.indexOf('application/json') == -1) {
          var blob = new Blob([res], { type: contentType });
          let url = window.URL.createObjectURL(blob)
          // window.open(url,'_blank')

          if (
            window.navigator &&
            window.navigator.msSaveOrOpenBlob
          ) return window.navigator.msSaveOrOpenBlob(blob);

          // For other browsers:
          // Create a link pointing to the ObjectURL containing the blob.
          const link = document.createElement('a');
          link.href = url;
          link.download = getFileName(data.file);
          // this is necessary as link.click() does not work on the latest firefox
          link.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            })
          );

          setTimeout(() => {
            // For Firefox it is necessary to delay revoking the ObjectURL
            window.URL.revokeObjectURL(data);
            link.remove();
          }, 100);

          // return {status:true,message:"Success"}
        }
      }
      setFormSbmt(false)
      setShowContentLoader(false)
    }
  }
  const downloadAllFile = async () => {
    // if (data != null) {
    setFormSbmt(true)
    setShowContentLoader(true)
    let payloadUrl = `${process.env.REACT_APP_API_URL}evidences/downloadVendorEvidence/${templateQuestions.vendor.org_vendor_id}`
    let method = "GET";
    let response = await ApiService.fetchFile(payloadUrl, method);
    let res = await response.arrayBuffer();
    if (res) {
      let contentType = response && response.headers.get('content-type') ? response.headers.get('content-type') : 'application/pdf';
      if (contentType.indexOf('application/json') == -1) {
        var blob = new Blob([res], { type: contentType });
        let url = window.URL.createObjectURL(blob)
        // window.open(url,'_blank')

        if (
          window.navigator &&
          window.navigator.msSaveOrOpenBlob
        ) return window.navigator.msSaveOrOpenBlob(blob);

        // For other browsers:
        // Create a link pointing to the ObjectURL containing the blob.
        const link = document.createElement('a');
        link.href = url;
        link.download = getFileName(`${templateQuestions.vendor.vendor_name}.zip`);
        // this is necessary as link.click() does not work on the latest firefox
        link.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          })
        );

        setTimeout(() => {
          // For Firefox it is necessary to delay revoking the ObjectURL
          // window.URL.revokeObjectURL(data);
          // link.remove();
        }, 100);

        // return {status:true,message:"Success"}
      }
    }
    setFormSbmt(false)
    setShowContentLoader(false)
    // }
  }
  const groupDownload = async (data = null) => {

    let grpKey = `filesGrp${data.gIndex}`
    if (data != null && Object.keys(downloadGrpFilesList).length > 0 && downloadGrpFilesList[grpKey].length > 0) {
      setFormSbmt(true)
      setShowContentLoader(true)
      let payloadUrl = `${process.env.REACT_APP_API_URL}evidences/downloadVendorEvidenceByFiles`
      let method = "POST";
      let formData = {}
      let files = []
      for (let item of downloadGrpFilesList[grpKey]) {
        let file = getFileName(item)
        files.push(file)
      }
      formData["file_array"] = files
      let response = await ApiService.fetchFile(payloadUrl, method, formData);
      let res = await response.arrayBuffer();
      if (res) {
        let contentType = response && response.headers.get('content-type') ? response.headers.get('content-type') : 'application/pdf';
        if (contentType.indexOf('application/json') == -1) {
          var blob = new Blob([res], { type: contentType });
          let url = window.URL.createObjectURL(blob)
          // window.open(url,'_blank')

          if (
            window.navigator &&
            window.navigator.msSaveOrOpenBlob
          ) return window.navigator.msSaveOrOpenBlob(blob);

          // For other browsers:
          // Create a link pointing to the ObjectURL containing the blob.
          const link = document.createElement('a');
          link.href = url;
          link.download = getFileName(`${templateQuestions.vendor.vendor_name}.zip`);
          // this is necessary as link.click() does not work on the latest firefox
          link.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            })
          );

          setTimeout(() => {
            // For Firefox it is necessary to delay revoking the ObjectURL
            window.URL.revokeObjectURL(data);
            link.remove();
          }, 100);

          // return {status:true,message:"Success"}
        }
      }
      setFormSbmt(false)
      setShowContentLoader(false)
    }
  }

  const fileToDownload = (ele, data = null) => {
    if (data == null) {
      return false;
    }
    let obj = Object.assign({}, downloadGrpFilesList)
    let objKey = `filesGrp${data.gIndex}`
    if (!obj[objKey]) {
      obj[objKey] = [];
    }
    if (ele.checked) {
      let filesArr = obj[objKey]
      if (filesArr.indexOf(data.file) == -1) {
        filesArr.push(data.file)
      }
    } else {
      let filesArr = obj[objKey]
      if (filesArr.indexOf(data.file) != -1) {
        let fKey = filesArr.indexOf(data.file)
        filesArr.splice(fKey, 1)
        obj[objKey] = filesArr
      }
    }

    setDownloadGrpFilesList(oldVal => {
      return { ...obj }
    })

  }








  /* Add trigger questionaire functions start */




  const getFileName = (file = null) => {
    if (file == null) {
      return '';
    }
    return (file).substr((file).lastIndexOf('/') + 1)
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


  const toggleAlert = (val) => {
    setShowAlert(val)
  }

  /* Add trigger questionaire functions end */

  const showModal = async (modalName = null, data = null) => {
    if (modalName == null) {
      return false
    }
    // setEvidenceTypeId(null)
    let fileType = null
    switch (modalName) {
      case 'view_documents':
        setFileType(null)
        setViewFile(null)
        if (data != null) {
          // setViewFile(data.file);
          // fileType = (data.file).substr((data.file).lastIndexOf('.') + 1)
          // setFileType(fileType)
          getFileDetails(data)
          setModalType(modalName)
          setShowModal(true)
        }
        break;
    }
  }

  const hideModal = () => {
    setModalType(null)
    setShowModal(false)
  }



  const changeView = (tab = null) => {
    if (tab == null) {
      return false
    }
    setView(tab)
  }


  const evidenceUploadedCount = (group = null) => {
    let count = 0;
    let mandatoryQuestions = 0
    if (group == null) {
      return count
    }
    for (let item of group.questions) {
      if (item.is_mandatory == "Y") {
        mandatoryQuestions += 1
      }
      if (item.files && item.files.length > 0) {
        count += 1
      }
    }
    // if(mandatoryQuestions == count){
    //   count = group.questions.length
    // }

    return count
  }
  // console.log(form)
  // console.log(errors)
  return (
    <>
      {/* Vendor list page start */}
      <div style={{ 'minHeight': 'calc(100vh - 50px)' }}>
        <Header defHeaderTitle={''} />
        <div id={Styles.v_ev_manager_sec} className="container-fluid">
          <div id="vendor_assessment_section" className={`vendor_assessment_section`}>
          <Loader showLoader={showContentLoader} pos={'fixed'} heightClass="h-100"></Loader>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex align-items-center justify-content-between mb-3 ">
                  <div id="va_header_section">
                    <h1 className={`mb-0 ${Styles.vem_header_section}`}>Evidence Manager</h1>
                  </div>
                </div>

              </div>
            </div>

            {/* Vendor questionaire page start */}

            <div id="level1" className="accordion pl-lg-3 pr-lg-3 evidence position-relative level1">
              {/* <Loader showLoader={showContentLoader} pos={'fixed'} heightClass="h-100"></Loader> */}
              <div className="card shadow overflow_unset">
                <div className="d-flex align-items-center">
                  <div className={`card-header bg_07 flex-grow-1 ${Styles.card_header}`}>
                    <div className="w-100 d-flex mb-0 align-items-center justify-content-between  flex-lg-row ">
                      <div className="w-50 mr-2 px-3 py-2 bg-white">
                        {/* <select name="" id="" className="form-control position-relative" onChange={(e) => getVendorQuestionnaires(e.target.value)}>
                          <option value="" selected="">Select Vendor</option>
                          {assessmentList && assessmentList.length > 0 && assessmentList.map((assessment, aIndex) => {
                            return (
                              <option key={aIndex} value={JSON.stringify(assessment)}>{assessment.vendor_name}</option>
                            )
                          })}
                        </select> */}
                        <AirSelect cClass={'vendor_select_box'}
                          cClassPrefix={'vendor_select'}
                          hideOptionOnSelect={false}
                          closeOnSelect={true}
                          changeFn={getVendorQuestionnaires}
                          selectOptions={assessmentList && assessmentList.length > 0 && assessmentList.map((assessment, aIndex) => ({ value: aIndex, label: assessment.vendor_name }))}
                          selected={[]}
                          selectPlaceholder='Select Vendor'
                          multi={false} />
                      </div>
                      <div className="col-auto ml-auto action_item">
                        {/* <a onClick={null} className="btn btn-outline-primary btn-sm w-145 mr-3">Download Report</a> */}
                        <a onClick={() => downloadAllFile()} className={`btn btn-primary-2 btn_03 btn-sm h-28 w-100px ${formSubmitted ? `disabled ${Styles.disabled}` : ''}`}  >Download All</a>
                      </div>
                    </div>
                  </div>

                </div>
                {(() => {
                  if (templateQuestions?.template && templateQuestions?.template.page && templateQuestions?.template.page.length > 0) {
                    return (
                      <div id="cp1" className="card-body " data-parent="#level1" >
                        <div className="bg-white m-0 mb-3 rounded ">
                          <ul id="level2" className={`accordion p-0 list-unstyled level2 ${Styles.level2}`}>
                            {templateQuestions?.template && templateQuestions?.template.page && templateQuestions?.template.page.length > 0 && templateQuestions?.template.page.map((group, gIndex) => {
                              return (
                                <li className="pt-3" key={gIndex}>
                                  <a href={`#a${gIndex}`} data-toggle="collapse" className="collapsed">
                                    {group.group} &nbsp;
                                    <OverlayTrigger
                                      placement={"right"}
                                      overlay={
                                        <Tooltip id={`tooltip-right`}>
                                          {
                                            evidenceUploadedCount(group) == 0
                                              ? `No evidences uploaded`
                                              : (
                                                evidenceUploadedCount(group) == group.questions.length
                                                  ? `All evidences  uploaded`
                                                  : `Partial evidences uploaded`
                                              )
                                          }
                                        </Tooltip>
                                      }
                                    >
                                      <span className={`text-${evidenceUploadedCount(group) == 0 ? 'danger' : (evidenceUploadedCount(group) == group.questions.length ? 'success' : 'warning')}`}><i className="fa fa-circle"></i></span>
                                    </OverlayTrigger>
                                    {/* <span className={`text-${evidenceUploadedCount(group) == 0 ? 'danger' : (evidenceUploadedCount(group) == group.questions.length ? 'success' : 'warning')}`}><i className="fa fa-circle"></i></span> */}
                                  </a>
                                  <div id={`a${gIndex}`} className="collapse" data-parent="#level2" >
                                    <ul id="level3" className={`accordion p-0 list-unstyled level3 ${Styles.level3}`}>
                                      {group.questions && group.questions.length > 0 && group.questions.map((item, qIndex) => {
                                        return (
                                          <li key={qIndex}>
                                            <a href={`#q${gIndex}_${qIndex}`} data-toggle="collapse" className={`collapsed vendorEvi mb-0`}>
                                              <span>{item.question}{item.is_mandatory == "Y" ? <span className="text-danger"> * </span> : ''}
                                                {item.files && item.files.length > 0 && <span className="ml-2 text-success fs-15"><i className="fa fa-check" aria-hidden="true"></i></span>}

                                              </span>

                                            </a>
                                            <div className="ml-auto action_item">
                                              {
                                                item.files.length > 0
                                                  ? <a onClick={() => groupDownload({ gIndex, qIndex })} className={`btn btn-primary-2 btn_03 btn-sm ${formSubmitted ? `disabled ${Styles.disabled}` : ''}`} >Download</a>
                                                  : ''
                                              }

                                            </div>
                                            <div id={`q${gIndex}_${qIndex}`} className="collapse card-body py-2 assessment_Table border-0" data-parent="#level3" >
                                              {(() => {
                                                if (item.files && item.files.length > 0) {
                                                  return (
                                                    <>
                                                      {item.files.map((file, fKey) => {
                                                        return (
                                                          <div key={fKey} className=" d-flex justify-content-between">
                                                            <div className="form-check">

                                                              <label className="form-check-label d-flex align-items-center"><input className="form-check-input" type="checkbox" id="" name="option1" onClick={(e) => fileToDownload(e.target, { gIndex, qIndex, file })} /> <span>{getFileName(file)}</span></label>
                                                            </div>
                                                            <div className="d-flex">
                                                              {/* <a onClick={() => showModal('view_documents', { file })} ><span className="assView"></span></a> */}
                                                              <a onClick={() => showModal('view_documents', { file })} ><span className=""><img className="img-fluid quick_view_icon mr-1 mt-1" src="/assets/img/quick_view.png" /></span></a>
                                                              <a onClick={() => downloadFile({ file })} className={`${formSubmitted ? `disabled ${Styles.disabled}` : ''}`}><span className="assdp"></span></a>
                                                            </div>
                                                          </div>
                                                        )
                                                      })}
                                                    </>
                                                  )
                                                } else {
                                                  return (
                                                    <div className=" d-flex justify-content-center">
                                                      <div className="form-check p-0">
                                                        <label className="form-check-label d-flex align-items-center"><span>No evidence uploaded yet</span></label>
                                                      </div>
                                                    </div>
                                                  )
                                                }
                                              })()}

                                            </div>
                                          </li>
                                        )
                                      })}

                                    </ul>
                                  </div>
                                </li>
                              )
                            })}

                          </ul>
                        </div>
                      </div>
                    )
                  }
                })()}

              </div>
            </div>
            {(() => {
              if (modalType && modalType != '' && modalType != null) {
                if (modalType == 'view_documents') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={{ viewFile: viewFile, fileType: fileType }}
                    formSubmit={() => { }} />
                }
              }
            })()}
            {/* Vendor questionaire page end */}


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


          </div>
        </div>
      </div>
      {/* Vendor list page end */}
    </>
  )
}

export default VendorsEvidenceManager