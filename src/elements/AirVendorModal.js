import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Loader from "../components/partials/Loader";
import { LayoutContext } from "../ContextProviders/LayoutContext";
// import { encryptData, GetInitials, GetRandomColor, mentionStrToHtml } from "../helpers/Helper";
// import ApiService from "../services/ApiServices";
import AirCalender from "./AirCalender";
import moment from "moment";
import ReactTags from 'react-tag-autocomplete';
import '../assets/css/autotag.css';
import { data } from "jquery";


const AirVendorModal = (intialData) => {
    const { modalType, formSubmit, show, hideModal, modalData, mClass } = intialData
    // const { projectId = null, user } = useContext(LayoutContext)
    const { projectId = null, user = {} } = useContext(LayoutContext)
    const { access_role: accessRole = null, org_id: orgId = 0, is_management: isManagement = '' } = user?.currentUser;
    const navigate = useNavigate();
    const { register, handleSubmit, watch, setValue, resetField, trigger, clearErrors, setError, formState: { errors } } = useForm();
    const [formRes, setFormRes] = useState({ staus: false, err: false, data: {} })
    const [formSubmitted, setFormSbmt] = useState(false)
    const [modalFormData, setModalFormData] = useState({})
    const [showLoader, setShowLoader] = useState(false)

    const [msgError, setMsgErr] = useState('')
    const is_evidence_needed = watch('evidence_needed')
    const date_required = watch('date_required')
    const group_selected = watch('group_selected')
    const [questionnnaireGrps, setQuestionnnaireGrps] = useState([])
    const [tags, setTags] = useState([])
    const reactTags = useRef()

    useEffect(() => {
        if (modalType == 'revert_modal') {


        } else if (modalType == 'edit_enqForm_group') {

        }
        if (modalType == 'add_enqForm_question') {


        }
        if (modalType == 'add_vendor_tags_modal') {
        }

    }, []);

    // react-tag-autocomplete

    const onDelete = useCallback((tagIndex) => {
        setTags(tags.filter((_, i) => i !== tagIndex))
    }, [tags])

    const onAddition = useCallback((newTag) => {
        setTags([...tags, newTag])
    }, [tags])

    const onValidate = useCallback((newTag) => {
        return /^[a-z]{3,12}$/i.test(newTag.name)
    })



    const handleModalClose = (data = null) => {
        // setShowModal(false)
        hideModal(data)
    };
    // const handleModalShow = () => setShowModal(true);

    const onSubmit = async (data) => {
        let stat = { status: false, err: false, data: {} }
        setFormRes(stat)
        if (modalType == 'add_template_question_modal') {
            if (Object.keys(data).length > 0) {
                setFormSbmt(true)
                data.question_id = modalData.questions.length + 1
                data.template_id = modalData?.template_id;
                data.template_name = modalData?.template_name
                data.template_type = modalData?.template_type
                let res = await formSubmit(modalType, data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    handleModalClose()
                } else {

                }
                setFormSbmt(false)
            }
        } else if (modalType == 'add_questionnaire_modal') {
            if (Object.keys(data).length > 0) {
                // setFormSbmt(true)
                // console.log(modalData)
                // data.question_id = modalData.questions.length + 1
                // data.template_id = modalData?.template_id;
                // data.template_name = modalData?.template_name
                data.template_type = "custom"
                data.groups = questionnnaireGrps
                let res = await formSubmit(modalType, data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    handleModalClose()
                } else {

                }
                setFormSbmt(false)
            }
        } else if (modalType == 'revert_modal') {
            if (data.revert_comment && data.revert_comment != '') {
                setFormSbmt(true)
                data.groupIndex = modalData?.gIndex;
                data.questionIndex = modalData?.qIndex;
                let res = await formSubmit(modalType, data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        } else if (modalType == 'save_template_modal') {
            if (data.template_name && data.template_name != '') {
                setFormSbmt(true)
                data.templateIndex = modalData?.tIndex;
                // data.groupIndex = modalData?.gIndex;
                // data.questionIndex = modalData?.qIndex;
                let res = await formSubmit(modalType, data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    handleModalClose()
                } else {

                }
                setFormSbmt(false)
            }
        } else if (modalType == 'remediation_step_modal') {
            if (data.remediation_steps && data.remediation_steps != '' && data.remediation_date && data.remediation_date != '') {
                setFormSbmt(true)
                // data.groupIndex = modalData?.gIndex;
                // data.questionIndex = modalData?.qIndex;
                let res = await formSubmit(modalType, data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        } else if (modalType == "add_vendor_tags_modal") {
            if (data.tags && data.tags.length > 0) {
                setFormSbmt(true)
                data.entity = "vendor";
                data.entity_id = (modalData?.org_vendor_id).toString();
                data.tags = data.tags.map((tag) => tag.name)
                // data.groupIndex = modalData?.gIndex;
                // data.questionIndex = modalData?.qIndex;
                let res = await formSubmit(modalType, data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    handleModalClose()
                } else {

                }
                setFormSbmt(false)
            }
        } else if (modalType == 'auditors_remark_modal') {
            if (data.auditors_remark && data.auditors_remark != '') {
                setFormSbmt(true)
                data.groupIndex = modalData?.gIndex;
                data.questionIndex = modalData?.qIndex;
                let res = await formSubmit(modalType, data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    handleModalClose()
                }
                setFormSbmt(false)
            }
        }

        return false
    }

    const _ = (el) => {
        return document.getElementById(el);
    }

    const onChangeDate = (startDate = null, endDate = null) => {
        if (modalType == 'remediation_step_modal') {
            setValue('remediation_date', startDate, { shouldValidate: true })
        }

        //updateTaskDetails("due_date", startDate)
    }

    /* Add questionnaire functions start */
    const addQuestionnaireGroup = async () => {
        clearErrors();
        let newGrpName = watch('new_group_name')
        register("new_group_name", { required: true })
        let isValid = await trigger("new_group_name")
        if (!isValid) {
            return false
        }
        let tempArr = Object.assign([], questionnnaireGrps);
        if (tempArr.includes(newGrpName)) {
            setError(newGrpName, { type: 'custom', message: 'Group already exist' });
            return false
        }
        tempArr.push({ formIndex: tempArr.length, group_name: newGrpName })
        setQuestionnnaireGrps(oldVal => {
            return [...tempArr]
        })
        register("new_group_name", { required: false })
        setValue("new_group_name", "")
    }
    const submitAndAddNewQuestionnaire = async (data) => {
        // console.log(modalType,data)
        let stat = { status: false, err: false, data: {} }
        setFormRes(stat)
        setFormSbmt(true)
        if (modalType == 'add_questionnaire_modal') {
            if (Object.keys(data).length > 0) {
                // setFormSbmt(true)
                // console.log(modalData)
                // data.question_id = modalData.questions.length + 1
                // data.template_id = modalData?.template_id;
                // data.template_name = modalData?.template_name
                data.template_type = "custom"
                data.groups = questionnnaireGrps
                data.hideSuccessDialog = true
                data.openModal = "add_template_question_modal"
                let res = await formSubmit(modalType, data)
                if (res && res.message == 'Success') {
                    handleModalClose({ openModal: "add_template_question_modal", modalData: res.openModalData })
                }
                setFormSbmt(false)
            }
        }
    }
    const submitAndAddNewQuestion = async (data) => {
        let stat = { status: false, err: false, data: {} }
        setFormRes(stat)
        if (modalType == 'add_template_question_modal') {
            if (Object.keys(data).length > 0) {
                setFormSbmt(true)
                data.question_id = modalData.questions.length + 1
                data.template_id = modalData?.template_id;
                data.template_name = modalData?.template_name
                data.template_type = modalData?.template_type
                data.addMoreQuestion = true;
                let res = await formSubmit(modalType, data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    let obj = modalData;
                    obj.addMoreQuestion = true
                    handleModalClose(obj)
                } else {
                    handleModalClose(modalData)
                }
                setFormSbmt(false)
            }
        }
    }
    /* Add questionnaire functions end */

    // Add ventor auto tags
    const CustomTags = () => {
        const [tags, setTags] = useState([])

        const reactTags = useRef()

        const onDelete = useCallback((tagIndex) => {
            setTags(tags.filter((_, i) => i !== tagIndex))
        }, [tags])

        const onAddition = useCallback((newTag) => {
            setTags([...tags, newTag])
        }, [tags])

        const onValidate = useCallback((newTag) => {
            return /^[a-z]{3,12}$/i.test(newTag.name)
        })


        return (
            <>
                <ReactTags
                    allowNew
                    newTagText='Create new tag:'
                    ref={reactTags}
                    tags={tags}
                    suggestions={[]}
                    onDelete={onDelete}
                    onAddition={onAddition}
                    onValidate={onValidate}
                />
                <p style={{ margin: '0.25rem 0', color: 'gray' }}>
                    <small><em>Tags must be 3–12 characters in length and only contain the letters A-Z</em></small>
                </p>
                <hr />
                {tags.map((element) => {
                    return (
                        <div className="react-tags__selected" aria-relevant="additions removals" aria-live="polite">
                            <button type="button" className="react-tags__selected-tag" title="Click to remove tag">
                                <span className="react-tags__selected-tag-name">{element.name}</span></button></div>
                    )
                })}
            </>
        )
    }

    if (modalType == 'revert_modal') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={'md'}
                    className={`custom-modal ${mClass}`}>

                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white ">
                        <Modal.Title className="fs-12">Share the reason to return <span className="text-danger">*</span></Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pb-2">
                        <form id="addEnqQuestionForm" onSubmit={handleSubmit(onSubmit)} autoComplete="off">

                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="form-group">
                                        <textarea className="form-control border-0"
                                            {...register("revert_comment", { required: true })}
                                            placeholder="Add Comment...."
                                            rows={4}>

                                        </textarea>
                                        <span className="form_err text-danger d-block"> {errors.revert_comment?.type === 'required' && 'Comment is required.'}</span>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-group">
                                        <span className="text-danger fs-11"> *Note: To return the assessment please click on return button at the end of the page</span>
                                    </div>
                                </div>

                            </div>
                            <hr className="my-2" />
                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <button className="btn btn_1 btn-sm w-auto" type="button" disabled={formSubmitted} onClick={() => hideModal()}>Cancel</button>
                                        <button className="btn btn-primary-2 btn_05" type="submit" disabled={formSubmitted}>Submit</button>

                                    </div>

                                    <div className="w-100">

                                        {(() => {
                                            if (formRes.err && formRes.data.err) {
                                                return (
                                                    <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                                )
                                            }
                                        })()}
                                        {/* <button className="btn-common text-uppercase" disabled={formSubmitted}> Submit </button> */}
                                    </div>
                                </div>
                            </div>

                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
    if (modalType == 'save_template_modal') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={'md'}
                    className={`custom-modal ${mClass}`}>

                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white ">
                        <Modal.Title className="fs-12">Save New Template</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pb-2">
                        <form id="addEnqQuestionForm" onSubmit={handleSubmit(onSubmit)} autoComplete="off">

                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="form-group">
                                        <textarea className="form-control border-0"
                                            {...register("template_name", { required: true })}
                                            placeholder="Add Name...."
                                            rows={4}>

                                        </textarea>
                                        <span className="form_err text-danger d-block"> {errors.template_name?.type === 'required' && 'Name is required.'}</span>
                                    </div>
                                </div>

                            </div>
                            <hr className="my-2" />
                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <button className="btn btn_1 btn-sm w-auto" type="button" disabled={formSubmitted} onClick={() => hideModal()}>Cancel</button>
                                        <button className="btn btn-primary-2 btn_05" type="submit" disabled={formSubmitted}>Submit</button>

                                    </div>

                                    <div className="w-100">

                                        {(() => {
                                            if (formRes.err && formRes.data.err) {
                                                return (
                                                    <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                                )
                                            }
                                        })()}
                                        {/* <button className="btn-common text-uppercase" disabled={formSubmitted}> Submit </button> */}
                                    </div>
                                </div>
                            </div>

                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
    if (modalType == 'add_template_question_modal') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={'lg'}
                    className={`custom-modal ${mClass}`}>

                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white ">
                        <Modal.Title className="fs-12">Add Question</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pb-2">
                        <form id="addEnqQuestionForm" onSubmit={handleSubmit(onSubmit)} autoComplete="off">

                            <div className="row m-0">
                                <div className="col row align-items-baseline">
                                    <div className="col-5">
                                        <div className="form-group">
                                            <select className="enqForm_select mw-100 w-100" {...register(`group_selected`)}>
                                                <option value={''}> Select Group</option>
                                                {modalData && modalData?.groups.length > 0 && modalData.groups.map((group) => {
                                                    return <option value={group.formIndex}> {group.group_name}</option>
                                                })}
                                                <option value={'new_group'}> Create New Group</option>
                                            </select>
                                            <span className="form_err text-danger d-block"> {errors.group_selected?.type === 'required' && 'Group is required.'}</span>
                                        </div>
                                    </div>
                                    <div className="col-2">{group_selected && group_selected == 'new_group' && 'Group name'}</div>
                                    <div className="col-5">
                                        {group_selected && group_selected == 'new_group' &&
                                            <div className="form-group">
                                                <input className="form-control" type="text" {...register(`new_group_name`, { required: true })} />
                                                <span className="form_err text-danger d-block"> {errors.new_group_name && errors.new_group_name?.type === 'required' && 'Group name is required.'}</span>
                                            </div>
                                        }

                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-group">
                                        <textarea className="form-control border"
                                            {...register("question", { required: true })}
                                            placeholder="Question Text"
                                            rows={4}>

                                        </textarea>
                                        <span className="form_err text-danger d-block"> {errors.question?.type === 'required' && 'Question is required.'}</span>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <select className="enqForm_select" {...register(`field_type`, { required: true })} defaultValue={'radio'}>
                                            <option value={'radio'}> Radio</option>
                                            {/* <option value={'textarea'}> Textarea</option> */}
                                        </select>
                                        <span className="form_err text-danger d-block"> {errors.field_type?.type === 'required' && 'Field type is required.'}</span>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="form-group">
                                        <select className="enqForm_select" {...register(`severity`, { required: true })} defaultValue={'low'}>
                                            <option value={'low'}> Low</option>
                                            <option value={'medium'}> Medium</option>
                                            <option value={'high'}> High</option>
                                            <option value={'very high'}> Very High</option>
                                        </select>
                                        <span className="form_err text-danger d-block"> {errors.severity?.type === 'required' && 'Severity is required.'}</span>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-group">
                                        <div className="d-flex align-items-center">
                                            <label className={`mb-0`} htmlFor={`evidence_needed`}> Evidence Needed</label>
                                            <input id="evidence_needed" className="ml-5" type="checkbox" {...register(`evidence_needed`)} />
                                        </div>
                                        <span className="form_err text-danger d-block"> {errors.evidence_needed?.type === 'required' && 'Evidence needed is required.'}</span>
                                    </div>
                                    {(() => {
                                        if (is_evidence_needed) {
                                            return (
                                                <div className="form-group">
                                                    <input id="doc_label" className="form-control border" type="text" {...register(`doc_upload_label`)} placeholder="Required Evidence" />
                                                    <span className="form_err text-danger d-block"> {errors.doc_upload_label?.type === 'required' && 'Document label is required.'}</span>
                                                </div>
                                            )
                                        }
                                    })()}

                                </div>
                                <div className="col-12">
                                    <div className="form-group">
                                        <div className="d-flex align-items-center">
                                            <label className={`mb-0`} htmlFor={`date_required`}> Date Required</label>
                                            <input id="date_required" className="ml-5" type="checkbox" {...register(`date_required`)} />
                                        </div>
                                        <span className="form_err text-danger d-block"> {errors.date_required?.type === 'required' && 'Date is required.'}</span>
                                    </div>
                                    {(() => {
                                        if (date_required) {
                                            return (
                                                <div className="form-group">
                                                    <input id="date_label" className="form-control border" type="text" {...register(`date_label`)} placeholder="Required Date For" />
                                                    <span className="form_err text-danger d-block"> {errors.date_label?.type === 'required' && 'Date label is required.'}</span>
                                                </div>
                                            )
                                        }
                                    })()}
                                </div>
                                <div className="col-12">
                                    <div className="form-group">
                                        <div className="d-flex align-items-center">
                                            <label className={`mb-0`} htmlFor={`is_mandatory`}> Is Mandatory</label>
                                            <input id="is_mandatory" className="ml-5" type="checkbox" {...register(`is_mandatory`)} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <hr />

                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="text-right">
                                        {modalData.addMoreQuestion && <button className="btn btn-primary-2 btn_05 btn_wide mr-3" type="button" onClick={handleSubmit(submitAndAddNewQuestion)} disabled={formSubmitted}>Save And Add New</button>}
                                        <button className="btn btn-primary-2 btn_05 btn_wide" type="submit" disabled={formSubmitted}>Save</button>
                                        {(() => {
                                            if (formRes.err && formRes.data.err) {
                                                return (
                                                    <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                                )
                                            }
                                        })()}
                                        {/* <button className="btn-common text-uppercase" disabled={formSubmitted}> Submit </button> */}
                                    </div>
                                </div>
                            </div>

                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
    if (modalType == 'add_questionnaire_modal') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={'lg'}
                    className={`custom-modal ${mClass}`}>

                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white ">
                        <Modal.Title className="fs-12">Add questionnaire</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pb-2">
                        <div className="position-relative">
                            {formSubmitted &&<Loader showLoader={true} pos={'absolute'} heightClass={"h-100"}></Loader>}
                            {/* <Loader showLoader={true} pos={'absolute'} heightClass={"h-100"}></Loader> */}
                            <form id="addEnqQuestionForm" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                                <fieldset className="border rounded">
                                    <legend className="w-auto ml-3 fs-14 fw-600">Questionnaire</legend>
                                    <div className="row m-0">
                                        <div className="col-12">
                                            <div className="form-group">
                                                <input type="text"
                                                    className="form-control border"
                                                    {...register("template_name", { required: true })}
                                                    placeholder="Enter Questionnaire Title" />
                                                <span className="form_err text-danger d-block"> {errors.template_name?.type === 'required' && 'Questionnaire name is required.'}</span>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="form-group">
                                                <input type="text"
                                                    className="form-control border"
                                                    {...register("new_group_name")}
                                                    placeholder="Enter Domain Name" />
                                                <span className="form_err text-danger d-block"> {errors.new_group_name?.type === 'required' && 'Group Name is required.'}</span>
                                                <span className="form_err text-danger d-block"> {errors.new_group_name?.type === 'custom' && errors.new_group_name?.message}</span>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <button onClick={() => addQuestionnaireGroup()} className="btn btn-primary-2 btn_05 min_w_100 h-28 ml-2" type="button" >Add Domain</button>
                                        </div>
                                    </div>
                                    {questionnnaireGrps && questionnnaireGrps.length > 0 &&
                                        <div className="row m-0">
                                            <div className="col-12">
                                                <fieldset className="border rounded">
                                                    <legend className="w-auto ml-3 fs-14 fw-600">Add Question</legend>
                                                    <div className="row m-0">
                                                        {/* <div className="col-12">
                                                        <div className="form-group">
                                                            <input type="text"
                                                                className="form-control border"
                                                                {...register("title", { required: true })}
                                                                placeholder="Enter Title" />
                                                            <span className="form_err text-danger d-block"> {errors.title?.type === 'required' && 'Title is required.'}</span>
                                                        </div>
                                                    </div> */}
                                                        <div className="col-5">
                                                            <div className="form-group">
                                                                <select className="enqForm_select mw-100" {...register(`group_selected`)} defaultValue={'0'}>
                                                                    <option value={''}> Select Group</option>
                                                                    {React.Children.toArray(questionnnaireGrps.map((group, index) => {
                                                                        return <option value={group.formIndex}> {group.group_name}</option>
                                                                    }))}
                                                                </select>
                                                                <span className="form_err text-danger d-block"> {errors.group_selected?.type === 'required' && 'Group is required.'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <textarea className="form-control border"
                                                                    {...register("question", { required: true })}
                                                                    placeholder="Question Text"
                                                                    rows={4}>

                                                                </textarea>
                                                                <span className="form_err text-danger d-block"> {errors.question?.type === 'required' && 'Question is required.'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <select className="enqForm_select" {...register(`field_type`, { required: true })} defaultValue={'radio'}>
                                                                    <option value={'radio'}> Radio</option>
                                                                    {/* <option value={'textarea'}> Textarea</option> */}
                                                                </select>
                                                                <span className="form_err text-danger d-block"> {errors.field_type?.type === 'required' && 'Field type is required.'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="col-4">
                                                            <div className="form-group">
                                                                <select className="enqForm_select" {...register(`severity`, { required: true })} defaultValue={'low'}>
                                                                    <option value={'low'}> Low</option>
                                                                    <option value={'medium'}> Medium</option>
                                                                    <option value={'high'}> High</option>
                                                                    <option value={'very high'}> Very High</option>
                                                                </select>
                                                                <span className="form_err text-danger d-block"> {errors.severity?.type === 'required' && 'Severity is required.'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <div className="d-flex align-items-center">
                                                                    <label className={`mb-0`} htmlFor={`evidence_needed`}> Evidence Needed</label>
                                                                    <input id="evidence_needed" className="ml-5" type="checkbox" {...register(`evidence_needed`)} />
                                                                </div>
                                                                <span className="form_err text-danger d-block"> {errors.evidence_needed?.type === 'required' && 'Evidence needed is required.'}</span>
                                                            </div>
                                                            {(() => {
                                                                if (is_evidence_needed) {
                                                                    return (
                                                                        <div className="form-group">
                                                                            <input id="doc_label" className="form-control border" type="text" {...register(`doc_upload_label`)} placeholder="Required Evidence" />
                                                                            <span className="form_err text-danger d-block"> {errors.doc_upload_label?.type === 'required' && 'Document label is required.'}</span>
                                                                        </div>
                                                                    )
                                                                }
                                                            })()}

                                                        </div>
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <div className="d-flex align-items-center">
                                                                    <label className={`mb-0`} htmlFor={`date_required`}> Date Required</label>
                                                                    <input id="date_required" className="ml-5" type="checkbox" {...register(`date_required`)} />
                                                                </div>
                                                                <span className="form_err text-danger d-block"> {errors.date_required?.type === 'required' && 'Date is required.'}</span>
                                                            </div>
                                                            {(() => {
                                                                if (date_required) {
                                                                    return (
                                                                        <div className="form-group">
                                                                            <input id="date_label" className="form-control border" type="text" {...register(`date_label`)} placeholder="Required Date For" />
                                                                            <span className="form_err text-danger d-block"> {errors.date_label?.type === 'required' && 'Date label is required.'}</span>
                                                                        </div>
                                                                    )
                                                                }
                                                            })()}
                                                        </div>
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <div className="d-flex align-items-center">
                                                                    <label className={`mb-0`} htmlFor={`is_mandatory`}> Is Mandatory</label>
                                                                    <input id="is_mandatory" className="ml-5" type="checkbox" {...register(`is_mandatory`)} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </fieldset>

                                            </div>
                                        </div>
                                    }

                                </fieldset>

                                <hr />

                                <div className="row m-0">
                                    <div className="col-12">
                                        <div className="text-right">
                                            <button className="btn btn-primary-2 btn_05 btn_wide mr-3" type="button" onClick={handleSubmit(submitAndAddNewQuestionnaire)} disabled={formSubmitted}>Save And Add New</button>
                                            <button className="btn btn-primary-2 btn_05 btn_wide" type="submit" disabled={formSubmitted}>Save</button>
                                            {(() => {
                                                if (formRes.err && formRes.data.err) {
                                                    return (
                                                        <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                                    )
                                                }
                                            })()}
                                            {/* <button className="btn-common text-uppercase" disabled={formSubmitted}> Submit </button> */}
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        )
    }

    if (modalType == 'remediation_step_modal') {
        const todayDate = moment().toDate();
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={'lg'}
                    className={`custom-modal ${mClass}`}>

                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white ">
                        <Modal.Title className="fs-12">Add Remediation Steps</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pb-2">
                        <form id="addRemediationSteps" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <fieldset className="border rounded">
                                <legend className="w-auto ml-3 fs-14 fw-600">Remediation Steps</legend>
                                <div className="row m-0">
                                    <div className="col-12">
                                        <div className="form-group">
                                            <textarea type="text"
                                                className="form-control border"
                                                {...register("remediation_steps", { required: true })}
                                                placeholder="Add Remediation Steps" ></textarea>
                                            <span className="form_err text-danger d-block"> {errors.remediation_steps?.type === 'required' && 'Steps are required.'}</span>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="form-group">
                                            <AirCalender type="custom" dateFormat="MM-DD-YYYY" changeFn={onChangeDate} defaultSettings={{ singleDatePicker: true, autoUpdateInput: true, autoApply: true, minDate: todayDate }}
                                            >
                                                <div className="date_box w-100 mr-2 d-flex align-items-center triggerDate">
                                                    <input type="text" className="form-control link_url bg-transparent" disabled={true} {...register('remediation_date', { required: true, pattern: /^(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])-[0-9]{4}$/ })} placeholder="Remediation Date" autoComplete="off" />
                                                </div>
                                            </AirCalender>
                                            <span className="form_err text-danger d-block"> {errors.remediation_date?.type === 'required' && 'Date is required.'}</span>
                                            <span className="form_err text-danger d-block"> {errors.remediation_date?.type === 'pattern' && 'Invalid Date.'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="row m-0 pt-2 pb-4">
                                    <div className="col-12">
                                        <div className="text-right">
                                            <button className="btn btn-primary-2 btn_05 btn_wide" type="submit" disabled={formSubmitted}>Submit</button>
                                            {(() => {
                                                if (formRes.err && formRes.data.err) {
                                                    return (
                                                        <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                                    )
                                                }
                                            })()}
                                            {/* <button className="btn-common text-uppercase" disabled={formSubmitted}> Submit </button> */}
                                        </div>
                                    </div>
                                </div>
                            </fieldset>



                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }

    if (modalType == 'view_documents') {

        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size="xl"
                    className="custom-modal task_details_modal"
                    scrollable={true}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Document Viewer</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <section className="view_document_section my-sm-5 my-lg-0">
                                <div className="container">
                                    <div className="row py-5 justify-content-center">
                                        <div className="col-12 col-md-12">
                                            <div className={`view_doc_container h-100 text-center`}>
                                                {(() => {
                                                    if (modalData.viewFile && modalData.viewFile != '') {
                                                        if (modalData.fileType && modalData.fileType != '') {
                                                            if (modalData.fileType == 'pdf') {
                                                                return <object data={modalData.viewFile} className="w-100 img-fluid h-100"></object>
                                                                // return <object data={'https://www.orimi.com/pdf-test.pdf'} className="w-100 img-fluid h-100"></object>
                                                                // return <object type="application/x-shockwave-flash" data="c.swf?path=movie.swf" width="400" height="300">
                                                                //     <param name="movie" value="c.swf?path=movie.swf" />
                                                                //     <img src="noflash.gif" width="200" height="100" alt="No Flash" />
                                                                // </object>

                                                            } else if (modalData.fileType == 'jpeg' || modalData.fileType == 'jpg' || modalData.fileType == 'png' || modalData.fileType == 'webp' || modalData.fileType == 'svg' || modalData.fileType == 'gif') {
                                                                return <img src={modalData.viewFile} className="img-fluid" />
                                                            } else if (['xls', 'xlsx', 'xlsb', 'xml', 'msword', 'docx', 'doc', 'officeDocument'].indexOf(modalData.fileType) != -1) {
                                                                // return <object data={`{modalData.viewFile}`} type="application/msword" className="w-100 img-fluid h-100"></object>
                                                                return <object data={`https://view.officeapps.live.com/op/embed.aspx?src=${modalData.viewFile}`} className="w-100 img-fluid h-100"></object>
                                                                // return <iframe src={`https://docs.google.com/gview?https://calibre-ebook.com/downloads/demos/demo.docx&embedded=true`} className="w-100 img-fluid h-100"></iframe>
                                                                // return <iframe src='https://view.officeapps.live.com/op/embed.aspx?src=https://calibre-ebook.com/downloads/demos/demo.docx' className="w-100 img-fluid h-100" frameborder='0'></iframe>
                                                                // return <object data={`https://view.officeapps.live.com/op/embed.aspx?src=${modalData.viewFile}`} className="w-100 img-fluid h-100" frameborder='0'></object>
                                                                // return <object data={`https://view.officeapps.live.com/op/embed.aspx?src=https://calibre-ebook.com/downloads/demos/demo.docx`} className="w-100 img-fluid h-100" frameborder='0'></object>
                                                            }
                                                        }
                                                    } else {
                                                        return <Loader showLoader={true} pos={'absolute'} />
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'add_vendor_tags_modal') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={"lg"}
                    className={`custom-modal ${mClass}`}
                >
                    <Modal.Header
                        closeButton
                        className="py-2 bg_04 d-flex align-items-center text-white "
                    >
                        <Modal.Title className="fs-12">Add Vendor Tags</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pb-2">
                        <fieldset className="border rounded">
                            <legend className="w-auto ml-3 fs-14 fw-600">
                                Tags
                            </legend>
                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="form-group">
                                        {/* <CustomTags /> */}
                                        <ReactTags
                                            allowNew
                                            newTagText='Create new tag:'
                                            ref={reactTags}
                                            tags={tags}
                                            suggestions={[]}
                                            onDelete={onDelete}
                                            onAddition={onAddition}
                                            onValidate={onValidate}
                                        />
                                        <p style={{ margin: '0.25rem 0', color: 'gray' }}>
                                            <small><em>Tags must be 3–12 characters in length and only contain the letters A-Z</em></small>
                                        </p>
                                        <hr className="mb-0" />
                                        <div className="stat_chips_block p-3">
                                            {modalData.tags && modalData.tags.length > 0 && <div className="header mb-3"> <h3 className="m-0 fs-12">Tags</h3></div>}
                                            <div className="d-flex flex-wrap">
                                                {modalData.tags && modalData.tags.length > 0 && React.Children.toArray(modalData.tags.map((element, index) => {
                                                    return (
                                                        <div className={`stat_chips_box text-dark position-relative ${index != 0 ? "ml-3" : ""}`}>
                                                            <span>{element.tag_name}</span>
                                                            <span className="position-absolute del_btn badge badge-pill badge-danger link_url" onClick={() => modalData.delVendorTags ? modalData.delVendorTags(element.tag_id, modalData) : null}><i className="fa fa-times"></i></span>
                                                        </div>
                                                        // <div className="react-tags__selected" aria-relevant="additions removals" aria-live="polite">
                                                        //     <button type="button" className="react-tags__selected-tag" title="Click to remove tag">
                                                        //         <span className="react-tags__selected-tag-name">{element.tag_name}</span></button></div>
                                                    )
                                                }))}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </div>

                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="text-right">
                                        <button className="btn btn-primary-2 btn_05 btn_wide" type="button" onClick={() => onSubmit({ tags: tags })}>Submit</button>
                                    </div>
                                </div>
                            </div>
                            <br />
                        </fieldset>


                    </Modal.Body>
                </Modal>
            </>
        );
    }
    if (modalType == 'add_review_call_modal') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={"lg"}
                    className={`custom-modal ${mClass}`}
                >
                    <Modal.Header
                        closeButton
                        className="py-2 bg_04 d-flex align-items-center text-white "
                    >
                        <Modal.Title className="fs-12">Schedule Review Call</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pb-2">
                        <fieldset className="border rounded">
                            <legend className="w-auto ml-3 fs-14 fw-600">
                                Call Info
                            </legend>
                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="form-group">
                                        {/* <CustomTags /> */}
                                        <ReactTags
                                            allowNew
                                            newTagText='Create new tag:'
                                            ref={reactTags}
                                            tags={tags}
                                            suggestions={[]}
                                            onDelete={onDelete}
                                            onAddition={onAddition}
                                            onValidate={onValidate}
                                        />
                                        <p style={{ margin: '0.25rem 0', color: 'gray' }}>
                                            <small><em>Tags must be 3–12 characters in length and only contain the letters A-Z</em></small>
                                        </p>
                                        <hr className="mb-0" />
                                        <div className="stat_chips_block p-3">
                                            {modalData.tags && modalData.tags.length > 0 && <div className="header mb-3"> <h3 className="m-0 fs-12">Tags</h3></div>}
                                            <div className="d-flex flex-wrap">
                                                {modalData.tags && modalData.tags.length > 0 && React.Children.toArray(modalData.tags.map((element, index) => {
                                                    return (
                                                        <div className={`stat_chips_box text-dark position-relative ${index != 0 ? "ml-3" : ""}`}>
                                                            <span>{element.tag_name}</span>
                                                            <span className="position-absolute del_btn badge badge-pill badge-danger link_url" onClick={() => modalData.delVendorTags ? modalData.delVendorTags(element.tag_id, modalData) : null}><i className="fa fa-times"></i></span>
                                                        </div>
                                                        // <div className="react-tags__selected" aria-relevant="additions removals" aria-live="polite">
                                                        //     <button type="button" className="react-tags__selected-tag" title="Click to remove tag">
                                                        //         <span className="react-tags__selected-tag-name">{element.tag_name}</span></button></div>
                                                    )
                                                }))}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </div>

                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="text-right">
                                        <button className="btn btn-primary-2 btn_05 btn_wide" type="button" onClick={() => onSubmit({ tags: tags })}>Submit</button>
                                    </div>
                                </div>
                            </div>
                            <br />
                        </fieldset>


                    </Modal.Body>
                </Modal>
            </>
        );
    }
    if (modalType == 'auditors_remark_modal') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={'md'}
                    className={`custom-modal ${mClass}`}>

                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white ">
                        <Modal.Title className="fs-12">Auditor Remarks <span className="text-danger">*</span></Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pb-2">
                        <form id="addEnqQuestionForm" onSubmit={handleSubmit(onSubmit)} autoComplete="off">

                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="form-group">
                                        <textarea className="form-control border-0"
                                            {...register("auditors_remark", { required: true })}
                                            placeholder="Add Remark...."
                                            rows={4}>

                                        </textarea>
                                        <span className="form_err text-danger d-block"> {errors.auditors_remark?.type === 'required' && 'Remark is required.'}</span>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-group">
                                        {/* <span className="text-danger fs-11"> *Note: To return the assessment please click on return button at the end of the page</span> */}
                                    </div>
                                </div>

                            </div>
                            <hr className="my-2" />
                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <button className="btn btn_1 btn-sm w-auto" type="button" disabled={formSubmitted} onClick={() => hideModal()}>Cancel</button>
                                        <button className="btn btn-primary-2 btn_05" type="submit" disabled={formSubmitted}>Submit</button>

                                    </div>

                                    <div className="w-100">

                                        {(() => {
                                            if (formRes.err && formRes.data.err) {
                                                return (
                                                    <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                                )
                                            }
                                        })()}
                                        {/* <button className="btn-common text-uppercase" disabled={formSubmitted}> Submit </button> */}
                                    </div>
                                </div>
                            </div>

                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
    if (modalType == 'gcp_modal') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={''}
                    className={`custom-modal ${mClass}`}>

                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white ">
                        <Modal.Title className="fs-12">Google OAuth Consent</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pb-2" style={{"margin":"auto"}}>
                        <div className="position-relative">
                         <iframe src={modalData} className="gcp_modal" ></iframe>
                        </div>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
}

export default AirVendorModal