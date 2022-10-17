import { useForm } from "react-hook-form";
import ApiService from "../../services/ApiServices";
import { SetCookie, GetCookie, encryptData, sortArr, ChangeDateFormat } from "../../helpers/Helper";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Header from "../../components/partials/Header";
import React, { lazy, useContext, useEffect, useRef, useState } from "react";
import { Button, OverlayTrigger, ProgressBar, Tooltip } from "react-bootstrap";
import { LayoutContext } from "../../ContextProviders/LayoutContext";
import AirPagination from "../../elements/AirPagination";
import Styles from "../../styles/VendorsAssessment.module.css"
import AirSelect from "../../elements/AirSelect";
import AIR_MSG from "../../helpers/AirMsgs";
import AirCalender from "../../elements/AirCalender";
import AirVendorModal from "../../elements/AirVendorModal";
import SweetAlert from "react-bootstrap-sweetalert";
import Loader from "../../components/partials/Loader";
import AirPdf from "../../elements/AirPdf";
import { PDFViewer, PDFDownloadLink, pdf } from '@react-pdf/renderer';
import moment from "moment";
// const LayoutContext = lazy(() => import("../ContextProviders/LayoutContext"))


const VendorsAssessment = (props) => {
  // const {setShowLoader} = useContext(LayoutContext)
  // const { user = {} } = useOutletContext()
  const { projectId, setProjectId, user = {}, updateData } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const [view, setView] = useState('assessment_trigger_list')
  const [vendorTemplates, setVendorTemplates] = useState([])
  const [customVendors, setCustomVendors] = useState([])
  const [vendorAssessment, setVendorAssessment] = useState([])
  const [assessmentList, setAssessmentList] = useState(null)
  const [filteredList, setFilteredList] = useState(null)
  const [vendorQuestionnaireStat, setVendorQuestionnaireStat] = useState({})
  const schedulePublishDate = useRef(false);
  const publishDate = useRef();
  const repeatFrequency = useRef(false);
  const frequencyVal = useRef();
  const navigate = useNavigate()

  // const { register, handleSubmit, watch, formState: { errors } } = useForm(); // initialize the hook
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const { register, handleSubmit, resetField, setValue, watch, formState: { errors } } = useForm();
  const form = watch()
  const [formSubmitted, setFormSbmt] = useState(false)
  const [errorMsg, setErrorMsg] = useState(false);
  const [showLoader, setShowLoader] = useState(false)

  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({})
  const [viewFile, setViewFile] = useState(null)
  const [fileType, setFileType] = useState(null)
  const [taskStatFilter, setTaskStatFilter] = useState('all')
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })
  const searchKeyword = useRef()

  // sorting data
  const [activeCol, setActiveCol] = useState('')
  const [activeSortOrder, setActiveSortOrder] = useState('ASC')
  const [viewPdf, setViewPdf] = useState(false)
  const [pdfData, setPdfData] = useState({})
  const [editAssessmentIndex, setEditAssessmentIndex] = useState(null)
  const [modifyAssessment, setModifyAssessment] = useState({})

  const editAssessmentDateInpRef = useRef([])

  useEffect(() => {

    initializeData()
  }, [user])

  const initializeData = () => {
    if (customVendors.length == 0) {
      fetchInfo('vendors_custom')
    }
    if (!assessmentList || assessmentList.length == 0) {
      fetchInfo('assessment_list')
    }
    if (vendorTemplates.length == 0) {
      fetchInfo('vendor_templates')
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
    } else if (type == 'vendors_custom') {
      payloadUrl = `assessment/getVendors/${orgId}/custom`
      method = "GET";
    } else if (type == 'vendor_templates') {
      payloadUrl = `assessment/getTemplates/${orgId}`
      method = "GET";
    }

    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      if (type == 'assessment_list') {
        setAssessmentList(oldVal => {
          return [...res.results]
        })
        setFilteredList(oldVal => {
          return [...res.results]
        })
      } else if (type == 'vendors_custom') {
        setCustomVendors(oldVal => {
          return [...res.results]
        })
      } else if (type == 'vendor_templates') {
        setVendorTemplates(oldVal => {
          return [...res.results]
        })
      }
    }
  }

  const searchFilter = (data = {}) => {
    let { task_status: taskStatus = 'all' } = data
    let listArr = Object.assign([], assessmentList)
    let keyword = searchKeyword?.current?.value || '';
    let tempArr = listArr.filter((vendor, index) => {
      let regexExp = new RegExp(keyword, 'i')
      // console.log(keyword)

      let result =
        setTaskStatFilter(taskStatus)
      if (vendor.vendor_name.search(regexExp) != -1 ||
        vendor.vendor_email.search(regexExp) != -1 ||
        vendor.vendor_category.search(regexExp) != -1 ||
        vendor.vendor_status.search(regexExp) != -1
      ) {
        result = true
        // applying filter on status
        if (taskStatus != "all" && vendor.admin_status != taskStatus) {
          result = false
        }

      } else {
        result = false
      }
      return result
    })
    setFilteredList(oldVal => {
      return [...tempArr]
    })
  }

  /* assessment method start */
  const addTempQuestionnaire = async (data = null) => {
    if (data == null) {
      return false
    }
    data.deadline = ChangeDateFormat(data.deadline, 2, 3);
    // console.log(data)


    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (!data || data.vendor_id == '' || !data.template_id || data.template_id == '' || !data.deadline || data.deadline == '') {
      return false
    };
    data.vendor = customVendors.find((vendor, index) => Number(data.vendor_id) == vendor.org_vendor_id)
    data.template = vendorTemplates.find((template, index) => Number(data.template_id) == template.template_id)
    let tempData = Object.assign([], vendorAssessment)
    tempData.push(data)
    setVendorAssessment(oldVal => {
      return [...tempData]
    })
    // clear field
    setValue("vendor_id")
    setValue("deadline")
    setValue("template_id")

  }
  const addQuestionnaire = async (data = null) => {
    if (vendorAssessment.length == 0) {
      return false
    }
    let count = 0
    for (let data of vendorAssessment) {
      if (!data || data.vendor_id == '' || !data.template_id || data.template_id == '' || !data.deadline || data.deadline == '') {
        // return false
        continue;
      };
      let payloadUrl = `assessment/triggerAssessment`
      let method = "POST";
      let formData = {
        org_id: orgId,
        vendor_id: Number(data.vendor_id) || 0,
        template_id: Number(data.template_id) || 0,
        deadline: data.deadline,
        repeat_survey_frequency: repeatFrequency.current.checked ? Number(frequencyVal.current.value) : 0,
        repeat_survey_unit: repeatFrequency.current.checked ? "month" : "",
        publish_date: schedulePublishDate.current.checked ? publishDate.current.value : "",
      }
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        count += 1
      }
    }
    if (count == vendorAssessment.length) {
      fetchInfo('assessment_list')
      changeView('assessment_trigger_list')
    }




    // if (res && res.message == "Success") {
    //   resetField("vendor_id")
    //   resetField("template_id")
    //   resetField("deadline")
    //   formRes = { status: true, err_status: false, type: "addVendor", error: {}, msg: "" }
    //   setFormRes(formRes)
    //   fetchInfo('vendor_assessment')
    // } else {
    //   formRes['err_status'] = true
    //   formRes['error']['type'] = "addVendor"
    //   formRes['error']['msg'] = ""
    //   setFormRes(formRes)
    // }
    // setTimeout(() => {
    //   formRes = { status: false, err_status: false, error: {} }
    //   setFormRes(formRes)
    // }, 3000);
  }

  const onChangeDate = (startDate = null, endDate = null) => {
    setValue("deadline", startDate)
  }
  const onChangePublishDate = (startDate = null, endDate = null) => {
    // setValue("publish_date", startDate)
    publishDate.current.value = startDate
  }
  const delAssessment = (assessmentIndex = null) => {
    if (assessmentIndex == null) {
      return false
    }
    let tempArr = Object.assign([], vendorAssessment)
    tempArr.splice(assessmentIndex, 1)
    setVendorAssessment(oldVal => {
      return [...tempArr]
    })
  }

  const getVendorQuestionnaire = async (assessment = null) => {
    if (assessment == null) {
      return
    }

    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    let payloadUrl = `assessment/getVendorQuestionnaire/${assessment.unique_guid}`
    let method = "GET";
    // let formData = {org_id: orgId}
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      let vendorQuesStat = res.results[0];
      vendorQuesStat.vendor = assessment
      vendorQuesStat.template = JSON.parse(vendorQuesStat.template)
      setVendorQuestionnaireStat(oldVal => {
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
  /* assessment method end */



  /* Add trigger questionaire functions start */
  const addTriggerQuestionaire = () => {

  }
  const delQuest = () => {

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
      case 'revert_modal':
        if (data != null) {
          setModalData(data)
        }
        setModalType(modalName)
        setShowModal(true)
        break;
      case 'auditors_remark_modal':
        if (data != null) {
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
      case 'remediation_step_modal':
        setShowAlert({ show: false, type: "", message: "" })
        setModalType(modalName)
        setShowModal(true)
        break;
    }
  }

  const getFileName = (file = null) => {
    if (file == null) {
      return '';
    }
    return (file).substr((file).lastIndexOf('/') + 1)
  }

  const hideModal = () => {
    setModalType(null)
    setShowModal(false)
  }

  const onSubmitForm = (modalName = null, data = null) => {
    if (modalName == null || data == null) {
      return false
    }
  }



  const saveRevertNote = async (modalName = null, data = null) => {
    if (!data.revert_comment || data.revert_comment == '') {
      return false;
    }
    let vendQuesStat = Object.assign({}, vendorQuestionnaireStat)
    let template = vendQuesStat.template
    if (template && template.page && template.page[data.groupIndex] && template.page[data.groupIndex].questions[data.questionIndex]) {
      let questionObj = template.page[data.groupIndex].questions[data.questionIndex]
      questionObj.notes = data.revert_comment;
      questionObj.reverted_answer = "N"
      questionObj.is_compliant = ""
      // console.log(vendQuesStat)
      setVendorQuestionnaireStat(oldVal => {
        return { ...vendQuesStat }
      })
      hideModal()
    }

  }
  const onClickRevert = async (modalName = null, data = null) => {

    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)

    let template = vendorQuestionnaireStat.template
    if (template && template.page) {
      let formData = {
        template: btoa(JSON.stringify(template))
      }

      let payloadUrl = `assessment/revertVendorQuestionnaire/${orgId}/${vendorQuestionnaireStat.vendor.org_vendor_id}/${vendorQuestionnaireStat.vendor.unique_guid}`
      let method = "POST";
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "vendorQuest", error: {}, msg: "" }
        setFormRes(formRes)
        setShowAlert({ show: true, type: "success", message: AIR_MSG.stat_assessment_return, redirectToHome: true })
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "vendorQuest"
        formRes['error']['msg'] = ""
        setFormRes(formRes)
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
      }
      setFormSbmt(false)
      setTimeout(() => {
        formRes = { status: false, err_status: false, error: {} }
        setFormRes(formRes)
      }, 3000);
    }

  }

  const onClickFail = async () => {
    setShowAlert({
      show: true,
      type: "confirm",
      message: "Are you sure you want to mark assessment as failed ?",
      confirmFn: showRemediationStepFn,
      confirmFnParams: null,
      cancelFn: toggleAlert,
      cancelFnParams: { show: false, type: '', message: '' },
    })
  }
  const showRemediationStepFn = async () => {
    setShowAlert({
      show: true,
      type: "confirm",
      message: "Do you want to send remediations steps to vendor ?",
      confirmFn: showModal,
      confirmFnParams: "remediation_step_modal",
      cancelFn: failAssesment,
      cancelFnParams: null
    })
  }
  const saveRemediationSteps = async (modalName = null, data = null) => {
    if (data == null) {
      return false
    }
    //  /assessment/addRemediationSteps
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setFormSbmt(true)
    let payloadUrl = `assessment/addRemediationSteps`
    let method = "POST";
    let formData = { org_id: Number(orgId), unique_guid: vendorQuestionnaireStat.vendor.unique_guid, remediation_deadline: moment(data.remediation_date, 'MM-DD-YYYY').format('YYYY-MM-DD'), remediation_steps: btoa(data.remediation_steps) }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      failAssesment()
      return { message: "Success" }
    }

  }



  const failAssesment = async () => {
    setShowAlert({ show: false, type: "", message: "" })
    if (Object.keys(vendorQuestionnaireStat).length == 0) {
      return
    }
    if (vendorQuestionnaireStat?.vendor?.unique_guid) {
      let formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
      setFormSbmt(true)
      let payloadUrl = `assessment/validateAssessment/${vendorQuestionnaireStat.vendor.unique_guid}/failed`
      let method = "GET";
      // let formData = {org_id: orgId}
      let res = await ApiService.fetchData(payloadUrl, method);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "vendorQuest", error: {}, msg: "" }
        setFormRes(formRes)
        setShowAlert({ show: true, type: "success", message: AIR_MSG.stat_assessment_failed, redirectToHome: true })
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "vendorQuest"
        formRes['error']['msg'] = ""
        setFormRes(formRes)
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
      }
      setFormSbmt(false)
      setTimeout(() => {
        formRes = { status: false, err_status: false, error: {} }
        setFormRes(formRes)
      }, 3000);
    }

  }
  const onClickApproved = async () => {
    if (Object.keys(vendorQuestionnaireStat).length == 0) {
      return
    }
    if (vendorQuestionnaireStat?.vendor?.unique_guid) {
      let formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
      setFormSbmt(true)
      let payloadUrl = `assessment/validateAssessment/${vendorQuestionnaireStat.vendor.unique_guid}/approved`
      let method = "GET";
      // let formData = {org_id: orgId}
      let res = await ApiService.fetchData(payloadUrl, method);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "vendorQuest", error: {}, msg: "" }
        setFormRes(formRes)
        setShowAlert({ show: true, type: "success", message: AIR_MSG.stat_assessment_approved, redirectToHome: true })
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "vendorQuest"
        formRes['error']['msg'] = ""
        setFormRes(formRes)
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
      }
      setFormSbmt(false)
      setTimeout(() => {
        formRes = { status: false, err_status: false, error: {} }
        setFormRes(formRes)
      }, 3000);
    }

  }

  const toggleAlert = (val) => {
    setShowAlert(val)
    if (val && val.redirectToHome) {
      fetchInfo('assessment_list')
      changeView('assessment_trigger_list')
    }
  }

  /* Add trigger questionaire functions end */


  /* list funtions start */
  const updateCompliantStatus = async (data = null, status = null) => {
    if (data == null || status == null) {
      return false
    }
    setFormSbmt(true)
    let { gIndex, qIndex } = data
    let vendQuesStat = Object.assign({}, vendorQuestionnaireStat)
    let template = vendQuesStat.template
    if (template && template.page) {
      if (template.page[gIndex] && template.page[gIndex].questions[qIndex]) {
        let questionObj = template.page[gIndex].questions[qIndex]
        questionObj.is_compliant = status == "compliant" ? "Y" : "N";
      }
      let formData = {
        template: btoa(JSON.stringify(template))
      }

      let payloadUrl = `assessment/revertVendorQuestionnaire/${orgId}/${vendorQuestionnaireStat.vendor.org_vendor_id}/${vendorQuestionnaireStat.vendor.unique_guid}`
      let method = "POST";
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        setVendorQuestionnaireStat(oldVal => {
          return { ...vendQuesStat }
        })
        setShowAlert({ show: true, type: "success", message: "Assessment updated successfully", redirectToHome: false })
      } else {
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
      }
      setFormSbmt(false)

    }

  }

  const onClickDelAssessment = async (data = null) => {

    if (data == null) {
      return false
    }
    setShowAlert({ show: true, type: "admin_status_confirmation", message: "Assessment deleted successfully", data })

  }

  const sofDelAssessment = async (data = null) => {
    if (data == null) {
      return false
    }
    setShowAlert({ show: false, type: "", message: "" })
    if (data.unique_guid) {
      let formRes = { status: false, err_status: false, error: {} }
      setFormSbmt(true)
      let payloadUrl = `assessment/validateAssessment/${data.unique_guid}/deleted`
      let method = "GET";
      // let formData = {org_id: orgId}
      let res = await ApiService.fetchData(payloadUrl, method);
      if (res && res.message == "Success") {
        setShowAlert({ show: true, type: "success", message: "Assessment deleted successfully" })
        fetchInfo('assessment_list')
      } else {
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
      }
      setFormSbmt(false)

    }

  }
  /* list fintions end */


  const changeView = (tab = null) => {
    if (tab == null) {
      return false
    }
    setView(tab)
  }

  const sortData = async (column = '', type = '', items = []) => {
    if (column == '' || type == '' || items.length == 0) {
      return false
    }
    let sortOpts = {
      sortBy: column,
      sortOrder: type,
      activeCol: activeCol,
      activeSortOrder: activeSortOrder,
      items: items
    }
    let dataArr = sortArr(sortOpts);
    setFilteredList(dataArr)
    setActiveCol(column)
    setActiveSortOrder(type)
  }

  const invertArr = (arr = null) => {
    if (arr == null) {
      return []
    }

    let tempArr = Object.assign([], arr)
    // console.log("inverse", tempArr.reverse())
    return tempArr.reverse()
  }

  const onClickPdfDownload = async (data = null) => {
    setViewPdf(false)
    if (data == null) {
      return false
    }
    setShowLoader(true)
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    let payloadUrl = `assessment/getVendorQuestionnaire/${data.unique_guid}`
    let method = "GET";
    // let formData = {org_id: orgId}
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      let vendorQuesStat = res.results[0];
      vendorQuesStat.vendor = data
      vendorQuesStat.template = JSON.parse(vendorQuesStat.template)
      setPdfData(oldVal => {
        return { ...vendorQuesStat }
      })
      // setViewPdf(true)
      const blob = await pdf(<AirPdf {...vendorQuesStat} />).toBlob()
      downloadPdf(blob, `Vendor Risk Assessment Report-${vendorQuesStat.vendor.vendor_name}.pdf`)
    }
    setShowLoader(false)
  }

  const downloadPdf = (blob = null, filename = "") => {
    if (blob == null || filename == '') {
      return false
    }
    const link = document.createElement('a');
    // create a blobURI pointing to our Blob
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    // some browser needs the anchor to be in the doc
    document.body.append(link);
    link.click();
    link.remove();
    // in case the Blob uses a lot of memory
    setTimeout(() => URL.revokeObjectURL(link.href), 3000);
  }

  const AssessmentResubmission = async (val = "", data = null) => {
    if (val == "" || data == null) {
      return false
    }
    setShowAlert({ show: false, type: "", message: "" })
    if (data.unique_guid) {
      let formRes = { status: false, err_status: false, error: {} }
      setFormSbmt(true)
      let payloadUrl = `assessment/resubmission/${data.unique_guid}/${val}`
      let method = "GET";
      // let formData = {org_id: orgId}
      let res = await ApiService.fetchData(payloadUrl, method);
      if (res && res.message == "Success") {
        setShowAlert({ show: true, type: "success", message: `Assessment Re-submission request ${val} successfully` })
        fetchInfo('assessment_list')
      } else {
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
      }
      setFormSbmt(false)

    }
  }

  const editVendorAssessment = async (index = null) => {
    if (index == null) {
      return false
    }
    let assessment = filteredList[index] ? filteredList[index] : false;
    if (assessment) {
      setEditAssessmentIndex(index)
      setModifyAssessment(oldVal => {
        return { ...assessment }
      })
    }
  }

  const updateAssessmenExpDate = (startDate = null, endDate = null) => {
    if(editAssessmentDateInpRef.current && editAssessmentDateInpRef.current[editAssessmentIndex]){
      editAssessmentDateInpRef.current[editAssessmentIndex].value = moment(startDate, 'YYYY-MM-DD').format('MMM DD, YYYY') 
    }
  }

  const updateAssessment = async (index = null, data = null, standard = false) => {
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (index == null) {
      return false
    }
    let assessment = filteredList[index] || false
    if (assessment) {
      let payloadUrl = `assessment/editAssessment/${assessment.unique_guid}`
      let method = "POST";

      let formData = {}
      if (editAssessmentDateInpRef && editAssessmentDateInpRef.current[index] && editAssessmentDateInpRef.current[index].value) {
        formData.deadline = moment(editAssessmentDateInpRef.current[index].value, 'MMM DD, YYYY').format('YYYY-MM-DD') 
      }

      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "updateAssessment", error: {}, msg: "" }
        setFormRes(formRes)
        setEditAssessmentIndex(null)
        setModifyAssessment({})
        fetchInfo('assessment_list')
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "updateAssessment"
        formRes['error']['msg'] = ""

        setFormRes(formRes)
      }
      setTimeout(() => {
        formRes = { status: false, err_status: false, error: {} }
        setFormRes(formRes)
      }, 3000);
    }


  }

  const saveAuditorsRemark = async (modalName = null, data = null) => {
    let result = false
    if (!data.auditors_remark || data.auditors_remark == '') {
      return result;
    }
    setFormSbmt(true)
    let vendQuesStat = Object.assign({}, vendorQuestionnaireStat)
    let template = vendQuesStat.template
    if (template && template.page && template.page[data.groupIndex] && template.page[data.groupIndex].questions[data.questionIndex]) {
      let questionObj = template.page[data.groupIndex].questions[data.questionIndex]
      questionObj.auditor_notes = data.auditors_remark;
      // questionObj.reverted_answer = "N"
      // questionObj.is_compliant = ""
      let formData = {
        template: btoa(JSON.stringify(template))
      }
      let payloadUrl = `assessment/revertVendorQuestionnaire/${orgId}/${vendorQuestionnaireStat.vendor.org_vendor_id}/${vendorQuestionnaireStat.vendor.unique_guid}`
      let method = "POST";
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        setVendorQuestionnaireStat(oldVal => {
          return { ...vendQuesStat }
        })
        setShowAlert({ show: true, type: "success", message: "Auditor Remarks updated successfully", redirectToHome: false })
        result = {message:"Success"}
        setFormSbmt(false)
        return result
      } else {
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
        setFormSbmt(false)
        return result
      }
    }
    return result
  }

  // console.log(form)
  // console.log(errors)
  return (
    <>
      {/* Vendor list page start */}
      <div style={{ 'minHeight': 'calc(100vh - 50px)' }}>
        <Header defHeaderTitle={''} />
        <div id={Styles.v_assessment_sec} className="container-fluid">
          <div id="vendor_assessment_section" className={`vendor_assessment_section v_assessment_sec`}>
            {showLoader && <Loader showLoader={showLoader} pos={'fixed'} lClass={"cus_loader_fixed_1"}></Loader>}
            {/* <Loader showLoader={true} pos={'fixed'} lClass={"cus_loader_fixed_1"}></Loader> */}

            {(() => {
              if (view == 'assessment_trigger') {
                return (
                  <>
                    <div className="trigger_assessment_block mt-3">
                      <div className="row">
                        <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3 mb-2">

                          <div id="accordion" className="accordion accordianSec">

                            <div className="card ">
                              <div className="d-flex align-items-center">
                                <div className={`card-header flex-grow-1 p-4 ${Styles.card_header}`} >
                                  <a className="card-title">
                                    Send Assessment
                                  </a>
                                </div>
                                <div className="ml-auto action_item">
                                  <a onClick={() => addQuestionnaire(vendorAssessment)} className="btn btn-primary-2 btn_03 btn-sm" aria-disabled={formSubmitted}>Send</a>
                                </div>
                              </div>
                              <div id="cp2" className="card-body p-0  collapse show bg_07"  >
                                <div className="p-lg-2 mb-lg-3 p-2 mt-0 mb-3 ml-3 mr-3  bg-white rounded triggerResult">
                                  <form className={`vendor_custom_form2 ${Styles.vendor_custom_form2}`} onSubmit={handleSubmit(addTempQuestionnaire)} autoComplete="off">
                                    <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                                      <div className="w-100 mr-2">
                                        <select defaultValue="" className="form-control" {...register('vendor_id', { required: true })}>
                                          <option value="">Select Vendors</option>
                                          {customVendors && customVendors.length > 0 && customVendors.map((vendor, vIndex) => {
                                            return <option key={vIndex} value={vendor.org_vendor_id}>{vendor.vendor_name}</option>
                                          })}
                                        </select>
                                      </div>
                                      <div className="w-100 mr-2 d-flex align-items-center">

                                        <AirCalender dateFormat="MM-DD-YYYY" type="date" aClassName="" changeFn={onChangeDate} autoApply={true} setCurrentDate={true}>
                                          <div className="date_box w-100 mr-2 d-flex align-items-center triggerDate">
                                            <input type="text" className="form-control " {...register('deadline', { required: true })} name="date" placeholder="Select Deadline" autoComplete="off" />
                                            <i className="fa fa-calendar position-static"></i>
                                          </div>
                                        </AirCalender>
                                      </div>
                                      <div className="w-100 mr-2">
                                        <select defaultValue="" className="form-control" {...register('template_id', { required: true })}>
                                          <option value="">Select Questionnaire</option>
                                          {vendorTemplates && vendorTemplates.length > 0 && vendorTemplates.map((template, tIndex) => {
                                            return <option key={tIndex} value={template.template_id}>{template.template_name}</option>
                                          })}
                                        </select>
                                      </div>
                                      <div >
                                        <button type="submit" className="bg-transparent border-0">
                                          <a onClick={null} className="info btn_03"> <img src="/assets/img/plus.svg" alt="" className="plus" /> </a>
                                        </button>
                                      </div>

                                    </div>
                                  </form>
                                </div>
                                {(() => {
                                  if (vendorAssessment.length > 0) {
                                    return (
                                      <>
                                        <div className="search_result bg-white ">
                                          {vendorAssessment && vendorAssessment.length > 0 && vendorAssessment.map((assessment, aIndex) => {
                                            return (
                                              <div key={aIndex} className=" px-4">
                                                <div className="flex-grow-1 ml-lg-3 ml-md-0  d-flex flex-column"><span className="themeBlc fw-600">{assessment.vendor?.vendor_name}</span>
                                                  <span className="gLbl">{assessment.template?.template_name}</span></div>
                                                <div>{assessment.deadline} </div>
                                                <div className="mr-lg-auto">
                                                  <a onClick={() => delAssessment(aIndex)}> <img src="/assets/img/gbl.gif" alt="" className="cls" />  </a>
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </>
                                    )
                                  }
                                })()}

                              </div>
                            </div>
                          </div>

                        </div>
                        {/* <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3 fixedBottom"> */}
                        <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
                          <div className="d-flex  align-items-end  my-2 w-100 ">
                            <div className="w-100">
                              {/* <div className="form-check d-flex align-items-center">
                                <label className="form-check-label gLbl">
                                  <input type="checkbox" className="form-check-input" ref={schedulePublishDate} {...register("schedulePublishDate")} />Schedule publishing on specific date and time
                                </label>
                                {(() => {
                                  if (form.schedulePublishDate) {
                                    return (
                                      <div className="d-inline-block pl-3">
                                        <AirCalender type="date" aClassName="" changeFn={onChangePublishDate} >
                                          <div className="date_box w-100 mr-2 d-flex align-items-center triggerDate">
                                            <input type="text" className="form-control " ref={publishDate} name="date" placeholder="Select publish date" autoComplete="off" />
                                            <i className="fa fa-calendar position-static"></i>
                                          </div>
                                        </AirCalender>
                                      </div>
                                    )
                                  }
                                })()}
                              </div> */}
                              <div className="form-check">
                                <label className="form-check-label d-flex gLbl">
                                  <input type="checkbox" className="form-check-input" ref={repeatFrequency} />Repeat Survey every
                                  <select name="" id="" className="form-control gLbl w-auto shortdbox" ref={frequencyVal}>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                    <option value="9">9</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                  </select> months
                                </label>
                              </div>
                            </div>


                          </div>
                        </div>
                      </div>
                    </div>
                  </>

                )
              } else if (view == 'assessment_trigger_list') {
                return (
                  <>
                    <div className="vendor_assessment_list">
                      <div className="row">
                        <div className="col-md-12 p-0">
                          <div className="align-items-center d-flex justify-content-between aDm_navigation px-lg-3 border-0">
                            <div className="userProfile">
                              <h6 className="mr-0 fs-18">Assessment Status</h6>
                            </div>
                            <div>
                              <div className="align-items-center d-flex justify-content-between my-3">
                                <div className="d-flex">
                                  {(() => {
                                    if (filteredList) {
                                      return (
                                        <ul className="pagination mb-0  filterview filtersm_view">
                                          <li className={`page-item ${taskStatFilter == 'all' ? 'active' : ''}`}><a onClick={() => searchFilter({ task_status: 'all' })} className={`page-link`}>All Vendors</a></li>
                                          <li className={`page-item ${taskStatFilter == 'pending' ? 'active' : ''}`}><a onClick={() => searchFilter({ task_status: 'pending' })} className={`page-link`}>Pending</a></li>
                                          <li className={`page-item ${taskStatFilter == 'approved' ? 'active' : ''}`}><a onClick={() => searchFilter({ task_status: 'approved' })} className={`page-link`}>Approved</a></li>
                                          {/* <li className={`page-item ${taskStatFilter == 'reverted' ? 'active' : ''}`}><a onClick={() => searchFilter({task_status: 'reverted'})} className={`page-link`}>Reverted</a></li> */}
                                          <li className={`page-item ${taskStatFilter == 'failed' ? 'active' : ''}`}><a onClick={() => searchFilter({ task_status: 'failed' })} className={`page-link`}>Failed</a></li>
                                        </ul>
                                      )
                                    }
                                  })()}

                                  <a onClick={() => changeView('assessment_trigger')} className={`btn btn-primary-2 btn_05 ml-2 ${Styles.newTrigger}`}>Send Assessment</a>
                                </div>

                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {(() => {
                        if (filteredList && filteredList.length > 0) {
                          return (
                            <>
                              <div className="row">
                                <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3 mb-2">
                                  <div className="mainSearchbar mb-2">
                                    <div className="flex-grow-1 position-static">
                                      <div className="input-group">
                                        <div className="input-group-prepend">
                                          <span className="input-group-text bg-transparent border-0 srchInput"><img src="/assets/img/gbl.gif" alt="" /></span>
                                        </div>
                                        <input type="text" name="" placeholder="Search for vendor Name, Email ID" className="form-control border-0 pl-0 fs-14" ref={searchKeyword} onChange={() => searchFilter()} />
                                      </div>
                                    </div>
                                    <div className="invisible">
                                      <input type="text" className="form-control border-0" name="date" placeholder="Select Date" />
                                      <i className="fa fa-calendar"></i>
                                    </div>
                                  </div>

                                  <div className={`table-responsive card assessment_Table fc-scroller ${Styles.fc_scroller} ${Styles.assessment_Table}`}>
                                    <div className="card-body p-0">
                                      <table className="table mb-0">
                                        <thead>
                                          <tr>
                                            <th><a onClick={() => sortData('vendor_name', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', filteredList)} className="sort-by link_url">Vendor Name</a></th>
                                            <th><a onClick={() => sortData('vendor_category', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', filteredList)} className="sort-by link_url">Category</a></th>
                                            <th><a onClick={() => sortData('vendor_email', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', filteredList)} className="sort-by link_url">Email</a></th>
                                            <th><a onClick={() => sortData('triggered_on', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', filteredList)} className="sort-by link_url">Triggered</a></th>
                                            <th><a onClick={() => sortData('expires_on', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', filteredList)} className="sort-by link_url">Expires</a></th>
                                            <th>
                                              <a onClick={() => sortData('admin_status', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', filteredList)} className="sort-by link_url">
                                                Status
                                                <OverlayTrigger
                                                  key={"right"}
                                                  placement={"right"}
                                                  overlay={
                                                    <Tooltip id={`tooltip-right`}>
                                                      <div className="text-left fs-11">
                                                        Admin Status :<br />
                                                        1. Pending - No action from admin yet<br />
                                                        2. Approved - Admin marked assessment as approved<br />
                                                        3. Failed -  Admin marked assessment as failed<br />
                                                        4. Deleted -  Admin marked assessment as deleted<br />
                                                      </div>
                                                      {/* Tooltip for <strong>Admin Status</strong>. */}
                                                    </Tooltip>
                                                  }
                                                >
                                                  <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                                                </OverlayTrigger>
                                              </a>
                                            </th>
                                            <th>
                                              <a onClick={() => sortData('vendor_status', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', filteredList)} className="sort-by link_url">
                                                Assessment
                                                <OverlayTrigger
                                                  key={"right"}
                                                  placement={"right"}
                                                  overlay={
                                                    <Tooltip id={`tooltip-right`}>
                                                      <div className="text-left fs-11">
                                                        Assessment Status :<br />
                                                        1. Pending - Vendor is yet to check the assessment<br />
                                                        2. Draft - Vendor checked the assessment and saved partial information<br />
                                                        3. Complete - Vendor completed the assessment<br />
                                                        4. Returned - Admin has returned the assessment for some more information<br />
                                                        5. Request - Vendor has sent a request for assessment resubmission<br />
                                                      </div>
                                                      {/* Tooltip for <strong>Accessment status</strong>. */}
                                                    </Tooltip>
                                                  }
                                                >
                                                  <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                                                </OverlayTrigger>
                                              </a>
                                            </th>
                                            <th><a onClick={() => sortData('score', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', filteredList)} className="sort-by link_url">Score</a></th>
                                            <th><a onClick={() => null} className="sort-by link_url">Action</a></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {filteredList && filteredList.length > 0 && filteredList.map((item, alIndex) => {
                                            return (
                                              <tr key={alIndex}>
                                                <td className="themeBlc"><span onClick={() => getVendorQuestionnaire(item)} className="link_url text_underline">{item.vendor_name}</span></td>
                                                <td>{item.vendor_category}</td>
                                                <td>{item.vendor_email}</td>
                                                <td>{item.triggered_on}</td>
                                                {(() => {
                                                  if (editAssessmentIndex == alIndex) {
                                                    return (
                                                      <td>
                                                        <AirCalender type="date" aClassName="" markDate={item.expires_on} changeFn={updateAssessmenExpDate} autoApply={true} setCurrentDate={true} showOldDate={true}>
                                                        <div className="date_box w85 d-flex align-items-center triggerDate">
                                                          <input className="form-control pl-0" defaultValue={item.expires_on} ref={el => (editAssessmentDateInpRef.current[`${alIndex}`] = el)} />
                                                          </div>

                                                        </AirCalender>
                                                        {/* <AirCalender dateFormat="MM-DD-YYYY" type="date" aClassName="" changeFn={onChangeDate} autoApply={true}>
                                                          <div className="date_box w-100 mr-2 d-flex align-items-center triggerDate">
                                                            <input type="text" className="form-control " {...register('deadline', { required: true })} name="date" placeholder="Select Deadline" autoComplete="off" />
                                                            <i className="fa fa-calendar position-static"></i>
                                                          </div>
                                                        </AirCalender> */}
                                                        {/* <input className="form-control w-auto pl-0" ref={el => (editAssessmentDateInpRef.current[`${alIndex}`] = el)} /> */}
                                                      </td>
                                                    )
                                                  } else {
                                                    return (
                                                      <td>{item.expires_on}</td>
                                                    )
                                                  }
                                                })()}
                                                {/* <td>{item.expires_on}</td> */}
                                                <td className="text-capitalize"><span className={`p-1 badge badge-${item.admin_status === "pending" ? "warning bg_color_5" : (item.admin_status === "failed" ? "danger bg_color_4" : item.admin_status === "deleted" ? "danger bg_color_4" : "success bg_color_7")}`}>{item.admin_status}</span></td>
                                                {/* <td className={`text-capitalize ${item.vendor_status === "pending" ? "text-warning" : item.vendor_status === "draft" ? "text_color_5" : item.vendor_status === "reverted" ? "text_color_6": item.vendor_status === "failed"? "text-danger": "text-success"}`}>{item.vendor_status}</td> */}
                                                <td className={`text-capitalize`}><span className={`p-1 badge badge-${item.vendor_status === "pending" ? "warning bg_color_5" : item.vendor_status === "draft" ? "primary bg_color_6" : item.vendor_status === "returned" ? "danger bg_color_4" : item.vendor_status === "failed" ? "danger bg_color_4" : item.vendor_status === "request" ? "success bg_04" : "success bg_color_7"}`}>{item.vendor_status}</span></td>
                                                <td>{item.score}%</td>
                                                <td>
                                                  <div className="d-flex align-items-center">
                                                    {/* <span onClick={() => getVendorQuestionnaire(item)} className="assView link_url text_color_2"></span> */}
                                                    {
                                                      editAssessmentIndex == alIndex
                                                        ? <span className="edit text-success link_url mr-2" onClick={() => updateAssessment(alIndex)}><i className="fa fa-check"></i></span>
                                                        : <span className="edit link_url mr-2" onClick={() => editVendorAssessment(alIndex)}><i className="fa fa-pencil fs-14"></i></span>
                                                    }


                                                    <span onClick={() => getVendorQuestionnaire(item)} className="link_url text_color_2 mr-2"><img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon" /></span>
                                                    <span onClick={() => onClickPdfDownload(item)} className="link_url text_color_2 pt-1 mr-2"><i className="fa fa-cloud-download"></i></span>
                                                    <span onClick={() => onClickDelAssessment(item)} className="link_url delete text-danger pt-1"><i className="fa fa-trash"></i></span>
                                                    {
                                                      item.vendor_status === "request"
                                                        ? (
                                                          <>
                                                            <OverlayTrigger
                                                              placement={"top"}
                                                              overlay={
                                                                <Tooltip id={`tooltip-right`}>
                                                                  <div className="text-left fs-11"> Accept Re-submission request</div>
                                                                </Tooltip>
                                                              }
                                                            >
                                                              <span onClick={() => AssessmentResubmission("approved", item)} className="link_url text-success ml-2 pt-1 mr-2"><i className="fa fa-check-circle-o"></i></span>
                                                            </OverlayTrigger>
                                                            <OverlayTrigger
                                                              placement={"top"}
                                                              overlay={
                                                                <Tooltip id={`tooltip-right`}>
                                                                  <div className="text-left fs-11"> Reject Re-submission request</div>
                                                                </Tooltip>
                                                              }
                                                            >
                                                              <span onClick={() => AssessmentResubmission("declined", item)} className="link_url text-danger pt-1"><i className="fa fa-times-circle-o"></i></span>
                                                            </OverlayTrigger>
                                                          </>
                                                        ) : ""
                                                    }
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

                                {/* {(() => {
                                  if (filteredList && filteredList.length > 0 && false) {
                                    return (
                                      <div className="pagination_sec">
                                        <AirPagination layout={1}
                                          totalPages={10}
                                          currentPage={1}
                                          showAllPages={true}
                                          showPrevNextBtn={true}
                                          disablePages={[]}
                                          cClass='' />
                                      </div>
                                    )
                                  }
                                })()} */}
                                {(() => {
                                  if (filteredList && filteredList.length > 0 && false) {
                                    return (
                                      <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3 fixedBottom">
                                        <div className="d-flex justify-content-between align-items-end row-cols-3 my-2 w-100 ">
                                          <div>
                                            <select name="" id="" className="form-control gLbl w-auto">
                                              <option value="10">10</option>
                                              <option value="20">20</option>
                                              <option value="30">30</option>
                                              <option value="40">40</option>
                                            </select>
                                          </div>
                                          <div >
                                            <ul className="pagination justify-content-center gLbl mb-0">
                                              <li><a href="#" className="page-link bg-transparent border-0"><i className="fa fa-angle-double-left" aria-hidden="true"></i></a></li>
                                              <li><a href="#" className="page-link bg-transparent border-0"><i className="fa fa-angle-left" aria-hidden="true"></i></a></li>
                                              <li><a href="#" className="page-link bg-transparent border-0 themeBlc">1</a></li>
                                              <li><a href="#" className="page-link bg-transparent border-0"><i className="fa fa-angle-right" aria-hidden="true"></i></a></li>
                                              <li><a href="#" className="page-link bg-transparent border-0"><i className="fa fa-angle-double-right" aria-hidden="true"></i></a></li>
                                            </ul>
                                          </div>
                                          <div className="d-flex justify-content-end">
                                            <p className="mb-0 gLbl">Showing 01 to 03 of 03 entries</p></div>

                                        </div>
                                      </div>
                                    )
                                  }
                                })()}

                              </div>
                            </>
                          )
                        }
                        if (filteredList == null) {
                          return (
                            <>
                              <div className="row">
                                <div className="col-md-12">
                                  <div className="no_data_section">
                                    <Loader showLoader={true} pos={'relative'}></Loader>
                                    {/* <div className="d-flex align-items-center justify-content-center">
                                      <div className="no_data_block">
                                        <img className="img-fluid" src="/assets/img/page_not_found.png" />
                                      </div>
                                    </div> */}
                                  </div>
                                </div>
                              </div>
                            </>
                          )
                        }
                      })()}

                    </div>
                  </>
                )
              } else if (view == 'view_questionnnaire') {
                return (
                  <>
                    {/* Vendor questionaire page start */}
                    <div className="container-fluid">
                      {(() => {
                        ;
                        if (vendorQuestionnaireStat && vendorQuestionnaireStat?.template) {
                          return (
                            <>
                              <div id="vendor_assessment_section">
                                <div className="row">
                                  <div className="col-md-12">
                                    <div id="va_header_section" className="mb-3" >
                                      <h1>{vendorQuestionnaireStat?.vendor?.vendor_name}</h1>
                                    </div>
                                    <div className="mt-3 mb-4">
                                      {
                                        vendorQuestionnaireStat.expire_in > 0
                                          ? <div className="text-right text_color_2 mb-2"><span>Expires in {vendorQuestionnaireStat.expire_in} days</span></div>
                                          : <div className="text-right text-danger mb-2"><span>Expired</span></div>
                                      }

                                      {
                                        Number(vendorQuestionnaireStat.completion_pct || 50) === 0
                                          ? <ProgressBar className="justify-content-center align-items-center fw-500">0%</ProgressBar>
                                          : <ProgressBar variant="success" now={Number(vendorQuestionnaireStat.completion_pct || 50)} label={`${Number(vendorQuestionnaireStat.completion_pct || 50)}%`} />
                                      }
                                    </div>
                                  </div>
                                </div>
                                <div id="accordion" className="accordion accordianSec">
                                  {vendorQuestionnaireStat?.template.page && vendorQuestionnaireStat?.template.page.length > 0 && vendorQuestionnaireStat?.template.page.map((group, gIndex) => {
                                    return (
                                      <>
                                        {group.questions && group.questions.length > 0 && group.questions.map((item, qIndex) => {
                                          return (
                                            <div key={qIndex} className="card">
                                              <div className="d-flex align-items-center">
                                                <div id={`vat_${gIndex}_${qIndex}`} className={`card-header flex-grow-1 collapsed ${Styles.card_header}`} data-toggle="collapse" href={`#vap_${gIndex}_${qIndex}`} aria-expanded="true">
                                                  <a onClick={null} className="card-title w-100 d-flex align-items-center">
                                                    <span className={`${Styles.assessment_title}`}>{item.question}</span>
                                                    {
                                                      item.is_complete == "Y"
                                                        ? <span className={`complete_check d-inline-block ml-auto ${Styles.complete_check}`}><i className="fa fa-check-circle"></i></span>
                                                        : ''
                                                    }
                                                  </a>
                                                </div>

                                              </div>
                                              <div id={`vap_${gIndex}_${qIndex}`} className="card-body p-0 collapse" data-parent="#accordion">

                                                <div className={`px-3 py-2 bg-white rounded`}>
                                                  <div className="accordian_box pl-3 fs-14 text-dark">
                                                    {/* <p className="m-0 mb-2">{item.question}</p> */}
                                                    <div className="m-0 my-2">
                                                      {(() => {
                                                        if (item.fields && item.fields.length > 0) {
                                                          return (
                                                            <>
                                                              <div className="d-flex justify-content-between w-25">
                                                                {
                                                                  invertArr(item.fields)[0] && invertArr(item.fields)[0]?.type == "radio"
                                                                    ? <p className=""><span className="fw-600"> Answer: </span>  <span>{invertArr(item.fields)[0]?.value}</span></p>
                                                                    : ''
                                                                }
                                                                {
                                                                  invertArr(item.fields)[1] && invertArr(item.fields)[1]?.type == "date"
                                                                    ? <p className="="><span className="fw-600"> {invertArr(item.fields)[1].label.toLowerCase() == 'select date' ? 'Date :' : invertArr(item.fields)[1].label}</span>  <span>{invertArr(item.fields)[1]?.value}</span></p>
                                                                    : ''
                                                                }
                                                              </div>

                                                            </>
                                                          )
                                                        }
                                                      })()}

                                                      {item.fields && item.fields.length > 0 && invertArr(item.fields).map((field, fieldKey) => {
                                                        if (fieldKey > 2) {
                                                          return (
                                                            <p key={fieldKey} className="m-0">
                                                              <span> {(field.label)}</span> : <span>{field.value}</span>
                                                            </p>
                                                          )
                                                        }
                                                      })}
                                                    </div>

                                                    {(() => {
                                                      if (item.files && item.files.length > 0) {
                                                        return (
                                                          <>
                                                            <div className="doc_req_box">
                                                              <p className="m-0 mb-2 fw-600">Evidences : </p>
                                                              <ul className="m-0 pl-3">
                                                                {item.files.map((file, fIndex) => {
                                                                  return (
                                                                    <li key={fIndex}>
                                                                      <p className="d-flex align-items-center justify-content-between">
                                                                        <div>{getFileName(file)}</div>
                                                                        <div>
                                                                          {/* <span className="mr-2 link_url" onClick={() => showModal('view_documents', { file })}> <i className="fa fa-eye"></i> </span> */}
                                                                          <span className="mr-2 link_url" onClick={() => showModal('view_documents', { file })}> <img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon" /> </span>
                                                                        </div>
                                                                      </p>
                                                                    </li>
                                                                  )
                                                                })}
                                                              </ul>
                                                            </div>
                                                          </>

                                                        )
                                                      } else {
                                                        return <p className="m-0 mb-2">No Evidences uploaded yet!</p>
                                                      }
                                                    })()}

                                                    {(() => {
                                                      if (item.fields && item.fields.length > 0) {
                                                        return (
                                                          <>
                                                            <div className="d-flex justify-content-between">

                                                              {
                                                                invertArr(item.fields)[item.fields.length - 1] && invertArr(item.fields)[item.fields.length - 1].type == "text"
                                                                  ? <p className=""><span className="fw-600"> {invertArr(item.fields)[item.fields.length - 1].label} : </span><br />  <span>{invertArr(item.fields)[item.fields.length - 1]?.value}</span></p>
                                                                  : ''
                                                              }
                                                            </div>

                                                          </>
                                                        )
                                                      }
                                                    })()}
                                                    {item.is_compliant &&
                                                      <p className="">
                                                        <span className="fw-600">Complaint:</span>
                                                        <span className="fw-400">
                                                          {
                                                            item.is_compliant == "Y"
                                                              ? <i className="fa fa-check text-success ml-2 fs-17" aria-hidden="true"></i>
                                                              : <i className="fa fa-times text-danger ml-2 fs-17" aria-hidden="true"></i>
                                                          }
                                                        </span>
                                                      </p>
                                                    }
                                                    <div className="d-flex justify-content-end">
                                                    <div className="control_button_block">
                                                        <Button className="btn_1 mr-2" onClick={() => showModal('auditors_remark_modal', { gIndex, qIndex })} variant="outline-dark" disabled={formSubmitted}>Auditor Remarks</Button>
                                                      </div>
                                                      <div className="control_button_block">
                                                        <Button className={`${item.is_compliant && item.is_compliant == "Y" ? 'btn-primary-2' : 'btn_1'} mr-2`} variant={`${item.is_compliant && item.is_compliant == "Y" ? 'success' : 'outline-dark'}`} disabled={formSubmitted} onClick={() => updateCompliantStatus({ gIndex, qIndex }, 'compliant')}>Compliant</Button>
                                                      </div>
                                                      <div className="control_button_block">
                                                        <Button className={`${item.is_compliant && item.is_compliant == "N" ? 'btn-primary-2' : 'btn_1'} mr-2`} variant={`${item.is_compliant && item.is_compliant == "N" ? 'danger' : 'outline-dark'}`} disabled={formSubmitted} onClick={() => updateCompliantStatus({ gIndex, qIndex }, 'not_compliant')}>Not Compliant</Button>
                                                      </div>
                                                      <div className="control_button_block">
                                                        <Button className="btn_custom" onClick={() => showModal('revert_modal', { gIndex, qIndex })} variant="warning" disabled={formSubmitted}>Return</Button>
                                                      </div>
                                                    </div>
                                                  </div>

                                                </div>
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </>
                                    )
                                  })}
                                </div>
                              </div>
                              <div className="d-flex align-items-center justify-content-end">
                                <div>
                                  <div className="control_button_block">
                                    {/* <Button className="btn_custom btn_wide" onClick={() => failAssesment()} variant="danger" disabled={formSubmitted}>Fail</Button> */}
                                    <Button className="btn_custom btn_wide" onClick={() => onClickFail()} variant="danger" disabled={formSubmitted}>Fail</Button>
                                  </div>
                                </div>
                                <div className="d-flex">
                                  <div className="control_button_block pl-3">
                                    <Button className="btn_custom btn_wide" onClick={() => onClickRevert()} variant="warning" disabled={formSubmitted}>Return</Button>
                                  </div>
                                  <div className="control_button_block pl-3">
                                    <Button className="btn_custom btn_wide" onClick={() => onClickApproved()} variant="success" disabled={formSubmitted}>Approve</Button>
                                  </div>
                                </div>

                              </div>
                            </>
                          )
                        }
                      })()}
                    </div>
                    {/* Vendor questionaire page end */}
                  </>
                )
              }
            })()}

            {(() => {
              if (modalType && modalType != '' && modalType != null) {
                if (modalType == 'revert_modal') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={modalData}
                    formSubmit={saveRevertNote} />
                } else if (modalType == 'auditors_remark_modal') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={modalData}
                    formSubmit={saveAuditorsRemark} />
                } else if (modalType == 'view_documents') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={{ viewFile: viewFile, fileType: fileType }}
                    formSubmit={() => { }} />
                } else if (modalType == 'remediation_step_modal') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={{}}
                    formSubmit={saveRemediationSteps} />
                }

              }
            })()}

            {(() => {
              if (showAlert && showAlert.show && showAlert.type == "admin_status_confirmation") {
                return (
                  <SweetAlert
                    danger
                    showCancel
                    confirmBtnText="Delete"
                    title="Are you sure you want delete the Assessment ?"
                    onConfirm={() => sofDelAssessment(showAlert.data)}
                    confirmBtnCssClass={'btn_wide btn_05'}
                    cancelBtnCssClass={'btn_1 btn_wide'}
                    onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
                    focusCancelBtn
                  >
                  </SweetAlert>
                )
              } else if (showAlert && showAlert.show && showAlert.type == "confirm") {
                return (
                  // <SweetAlert
                  //   info
                  //   showCancel
                  //   confirmBtnText="Yes"
                  //   title="Do you want to send remediations steps to vendor ?"
                  //   onConfirm={() => showModal("remediation_step_modal")}
                  //   confirmBtnCssClass={'btn_wide btn_05'}
                  //   cancelBtnCssClass={'btn_1 btn_wide'}
                  //   onCancel={() => failAssesment()}
                  //   focusCancelBtn
                  // >
                  // </SweetAlert>
                  <SweetAlert
                    info
                    showCancel
                    confirmBtnText="Yes"
                    title={showAlert.message}
                    onConfirm={() => showAlert.confirmFn(showAlert.confirmFnParams)}
                    confirmBtnCssClass={'btn_wide btn_05'}
                    cancelBtnCssClass={'btn_1 btn_wide'}
                    onCancel={() => showAlert.cancelFn(showAlert.cancelFnParams)}
                    focusCancelBtn
                  >
                  </SweetAlert>
                )
              } else if (showAlert && showAlert.show && showAlert.type == "success") {
                return (
                  <SweetAlert
                    success
                    title={showAlert.message}
                    onConfirm={() => toggleAlert({ show: false, type: 'success', message: '', redirectToHome: showAlert.redirectToHome })}
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

          {viewPdf && <PDFViewer width={'100%'} height={'500'}><AirPdf {...pdfData} /></PDFViewer>}
        </div>
      </div>
      {/* Vendor list page end */}
    </>
  )
}

export default VendorsAssessment