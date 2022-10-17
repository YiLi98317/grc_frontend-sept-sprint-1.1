import React, { lazy, useContext, useEffect, useState } from "react"
import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { useParams } from "react-router-dom"
import { LayoutContext } from "../ContextProviders/LayoutContext"
import AirAdminModal from "../elements/AirAdminModal"
import { GenMD5Hash } from "../helpers/Helper"
import ApiService from "../services/ApiServices"

const AdminEnquiryForm = (props) => {
  const { guid = null } = useParams()
  const { showLoader, setShowLoader, user } = useContext(LayoutContext)
  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [showEnqForm, setShowEnqForm] = useState(false);
  const [modalData, setModalData] = useState({})
  const [enqData, setEnqData] = useState(null)
  const [enqForm, setEnqForm] = useState(null)
  const [editFieldData, setEditFieldData] = useState(null)
  const [formSubmitted, setFormSbmt] = useState(false)
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [errorMsg, setErrorMsg] = useState(false);
  const { register, handleSubmit, watch, setValue, resetField, formState: { errors } } = useForm();
  const enquiryForm = watch('enqForm')
  const uniqGuid = guid;

  //   useEffect(()=>{
  //     if(!showEnqForm){
  //       showModal('document_verify_password_modal')
  //     }else{
  //         hideModal()
  //     }
  // },[showEnqForm])

  useEffect(() => {
    if (enqForm == null) {
      initializeData()
    }
  }, [])


  const initializeData = async (data = null) => {
    data = {}
    data.password = 'db45739c-9991-4351-8805-eac8fcbfee03'
    if (!data.password || data.password == '') {
      return false
    }
    let password = GenMD5Hash(data.password)
    // let password = data.password
    let payloadUrl = `vendor/getVendorQuestionnaire/${uniqGuid}/${password}`
    let method = "GET";
    let formData = {}
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let data = res.results
      setEnqData(oldVal => {
        return { ...data[0] }
      })
      if (data[0].template) {
        setEnqForm(JSON.parse(data[0].template).page)
      }
      setShowEnqForm(true)
    } else {
      return res
    }
  }

  const submitForm = async (type = '') => {
    if (type == '') {
      return false
    }
    setFormSbmt(true)
    let pageData = Object.assign([], enqForm)
    for (let gKey in pageData) {
      let enqGrp = pageData[gKey]
      if (enqGrp.questions && enqGrp.questions.length > 0) {
        for (let qKey in enqGrp.questions) {
          let formQues = enqGrp.questions[qKey]
          if (formQues.fields && formQues.fields.length > 0) {
            for (let fKey in formQues.fields) {
              let formField = formQues.fields[fKey]
              formField.value = enquiryForm[gKey]['questions'][qKey]['fields'][fKey].value
            }
          }
          if (enquiryForm[gKey]['questions'][qKey].files && enquiryForm[gKey]['questions'][qKey].files.length > 0) {
            formQues.files = enquiryForm[gKey]['questions'][qKey].files
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
    }
    setFormSbmt(false)

  }

  const showModal = async (modalName = null, data = null) => {
    if (modalName == null) {
      return false
    }
    // setEvidenceTypeId(null)
    let fileType = null;
    switch (modalName) {
      case 'add_enqForm_question':
        let modalObj = {}
        if (data) {
          modalObj = data
        }
        // fetch groups
        let groups = enqForm.map((form,index) => ({group_name:form.group,formIndex:index}))
        let questions = []
        enqForm && enqForm.map((form,index) => {
          questions = [...questions,...form.questions]
        })
        modalObj.groups = groups
        modalObj.questions = questions
        setModalData(modalObj)
        setModalType(modalName)
        setShowModal(true)
        break;
    }
  }

  const hideModal = () => {
    setModalType(null)
    setShowModal(false)
  }

  const AddEnquiryQuestion = (data = null) => {
    let fields = [];
    let quesObj = {
      id: data.question_id,
      question : data.question,
      severity : data.severity
    }
    fields.push({type:data.field_type,value:''})
    if(data.date_required){
      fields.push({type:'date',value:''})
    }
    if(data.evidence_needed){
      quesObj.doc_upload_label = data.doc_upload_label;
      quesObj.files = []
    }
    quesObj.fields = fields
    let form = Object.assign([],enqForm)
    if(data.new_group && data.new_group.length > 0){
      form.push({group:data.new_group,questions:[quesObj]})
    }else if(data.group_selected){
      if(form[data.group_selected]){
        form[data.group_selected].questions.push(quesObj)
      }
    }
    setEnqForm(oldVal =>{
      return [...form]
    })
  }
  const updateGroup = async (gKey = null, data = null) => {
    if (gKey == null) {
      return false
    }
    setFormSbmt(true)
    // let pageData = Object.assign([], enqForm)
    let pageData = [...enqForm]
    // for (let gKey in pageData) {
    let enqGrp = pageData[gKey]
    enqGrp.group = enquiryForm[gKey].group
    let questions = []
    if (enquiryForm[gKey]['questions'].length > 0) {
      for (let qKey in enquiryForm[gKey]['questions']) {
        let formQues = enquiryForm[gKey]['questions'][qKey]
        let oldFormQues = enqGrp['questions'][qKey] ? enqGrp['questions'][qKey] : null
        let quesObj = {
          doc_upload_label: formQues.doc_upload_label,
          fields: oldFormQues ? oldFormQues.fields : [],
          files: oldFormQues ? oldFormQues.files : [],
          id: oldFormQues ? oldFormQues.id : Math.random(),
          question: formQues.question,
          severity: formQues.severity,
        }
        questions.push(quesObj)
      }
    }
    enqGrp.questions = questions
    // }
    // return
    // let payloadUrl = `vendor/updateVendorQuestionnaire/${uniqGuid}`
    // let method = "POST";
    // let formData = { page: pageData }
    // let res = await ApiService.fetchData(payloadUrl, method, { template: btoa(JSON.stringify(formData)) });
    // if (res && res.message == "Success") {
    // }
    setFormSbmt(false)
  }

  const toggleDocUploadOpt = (gkey = null, qkey = null, defaultVal = '') => {
    if (gkey == null || qkey == null) {
      return false
    }
    if (!enquiryForm[gkey]['questions'][qkey].is_doc_upload) {
      register(`enqForm.${gkey}.questions.${qkey}.is_doc_upload`)
    }

    let oldVal = enquiryForm[gkey]['questions'][qkey].is_doc_upload
    setValue(`enqForm.${gkey}.questions.${qkey}.is_doc_upload`, !oldVal)
    resetField(`enqForm.${gkey}.questions.${qkey}.doc_upload_label`, { defaultValue: !oldVal ? defaultVal : '' })

  }
  const toggleDocUploadVal = (gkey = null, qkey = null) => {
    if (gkey == null || qkey == null) {
      return false
    }
    if (!enquiryForm[gkey]['questions'][qkey].is_doc_upload) {
      register(`enqForm.${gkey}.questions.${qkey}.is_doc_upload`)
    }
    if (enquiryForm[gkey]['questions'][qkey].doc_upload_label.length > 0) {
      let oldVal = enquiryForm[gkey]['questions'][qkey].is_doc_upload
      if (!oldVal) {
        setValue(`enqForm.${gkey}.questions.${qkey}.is_doc_upload`, true)
      }
    } else {
      setValue(`enqForm.${gkey}.questions.${qkey}.is_doc_upload`, false)
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
                            <img className="img-fluid" src={enqData?.client_logo} />
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

                <div id="accordion" className="accordion pl-lg-3 pr-lg-3 accordianSec">
                  <div className="card ">
                    <div className="d-flex align-items-center">
                      <div id="aeft0" className="card-header flex-grow-1">
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
                          >
                            <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                          </OverlayTrigger>

                        </a>
                      </div>
                      <div className="ml-auto action_item">
                        <a onClick={() => showModal('add_enqForm_question') } className={`btn btn-primary-2 btn_03 btn-sm ml-2 mw-100`} >Add Question</a>
                      </div>
                    </div>
                    <div id="aef0" className="card-body p-0 collapse show" data-parent="#accordion">
                      <div className="container-fluid pl-3 pt-4">
                        <div id="dynamicForm" className="accordion accordianSec">

                          {enqForm && enqForm.length > 0 && enqForm.map((enqGrp, gKey) => {
                            return (
                              <div className="card ">
                                <div className="d-flex align-items-center">
                                  <div id={`glt${gKey}`} className="card-header flex-grow-1 collapsed" data-toggle="collapse" href={`#gl${gKey}`}>
                                    <a className="card-title w-100 d-flex">
                                      {enqGrp.group}
                                      <OverlayTrigger
                                        key={"right"}
                                        placement={"right"}
                                        overlay={
                                          <Tooltip id={`tooltip-right`}>
                                            Tooltip for <strong>Group</strong>.
                                          </Tooltip>
                                        }
                                      >
                                        <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                                      </OverlayTrigger>

                                    </a>
                                  </div>
                                  <div className="ml-auto action_item">
                                    <a onClick={() => { updateGroup(gKey) }} className={`btn btn-primary-2 btn_03 btn-sm ml-2`} >update</a>
                                  </div>
                                </div>
                                <div id={`gl${gKey}`} className="card-body p-0 collapse" data-parent="#dynamicForm">

                                  <div className="container-fluid pl-3 pt-4">
                                    {/* Group name input box block start */}
                                    <div className="form-group px-2">
                                      <input className="form-control" type="text" defaultValue={enqGrp.group} placeholder="Enter Group Name" {...register(`enqForm.${gKey}.group`)} />
                                    </div>
                                    {/* Group name input box block end */}
                                    {/* group question loop start */}
                                    <div id={`group_question_acc${gKey}`} className="accordion accordianSec">

                                      {enqGrp.questions && enqGrp.questions.length > 0 && enqGrp.questions.map((formQues, qKey) => {
                                        return (
                                          <div className="card ">
                                            <div className="d-flex align-items-center">
                                              <div id={`gqh${gKey}`} className="card-header flex-grow-1 collapsed" data-toggle="collapse" href={`#gq${gKey}${qKey}`}>
                                                <a className="card-title w-100 d-flex">
                                                  {formQues.question}
                                                  <OverlayTrigger
                                                    key={"right"}
                                                    placement={"right"}
                                                    overlay={
                                                      <Tooltip id={`tooltip-right`}>
                                                        Tooltip for <strong>questions</strong>.
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <span className="info_icon d-inline-block ml-1 mt-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                                                  </OverlayTrigger>

                                                </a>
                                              </div>
                                              <div className="ml-auto action_item">
                                                {/* <a onClick={() => { }} className={`btn btn-primary-2 btn_03 btn-sm ml-2`} >Edit</a> */}
                                              </div>
                                            </div>
                                            <div id={`gq${gKey}${qKey}`} className="card-body p-0 collapse" data-parent={`#group_question_acc${gKey}`}>
                                              <div className="container-fluid p-3">
                                                <div>
                                                  <textarea rows={4} className="form-control border" defaultValue={formQues.question} {...register(`enqForm.${gKey}.questions.${qKey}.question`)}></textarea>
                                                </div>
                                                <div className="mt-3 ">
                                                  <div className="d-flex">
                                                    <label className="col font-weight-bold">Field Type</label>
                                                    <label className="col font-weight-bold">Value</label>
                                                    <label className="col"></label>
                                                    <label className="col-auto" style={{ 'width': '80px' }}></label>
                                                  </div>
                                                  {formQues.fields && formQues.fields.length > 0 && formQues.fields.map((formField, fKey) => {
                                                    return (
                                                      <div className="d-flex">
                                                        <span className="col">{formField.type}</span>
                                                        <span className="col">{formField.value}</span>
                                                        <span className="col"></span>
                                                        <span className="col-auto" style={{ 'width': '80px' }}></span>
                                                      </div>
                                                    )
                                                  })}
                                                </div>
                                                <div className="mt-3">
                                                  <label className={`mb-0`} htmlFor={`check${gKey}${qKey}`}> Document Upload</label>
                                                  <input className="ml-5" type="checkbox" defaultChecked={formQues.doc_upload_label.length > 0} {...register(`enqForm.${gKey}.questions.${qKey}.is_doc_upload`)} onChange={() => toggleDocUploadOpt(gKey, qKey, formQues.doc_upload_label)} disabled={true} />
                                                  <div className="form-group mt-3">
                                                    <input className="form-control border" type="text" defaultValue={formQues.doc_upload_label} {...register(`enqForm.${gKey}.questions.${qKey}.doc_upload_label`)} placeholder="Document Upload Label" onKeyUpCapture={() => toggleDocUploadVal(gKey, qKey)} readOnly={true}/>
                                                  </div>
                                                </div>

                                                <div className="mt-3">
                                                  <select className="enqForm_select" defaultValue={formQues.severity} {...register(`enqForm.${gKey}.questions.${qKey}.severity`)} disabled={true}>
                                                    <option value={'low'}> Low</option>
                                                    <option value={'medium'}> Medium</option>
                                                    <option value={'high'}> High</option>
                                                    <option value={'very high'}> Very High</option>
                                                  </select>
                                                </div>


                                              </div>

                                            </div>
                                          </div>

                                        )
                                      })}

                                    </div>


                                    {/* group question loop end */}





                                  </div>

                                </div>
                              </div>
                              // <div key={gKey} className="enqFormGrp col-md-12 mt-3">
                              //   <fieldset className="border rounded p-3">
                              //     <legend className="w-auto m-0">{enqGrp.group}</legend>
                              //     <div className="row">
                              //       {enqGrp.questions && enqGrp.questions.length > 0 && enqGrp.questions.map((formQues, qKey) => {
                              //         return (
                              //           <div key={qKey} className="col-md-12">
                              //             <div className="form_question_block mb-2"><label htmlFor="">{qKey + 1}. {formQues.question}:</label></div>
                              //             <div className="row m-0">
                              //               {formQues.fields && formQues.fields.length > 0 && formQues.fields.map((formField, fKey) => {
                              //                 if (formField.type == "text") {
                              //                   return (
                              //                     <div key={fKey} className="col-md-6">
                              //                       <div className="form-group">
                              //                         <input type={formField.type} className="form-control" {...register(`enqForm.${gKey}.questions.${qKey}.fields.${fKey}.value`)} autoComplete="off" defaultValue={formField.value} />
                              //                       </div>
                              //                     </div>
                              //                   )
                              //                 } else if (formField.type == "date") {
                              //                   return (
                              //                     <div key={fKey} className="col-md-6">
                              //                       <div className="form-group">
                              //                         <input type={formField.type} className="form-control" {...register(`enqForm.${gKey}.questions.${qKey}.fields.${fKey}.value`)} autoComplete="off" defaultValue={formField.value} />
                              //                       </div>
                              //                     </div>
                              //                   )
                              //                 } else if (formField.type == "textarea") {
                              //                   return (
                              //                     <div key={fKey} className="col-md-6">
                              //                       <div className="form-group">
                              //                         <textarea className="form-control" {...register(`enqForm.${gKey}.questions.${qKey}.fields.${fKey}.value`)} >{formField.value}</textarea>
                              //                       </div>
                              //                     </div>
                              //                   )
                              //                 }
                              //               })}
                              //               {(() => {
                              //                 if (formQues.files) {
                              //                   return (
                              //                     <div className="col-md-12">
                              //                       <div className="form-group">
                              //                         <label className="mb-3">{formQues.doc_upload_label}</label>
                              //                         <div className="row">
                              //                           <div className="col-auto">
                              //                             {/* <button className="btn btn-primary btn_wide" type="button" onClick={() => uploadFiles(gKey, qKey)} disabled={formSubmitted}>Upload Files</button> */}
                              //                             <button className="btn btn-primary btn_wide" type="button" onClick={() => showModal('view_upload_documents', { gKey, qKey })} disabled={formSubmitted}>Upload Files</button>
                              //                           </div>
                              //                           <div className="col-md-8">
                              //                             {/* <input type="file" className="form-control" {...register(`enqForm.${gKey}.questions.${qKey}.filesList`)} multiple={true} /> */}
                              //                             {
                              //                               formRes.err_status && formRes.error?.type == "no_file_select" && formRes.error?.path == `${gKey}_${qKey}`
                              //                                 ? <div className="field_err text-danger"><div>{formRes.error?.msg}</div> </div>
                              //                                 : ''
                              //                             }
                              //                             {(() => {
                              //                               if (enqForm && enqForm[gKey]['questions'][qKey].files && enqForm[gKey]['questions'][qKey].files.length > 0) {
                              //                                 return (
                              //                                   <div className="img_prev_block">
                              //                                     {enqForm[gKey]['questions'][qKey].files.map((file, iKey) => {
                              //                                       return <span className="img_box link_url" onClick={() => showModal('view_documents', { file })}><i className="fa fa-file" ></i> </span>
                              //                                     })}
                              //                                   </div>
                              //                                 )
                              //                               }
                              //                             })()}
                              //                           </div>

                              //                         </div>
                              //                       </div>
                              //                     </div>
                              //                   )
                              //                 }
                              //               })()}
                              //             </div>
                              //             {errors.oldPass?.type === 'required' && <div className="field_err text-danger">*Old assword is required</div>}
                              //           </div>
                              //         )
                              //       })}
                              //     </div>
                              //   </fieldset>
                              // </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        } else {
        }
      })()}

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
                            <img className="img-fluid" src={enqData?.client_logo} />
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
                    <form onSubmit={handleSubmit(submitForm)}>
                      <div className="card-header justify-content-between py-4">
                        <a className="card-title">
                          Enquiry Form
                          <OverlayTrigger
                            key={"right"}
                            placement={"right"}
                            overlay={
                              <Tooltip className="text-left" id={`tooltip-right`}>
                                <span> Dynamic enquiry form</span>
                              </Tooltip>
                            }
                          >
                            <span className="info_icon d-inline-block ml-1"><i className="fa fa-info-circle" aria-hidden="true"></i></span>
                          </OverlayTrigger>
                        </a>
                        <div>
                          <button className="btn btn-primary-2 bg_03 mr-3" type="button" onClick={() => submitForm('draft')} disabled={formSubmitted}>Save Draft </button>
                          <button className="btn btn-primary-2 bg_03" type="button" onClick={() => submitForm('complete')} disabled={formSubmitted}>Complete</button>
                        </div>
                      </div>
                      <div className="card-body">
                        <div id="dynamicForm" className="border border-secondary p-3 rounded">
                          <div className="row mb-4">

                            {enqForm && enqForm.length > 0 && enqForm.map((enqGrp, gKey) => {
                              return (
                                <div key={gKey} className="enqFormGrp col-md-12 mt-3">
                                  <fieldset className="border rounded p-3">
                                    <legend className="w-auto m-0">{enqGrp.group}</legend>
                                    <div className="row">
                                      {enqGrp.questions && enqGrp.questions.length > 0 && enqGrp.questions.map((formQues, qKey) => {
                                        return (
                                          <div key={qKey} className="col-md-12">
                                            <div className="form_question_block mb-2"><label htmlFor="">{qKey + 1}. {formQues.question}:</label></div>
                                            <div className="row m-0">
                                              {formQues.fields && formQues.fields.length > 0 && formQues.fields.map((formField, fKey) => {
                                                if (formField.type == "text") {
                                                  return (
                                                    <div key={fKey} className="col-md-6">
                                                      <div className="form-group">
                                                        <input type={formField.type} className="form-control" {...register(`enqForm.${gKey}.questions.${qKey}.fields.${fKey}.value`)} autoComplete="off" defaultValue={formField.value} />
                                                      </div>
                                                    </div>
                                                  )
                                                } else if (formField.type == "date") {
                                                  return (
                                                    <div key={fKey} className="col-md-6">
                                                      <div className="form-group">
                                                        <input type={formField.type} className="form-control" {...register(`enqForm.${gKey}.questions.${qKey}.fields.${fKey}.value`)} autoComplete="off" defaultValue={formField.value} />
                                                      </div>
                                                    </div>
                                                  )
                                                } else if (formField.type == "textarea") {
                                                  return (
                                                    <div key={fKey} className="col-md-6">
                                                      <div className="form-group">
                                                        <textarea className="form-control" {...register(`enqForm.${gKey}.questions.${qKey}.fields.${fKey}.value`)} >{formField.value}</textarea>
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
                                                            <button className="btn btn-primary-2 bg_04 btn_wide" type="button" onClick={() => showModal('view_upload_documents', { gKey, qKey })} disabled={formSubmitted}>Upload Files</button>
                                                          </div>
                                                          <div className="col-md-8">
                                                            {/* <input type="file" className="form-control" {...register(`enqForm.${gKey}.questions.${qKey}.filesList`)} multiple={true} /> */}
                                                            {
                                                              formRes.err_status && formRes.error?.type == "no_file_select" && formRes.error?.path == `${gKey}_${qKey}`
                                                                ? <div className="field_err text-danger"><div>{formRes.error?.msg}</div> </div>
                                                                : ''
                                                            }
                                                            {(() => {
                                                              if (enqForm && enqForm[gKey]['questions'][qKey].files && enqForm[gKey]['questions'][qKey].files.length > 0) {
                                                                return (
                                                                  <div className="img_prev_block">
                                                                    {enqForm[gKey]['questions'][qKey].files.map((file, iKey) => {
                                                                      return <span className="img_box link_url" onClick={() => showModal('view_documents', { file })}><i className="fa fa-file" ></i> </span>
                                                                    })}
                                                                  </div>
                                                                )
                                                              }
                                                            })()}
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
        if (modalType && modalType != '' && modalType != null) {

          if (modalType == 'add_enqForm_question' || modalType == 'edit_enqForm_question') {
            return <AirAdminModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={modalData}
              mClass="lg"
              formSubmit={AddEnquiryQuestion} />
          }
        }
      })()}
    </>
  )
}

export default AdminEnquiryForm