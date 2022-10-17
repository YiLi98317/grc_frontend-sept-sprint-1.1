import { useForm } from "react-hook-form";
import ApiService from "../../services/ApiServices";
import { SetCookie, GetCookie, encryptData } from "../../helpers/Helper";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Header from "../../components/partials/Header";
import React, { lazy, useContext, useEffect, useRef, useState } from "react";
import { Button, OverlayTrigger, ProgressBar, Tooltip } from "react-bootstrap";
import { LayoutContext } from "../../ContextProviders/LayoutContext";
import AirPagination from "../../elements/AirPagination";
import Styles from "../../styles/VendorsQuestionnaires.module.css"
import AirSelect from "../../elements/AirSelect";
import AIR_MSG from "../../helpers/AirMsgs";
import AirCalender from "../../elements/AirCalender";
import AirVendorModal from "../../elements/AirVendorModal";
import SweetAlert from "react-bootstrap-sweetalert";
// const LayoutContext = lazy(() => import("../ContextProviders/LayoutContext"))


const VendorsQuestionnaires = (props) => {
  // const {setShowLoader} = useContext(LayoutContext)
  // const { user = {} } = useOutletContext()
  const { projectId, setProjectId, user = {}, updateData } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const [view, setView] = useState('assessment_trigger_list')
  const [vendorTemplates, setVendorTemplates] = useState([])
  const [templateQuestions, setTemplateQuest] = useState([])
  const [defaultTemplateQuestions, setDefaultTemplateQuest] = useState([])
  const [editTemplateIndex, setEditTemplateIndex] = useState(null)
  const [editQuestionsArr, setEditQuestionsArr] = useState([])
  const { register, handleSubmit, watch, setValue, resetField, formState: { errors } } = useForm();
  const enquiryForm = watch('enqForm')

  const navigate = useNavigate()

  // const { register, handleSubmit, watch, formState: { errors } } = useForm(); // initialize the hook
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const form = watch()
  const [formSubmitted, setFormSbmt] = useState(false)
  const [errorMsg, setErrorMsg] = useState(false);
  const showLoader = false

  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({})
  const [viewFile, setViewFile] = useState(null)
  const [fileType, setFileType] = useState(null)
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })


  useEffect(() => {

    initializeData()
  }, [user])

  const initializeData = () => {
    if (vendorTemplates.length == 0) {
      fetchInfo('vendor_templates')
    }
  }



  const fetchInfo = async (type = '', data = null) => {
    if (type == '') {
      return false
    };

    let payloadUrl = ""
    let method = "POST";
    let formData = {};

    if (type == 'vendor_templates') {
      payloadUrl = `assessment/getTemplates/${orgId}`
      method = "GET";
    }

    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      if (type == 'vendor_templates') {
        setVendorTemplates(oldVal => {
          return [...res.results]
        })
        if(data && data.openModal && data.openModal == "add_template_question_modal"){
          let tempIndex = res.results.length -1;
          data.tempIndex = tempIndex
          data.vendorTemplates = res.results
          let eleId = document.getElementById(`ch${tempIndex}`)
          if(eleId){
            //auto close all open accordian
            let allAccEle = document.querySelectorAll(".card-header")
            Array.from(document.querySelectorAll('.card-header')).forEach((el) => {
              let parentEl = el.closest(".card")
              if(parentEl){
                let accBodyEl = parentEl.querySelector(".card-body").classList.remove("show")
              }
              el.classList.add('collapsed')
            });
            eleId.classList.remove("collapsed")
            let templateBox = document.getElementById(`cp${tempIndex}`)
            templateBox.classList.add("show")
          }
          
          let fnRes = await getTemplateQuestionnaire(null,tempIndex,data)
          if(fnRes){
            return fnRes
          }
          // showModal('add_template_question_modal',vendorTemplates[vendorTemplates.length -1])
        }
      }
    }
  }


  const getTemplateQuestionnaire = async (event,templateIndex = null,data = null) => {
    if (templateIndex == null) {
      return
    }
    
    // let ele = document.getElementById(`ct${templateIndex}`)
    // let divEle = document.getElementById(`cp${templateIndex}`)
    // if(!ele.classList.contains("collapsed")){
    //   ele.classList.add("collapsed")
    //   divEle.classList.remove("show");
    //   return 
    // }
    setTemplateQuest(oldVal => {
      return { ...{} }
    })
    setDefaultTemplateQuest(oldVal => {
      return { ...{} }
    })
    //set enquiry form value to to blank for new fields
    setValue('enqForm',[])
    setEditTemplateIndex(null)
    setEditQuestionsArr([])
    // questionnaire/getTemplate/:template_id
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    // if(divEle){
      let tmpVendorTemplates = data && data.vendorTemplates ? data.vendorTemplates :  vendorTemplates
      let template = tmpVendorTemplates[templateIndex] || false
    if (template) {
      let payloadUrl = `questionnaire/getTemplate/${template.template_id}`
      let method = "GET";
      let res = await ApiService.fetchData(payloadUrl, method);
      if (res && res.message == "Success") {
        let questTemp = res.results[0];
        // vendorQuesStat.vendor = assessment
        questTemp.template = JSON.parse(questTemp.template)
        setTemplateQuest(oldVal => {
          return { ...questTemp }
        })
        setDefaultTemplateQuest(oldVal => {
          return { ...Object.assign({},res.results[0]) }
        })

        if(data && data.openModal && data.openModal == "add_template_question_modal"){
          data.tempQuestions = questTemp
          data.template_id = template.template_id
          data.addMoreQuestion = true;
          setEditTemplateIndex(templateIndex)
          // console.log(data);
          // showModal('add_template_question_modal',data)
        }
        return data
        // ele.classList.toggle("collapsed")
        // divEle.classList.toggle("show");
      }else{
        return false
      }
    }
    // }
    

  }

  const editTemplate = (index = null) => {
    if (index == null) {
      return
    }
    if (vendorTemplates[index]) {
      setEditTemplateIndex(index)
    }

  }

  const toggleEditQuestion = (data = null) => {
    if (data == null) {
      return
    }
    let questionsArr = [...editQuestionsArr]
    let uniqKey = (`${data.tIndex}_${data.gIndex}_${data.qIndex}`).toString();
    if(questionsArr.indexOf(uniqKey) == -1){
      questionsArr.push(uniqKey);
    }else{
      let key =  questionsArr.indexOf(uniqKey)
      questionsArr.splice(key,1)
    }
    setEditQuestionsArr(oldVal => {
      // return [...oldVal, ...questionsArr]
      return [...questionsArr]
    })
  }

  const saveTemplate = async (modalType = null, data = null) => {
    if (data == null) {
      return false
    }

    if (!data.template_name || data.template_name == '') {
      return false;
    }
    let vendQuesStat = Object.assign({}, templateQuestions)
    let template = vendQuesStat.template
    
    for (let gIndex in enquiryForm) {
      let group = enquiryForm[gIndex]
      for (let qIndex in group.questions) {
        let formQuestion = group.questions[qIndex]
        if(template.page[gIndex] && template.page[gIndex].questions[qIndex] && template.page[gIndex].questions[qIndex].question){
          template.page[gIndex].questions[qIndex].question = formQuestion.question
        }
      }
    }
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (template && template.page) {
      let formData = {
        org_id: orgId,
        template_name: data.template_name,
        template: btoa(JSON.stringify(template)),
      }

      let payloadUrl = `questionnaire/addTemplate`
      let method = "POST";
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "template", error: {}, msg: "" }
        setFormRes(formRes)
        setEditTemplateIndex(null)
        setEditQuestionsArr([])
        fetchInfo('vendor_templates')
        // setTemplateQuest(oldVal =>{
        //   return {...defaultTemplateQuestions}
        // })
        setShowAlert({ show: true, type: "success", message: AIR_MSG.add_template_success })
        return res;
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "template"
        formRes['error']['msg'] = ""
        setFormRes(formRes)
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
        return false;
      }
      setFormSbmt(false)
    }

  }
  const updateTemplate = async (data = null) => {
    if (data == null) {
      return false
    }

    if (!data.template_id || data.template_id == '' || !data.template_name || data.template_name == '') {
      return false;
    }
    let vendQuesStat = Object.assign({}, templateQuestions)
    let template = vendQuesStat.template
    for (let gIndex in enquiryForm) {
      let group = enquiryForm[gIndex]
      for (let qIndex in group.questions) {
        let formQuestion = group.questions[qIndex]
        template.page[gIndex].questions[qIndex].question = formQuestion.question
      }
    }
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (template && template.page) {
      let formData = {
        template_name: data.template_name,
        template: btoa(JSON.stringify(template)),
      }

      let payloadUrl = `questionnaire/editTemplate/${data.template_id}`
      let method = "POST";
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "template", error: {}, msg: "" }
        setFormRes(formRes)
        setEditTemplateIndex(null)
        setEditQuestionsArr([])
        fetchInfo('vendor_templates')
        setShowAlert({ show: true, type: "success", message: AIR_MSG.update_template_success })
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "template"
        formRes['error']['msg'] = ""
        setFormRes(formRes)
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
      }
      setFormSbmt(false)
    }

  }

  const onDelTemplate= async (type = '',data) => {
    if (type == '') {
      return false
    }
    setShowAlert({ show: true, type: "del_template", message: "",data })
  }
  const delTemplate = async (data = null) => {
    if (data == null) {
      return false
    }

    if (!data.template_id || data.template_id == '') {
      return false;
    }
    
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (data.template_id) {
      let formData = {
        status: 'D',
      }

      let payloadUrl = `questionnaire/editTemplate/${data.template_id}`
      let method = "POST";
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "template", error: {}, msg: "" }
        setFormRes(formRes)
        setEditTemplateIndex(null)
        setEditQuestionsArr([])
        fetchInfo('vendor_templates')
        setShowAlert({ show: true, type: "success", message: AIR_MSG.del_template_success })
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "template"
        formRes['error']['msg'] = ""
        setFormRes(formRes)
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
      }
      setFormSbmt(false)
    }

  }
  const AddNewQuestion =  async (modalType = null,data = null) => {
    // console.log(data,templateQuestions);
    // return
    if (data == null || Object.keys(data).length == 0) {
      return false
    }
    

    if (!data.template_id || data.template_id == '' || !data.template_name || data.template_name == '') {
      return false;
    }
    let vendQuesStat = Object.assign({}, templateQuestions)
    let template = vendQuesStat.template
    let fields = [];
    let quesObj = {
      id: data.question_id,
      is_complete: "N",
      is_mandatory: data.is_mandatory ? "Y" : "N",
      notes: "",
      question : data.question,
      repeat_after: "1",
      repeat_after_unit: "month",
      severity : data.severity,
    }
    let tmpObj={label: '', value: ''}
    let fieldObj = {}
    fields.push({type:'text', label:'Additional Comments', value:''})
    if(data.date_required){
      fields.push({type:'date',value:'',label:data.date_label})
    }
    if(data.field_type == "radio"){
      fieldObj = {...tmpObj,...{type:data.field_type,radio_options:["Yes","No"]}}
      fieldObj.label = "Select"
    }else{
      fieldObj = {...tmpObj,...{type:data.field_type}}
    }
    fields.push(fieldObj)
    
    quesObj.fields = fields
    quesObj.files = []
    if(data.evidence_needed){
      quesObj.doc_upload_label = data.doc_upload_label;
      quesObj.files = []
    }
    let templateGrpsArr = template.page
    if(data.new_group_name && data.new_group_name.length > 0 && data.new_group_name != ''){
      templateGrpsArr.push({group:data.new_group_name,questions:[quesObj]})
    }else if(data.group_selected != 'new_group'){
      if(templateGrpsArr[data.group_selected]){
        templateGrpsArr[data.group_selected].questions.push(quesObj)
      }
    }

    // setTemplateQuest(oldVal =>{
    //   return {...vendQuesStat}
    // })

    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (template && template.page) {
      let formData = {
        template_name: data.template_name,
        template: btoa(JSON.stringify(template)),
      }

      let payloadUrl = `questionnaire/editTemplate/${data.template_id}`
      let method = "POST";
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "template", error: {}, msg: "" }
        setFormRes(formRes)
        setEditTemplateIndex(null)
        setEditQuestionsArr([])
        fetchInfo('vendor_templates')
        if(data && !data.addMoreQuestion){
          setShowAlert({ show: true, type: "success", message: AIR_MSG.update_template_success })
        }
        
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "template"
        formRes['error']['msg'] = ""
        setFormRes(formRes)
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
      }
      setFormSbmt(false)
      return res
    }
    
    // return {message:"Success"}
    // hideModal();
  }

  const delQuestion = async (data) => {
    if (data == null) {
      return false
    }
    // console.log(data)
    // console.log(templateQuestions)
    if (!data.template_id || data.template_id == '' || !data.template_name || data.template_name == '') {
      return false;
    }
    let vendQuesStat = Object.assign({}, templateQuestions)
    let template = vendQuesStat.template
    let questionsArr = template.page[data.gIndex].questions
    questionsArr.splice(data.qIndex,1)
    template.page[data.gIndex].questions = questionsArr
    vendQuesStat.template = template
    setTemplateQuest(oldVal =>{
      return {...vendQuesStat}
    })
    // let formRes = { status: false, err_status: false, error: {} }
    // setFormRes(formRes)
    // if (template && template.page) {
    //   let formData = {
    //     template_name: data.template_name,
    //     template: btoa(JSON.stringify(template)),
    //   }

    //   let payloadUrl = `questionnaire/editTemplate/${data.template_id}`
    //   let method = "POST";
    //   let res = await ApiService.fetchData(payloadUrl, method, formData);
    //   if (res && res.message == "Success") {
    //     formRes = { status: true, err_status: false, type: "templateQuestion", error: {}, msg: "" }
    //     setFormRes(formRes)
    //     setEditTemplateIndex(null)
    //     setEditQuestionsArr([])
    //     fetchInfo('vendor_templates')
    //     setShowAlert({ show: true, type: "success", message: "Question deleted successfully" })
    //   } else {
    //     formRes['err_status'] = true
    //     formRes['error']['type'] = "templateQuestion"
    //     formRes['error']['msg'] = ""
    //     setFormRes(formRes)
    //     setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
    //   }
    //   setFormSbmt(false)
    // }

  }



  const AddNewQuestionnaire = async (modalType = null,data = null) => {
    // console.log(data)
    if (data == null || Object.keys(data).length == 0) {
      return false
    }

    if (!data.template_name || data.template_name == '') {
      return false;
    }
    let questionnaireTemplate =  {}
    let quesObj = {
      id: 1,
      is_complete: "N",
      is_mandatory: data.is_mandatory ? "Y" : "N",
      notes: "",
      question : data.question,
      repeat_after: "1",
      repeat_after_unit: "month",
      severity : data.severity,
    }
    let fields = [];

    let tmpObj={label: '', value: ''}
    let fieldObj = {}
    fields.push({type:'text', label:'Additional Comments', value:''})
    if(data.date_required){
      fields.push({type:'date',value:'',label:data.date_label})
    }
    if(data.field_type == "radio"){
      fieldObj = {...tmpObj,...{type:data.field_type,radio_options:["Yes","No"]}}
      fieldObj.label = "Select"
    }else{
      fieldObj = {...tmpObj,...{type:data.field_type}}
    }
    fields.push(fieldObj)
    
    quesObj.fields = fields
    quesObj.files = []
    if(data.evidence_needed){
      quesObj.doc_upload_label = data.doc_upload_label;
      quesObj.files = []
    }

    // let questionnaireData = {
    //   group:data.groups[data.group_selected].group_name,
    //   questions:[quesObj]
    // }
    // questionnaireTemplate.page = [questionnaireData]

    let questGrps = []
    for (let gIndex in data.groups) {
      let grp = data.groups[gIndex]
      let questionnaireData = {
        group:grp.group_name,
        questions:[]
      }
      if(data.group_selected == gIndex){
        questionnaireData.questions = [quesObj]
      }
      questGrps.push(questionnaireData)
    }
    questionnaireTemplate.page = questGrps
    // set new vendor questionnaire data
    // console.log(questionnaireTemplate)
    // return 
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    setFormSbmt(true)
    if (questionnaireTemplate && questionnaireTemplate.page) {
      let formData = {
        org_id: orgId,
        template_name: data.template_name,
        template: btoa(JSON.stringify(questionnaireTemplate)),
      }

      let payloadUrl = `questionnaire/addTemplate`
      let method = "POST";
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "template", error: {}, msg: "" }
        setFormRes(formRes)
        setEditTemplateIndex(null)
        setEditQuestionsArr([])
        let fnRes = await fetchInfo('vendor_templates',data)
        // fetchInfo('vendor_templates',data)
        if(!data.hideSuccessDialog){
          setShowAlert({ show: true, type: "success", message: AIR_MSG.add_template_success })
        }
        setFormSbmt(false)
        // return res;
        if(fnRes){
          if(fnRes.openModal && fnRes.openModal == "add_template_question_modal"){
            res.openModalData = fnRes
          }
          return res;
        }else{
          setFormSbmt(false)
          setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
          return res;
        }
        
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "template"
        formRes['error']['msg'] = ""
        setFormRes(formRes)
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
        setFormSbmt(false)
        return false;
      }
    }
    
    
    //call api to create a new template to get template_id
    data.template_id = vendorTemplates.length
    let questionnaireObj = {
      template_id: data.template_id,
      template_name: data.template_name,
      template_type: data.template_type,
    }
    let tempVendorTemplates = Object.assign([],vendorTemplates)
    tempVendorTemplates.push(questionnaireObj)
    setVendorTemplates(oldVal =>{
      return [...tempVendorTemplates]
    })
    return false
    

  }


  /* Add trigger questionaire functions start */


  const showModal = async (modalName = null, data = null) => {
    if (modalName == null) {
      return false
    }
    // setEvidenceTypeId(null)
    let fileType = null
    let modalObj = {}
    switch (modalName) {
      case 'save_template_modal':
        if (data != null) {
          setModalData(data)
        }
        setModalType(modalName)
        setShowModal(true)
        break;
      case 'add_template_question_modal':
        // if (data != null) {
          if (data) {
            modalObj = data
          }
          let tempQuestions = data && data.tempQuestions ? data.tempQuestions :  templateQuestions
          if(tempQuestions.template.page){
            let formArr =  tempQuestions.template.page
            let groups = formArr.map((form, index) => ({ group_name: form.group, formIndex: index }))
            let questions = []
            formArr && formArr.map((form, index) => {
              questions = [...questions, ...form.questions]
            })
            modalObj.groups = groups
            modalObj.questions = questions
            // modalObj.addMoreQuestion = data.addMoreQuestion ? true : false;
            modalObj.addMoreQuestion = true
          }
          setModalData(modalObj)
        // }
          setModalType(modalName)
          setShowModal(true)
        break;
      case 'add_questionnaire_modal':
        // if (data != null) {
          if (data) {
            modalObj = data
          }
          if(templateQuestions?.template?.page){
            let formArr =  templateQuestions.template.page
            let groups = formArr.map((form, index) => ({ group_name: form.group, formIndex: index }))
            let questions = []
            formArr && formArr.map((form, index) => {
              questions = [...questions, ...form.questions]
            })
            modalObj.groups = groups
            modalObj.questions = questions
          }
          setModalData(modalObj)
        // }
          setModalType(modalName)
          setShowModal(true)
        break;
      case 'view_documents':
        if (data != null) {
          setViewFile(data.file);
          fileType = (data.file).substr((data.file).lastIndexOf('.') + 1)
          setFileType(fileType)
          setModalType(modalName)
          setShowModal(true)
        }
        break;
    }
  }

  const getFileName = (file = null) => {
    if (file == null) {
      return '';
    }
    return (file).substr((file).lastIndexOf('/') + 1)
  }

  const hideModal = (data = null) => {
    setModalType(null)
    setShowModal(false)
    if(data != null){
        if(data && data.addMoreQuestion){
          let modalObj =data
          showModal('add_template_question_modal',modalObj)
        }else if(data.openModal == "add_template_question_modal"){
          let modalObj =data.modalData
          showModal('add_template_question_modal',modalObj)
        }
    }
  }


  const toggleAlert = (val) => {
    setShowAlert(val)
  }

  /* Add trigger questionaire functions end */




  const changeView = (tab = null) => {
    if (tab == null) {
      return false
    }
    setView(tab)
  }
  // console.log(form)
  // console.log(errors)
  return (
    <>
      {/* Vendor list page start */}
      <div style={{ 'minHeight': 'calc(100vh - 50px)' }}>
        <Header defHeaderTitle={''} />
        <div id={Styles.v_questionaire_sec} className="container-fluid">
          <div id="vendor_assessment_section" className={`vendor_assessment_section`}>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex align-items-center justify-content-between mb-3 ">
                  <div id="va_header_section">
                    <h1 className={`mb-0 ${Styles.va_header_section}`}>Questionnaire List</h1>
                  </div>
                  <div className="vm_btns_box">
                    {/* <a className={`link_url`} onClick={() => changeView('definitions')}>View Definitions</a> */}
                    <a className={`btn btn-primary-2 btn_05 mw-100`} onClick={() => showModal('add_questionnaire_modal')} >Add New Questionnaire</a>
                  </div>
                </div>

              </div>
            </div>

            {/* Vendor questionaire page start */}
            <div id="level1" className="accordion accordianSec questionnaire level1">
              {vendorTemplates && vendorTemplates.length > 0 && vendorTemplates.map((template, tIndex) => {
                return (
                  <div className="card" key={`${template.template_name}__${tIndex}`}>
                    <div className="d-flex align-items-center">
                      <div id={`ch${tIndex}`} className="card-header collapsed flex-grow-1 link_url" data-toggle="collapse" href={`#cp${tIndex}`} onClick={(ev) => getTemplateQuestionnaire(ev,tIndex)}>
                      {/* <div id={`ct${tIndex}`} className="card-header collapsed flex-grow-1" href={`#cp${tIndex}`} onClick={(ev) => getTemplateQuestionnaire(ev,tIndex)}> */}
                        <a className="card-title fs-15">
                          {template.template_name}
                        </a>
                      </div>
                      <div className="ml-auto action_item">
                        {(() => {
                          if (template.template_type == "default") {
                            if (editTemplateIndex == null || editTemplateIndex != tIndex) {
                              return (
                                <>
                                  <a onClick={() => editTemplate(tIndex)} className="btn btn-primary-2 btn_03 btn-sm h-28 ml-2" data-toggle="modal" >Customize</a>
                                </>
                              )
                            } else if (editTemplateIndex == tIndex) {
                              return (
                                <>
                                  <a onClick={() => showModal('add_template_question_modal',template)} className={`btn btn-sm btn_1 ${Styles.btn_outline_primary}`}>Add Question</a>
                                  <a onClick={() => showModal('save_template_modal', { tIndex })} className="btn btn-primary-2 btn_03 btn-sm h-28 ml-2" data-toggle="modal" >Save</a>
                                </>
                              )
                            }

                          } else {
                            if (editTemplateIndex == null || editTemplateIndex != tIndex) {
                              return (
                                <>
                                  <a onClick={() => editTemplate(tIndex)} className="btn btn-primary-2 btn_03 btn-sm h-28 ml-2" ><i className="fa fa-pencil fs-14"></i></a>
                                  {/* <a onClick={() => delTemplate({...template})} className="btn btn-primary-2 btn_03 btn-sm h-28 ml-2" >Delete</a> */}
                                  <a onClick={() => onDelTemplate("del_template",{...template})} className="btn btn-primary-2 btn_03 btn-sm h-28 ml-2" ><i className="fa fa-trash fs-14"></i></a>
                                </>
                              )
                            } else if (editTemplateIndex == tIndex) {
                              return (
                                <>
                                  <a onClick={() => showModal('add_template_question_modal',template)} className={`btn btn-sm btn_1 ${Styles.btn_outline_primary}`}>Add Question</a>
                                  <a onClick={() => updateTemplate(template)} className="btn btn-primary-2 btn_03 btn-sm h-28 ml-2">Update</a>
                                </>
                              )
                            }

                          }
                        })()}

                      </div>
                    </div>
                    <div id={`cp${tIndex}`} className="card-body collapse" data-parent="#level1" >
                      <div className="bg-white m-0 mb-3 rounded">

                        {template.template_type == "default" && editTemplateIndex == tIndex && <h6 className="fs-12 pl-2 py-2 text-danger">Note: Default questionnaire can't be modified and it can only be edited & stored as a new questionnaire .</h6>}
                        <ul id="level2" className={`accordion p-0 list-unstyled level2 ${Styles.level2}`}>
                          {/* {templateQuestions && } */}
                          {templateQuestions?.template && templateQuestions?.template.page && templateQuestions?.template.page.length > 0 && React.Children.toArray(templateQuestions?.template.page.map((group, gIndex) => {
                            return (
                              <li className="pt-3">
                                <a href={`#a${gIndex}`} data-toggle="collapse" className="collapsed">{group.group}</a>
                                <div id={`a${gIndex}`} className="collapse" data-parent="#level2" >
                                  <ul id="level3" className={`accordion p-0 list-unstyled level3 ${Styles.level3}`}>
                                    {group.questions && group.questions.length > 0 && React.Children.toArray(group.questions.map((item, qIndex) => {
                                      return (
                                        <li data-uniq-index={`${tIndex}_${gIndex}_${qIndex}`}>
                                          {(() => {
                                            if (editQuestionsArr.indexOf(`${tIndex}_${gIndex}_${qIndex}`) == -1) {
                                              return (
                                                <a onClick={null} className="collapsed">
                                                  {/* <span>{item.question}</span> */}
                                                  <span>
                                                    {
                                                      enquiryForm && enquiryForm[gIndex]?.questions[qIndex]?.question
                                                      ? enquiryForm[gIndex]?.questions[qIndex]?.question
                                                      : item.question
                                                    }
                                                  {(() => {
                                                    if (editTemplateIndex != null && editTemplateIndex == tIndex) {
                                                      return (
                                                        <div className="actionBtn d-inline-block">
                                                          <button className="btn p-0" onClick={() => toggleEditQuestion({ tIndex, gIndex, qIndex })}><span className="questionnaireEdit"></span></button>
                                                          <button className="btn p-0" onClick={() => delQuestion({...template,...{ tIndex, gIndex, qIndex }})}><span className="questionnairedelete"></span></button>
                                                        </div>
                                                      )
                                                    }
                                                  })()}
                                                  </span>

                                                </a>
                                              )
                                            } else {
                                              return (
                                                <div className={`collapse fieldCaption show ${Styles.fieldCaption}`} >
                                                  <textarea className="form-control fs-13" name="" id="" cols="2" rows="2" defaultValue={item.question} {...register(`enqForm.${gIndex}.questions.${qIndex}.question`)}></textarea>
                                                  <div className="mt-3 text-right">
                                                  <button className="btn btn-primary-2 btn_05" onClick={()=> toggleEditQuestion({ tIndex, gIndex, qIndex })} >Save</button>
                                                  </div>
                                                </div>
                                              )
                                            }
                                          })()}
                                        </li>
                                      )
                                    }))}

                                  </ul>
                                </div>
                              </li>
                            )
                          }))}

                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}

            </div>
            {(() => {
              if (modalType && modalType != '' && modalType != null) {
                if (modalType == 'save_template_modal') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={modalData}
                    formSubmit={saveTemplate} />
                } else if (modalType == 'view_documents') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={{ viewFile: viewFile, fileType: fileType }}
                    formSubmit={() => { }} />
                } else if (modalType == 'add_template_question_modal') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={modalData}
                    formSubmit={AddNewQuestion} />
                } else if (modalType == 'add_questionnaire_modal') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={modalData}
                    formSubmit={AddNewQuestionnaire} />
                }

              }
            })()}
            {/* Vendor questionaire page end */}


            {(() => {
              if (showAlert && showAlert.show && showAlert.type == "del_template") {
                return (
                  <SweetAlert
                    danger
                    showCancel
                    confirmBtnText="Delete"
                    confirmBtnBsStyle="danger"
                    cancelBtnCssClass="btn btn-outline-secondary text_color_2"
                    title="Are you sure  you want delete the template ?"
                    onConfirm={() => delTemplate(showAlert?.data)}
                    confirmBtnCssClass={'btn_05'}
                    onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
                    focusConfirmBtn
                  >
                  </SweetAlert>
                )
              } else if (showAlert && showAlert.show && showAlert.type == "admin_status_confirmation") {
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

export default VendorsQuestionnaires