import { useContext, useEffect, useRef, useState } from "react";
import { Accordion, Button, Modal, ProgressBar } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Loader from "../components/partials/Loader";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import { encryptData, GetInitials, GetRandomColor, mentionStrToHtml } from "../helpers/Helper";
import ApiService from "../services/ApiServices";
import AirCalender from "./AirCalender";
import { MentionsInput, Mention } from 'react-mentions'


const AirAdminModal = (intialData) => {
    const { modalType, formSubmit, show, hideModal, modalData, mClass } = intialData
    // const { projectId = null, user } = useContext(LayoutContext)
    const { projectId = null, user = {} } = useContext(LayoutContext)
    const { access_role: accessRole = null, org_id: orgId = 0, is_management: isManagement = '' } = user?.currentUser;
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [formRes, setFormRes] = useState({ staus: false, err: false, data: {} })
    const [formSubmitted, setFormSbmt] = useState(false)
    const [modalFormData, setModalFormData] = useState({})
    const [showLoader, setShowLoader] = useState(false)

    const [msgError, setMsgErr] = useState('')
    const is_evidence_needed = watch('evidence_needed')

    useEffect(() => {
        if (modalType == 'add_enqForm_group') {


        } else if (modalType == 'edit_enqForm_group') {

        }
        if (modalType == 'add_enqForm_question') {


        }

    }, []);


    const handleModalClose = () => {
        // setShowModal(false)
        hideModal()
    };
    // const handleModalShow = () => setShowModal(true);

    const onSubmit = async (data) => {
        let stat = { status: false, err: false, data: {} }
        setFormRes(stat)
        if (modalType == 'add_enqForm_question') {
            if (Object.keys(data).length > 0) {
                setFormSbmt(false)
                data.question_id = modalData.questions.length + 1
                let res = await formSubmit(data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    // handleModalClose()
                }
            }
        } else if (modalType == 'edit_enqForm_question') {
            if (data.title && data.title != '') {
                setFormSbmt(true)
                let res = await formSubmit(data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    handleModalClose()
                }
            }
        }

        return false
    }

    const _ = (el) => {
        return document.getElementById(el);
    }


    if (modalType == 'add_enqForm_question' || modalType == 'edit_enqForm_question') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size={'lg'}
                    className={`custom-modal ${mClass}`}>

                    <Modal.Header closeButton>
                        <Modal.Title>{modalType == 'add_enqForm_question' ? 'Add' : 'Update'} Question</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form id="addEnqQuestionForm" onSubmit={handleSubmit(onSubmit)} autoComplete="off">

                            <div className="row m-0">
                                <div className="col-5">
                                    <div className="form-group">
                                        <input id="newGrp" className="form-control border" type="text" {...register(`new_group`)} />
                                        <span className="form_err text-danger d-block"> {errors.new_group?.type === 'required' && 'question is required.'}</span>
                                    </div>
                                </div>
                                <div className="col-2"><span>Or</span></div>
                                <div className="col-5">
                                    <div className="form-group">
                                        <select className="enqForm_select mw-100" {...register(`group_selected`)}>
                                            <option value={''}> Select Group</option>
                                            {modalData && modalData?.groups.length > 0 && modalData.groups.map((group) => {
                                                return <option value={group.formIndex}> {group.group_name}</option>
                                            })}

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
                                <div className="col-12">
                                    <div className="form-group">
                                        <select className="enqForm_select" {...register(`field_type`, { required: true })}>
                                            <option value={'text'}> Text</option>
                                            <option value={'textarea'}> Textarea</option>
                                            <option value={'date'}> Date</option>
                                        </select>
                                        <span className="form_err text-danger d-block"> {errors.field_type?.type === 'required' && 'Field type is required.'}</span>
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
                                                    <input id="doc_label" className="form-control border" type="text" {...register(`doc_upload_label`)} placeholder="Document Upload Label" />
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
                                        <span className="form_err text-danger d-block"> {errors.date_required?.type === 'required' && 'question is required.'}</span>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-group">
                                        <select className="enqForm_select" {...register(`severity`, { required: true })}>
                                            <option value={'low'}> Low</option>
                                            <option value={'medium'}> Medium</option>
                                            <option value={'high'}> High</option>
                                            <option value={'very high'}> Very High</option>
                                        </select>
                                        <span className="form_err text-danger d-block"> {errors.severity?.type === 'required' && 'Severity is required.'}</span>
                                    </div>
                                </div>
                            </div>
                            <hr />

                            <div className="row m-0">
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

                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
}

export default AirAdminModal