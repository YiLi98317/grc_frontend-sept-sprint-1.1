import React, { useContext, useEffect, useRef, useState } from "react";
import { Accordion, Button, Modal, ProgressBar } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Loader from "../components/partials/Loader";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import { encryptData, GetInitials, GetRandomColor, mentionStrToHtml, ChangeDateFormat } from "../helpers/Helper";
import ApiService from "../services/ApiServices";
import AirCalender from "./AirCalender";
import { MentionsInput, Mention } from 'react-mentions'
import AirSelect from "./AirSelect";
import "../styles/AirModal.css"
import moment from "moment";
import AIR_MSG from "../helpers/AirMsgs";
import { useCSVReader, formatFileSize } from 'react-papaparse';


const AirModal = (intialData) => {
    const { modalType, formSubmit, show, hideModal, modalData, AmSize = "", AmClass = "" } = intialData
    // const { projectId = null, user } = useContext(LayoutContext)
    const { projectId = null, user = {} } = useContext(LayoutContext)
    const { access_role: accessRole = null, org_id: orgId = 0, is_management: isManagement = '' } = user?.currentUser || {};
    const navigate = useNavigate();
    const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm();
    const [formRes, setFormRes] = useState({ staus: false, err: false, data: {} })
    const [formSubmitted, setFormSbmt] = useState(false)
    const [modalFormData, setModalFormData] = useState({})
    const [showLoader, setShowLoader] = useState(false)
    const [taskDetails, setTaskDetails] = useState({})

    const [msgError, setMsgErr] = useState('')
    const [uploadfiles, setUploadFiles] = useState(null)
    const [uploadErr, setUploadErr] = useState('')

    const [taskOwnersList, setTaskOwnersList] = useState([]);
    const [keyMembers, setKeyMembers] = useState([]);
    const [servicePartners, setServicePartners] = useState([]);
    const [priority, setPriority] = useState('');
    const [taskOwner, setTaskOwner] = useState({});
    const [approvalAuthority, setApprovalAuthority] = useState({});
    const [status, setStatus] = useState(null);
    const [dueDate, setDueDate] = useState(null);

    // task detail new change start
    const [comments, setComments] = useState([]);
    const [showEditBox, setShowEditBox] = useState(-1);
    const [showRplyBox, setShowRplyBox] = useState(-1);
    const commentInpRef = useRef()
    const replyCommentInpRef = useRef([])
    const editCommentInpRef = useRef([])
    const [userMentionData, setUserMentionData] = useState([]);
    const [mentionVal, setMentionVal] = useState('');
    const [editMentionVal, setEditMentionVal] = useState('');
    const [replyMentionVal, setReplyMentionVal] = useState('');
    const [fileUrls, setFileUrls] = useState([]);
    const [checkFileType, setCheckFileType] = useState(true);
    const [validFileTypes, setValidFileTypes] = useState(process.env.REACT_APP_SUPPORT_UPLOAD_FILE_TYPE.split(","));
    // task detail new change end

    // Add task change start
    const [evidenceTitle, setEvidenceTitle] = useState([]);
    const [evidenceTitleList, setEvidenceTitleList] = useState([]);

    const [controlCriterias, setCtrlCriterias] = useState([]);
    const [controlCategories, setCtrlCategories] = useState([]);
    const [isoCategories, setIsoCategories] = useState([]);
    const [nistCategories, setNistCategories] = useState([]);
    const [taskFrameworks, setTaskFrameworks] = useState([]);
    // Add task change end
    const form = watch()
    const { CSVReader } = useCSVReader();
    const [fileData, setFileData] = useState([]);

    useEffect(() => {

        //   return () => {
        //     if(fileUrls.length > 0){
        //         for (let  file of fileUrls) {
        //             URL.revokeObjectURL(file.url)
        //         }
        //     }
        //   }
    }, [])


    useEffect(() => {
        if (modalType == "add_new_task") {
            if (taskOwnersList.length == 0 && projectId != null) {
                getTaskOwners()
            }
            if (keyMembers.length == 0 && projectId != null) {
                getKeyMembers()
            }
            if (servicePartners.length == 0 && projectId != null) {
                getServicePartners()
            }
            getEvidenceTitleList()
            modalData.getDueDateExpressions("annually")
            setShowLoader(false)
            setEvidenceTitle([])
            setEvidenceTitleList([])
            register("evidences", { required: false })
            register("control_category", { required: false })
            register("iso_category", { required: false })
            register("nist_csf_category", { required: false })
            register("criteria", { required: false })
        }
        if (modalType == 'view_task_details') {
            if (Object.keys(taskDetails).length == 0) {
                let obj = modalData?.taskDetails ? modalData?.taskDetails : {};
                setTaskDetails(obj)
                if (obj.task && obj.task.length > 0) {
                    setPriority(obj.task[0].priority)
                    setStatus(obj.task[0].task_status)
                    setTaskOwner(oldVal => {
                        let ownerDet = { emp_name: obj.task[0].task_owner, emp_id: obj.task[0].task_owner_id, authority: obj.task[0].authority }
                        return { ...ownerDet }
                    })
                    setApprovalAuthority(oldVal => {
                        let authDet = { emp_name: obj.task[0].key_member, emp_id: obj.task[0].key_member_id, authority: obj.task[0].key_member_authority }
                        return { ...authDet }
                    })
                }
            }
            if (taskOwnersList.length == 0 && projectId != null) {
                getTaskOwners()
            }
            if (keyMembers.length == 0 && projectId != null) {
                getKeyMembers()
            }
            if (servicePartners.length == 0 && projectId != null) {
                getServicePartners()
            }
            if (comments.length == 0 && projectId != null) {
                getCommentsList(modalData?.taskDetails.task[0].task_id)
            }

        }
        if (modalType == 'view_upload_evidence' || modalType == 'view_upload_documents') {
            setMsgErr('')
            setUploadErr('')
            setShowLoader(false)
            setUploadFiles(null)
        }
        if (modalType == 'upload_logo') {
            setMsgErr('')
            setUploadErr('')
            setShowLoader(false)
            setUploadFiles(null)
        }

    }, []);

    useEffect(() => {
        if (accessRole != 'auditor' && (taskOwnersList || taskOwnersList.length > 0 || keyMembers || keyMembers.length > 0 || servicePartners || servicePartners.length > 0)) {
            let commentUsers = [...taskOwnersList, ...keyMembers, ...servicePartners]
            let users = commentUsers && commentUsers.length > 0 && commentUsers.map((myUser) => ({
                id: myUser.emp_id,
                display: `${myUser.emp_name}`,
                authority: myUser.authority
            }));
            setUserMentionData(users)
        }
    }, [taskOwnersList, keyMembers, servicePartners])


    const handleModalClose = () => {
        // setShowModal(false)
        hideModal()
    };
    // const handleModalShow = () => setShowModal(true);

    const onSubmit = async (data) => {
        let stat = { status: false, err: false, data: {} }
        setFormRes(stat)
        if (modalType == 'add_update_title') {
            if (data.title && data.title != '') {
                setFormSbmt(true)
                let res = await formSubmit(data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    handleModalClose()
                }
            }
        }
        if (modalType == 'add_update_title') {
            if (data.title && data.title != '') {
                setFormSbmt(true)
                let res = await formSubmit(data)
                if (res && res.message == 'Success') {
                    setFormSbmt(false)
                    handleModalClose()
                }
            }
        }
        if (modalType == 'document_verify_password_modal') {
            if (data && Object.keys(data).length > 0) {
                setFormSbmt(true)
                let res = await formSubmit(data)
                if (res && res.message == 'Success') {
                    setFormRes(stat)
                    handleModalClose()
                } else {
                    if (!res) {
                        res = { status: 'tv401', message: AIR_MSG.technical_err }
                    }
                    let stat = { status: false, err: true, data: { err: res.message } }
                    setFormRes(stat)

                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'reduce_frequency_modal') {
            if (data && Object.keys(data).length > 0) {
                setFormSbmt(true)
                let res = await formSubmit(data)
                if (res && res.message == 'Success') {
                    setFormRes(stat)
                    handleModalClose()
                } else {
                    if (!res) {
                        res = { status: 'tv401', message: AIR_MSG.technical_err }
                    }
                    let stat = { status: false, err: true, data: { err: res.message } }
                    setFormRes(stat)

                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'add_new_task') {
            let frequencyData = {
                "annually": {
                    frequency_duration: 1,
                    frequency_unit: "year"
                },
                "bi-annually": {
                    frequency_duration: 6,
                    frequency_unit: "month"
                },
                "quarterly": {
                    frequency_duration: 3,
                    frequency_unit: "month"
                },
                "monthly": {
                    frequency_duration: 1,
                    frequency_unit: "month"
                },
                "weekly": {
                    frequency_duration: 7,
                    frequency_unit: "day"
                },
            }
            data.due_date = ChangeDateFormat(data.due_date, 2, 3);
            data.project_id = projectId
            data.frequency_duration = frequencyData[data.task_frequency]["frequency_duration"].toString()
            data.frequency_unit = frequencyData[data.task_frequency]["frequency_unit"]
            data.task_owner_id = data.task_owner_id || -1
            data.approval_authority_id = data.approval_authority_id || -1
            if (data && Object.keys(data).length > 0) {
                setFormSbmt(true)
                let res = await formSubmit(data)
                if (res && res.message == 'Success') {
                    setFormRes(stat)
                    handleModalClose()
                } else {
                    if (!res) {
                        res = { status: 'tv401', message: AIR_MSG.technical_err }
                    }
                    let stat = { status: false, err: true, data: { err: res.message } }
                    setFormRes(stat)
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'import_tasks') {
            setMsgErr('')
            setUploadErr('')
            setShowLoader(true)

            if (uploadfiles == '' || uploadfiles == null || uploadfiles == undefined) {
                setMsgErr(AIR_MSG.file_required);
                return false
            }
            let frequencyData = {
                "annually": {
                    frequency_duration: 1,
                    frequency_unit: "year"
                },
                "bi-annually": {
                    frequency_duration: 6,
                    frequency_unit: "month"
                },
                "quarterly": {
                    frequency_duration: 3,
                    frequency_unit: "month"
                },
                "monthly": {
                    frequency_duration: 1,
                    frequency_unit: "month"
                },
                "weekly": {
                    frequency_duration: 7,
                    frequency_unit: "day"
                },
            }
            data.due_date = ChangeDateFormat(data.due_date, 2, 3);
            data.project_id = projectId
            data.frequency_duration = frequencyData[data.task_frequency]["frequency_duration"].toString()
            data.frequency_unit = frequencyData[data.task_frequency]["frequency_unit"]
            if (data && Object.keys(data).length > 0) {
                setFormSbmt(true)
                let res = await formSubmit(data)
                if (res && res.message == 'Success') {
                    setFormRes(stat)
                    handleModalClose()
                } else {
                    if (!res) {
                        res = { status: 'tv401', message: AIR_MSG.technical_err }
                    }
                    let stat = { status: false, err: true, data: { err: res.message } }
                    setFormRes(stat)
                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'review_call_modal') {
            if (data && Object.keys(data).length > 0) {
                setFormSbmt(true)
                let res = await formSubmit(data)
                if (res && res.message == 'Success') {
                    setFormRes(stat)
                    handleModalClose()
                } else {
                    if (!res) {
                        res = { status: 'tv401', message: AIR_MSG.technical_err }
                    }
                    let stat = { status: false, err: true, data: { err: res.message } }
                    setFormRes(stat)

                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'share_modal') {
            if (data && Object.keys(data).length > 0) {
                setFormSbmt(true)
                let res = await formSubmit(data)
                if (res && res.message == 'Success') {
                    setFormRes(stat)
                    handleModalClose()
                } else {
                    if (!res) {
                        res = { status: 'tv401', message: AIR_MSG.technical_err }
                    }
                    let stat = { status: false, err: true, data: { err: res.message } }
                    setFormRes(stat)

                }
                setFormSbmt(false)
            }
        }
        if (modalType == 'update_task_details') {
            if (data && Object.keys(data).length > 0) {
                setFormSbmt(true)
                data.ele = modalData.ele
                let res = await modalData.callingFn(modalData.type,modalData.value,data)
                if (res && res.message == 'Success') {
                    setFormRes(stat)
                    handleModalClose()
                } else {
                    if (!res) {
                        res = { status: 'tv401', message: AIR_MSG.technical_err }
                    }
                    let stat = { status: false, err: true, data: { err: res.message } }
                    setFormRes(stat)

                }
                setFormSbmt(false)
            }
        }
        return false
    }

    const _ = (el) => {
        return document.getElementById(el);
    }

    const progressHandler = (event) => {
        _("loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of " + event.total;
        var percent = (event.loaded / event.total) * 100;
        _("progressBar").value = Math.round(percent);
        _("status").innerHTML = Math.round(percent) + "% uploaded... please wait";
    }

    const completeHandler = (event) => {
        _("status").innerHTML = event.target.responseText;
        _("progressBar").value = 0; //wil clear progress bar after successful upload
    }

    const errorHandler = (event) => {
        _("status").innerHTML = "Upload Failed";
    }

    const abortHandler = (event) => {
        _("status").innerHTML = "Upload Aborted";
    }

    const onFileChange = (event = null) => {
        setMsgErr('')
        setUploadErr('')
        if (event == null) {
            return false
        }
        let files = event.target.files
        let filesArray = Array.from(files);
        if (checkFileType) {
            if (checkFileTypeValidation(filesArray)) {
                setUploadFiles(filesArray)
            }
        } else {
            setUploadFiles(filesArray)
        }
    }

    const uploadFile = async () => {
        setMsgErr('')
        setUploadErr('')
        setShowLoader(true)

        if (uploadfiles == '' || uploadfiles == null || uploadfiles == undefined) {
            setMsgErr(AIR_MSG.file_required);
            return false
        }
        let upRes = null
        let tskId = modalData.taskId
        if (modalData.taskInfo.isVirtual == "Y") {
            let fData = { task_end_date: moment(modalData.taskInfo.dueDate, 'MMM DD, YYYY').format('YYYY-MM-DD') };
            upRes = await modalData.saveTaskDetails(fData, true);
            tskId = upRes.taskId
        }

        let formData = new FormData();
        let files = []
        if (uploadfiles && uploadfiles.length > 0) {
            for (var i = 0; i < uploadfiles.length; i++) {
                formData.append(`file[${i}]`, uploadfiles[i])
            }
        }
        // formData.append(`file`, uploadfiles)
        let checkValidation = false;

        if (checkFileType) {
            checkValidation = checkFileTypeValidation(uploadfiles)
        } else {
            checkValidation = true
        }

        if (checkValidation) {
            let payloadUrl = `evidences/uploadEvidence/${modalData.evidenceTypeId}/${tskId}`;
            let method = "POST"
            let res = await ApiService.fetchData(payloadUrl, method, formData, 'form');
            if (res && res.message == "Success") {
                setShowLoader(false)
                setFormSbmt(false)
                hideModal(tskId, upRes);
                // setUploadErr('We are not able to create your profile at this moment. Please continue by filling in fields manually')
            } else {
                setFormSbmt(false)
                setShowLoader(false)
                // setUploadErr(res.message)
            }
        }

    }

    const onUploadDocuments = async() => {
       
        setMsgErr('')
        setUploadErr('')
        setShowLoader(true)

        if (uploadfiles == '' || uploadfiles == null || uploadfiles == undefined || uploadfiles.length == 0) {
            setMsgErr(AIR_MSG.file_required);
            setShowLoader(false)
            return false
        }
        let formData = new FormData();
        let files = []
        if (uploadfiles.length > 0) {
            for (var i = 0; i < uploadfiles.length; i++) {
                formData.append(`file[${i}]`, uploadfiles[i])
            }
        }
        let checkValidation = false;

        if (checkFileType) {
            checkValidation = checkFileTypeValidation(uploadfiles)
        } else {
            checkValidation = true
        }
        if (checkValidation) {
            let payloadUrl = `configuration/assetRegiterUpload/${modalData.projectId}`;
            let method = "POST"
            let res = await ApiService.fetchData(payloadUrl, method, formData, 'form');
            if (res && res.message == "Success") {
                setShowLoader(false)
                setFormSbmt(false)
                hideModal(modalData.projectId);
            } else {
                setFormSbmt(false)
                setShowLoader(false)
            }
        }

    }

    const checkFileTypeValidation = (filesArray = []) => {
        if (!filesArray.length) {
            return false;
        }
        if (!checkFileType) {
            return true;
        }
        let validExt = Object.assign([], validFileTypes)
        for (let i = 0; i < filesArray.length; i++) {
            let fileName = filesArray[i]["name"];
            let ext = fileName.split('.').pop();
            if (!validExt.includes(ext)) {
                setMsgErr(AIR_MSG.select_valid_file_format)
                return false;
            }
        }
        return true;
    }

    const removeUploadFile = async (fileIndex = null) => {
        if (fileIndex == null) {
            return false
        }
        let files = uploadfiles;
        files.splice(fileIndex, 1)
        setUploadFiles(oldVal => {
            return [...files]
        })
    }

    const resetFile = () => {
        setUploadFiles(null);
        setMsgErr('')
        setUploadErr('')
    }


    const getTaskOwners = async () => {
        let payloadUrl = `tasks/getProjectMembers/${projectId}/task_owner`
        let method = "GET";
        let formData = {};
        let res = await ApiService.fetchData(payloadUrl, method);
        if (res && res.message == "Success") {
            setTaskOwnersList(oldVal => {
                return [...res.results]
            })
        }

    }

    const getKeyMembers = async () => {
        let payloadUrl = `tasks/getProjectMembers/${projectId}/key_member`
        let method = "GET";
        let res = await ApiService.fetchData(payloadUrl, method);
        if (res && res.message == "Success") {
            let tempKeyMembers = []
            for (let item of res.results) {
                if (item.authority.indexOf('v') != 0) {
                    tempKeyMembers.push(item)
                }
            }

            setKeyMembers(oldVal => {
                return [...tempKeyMembers]
            })
        }

    }

    const getServicePartners = async () => {
        let payloadUrl = `tasks/getProjectMembers/${projectId}/service_partner`
        let method = "GET";
        let res = await ApiService.fetchData(payloadUrl, method);
        if (res && res.message == "Success") {
            setServicePartners(oldVal => {
                return [...res.results]
            })
        }
    }

    const updateTaskDetails = async (type = null, value = null) => {
        if (type == null || value == null) {
            return false
        }
        setFormSbmt(true)
        // let obj = { priority, status, dueDate, taskOwner, authority: approvalAuthority }
        let obj = {}
        if (type == "priority") {
            obj.priority = value
            setPriority(oldVal => {
                return value
            })
        } else if (type == "owner") {
            obj.taskOwner = value
            setTaskOwner(oldVal => {
                return value
            })
        } else if (type == "authority") {
            obj.authority = value
            setApprovalAuthority(oldVal => {
                return value
            })
        } else if (type == "status") {
            obj.status = value
            setStatus(oldVal => {
                return value
            })
        } else if (type == "due_date") {
            obj.dueDate = value
            setDueDate(oldVal => {
                return value
            })
        }
        saveTaskDetails(obj)
    }

    const onChangeDate = (startDate = null, endDate = null) => {
        if (modalType == 'add_new_task') {
            setValue('due_date', startDate, { shouldValidate: true })
        }

        //updateTaskDetails("due_date", startDate)
    }

    const updateTaskStatus = (type = null, value = null) => {
        if (type == null || value == null) {
            return false
        }
        setFormSbmt(true)
        let obj = {}
        switch (type) {
            case 'admin_status':
                obj.adminStatus = value
                break;
        }

        saveTaskDetails(obj)
    }

    const saveTaskDetails = async (data = null) => {
        let taskId = taskDetails && taskDetails?.task && taskDetails?.task[0]?.task_id
        if (data == null || !taskId) {
            return false
        }
        if (!data.status && !data.priority && !data.dueDate && (data.taskOwner && Object.keys(data.taskOwner).length == 0) && (data.authority && Object.keys(data.authority).length == 0)) {
            return false
        }

        let payloadUrl = `tasks/updateTaskDetails/${taskId}`
        let method = "POST";
        // let formData = {priority:priority,task_status:status,task_owner_id:taskOwner.emp_id,task_end_date:''};
        let formData = {};
        if (data.status) {
            formData.task_status = data.status;
        }
        if (data.priority) {
            formData.priority = data.priority;
        }
        if (data.taskOwner && Object.keys(data.taskOwner).length > 0) {
            formData.task_owner_id = data.taskOwner.emp_id;
        }
        if (data.authority && Object.keys(data.authority).length > 0) {
            formData.key_member_id = data.authority.emp_id;
        }
        if (data.dueDate) {
            formData.task_end_date = data.dueDate;
        }
        if (data.adminStatus) {
            formData.admin_status = data.adminStatus;
        }
        let res = await ApiService.fetchData(payloadUrl, method, formData);
        if (res && res.message == "Success") {
            setFormSbmt(false)
            hideModal();
            return true
        }

    }


    const getCommentsList = async (tId = 0) => {
        let taskId = tId || taskDetails.task[0]?.task_id
        if (tId == 0) {
            return false
        }

        let payloadUrl = `tasks/listComments/${taskId}`
        let method = "GET";
        let res = await ApiService.fetchData(payloadUrl, method);
        if (res && res.message == "Success") {
            setComments(oldVal => {
                return [...res.results]
            })
        }

    }
    const addComment = async (parentCommentId = 0, commentIndex = null) => {
        let taskId = taskDetails.task[0]?.task_id
        if (taskId == 0) {
            return false
        }
        // let inpELe = parentCommentId == 0 && commentIndex != null ? commentInpRef.current : replyCommentInpRef.current[commentIndex];
        let inpELe = commentIndex != null ? replyCommentInpRef.current[commentIndex] : commentInpRef.current;
        let comment = mentionVal || inpELe.value
        if (!comment || comment == '') {
            return false
        }
        let payloadUrl = `tasks/addComment`
        let method = "POST";
        let formData = {
            project_task_id: taskId,
            comment_text: comment,
            parent_comment_id: parentCommentId,
        }
        let res = await ApiService.fetchData(payloadUrl, method, formData);
        if (res && res.message == "Success") {
            inpELe.value = ''
            getCommentsList(taskId)
            setShowRplyBox(-1)
            setShowEditBox(-1)
        }

    }
    const updateComment = async (commentId = 0, commentIndex = null) => {
        let taskId = taskDetails.task[0]?.task_id
        if (taskId == 0 || commentId == 0 || commentIndex == null) {
            return false
        }
        let inpELe = editCommentInpRef.current[commentIndex];
        let comment = editMentionVal || inpELe.value
        if (!comment || comment == '') {
            return false
        }
        let payloadUrl = `tasks/updateComment`
        let method = "POST";
        let formData = {
            project_task_id: taskId,
            comment_text: comment,
            comment_id: commentId,
        }
        let res = await ApiService.fetchData(payloadUrl, method, formData);
        if (res && res.message == "Success") {
            inpELe.value = '';
            getCommentsList(taskId)
            setShowRplyBox(-1)
            setShowEditBox(-1)
        }

    }
    const delComment = async (commentId = 0) => {
        let taskId = taskDetails.task[0]?.task_id
        if (taskId == 0 || commentId == 0) {
            return false
        }
        let payloadUrl = `tasks/deleteComment`
        let method = "DELETE";
        let formData = {
            project_task_id: taskId,
            comment_id: commentId,
        }
        let res = await ApiService.fetchData(payloadUrl, method, formData);
        if (res && res.message == "Success") {
            getCommentsList(taskId)
        }

    }

    const toggleEditBox = (commentIndex = null) => {
        if (commentIndex == null) {
            return false
        }
        if (!editCommentInpRef.current[commentIndex]) {
            let comment = comments[commentIndex] ? comments[commentIndex].comment_text : ''
            setShowEditBox(commentIndex)
            setEditMentionVal(comment)
        } else {
            setShowEditBox(-1)
        }
        setShowRplyBox(-1)

    }
    const toggleRplyBox = (commentIndex = null) => {
        if (commentIndex == null) {
            return false
        }
        setShowEditBox(-1)
        setShowRplyBox(commentIndex)
    }

    const getSubComments = (subComments = null, cIndex = null) => {
        if (cIndex == null) {
            return false
        }
        return (
            <>
                {(() => {
                    if (subComments && subComments.length > 0) {
                        return (
                            <div className="comments_rply_sec mt-4">
                                <ul className="chatSection sub">
                                    {subComments.map((comment, subKey) => {
                                        return (
                                            <li key={`${cIndex}_${subKey}`} className="d-flex flex-column align-items-stretch mb-4 pl-5">
                                                <div className="chatItem w-100 m-0">
                                                    {/* <img src="/assets/img/chatU3.svg" alt="" className="mr-2 p-1" /> */}
                                                    <span className="air_initials m-0 mr-2" >
                                                        <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(comment.commented_by_name)}</span>
                                                    </span>
                                                    <div className="flex-fill">
                                                        <h4 className="mb-0">{comment.commented_by_name} <span className="timeState ml-2">{comment.commented_on}</span></h4>
                                                        {(() => {
                                                            if (showEditBox != -1 && showEditBox == `${cIndex}_${subKey}`) {
                                                                return (
                                                                    <div className="edit_comment_box w-100">
                                                                        <div className="editInpField w-100">
                                                                            <textarea className="form-control border" rows={4} defaultValue={comment.comment_text} ref={el => (editCommentInpRef.current[`${cIndex}_${subKey}`] = el)}></textarea>
                                                                            {/* <input className="form-control" ref={el => (editCommentInpRef.current[`${cIndex}_${subKey}`] = el)} /> */}
                                                                        </div>
                                                                        <div className="editSubmitBtn text-right mt-3">
                                                                            <Button className="btn_1_inverse btn_1" variant="outline-dark" onClick={() => { updateComment(comment.comment_id, `${cIndex}_${subKey}`) }}>Update</Button>
                                                                            <Button className="btn_1 ml-2" variant="outline-dark" onClick={() => toggleEditBox(-1)}>Cancel</Button>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            } else {
                                                                return <p className="mb-0">{comment.comment_text}</p>
                                                            }
                                                        })()}
                                                        {(() => {
                                                            if (Number(user?.currentUser.org_emp_id) == Number(comment.commented_by_id)) {
                                                                return (
                                                                    <>
                                                                        <span className="edit_reply_btn" onClick={() => { toggleEditBox(`${cIndex}_${subKey}`) }}>{showEditBox != -1 && showEditBox == `${cIndex}_${subKey}` ? 'cancel' : 'Edit'}</span>
                                                                        {/* <span className="edit_reply_btn" onClick={() => { toggleRplyBox(`${cIndex}_${subKey}`) }}>Reply</span> */}
                                                                        <span className="edit_reply_btn" onClick={() => { delComment(comment.comment_id) }}>Delete</span>
                                                                    </>
                                                                )
                                                            }
                                                        })()}

                                                    </div>
                                                </div>

                                                {/* {(() => {
                              if (showRplyBox != -1 && showRplyBox == `${cIndex}_${subKey}`) {
                                return (
                                  <div className="rply_comment_box d-flex flex-wrap ml-5">
                                    <div className="rplyInpField">
                                      <input className="form-control" ref={el => (replyCommentInpRef.current[`${cIndex}_${subKey}`] = el)} />
                                    </div>
                                    <div className="rplySubmitBtn">
                                      <Button className="btn_1 btn_wide " variant="outline-dark" onClick={() => { addComment(comment.comment_id, `${cIndex}_${subKey}`) }}>Reply</Button>
                                    </div>
                                  </div>
                                )
                              }
                            })()} */}
                                                {comment.repliedComments && comment.repliedComments.length > 0 && getSubComments(comment.repliedComments, `${cIndex}_${subKey}`)}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )
                    }
                })()}
            </>
        )
    }

    const handleChange = (event, newValue, newPlainTextValue, mentions) => {
        setMentionVal(newValue)

    };
    const handleEditChange = (event, newValue, newPlainTextValue, mentions) => {
        setEditMentionVal(newValue)

    };

    // const users = [
    //     {
    //         _id: '123',
    //         name: { first: 'John', last: 'Reynolds' },
    //     },
    //     {
    //         _id: '234',
    //         name: { first: 'Holly', last: 'Reynolds' },
    //     },
    //     {
    //         _id: '345',
    //         name: { first: 'Ryan', last: 'Williams' },
    //     },
    // ];


    // const userMentionData = users.map((myUser) => ({
    //     id: myUser._id,
    //     display: `${myUser.name.first} ${myUser.name.last}`,
    // }));

    const renderUserSuggestion = (entry, search, highlightedDisplay, index, focused) => {
        return (
            <span className="comment_mentions_box">
                <span className="air_initials m-0 mr-2" >
                    <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(entry.display)}</span>
                </span>
                {entry.display}
            </span>
        )
    }

    const getFileUrl = (file = null) => {
        if (file == null) {
            return null
        }

        let fileObjUrl = URL.createObjectURL(file)
        if (fileObjUrl) {
            let tempFileUrls = Object.assign([], fileUrls)
            let obj = {
                url: fileObjUrl,
                details: file
            }
            tempFileUrls.push(obj)
            // setFileUrls(oldVal =>{
            //     return [...tempFileUrls]
            // })
        }

        return fileObjUrl
    }

    const isImg = (file = null) => {
        if (file == null) {
            return false
        }
        let fileType = (file.type).substr((file.type).lastIndexOf('/') + 1)
        if (fileType == 'jpeg' || fileType == 'jpg' || fileType == 'png' || fileType == 'webp' || fileType == 'svg' || fileType == 'gif') {
            return true
        } else {
            return false
        }

    }

    const getEvidenceTitleList = async () => {
        let payloadUrl = `reference/getEvidences`
        let method = "GET";
        let res = await ApiService.fetchData(payloadUrl, method);
        if (res && res?.message == "Success") {
            setEvidenceTitleList(res?.results)
        }
    }

    const createEvidenceTitle = async (title = null) => {
        if (title == null) {
            return
        }
        let payloadUrl = `reference/addEvidence`
        let method = "POST";
        let res = await ApiService.fetchData(payloadUrl, method, { name: title });
        if (res && res?.message == "Success") {
            let evi_id = res?.evidence_id;
            setEvidenceTitleList([...evidenceTitleList, { id: evi_id, name: title }])
            setEvidenceTitle([...evidenceTitle, { value: evi_id, label: title }])
            let evidenceArray = getValues("evidences") || []
            setValue("evidences", [...evidenceArray, evi_id], { shouldValidate: true })
        }
    }

    const addEvidenceTitle = (val) => {
        setEvidenceTitle(val)
        setValue('evidences', val.map(({ value }) => value), { shouldValidate: true })
    }
    const createControlTitle = async (title = null, type = null) => {
        if (title == null || type == null) {
            return
        }
        if (type == "soc2") {
            let tmpCategories = [...controlCategories,{ value: title, label: title }]
            setCtrlCategories(tmpCategories)
            setValue('control_category', tmpCategories.map(({ value }) => value), { shouldValidate: true })
        } else if (type == "iso") {
            let tmpCategories = [...isoCategories,{ value: title, label: title }]
            setIsoCategories(tmpCategories)
            setValue('iso_category', tmpCategories.map(({ value }) => value), { shouldValidate: true })
        } else if (type == "nist") {
            let tmpCategories = [...nistCategories,{ value: title, label: title }]
            setNistCategories(tmpCategories)
            setValue('nist_csf_category', tmpCategories.map(({ value }) => value), { shouldValidate: true })
        }

    }
    const addSoc2ControlCategories = (val) => {
        setCtrlCategories(val)
        setValue('control_category', val.map(({ value }) => value), { shouldValidate: true })
    }
    const addIsoControlCategories = (val) => {
        setIsoCategories(val)
        setValue('iso_category', val.map(({ value }) => value), { shouldValidate: true })
    }
    const addNistControlCategories = (val) => {
        setNistCategories(val)
        setValue('nist_csf_category', val.map(({ value }) => value), { shouldValidate: true })
    }
    const addTaskControlCriteria = (val) => {
        setCtrlCriterias(val)
        setValue('criteria', val.map(({ value }) => value), { shouldValidate: true })
    }
    const updatedTaskFrequency = async (e) => {
        setShowLoader(true)
        let firstData = await modalData.getDueDateExpressions(e.target.value)
        if (firstData) {
            setValue("due_date_expression", firstData)
        }
        setShowLoader(false)
    }

    const onSelectFileToUpload = (results) => {
        setFileData(oldVal => {
            return [...results.data]
        })
    }
    const onSelectFramework = (frameworks = null) => {
        if (frameworks == null) {
            return false
        }
        let frameworksArr = frameworks.map(item => {
            let val = item.value == 100001 ? 'soc2' : (item.value == 100002 ? 'iso' : (item.value == 100003 ? 'nist' : 'health'))
            return val
        })
        setTaskFrameworks(oldVal => {
            return [...frameworksArr]
        })
        if (!modalData?.frameworkCategories?.soc2 && frameworksArr.includes("soc2")) {
            modalData.getFrameWorkControlCategories("soc2")
        } else {
            setCtrlCategories([])
        }
        if (!modalData?.frameworkCategories?.iso && frameworksArr.includes("iso")) {
            modalData.getFrameWorkControlCategories("iso")
        } else {
            setIsoCategories([])
        }
        if (!modalData?.frameworkCategories?.nist && frameworksArr.includes("nist")) {
            modalData.getFrameWorkControlCategories("nist")
        } else {
            setIsoCategories([])
        }

    }

    if (modalType == 'view_task_details') {
        return (
            <>

                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop={true}
                    keyboard={true}
                    size={AmSize ? AmSize : "xl"}
                    className={`custom-modal task_details_modal ${AmClass}`}
                    scrollable={true}
                >
                    <Modal.Header closeButton>
                        <Modal.Title></Modal.Title>
                        {/* <Modal.Title>Task Details <a className="taskDetailPage_link position-absolute ml-3" onClick={() => navigate(`/task-details/${encryptData(taskDetails?.task[0]?.task_id)}`)}><i className="fa fa-external-link"></i></a></Modal.Title> */}
                        {/* <Modal.Title ><a className="taskDetailPage_link position-absolute ml-3" onClick={() => navigate(`/task-details/${encryptData(JSON.stringify({ taskId: taskDetails?.task[0]?.task_id, dueDate: taskDetails?.task[0]?.due_date, isVirtual: taskDetails?.task[0]?.is_virtual }))}`)}><i className="fa fa-external-link"></i></a></Modal.Title> */}
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <div id="taskDetails_sec">
                                <div className="task_overview_block">
                                    <div className="row">
                                        <div className="col">
                                            <div className="task_details_block">
                                                <div className="task_name_block">
                                                    <span className="task_name mr-2 fs-18 link_url text_underline" onClick={() => navigate(`/task-details/${encryptData(JSON.stringify({ taskId: taskDetails?.task[0]?.task_id, dueDate: taskDetails?.task[0]?.due_date, isVirtual: taskDetails?.task[0]?.is_virtual }))}`)}>{taskDetails && taskDetails?.task && taskDetails?.task[0]?.title}</span>
                                                </div>
                                                <div className="task_detail_status_block">
                                                    <div className="box mt-4">
                                                        <label className="col-auto m-0 pl-0 text_color_2"> Priority</label>
                                                        <div className="col p-0"> <span id="priorityOptions" className={`m-0 badge badge-pill badge-${priority.toLowerCase() == 'low' ? 'success' : (priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{priority.toUpperCase()}</span></div>
                                                    </div>
                                                    <div className="box mt-2">
                                                        <label className="col-auto m-0 pl-0 text_color_2"> Task Owner</label>
                                                        <div className="col p-0"> <span>{Object.keys(taskOwner).length > 0 && taskOwner.emp_name != '-' ? `${taskOwner.emp_name} (${taskOwner.authority})` : 'Not Assigned'}</span> </div>
                                                    </div>
                                                    <div className="box mt-2">
                                                        <label className="col-auto m-0 pl-0 text_color_2"> Due Date</label>
                                                        <div className="col p-0"> <span className="">{(taskDetails && taskDetails?.task && taskDetails?.task[0]?.due_date) ? taskDetails?.task[0]?.due_date : 'Not set'}</span> </div>
                                                    </div>
                                                    <div className="box mt-2">
                                                        <label className="col-auto m-0 pl-0 text_color_2"> Status</label>
                                                        <div className="col p-0"> <span id="statusOptions" className={`text-${status == "pending" ? 'danger' : (status == 'in_progress' ? 'warning' : (status == 'review' ? 'primary' : 'success'))}`}>{status == "pending" ? 'Pending' : (status == 'in_progress' ? 'In Progress' : (status == 'review' ? 'Under Review' : 'Completed'))}</span> </div>
                                                    </div>
                                                </div>
                                                <div className="task_detail_info_block mt-4">
                                                    <h4 className="fs-16 fw-600"> Description</h4>
                                                    <p className="desc text_color_2 fs-13 fw-400 mt-3 mb-0">
                                                        {taskDetails && taskDetails?.task && taskDetails?.task[0]?.description}
                                                    </p>

                                                    {/* <div className="card mt-4">
                                                        <div className="card-body p-0">
                                                            <div className="task_card_block assets_block">
                                                                <div className="card_block p-3">
                                                                    <Accordion activeKey="0" alwaysOpen>
                                                                        <Accordion.Item eventKey="0">
                                                                            <Accordion.Header onClick={null}>Applicable Assets</Accordion.Header>
                                                                            <Accordion.Body>
                                                                                <div className="assets_list pl-2">
                                                                                    {(() => {
                                                                                        if (taskDetails && taskDetails?.applicable_assets && taskDetails?.applicable_assets?.peoples.length > 0) {
                                                                                            return (
                                                                                                <>
                                                                                                    <div className="assets_box pt-3">
                                                                                                        <div className="header">People</div>
                                                                                                        <ul className="m-0 pl-2">
                                                                                                            <li className="d-flex justify-content-between">
                                                                                                                <span>Employees:</span>
                                                                                                                <span>{taskDetails?.applicable_assets?.peoples[0]?.employees ? taskDetails?.applicable_assets?.peoples[0]?.employees : 0}</span>
                                                                                                            </li>
                                                                                                            <li className="d-flex justify-content-between">
                                                                                                                <span>Consultants:</span>
                                                                                                                <span>{taskDetails?.applicable_assets?.peoples[0]?.consultants ? taskDetails?.applicable_assets?.peoples[0]?.consultants : 0}</span>
                                                                                                            </li>
                                                                                                        </ul>
                                                                                                    </div>
                                                                                                </>
                                                                                            )
                                                                                        }
                                                                                    })()}
                                                                                    {(() => {
                                                                                        if (taskDetails && taskDetails?.applicable_assets && taskDetails?.applicable_assets?.technology_assets.length > 0) {
                                                                                            return (
                                                                                                <>
                                                                                                    <div className="assets_box pt-3">
                                                                                                        <div className="header">Technology Assets</div>
                                                                                                        <ul className="m-0 pl-2">
                                                                                                            <li className="d-flex justify-content-between">
                                                                                                                <span>Endpoints:</span>
                                                                                                                <span>{taskDetails?.applicable_assets?.technology_assets[0]?.endpoints ? taskDetails?.applicable_assets?.technology_assets[0]?.endpoints : 0}</span>
                                                                                                            </li>
                                                                                                            <li className="d-flex justify-content-between">
                                                                                                                <span>Mobile Devices:</span>
                                                                                                                <span>{taskDetails?.applicable_assets?.technology_assets[0]?.mobile_devices ? taskDetails?.applicable_assets?.technology_assets[0]?.mobile_devices : 0}</span>
                                                                                                            </li>
                                                                                                            <li className="d-flex justify-content-between">
                                                                                                                <span>Servers:</span>
                                                                                                                <span>{taskDetails?.applicable_assets?.technology_assets[0]?.servers ? taskDetails?.applicable_assets?.technology_assets[0]?.servers : 0}</span>
                                                                                                            </li>
                                                                                                        </ul>
                                                                                                    </div>
                                                                                                </>
                                                                                            )
                                                                                        }
                                                                                    })()}
                                                                                    {(() => {
                                                                                        if (taskDetails && taskDetails?.applicable_assets && taskDetails?.applicable_assets?.vendors.length > 0) {
                                                                                            return (
                                                                                                <>
                                                                                                    <div className="assets_box pt-3">
                                                                                                        <div className="header">Vendors/Service Providers</div>
                                                                                                        <ul className="m-0 pl-2">
                                                                                                            {taskDetails?.applicable_assets?.vendors && taskDetails?.applicable_assets?.vendors.map((vendor, vIndex) => {
                                                                                                                return (
                                                                                                                    <li key={vIndex} className="d-flex justify-content-between">
                                                                                                                        <span>{vendor.vendor}</span>
                                                                                                                        <span></span>
                                                                                                                    </li>
                                                                                                                )
                                                                                                            })}
                                                                                                        </ul>
                                                                                                    </div>

                                                                                                </>
                                                                                            )
                                                                                        }
                                                                                    })()}
                                                                                    {(() => {
                                                                                        if (taskDetails && taskDetails?.applicable_assets && taskDetails?.applicable_assets?.third_party_utilities.length > 0 && taskDetails?.applicable_assets?.third_party_utilities.filter(ut => ut.is_selected == "Y").length > 0) {
                                                                                            return (
                                                                                                <>
                                                                                                    <div className="assets_box pt-3">
                                                                                                        <div className="header">Saas/Third Party Utility</div>
                                                                                                        <ul className="m-0 pl-2">
                                                                                                            {taskDetails?.applicable_assets?.third_party_utilities && taskDetails?.applicable_assets?.third_party_utilities.map((utility, uIndex) => {
                                                                                                                if (utility.is_selected == 'Y') {
                                                                                                                    return (
                                                                                                                        <li key={uIndex} className="d-flex justify-content-between">
                                                                                                                            <span>{utility.name}</span>
                                                                                                                            <span></span>
                                                                                                                        </li>
                                                                                                                    )
                                                                                                                }
                                                                                                            })}
                                                                                                        </ul>
                                                                                                    </div>
                                                                                                </>
                                                                                            )
                                                                                        }
                                                                                    })()}
                                                                                </div>
                                                                            </Accordion.Body>
                                                                        </Accordion.Item>
                                                                    </Accordion>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div> */}
                                                    {/* <div className="card mt-4">
                                                        <div className="card-body p-0">
                                                            <div className="task_card_block evidence_block">
                                                                <div className="card_block p-3">
                                                                    <div className="header my-2">
                                                                        <h3 className="m-0">Evidence Needed</h3>
                                                                    </div>
                                                                    {taskDetails && taskDetails?.evidence_needed && taskDetails?.evidence_needed.map((evidence, eIndex) => {
                                                                        return (
                                                                            <div key={eIndex} className="px-0">
                                                                                <div className="card_box px-0">
                                                                                    <span> <i className="fa fa-file" aria-hidden="true"></i> {evidence.evidence_name}</span>
                                                                                </div>
                                                                                <div className="evidences_list px-4">
                                                                                    <ul className="m-0 p-0 px-2">
                                                                                        {evidence && evidence.evidence_uploaded && evidence.evidence_uploaded.length > 0 && evidence.evidence_uploaded.map((evDocs, evIndex) => {
                                                                                            return (
                                                                                                <li key={evIndex} className="d-flex justify-content-between my-2">
                                                                                                    <span>&#8627; {evDocs.file_name}</span>
                                                                                                    <span className="action">
                                                                                                    </span>
                                                                                                </li>
                                                                                            )
                                                                                        })}
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                                <div className="w-100 pb-3">
                                                                    <div className="control_button_block pl-3">
                                                                        <Button className="btn_2" variant="outline-dark">Sample Evidence library</Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>

                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'view_upload_evidence') {
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
                        <Modal.Title>Upload Evidence</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <div id="form_file_upload_modal">
                                {(() => {
                                    if (uploadfiles == null || uploadfiles.length < 1) {
                                        return (
                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column">
                                                <input
                                                    className="fileUploadInp"
                                                    type="file"
                                                    name="file"
                                                    accept=".doc,.docx,.pdf,.xls,.xlsx,image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                                                    onChange={(e) => onFileChange(e)}
                                                    id="file"
                                                    data-multiple-caption="{count} files selected"
                                                    multiple
                                                />
                                                <i className="fa fa-upload" aria-hidden="true"></i>
                                                <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or drag it here</span>.</label>
                                                <label htmlFor="file"><strong>({AIR_MSG.supported_file_format})</strong></label>

                                                {msgError && <p className="text-danger p-2">{msgError}</p>}
                                            </div>
                                        )

                                    } else {
                                        return (
                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column">
                                                <div className="uploadsList my-2 text-center">
                                                    {uploadfiles && uploadfiles.length > 0 && uploadfiles.map((file, fIndex) => {
                                                        return (
                                                            <div key={fIndex} className="file_card position-relative">
                                                                {(() => {
                                                                    if (isImg(file)) {
                                                                        return <span className=""><img src={getFileUrl(file)} className="img-fluid" /></span>
                                                                    } else {
                                                                        return <span className=""><img src={`/assets/img/document.png`} className="img-fluid" /></span>
                                                                    }
                                                                })()}

                                                                <span className="close_btn link_url position-absolute" onClick={() => removeUploadFile(fIndex)}><i className="fa fa-times"></i></span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="taskDetails_btn_block px-3">
                                                    <div className="card_button_block ">
                                                        <Button className="btn_1 btn_wide " variant="outline-dark" type="submit" onClick={() => uploadFile()}>Upload</Button>
                                                    </div>
                                                    {/* <ProgressBar animated now={45} label={'45'} /> */}
                                                </div>
                                                <Loader showLoader={showLoader}></Loader>
                                            </div>
                                        )

                                    }
                                })()}



                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'view_upload_documents') {
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
                        <Modal.Title>Upload Documents</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <div id="form_file_upload_modal">
                                {(() => {
                                    if (uploadfiles == null || uploadfiles.length < 1) {
                                        return (
                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column">
                                                <input
                                                    className="fileUploadInp"
                                                    type="file"
                                                    name="file"
                                                    accept=".doc,.docx,.pdf,.xls,.xlsx,image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                                                    onChange={(e) => onFileChange(e)}
                                                    id="file"
                                                    data-multiple-caption="{count} files selected"
                                                    multiple
                                                />
                                                <i className="fa fa-upload" aria-hidden="true"></i>
                                                <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or drag it here</span>.</label>
                                                <label htmlFor="file"><strong>({AIR_MSG.supported_file_format})</strong></label>
                                                {msgError && <p className="text-danger p-2">{msgError}</p>}
                                            </div>
                                        )

                                    } else {
                                        return (
                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column">
                                                <div className="uploadsList my-2 text-center">
                                                    {uploadfiles && uploadfiles.length > 0 && uploadfiles.map((file, fIndex) => {
                                                        return (
                                                            <div key={fIndex} className="file_card position-relative">
                                                                {/* <span className=""><img src={URL.createObjectURL(file)} className="img-fluid" /></span> */}
                                                                {(() => {
                                                                    if (isImg(file)) {
                                                                        return <span className=""><img src={getFileUrl(file)} className="img-fluid" /></span>
                                                                    } else {
                                                                        return <span className=""><img src={`/assets/img/document.png`} className="img-fluid" /></span>
                                                                    }
                                                                })()}
                                                                <span className="close_btn link_url position-absolute" onClick={() => removeUploadFile(fIndex)}><i className="fa fa-times"></i></span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="taskDetails_btn_block px-3">
                                                    <div className="card_button_block ">
                                                        {/* <Button className="btn_1 btn_wide " variant="outline-dark" type="submit" onClick={() => formSubmit(modalData.gKey, modalData.qKey, uploadfiles)}>Upload</Button> */}
                                                        <Button className="btn_1 btn_wide " variant="outline-dark" type="submit" onClick={() => onUploadDocuments()}>Upload</Button>
                                                    </div>
                                                    {/* <ProgressBar animated now={45} label={'45'} /> */}
                                                </div>
                                                <Loader showLoader={showLoader}></Loader>
                                            </div>
                                        )

                                    }
                                })()}



                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
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

    if (modalType == 'document_verify_password_modal') {
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size="md"
                    className="custom-modal">

                    <Modal.Header closeButton>
                        <Modal.Title>Verify User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form id="docVerifyPass" onSubmit={handleSubmit(onSubmit)} autoComplete="off">

                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="form-group">
                                        <label className="lbl-control d-flex align-items-center">Password</label>
                                        <input type="password"
                                            className="form-control input-field"
                                            placeholder="Password"
                                            name="password"
                                            {...register("password")} />
                                        <span className="form_err text-danger d-block"> {errors.password?.type === 'required' && `${AIR_MSG.password_required}.`}</span>
                                        {(() => {
                                            if (formRes.err && formRes.data.err) {
                                                return (
                                                    <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                                )
                                            }
                                        })()}

                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="text-right">
                                        <button className="btn btn-primary-2 btn_05 btn_wide" type="submit" disabled={formSubmitted}>Submit</button>
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
    if (modalType == 'reduce_frequency_modal') {
        // let form = watch()
        let taskFrequency = modalData?.taskDetails?.task[0]?.task_frequency.toLowerCase();
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    className="custom-modal">

                    <Modal.Header closeButton>
                        <Modal.Title>Reduce Frequency</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form id="reduceFrequency" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row m-0">
                                <div className="col-6">
                                    <div className="form-group">
                                        <select className="form-control input-field"
                                            placeholder="Select Frequency"
                                            {...register("frequency", { required: true })} onChange={(e) => modalData.getDueDateExpressions(e.target.value)} defaultValue={modalData?.taskDetails?.task[0]?.task_frequency.toLowerCase()}>
                                            {
                                                taskFrequency != 'weekly' && taskFrequency != 'monthly' && taskFrequency != 'quarterly' && taskFrequency != 'bi-annually'
                                                    ? <option value={`annually`}>Annually</option>
                                                    : ''
                                            }
                                            {
                                                taskFrequency != 'weekly' && taskFrequency != 'monthly' && taskFrequency != 'quarterly'
                                                    ? <option value={`bi-annually`}>Bi-Annually</option>
                                                    : ''
                                            }
                                            {
                                                taskFrequency != 'weekly' && taskFrequency != 'monthly'
                                                    ? <option value={`quarterly`}>Quarterly</option>
                                                    : ''
                                            }
                                            {
                                                taskFrequency != 'weekly'
                                                    ? <option value={`monthly`}>Monthly</option>
                                                    : ''
                                            }
                                            <option value={`weekly`}>Weekly</option>
                                            {/* <option value={`bi-annually`}>Bi-Annually</option>
                                            <option value={`quarterly`}>Quarterly</option>
                                            <option value={`monthly`}>Monthly</option>
                                            <option value={`weekly`}>Weekly</option> */}
                                        </select>
                                        <span className="form_err text-danger d-block"> {errors.frequency?.type === 'required' && 'Frequency is required.'}</span>

                                    </div>
                                </div>
                                {(() => {
                                    if (modalData && modalData.dueDateExpressions && modalData.dueDateExpressions.length > 0) {
                                        return (
                                            <div className="col-6">
                                                <div className="form-group">
                                                    <select className="form-control input-field"
                                                        placeholder="Select Frequency"
                                                        {...register("expression", { required: true })}>
                                                        {modalData.dueDateExpressions.map((exp, eIndex) => {
                                                            return <option key={eIndex} value={exp.due_date_expression}>{exp.due_date_expression}</option>
                                                        })}
                                                    </select>
                                                    <span className="form_err text-danger d-block"> {errors.expression?.type === 'required' && 'Due Date expression is required.'}</span>
                                                </div>
                                            </div>
                                        )
                                    }
                                })()}
                                <div className="col-12">
                                    <div className="form-group">
                                        <textarea   className="form-control border-0" 
                                                    {...register("comment", { required: true })} 
                                                    placeholder="Add Reason...."
                                                    rows={4}>
                                        </textarea>
                                        
                                        <span className="form_err text-danger d-block"> {errors.comment?.type === 'required' && 'Reason is required.'}</span>

                                    </div>
                                </div>
                                <div className="col-12">
                                    {(() => {
                                        if (formRes.err && formRes.data.err) {
                                            return (
                                                <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                            )
                                        }
                                    })()}
                                </div>
                                <div className="col-12">
                                    <div className="text-right">
                                        <button className="btn btn-primary-2 btn_05 btn_wide" type="submit" disabled={formSubmitted}>Submit</button>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
    if (modalType == 'upload_logo') {
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
                        <Modal.Title>Upload Logo</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <div id="form_file_upload_modal">
                                {(() => {
                                    if (uploadfiles == null || uploadfiles.length < 1) {
                                        return (
                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column">
                                                <input
                                                    className="fileUploadInp"
                                                    type="file"
                                                    name="file"
                                                    accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                                                    onChange={(e) => onFileChange(e)}
                                                    id="file"
                                                    data-multiple-caption="{count} files selected"
                                                />;
                                                <i className="fa fa-upload" aria-hidden="true"></i>
                                                <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or drag it here</span>.</label>
                                                <label htmlFor="file"><strong>(Supported Format : png,gif,jpg,jpeg,jfif,svg,webp) </strong></label>

                                                {msgError && <p className="text-danger p-2">{msgError}</p>}
                                            </div>
                                        )

                                    } else {
                                        return (
                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column">
                                                <div className="uploadsList my-2 text-center">
                                                    {uploadfiles && uploadfiles.length > 0 && uploadfiles.map((file, dIndex) => {
                                                        return (
                                                            <div key={dIndex} className="file_card position-relative">
                                                                {(() => {
                                                                    if (isImg(file)) {
                                                                        return <span className=""><img src={getFileUrl(file)} className="img-fluid" /></span>
                                                                    } else {
                                                                        return <span className=""><img src={`/assets/img/document.png`} className="img-fluid" /></span>
                                                                    }
                                                                })()}

                                                                <span className="close_btn link_url position-absolute" onClick={() => removeUploadFile(dIndex)}><i className="fa fa-times"></i></span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="taskDetails_btn_block px-3">
                                                    <div className="card_button_block ">
                                                        <Button className="btn_1 btn_wide " variant="outline-dark" type="submit" onClick={() => formSubmit(uploadfiles)}>Upload</Button>
                                                    </div>
                                                    {/* <ProgressBar animated now={45} label={'45'} /> */}
                                                </div>
                                                <Loader showLoader={showLoader}></Loader>
                                            </div>
                                        )

                                    }
                                })()}



                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'import_tasks') {
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
                        <Modal.Title>Import Tasks</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="container-fluid">
                            <div id="form_file_upload_modal">
                                <CSVReader
                                    onUploadAccepted={onSelectFileToUpload}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDragLeave={(e) => e.preventDefault()}>
                                    {({ getRootProps, acceptedFile, getRemoveFileProps, Remove }) => (

                                        <>
                                            <div {...getRootProps()} >
                                                {acceptedFile ? (
                                                    <>
                                                        <div>
                                                            {/* <div>
                                                                <span>
                                                                    {formatFileSize(acceptedFile.size)}
                                                                </span>
                                                                <span>{acceptedFile.name}</span>
                                                            </div> */}

                                                            <div {...getRemoveFileProps()}
                                                                onMouseOver={(event) => {
                                                                    event.preventDefault();
                                                                }}
                                                                onMouseOut={(event) => {
                                                                    event.preventDefault();
                                                                }}
                                                            >
                                                                <Remove />
                                                            </div>
                                                        </div>

                                                        <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column">
                                                            <div className="uploadsList my-2 text-center">
                                                                {fileData && fileData.length > 0 &&
                                                                    <div className="file_card position-relative">
                                                                        <span className=""><img src={`/assets/img/document.png`} className="img-fluid" /></span>
                                                                        <span className="close_btn link_url position-absolute"><i className="fa fa-times"></i></span>
                                                                    </div>
                                                                }
                                                            </div>
                                                            <div className="taskDetails_btn_block px-3">
                                                                <div className="card_button_block ">
                                                                    <Button className="btn_1 btn_wide " variant="outline-dark" type="button" onClick={() => formSubmit(fileData)}>Upload</Button>
                                                                </div>
                                                            </div>
                                                            <Loader showLoader={showLoader}></Loader>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column">
                                                        <input
                                                            className="fileUploadInp"
                                                            type="file"
                                                            name="file"
                                                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                            onChange={(e) => onFileChange(e)}
                                                            id="file"
                                                        />;
                                                        <i className="fa fa-upload" aria-hidden="true"></i>
                                                        <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or drag it here</span>.</label>
                                                        <label htmlFor="file"><strong>(Supported Format : csv) </strong></label>

                                                        {msgError && <p className="text-danger p-2">{msgError}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </CSVReader>
                                {/* {(() => {
                                    if (uploadfiles == null || uploadfiles.length < 1) {
                                        return (
                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column">
                                                <input
                                                    className="fileUploadInp"
                                                    type="file"
                                                    name="file"
                                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                    onChange={(e) => onFileChange(e)}
                                                    id="file"
                                                />;
                                                <i className="fa fa-upload" aria-hidden="true"></i>
                                                <label htmlFor="file"><strong>Choose a file</strong><span className="fileDropBox"> or drag it here</span>.</label>
                                                <label htmlFor="file"><strong>(Supported Format : csv) </strong></label>

                                                {msgError && <p className="text-danger p-2">{msgError}</p>}
                                            </div>
                                        )

                                    } else {
                                        return (
                                            <div className="form-control file_upload_block position-relative d-flex justify-content-center align-items-center flex-column">
                                                <div className="uploadsList my-2 text-center">
                                                    {uploadfiles && uploadfiles.length > 0 && uploadfiles.map((file, dIndex) => {
                                                        return (
                                                            <div key={dIndex} className="file_card position-relative">
                                                                {(() => {
                                                                    if (isImg(file)) {
                                                                        return <span className=""><img src={getFileUrl(file)} className="img-fluid" /></span>
                                                                    } else {
                                                                        return <span className=""><img src={`/assets/img/document.png`} className="img-fluid" /></span>
                                                                    }
                                                                })()}

                                                                <span className="close_btn link_url position-absolute" onClick={() => removeUploadFile(dIndex)}><i className="fa fa-times"></i></span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="taskDetails_btn_block px-3">
                                                    <div className="card_button_block ">
                                                        <Button className="btn_1 btn_wide " variant="outline-dark" type="submit" onClick={() => formSubmit(uploadfiles)}>Upload</Button>
                                                    </div>
                                                </div>
                                                <Loader showLoader={showLoader}></Loader>
                                            </div>
                                        )

                                    }
                                })()} */}



                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }

    if (modalType == 'add_new_task') {
        const todayDate = moment().toDate();
        return (
            <>

                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    className="custom-modal new_task_add_modal"
                    scrollable={true}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Task</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="air_scroll">
                        <form id="add_new_task" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <fieldset className="border rounded p-3">
                                <legend className="w-auto m-0 fs-14 fw-600">Task Detail</legend>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="form-group">
                                            <input type="text" placeholder="Title" className="form-control" {...register("title", { required: true })} autoComplete="off" defaultValue="" />
                                            {errors.title?.type === 'required' && <div className="field_err text-danger">Title is required</div>}
                                        </div>
                                        <div className="form-group">
                                            <textarea
                                                className="form-control air_scroll"
                                                {...register("description", { required: true })}
                                                placeholder="Description...."
                                                rows={2}>
                                            </textarea>
                                            <span className="form_err text-danger d-block"> {errors.description?.type === 'required' && 'Description is required.'}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <select className="form-control input-field"
                                                placeholder="priority"
                                                {...register("priority", { required: true })} defaultValue="">
                                                <option value="" disabled>Priority</option>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                            <span className="form_err text-danger d-block"> {errors.priority?.type === 'required' && 'Priority is required.'}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <AirCalender type="custom" dateFormat="MM-DD-YYYY" changeFn={onChangeDate} defaultSettings={{ singleDatePicker: true, autoUpdateInput: true, autoApply: true, minDate: todayDate }}
                                            >
                                                <div className="date_box w-100 mr-2 d-flex align-items-center triggerDate">
                                                    <input type="text" className="form-control link_url bg-transparent" disabled={true} {...register('due_date', { required: true, pattern: /^(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])-[0-9]{4}$/ })} placeholder="Due Date" autoComplete="off" />
                                                </div>
                                            </AirCalender>
                                            <span className="form_err text-danger d-block"> {errors.due_date?.type === 'required' && 'Due Date is required.'}</span>
                                            <span className="form_err text-danger d-block"> {errors.due_date?.type === 'pattern' && 'Invalid Date.'}</span>
                                        </div>
                                    </div>
                                </div>
                                <fieldset className="border rounded p-3 mt-3">
                                    <legend className="w-auto m-0 fs-14 fw-600">Details</legend>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className={`form-group ${showLoader ? "op_disabled" : ""}`}>
                                                <select className="form-control input-field"
                                                    {...register("task_owner_id", { required: false })}>
                                                    <option value={-1}>Select Task Owner</option>
                                                    {[...taskOwnersList, ...keyMembers, ...servicePartners] && [...taskOwnersList, ...keyMembers, ...servicePartners].length > 0 && [...taskOwnersList, ...keyMembers, ...servicePartners].map((tOwner, tkey) => {
                                                        return <option key={tkey} value={tOwner.emp_id}>{tOwner.emp_name} ({tOwner.authority})</option>
                                                    })}
                                                </select>
                                                <span className="form_err text-danger d-block"> {errors.task_owner_id?.type === 'required' && 'Task Owner is required.'}</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className={`form-group ${showLoader ? "op_disabled" : ""}`}>
                                                <select className="form-control input-field"
                                                    {...register("approval_authority_id", { required: false })}>
                                                    <option value={-1}>Select Approval Authority</option>
                                                    {keyMembers && keyMembers.length > 0 && keyMembers.map((tOwner, tkey) => {
                                                        return <option key={tkey} value={tOwner.emp_id}>{tOwner.emp_name} ({tOwner.authority})</option>
                                                    })}
                                                </select>
                                                <span className="form_err text-danger d-block"> {errors.approval_authority_id?.type === 'required' && `${AIR_MSG.approval_authority_required}.`}</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className={`form-group ${showLoader ? "op_disabled" : ""}`}>
                                                <select className="form-control input-field"
                                                    {...register("domain", { required: true })}>
                                                    <option value={''}>Select Control Domain</option>
                                                    {modalData.controlDomains && modalData.controlDomains.length > 0 && React.Children.toArray(modalData.controlDomains.map((domain, dkey) => {
                                                        return <option value={domain.id}>{domain.name}</option>
                                                    }))}
                                                </select>
                                                <span className="form_err text-danger d-block"> {errors.domain?.type === 'required' && 'Domain is required.'}</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className={`form-group ${showLoader ? "op_disabled" : ""}`}>
                                                {/* <select className="form-control input-field"
                                                    {...register("framework", { required: true })}
                                                    onChangeCapture={(e) => (onSelectFramework(e.target.value))}>
                                                    <option value={''}>Select Framework</option>
                                                    {modalData.frameworks && modalData.frameworks.length > 0 && React.Children.toArray(modalData.frameworks.map((item, fKey) => {
                                                        return <option value={item.id}>{item.name}</option>
                                                    }))}
                                                </select> */}
                                                <AirSelect cClass={'vendor_select_box'}
                                                    cClassPrefix={'vendor_select'}
                                                    hideOptionOnSelect={false}
                                                    closeOnSelect={true}
                                                    selectType="select"
                                                    changeFn={onSelectFramework}
                                                    selectOptions={modalData.frameworks && modalData.frameworks.length > 0 && modalData.frameworks.map((item) => ({ value: item.id, label: item.name }))}
                                                    selected={[]}
                                                    selectedValue={taskFrameworks}
                                                    selectPlaceholder='Select Frameworks'
                                                    multi={true} />
                                            </div>
                                        </div>
                                        {modalData?.frameworkCategories?.soc2 && taskFrameworks.includes("soc2") &&
                                            <div className="col-12">
                                                <div className="form-group">
                                                    <AirSelect cClass={'vendor_select_box'}
                                                        cClassPrefix={'vendor_select'}
                                                        hideOptionOnSelect={false}
                                                        closeOnSelect={true}
                                                        selectType="creatable"
                                                        changeFn={addSoc2ControlCategories}
                                                        createFn={(title) => createControlTitle(title, "soc2")}
                                                        creatablePosition="first"
                                                        // selectOptions={modalData.controlCategories && modalData.controlCategories.length > 0 && modalData.controlCategories.map((cat) => ({ value: cat.controls, label: cat.controls }))}
                                                        selectOptions={modalData?.frameworkCategories?.soc2 && modalData?.frameworkCategories?.soc2.length > 0 && modalData?.frameworkCategories?.soc2.map((item) => ({ value: item.controls, label: item.controls }))}
                                                        selected={[]}
                                                        selectedValue={controlCategories}
                                                        selectPlaceholder='Select SOC 2 Controls'
                                                        multi={true} />
                                                    <span className="form_err text-danger d-block"> {errors.control_category?.type === 'required' && `${AIR_MSG.category_required}.`}</span>
                                                </div>
                                            </div>
                                        }
                                        {modalData?.frameworkCategories?.iso && taskFrameworks.includes("iso") &&
                                            <div className="col-12">
                                                <div className="form-group">
                                                    <AirSelect cClass={'vendor_select_box'}
                                                        cClassPrefix={'vendor_select'}
                                                        hideOptionOnSelect={false}
                                                        closeOnSelect={true}
                                                        selectType="creatable"
                                                        changeFn={addIsoControlCategories}
                                                        createFn={(title) => createControlTitle(title, "iso")}
                                                        creatablePosition="first"
                                                        selectOptions={modalData?.frameworkCategories?.iso && modalData?.frameworkCategories?.iso.length > 0 && modalData?.frameworkCategories?.iso.map((item) => ({ value: item.controls, label: item.controls }))}
                                                        selected={[]}
                                                        selectedValue={isoCategories}
                                                        selectPlaceholder='Select ISO Controls'
                                                        multi={true} />
                                                    <span className="form_err text-danger d-block"> {errors.control_category?.type === 'required' && `${AIR_MSG.category_required}.`}</span>
                                                </div>
                                            </div>
                                        }
                                        {modalData?.frameworkCategories?.nist && taskFrameworks.includes("nist") &&
                                            <div className="col-12">
                                                <div className="form-group">
                                                    <AirSelect cClass={'vendor_select_box'}
                                                        cClassPrefix={'vendor_select'}
                                                        hideOptionOnSelect={false}
                                                        closeOnSelect={true}
                                                        selectType="creatable"
                                                        changeFn={addNistControlCategories}
                                                        createFn={(title) => createControlTitle(title, "nist")}
                                                        creatablePosition="first"
                                                        selectOptions={modalData?.frameworkCategories?.iso && modalData?.frameworkCategories?.iso.length > 0 && modalData?.frameworkCategories?.iso.map((item) => ({ value: item.controls, label: item.controls }))}
                                                        selected={[]}
                                                        selectedValue={nistCategories}
                                                        selectPlaceholder='Select NIST Controls'
                                                        multi={true} />
                                                    <span className="form_err text-danger d-block"> {errors.control_category?.type === 'required' && `${AIR_MSG.category_required}.`}</span>
                                                </div>
                                            </div>
                                        }

                                        <div className="col-12">
                                            <div className="form-group">
                                                <AirSelect cClass={'vendor_select_box'}
                                                    cClassPrefix={'vendor_select'}
                                                    hideOptionOnSelect={false}
                                                    closeOnSelect={true}
                                                    selectType="select"
                                                    changeFn={addTaskControlCriteria}
                                                    selectOptions={modalData.controlCriterias && modalData.controlCriterias.length > 0 && modalData.controlCriterias.map((criteria) => ({ value: criteria.id, label: criteria.name }))}
                                                    selected={[]}
                                                    selectedValue={controlCriterias}
                                                    selectPlaceholder='Select Control Criteria'
                                                    multi={true} />
                                                <span className="form_err text-danger d-block"> {errors.criteria?.type === 'required' && 'Criteria is required.'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                                <fieldset className="border rounded p-3 mt-3">
                                    <legend className="w-auto m-0 fs-14 fw-600">Add Frequency</legend>
                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="form-group">
                                                <select className="form-control input-field"
                                                    placeholder="frequency"
                                                    {...register("task_frequency", { required: true })} onChange={(e) => updatedTaskFrequency(e)} defaultValue="annually">
                                                    <option value={`annually`}>Annually</option>
                                                    <option value={`bi-annually`}>Bi-Annually</option>
                                                    <option value={`quarterly`}>Quarterly</option>
                                                    <option value={`monthly`}>Monthly</option>
                                                    <option value={`weekly`}>Weekly</option>
                                                </select>
                                                <span className="form_err text-danger d-block"> {errors.task_frequency?.type === 'required' && 'Frequency is required.'}</span>
                                            </div>
                                        </div>
                                        {(() => {
                                            if (modalData.dueDateExpressions && modalData.dueDateExpressions.length > 0) {
                                                return (
                                                    <div className="col-sm-6">
                                                        <div className={`form-group ${showLoader ? "op_disabled" : ""}`}>
                                                            <select className="form-control input-field"
                                                                placeholder="Select Frequency"
                                                                {...register("due_date_expression", { required: true })}>
                                                                {modalData.dueDateExpressions.map((exp, eIndex) => {
                                                                    return <option key={eIndex} value={exp.due_date_expression}>{exp.due_date_expression}</option>
                                                                })}
                                                            </select>
                                                            <span className="form_err text-danger d-block"> {errors.due_date_expression?.type === 'required' && 'Due Date expression is required.'}</span>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        })()}

                                    </div>
                                </fieldset>
                                <fieldset className="border rounded p-3 mt-3 evidence_select">
                                    <legend className="w-auto m-0 fs-14 fw-600">Add Evidence</legend>
                                    <AirSelect cClass={'vendor_select_box'}
                                        cClassPrefix={'vendor_select'}
                                        hideOptionOnSelect={false}
                                        closeOnSelect={true}
                                        selectType="creatable"
                                        changeFn={addEvidenceTitle}
                                        createFn={createEvidenceTitle}
                                        creatablePosition="first"
                                        selectOptions={evidenceTitleList && evidenceTitleList.length > 0 && evidenceTitleList.map((evi_title) => ({ value: evi_title.id, label: evi_title.name }))}
                                        selected={[]}
                                        selectedValue={evidenceTitle}
                                        selectPlaceholder='Select or Add Evidence'
                                        multi={true} />
                                    <span className="form_err text-danger d-block"> {errors.evidences?.type === 'required' && 'Evidence is required.'}</span>
                                </fieldset>
                                <div className="text-right">
                                    <button className="btn btn-primary-2 btn_05 btn_wide my-3" type="submit" disabled={formSubmitted}>Create</button>
                                </div>
                                <div className="col-sm-12">
                                    {(() => {
                                        if (formRes.err && formRes.data.err) {
                                            return (
                                                <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                            )
                                        }
                                    })()}
                                </div>
                            </fieldset>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'show_audit_details') {
        return (
            <>

                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    className="custom-modal new_task_add_modal"
                    scrollable={true}
                >
                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white">
                        <Modal.Title className="fs-12">Audit Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="air_scroll">
                        <div className={`table-responsive assessment_Table air_scroll border border-top-0`}>
                            <table className="table mb-0">
                                <thead>
                                    <tr>
                                        <th><a className="link_url">Updated Field</a></th>
                                        <th><a className="link_url">Updated By</a></th>
                                        <th><a className="link_url">Updated On</a></th>
                                        <th><a className="link_url">Before</a></th>
                                        <th><a className="link_url">After</a></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalData?.taskDetails && modalData?.taskDetails?.audit_details && modalData?.taskDetails?.audit_details.length > 0 && React.Children.toArray(modalData?.taskDetails?.audit_details.map((audit) => {
                                        return (
                                            <tr>
                                                <td>{audit.updated_field}</td>
                                                <td>{audit.updated_by}</td>
                                                <td>{audit.updated_on}</td>
                                                <td>{(audit.before_update == -1 || audit.before_update == "NA") ? "" : audit.before_update}</td>
                                                <td>{(audit.after_update == -1 || audit.after_update == "NA") ? "" : audit.after_update}</td>
                                            </tr>
                                        )
                                    }))}
                                </tbody>

                            </table>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'view_remediation_steps') {
        return (
            <>

                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    className="custom-modal new_task_add_modal"
                    scrollable={true}
                >
                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white">
                        <Modal.Title className="fs-12">Remediation Steps</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="air_scroll">
                        <div className="py-4">
                            <div className="d-flex">
                                <div className="justify-self-end remediation_date_box fs-12 fw-600 ml-auto mb-3">
                                    <span className="mb-0 ">Deadline :&nbsp;</span>
                                    <span>{modalData.remediation_deadline}</span>
                                </div>
                            </div>
                            <pre className="fs-14 fw-400">{modalData.remediation_steps}</pre>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'share_modal') {
        return (
            <>

                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    className="custom-modal new_task_add_modal"
                    scrollable={true}
                >
                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white">
                        <Modal.Title className="fs-12">Share Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="air_scroll">
                        <form id="add_new_task" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <fieldset className="border rounded p-3">
                                <legend className="w-auto m-0 fs-14 fw-600">Share with</legend>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <input type="text" placeholder="Email" className="form-control" {...register("email", { required: true })} autoComplete="off" defaultValue="" />
                                            {errors.email?.type === 'required' && <div className="field_err text-danger">Email is required</div>}
                                        </div>

                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <select className="form-control input-field"
                                                {...register("access_type", { required: true })} defaultValue="">
                                                <option value="" disabled>Select Access Type</option>
                                                <option value="R">View</option>
                                                <option value="W">Edit</option>
                                            </select>
                                            <span className="form_err text-danger d-block"> {errors.access_type?.type === 'required' && 'Access type is required.'}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <input type="password" placeholder="Password" className="form-control" {...register("password", { required: true })} autoComplete="off" defaultValue="" />
                                            {errors.password?.type === 'required' && <div className="field_err text-danger">Password is required</div>}
                                        </div>
                                    </div>

                                </div>
                                <div className="text-right">
                                    <button className="btn btn-primary-2 btn_05 btn_wide my-3" type="submit" disabled={formSubmitted}>Share</button>
                                </div>
                                <div className="col-sm-12">
                                    {(() => {
                                        if (formRes.err && formRes.data.err) {
                                            return (
                                                <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                            )
                                        }
                                    })()}
                                </div>
                            </fieldset>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }


    if (modalType == 'review_call_modal') {
        return (
            <>

                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    className="custom-modal new_task_add_modal"
                    scrollable={true}
                >
                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white">
                        <Modal.Title className="fs-12">Available Time Slots</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="air_scroll">
                        <form id="add_new_task" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <fieldset className="border rounded p-3">
                                <legend className="w-auto m-0 fs-14 fw-600">Schedule Call</legend>
                                {modalData.timeSlots && Object.keys(modalData.timeSlots).length > 0 && React.Children.toArray(Object.keys(modalData.timeSlots).map((date, dKey) => {
                                    return (
                                        <div className="row">
                                            <div className="col-12 date_title">{date}</div>
                                            <div className="col-12 row">
                                                {modalData.timeSlots[date].length > 0 && React.Children.toArray(modalData.timeSlots[date].map((item, diKey) => {
                                                    return (
                                                        <div className="col-auto d-flex align-items-center">
                                                            <label className="m-0 mr-2">
                                                                <input type="radio" {...register("selected_timeslot", { required: true })} value={JSON.stringify({ date: date, from: item.From, to: item.To })} />
                                                            </label>
                                                            <span className="badge badge-info btn_03 fs-10">{item?.From} - {item?.To}</span>
                                                        </div>
                                                    )
                                                }))}
                                            </div>
                                        </div>
                                    )
                                }))}
                                <div className="text-right">
                                    <button className="btn btn-primary-2 btn_05 btn_wide my-3" type="submit" disabled={formSubmitted}>Submit</button>
                                </div>
                                <div className="col-sm-12">
                                    {(() => {
                                        if (formRes.err && formRes.data.err) {
                                            return (
                                                <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                            )
                                        }
                                    })()}
                                </div>
                            </fieldset>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
    if (modalType == 'update_task_details') {
        // let form = watch()
        let taskFrequency = modalData?.taskDetails?.task[0]?.task_frequency.toLowerCase();
        return (
            <>
                <Modal
                    show={show}
                    onHide={handleModalClose}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                    className={`custom-modal`}>

                    <Modal.Header closeButton className="py-2 bg_04 d-flex align-items-center text-white ">
                        <Modal.Title className="fs-12">Add Reason</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form id="reduceFrequency" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                            <div className="row m-0">
                                <div className="col-12">
                                    <div className="form-group">
                                        <textarea   className="form-control border-0" 
                                                    {...register("comment", { required: true })} 
                                                    placeholder="Add Reason...."
                                                    rows={8}>
                                        </textarea>
                                        
                                        <span className="form_err text-danger d-block"> {errors.comment?.type === 'required' && 'Reason is required.'}</span>

                                    </div>
                                </div>
                                
                                <div className="col-12">
                                    {(() => {
                                        if (formRes.err && formRes.data.err) {
                                            return (
                                                <span className="form_err text-danger d-block">{formRes.data.err}</span>
                                            )
                                        }
                                    })()}
                                </div>
                                <div className="col-12">
                                    <div className="text-right">
                                        <button className="btn btn-primary-2 btn_05 btn_wide" type="submit" disabled={formSubmitted}>Submit</button>
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

export default AirModal