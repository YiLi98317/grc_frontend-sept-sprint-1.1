import ApiService from "../services/ApiServices";
import { decryptData, GetRandomColor, GetInitials, mentionStrToHtml, SetCookie, encryptData, SanitizeHtml } from "../helpers/Helper";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/partials/Header";
import { useContext, useEffect, useRef, useState } from "react";
import 'bootstrap-daterangepicker/daterangepicker.css';

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Accordion, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import AirModal from "../elements/AirModal";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import AirCalender from "../elements/AirCalender";
import SweetAlert from "react-bootstrap-sweetalert";
import { MentionsInput, Mention } from 'react-mentions'
import moment from "moment";
import AIR_MSG from "../helpers/AirMsgs";
const TaskDetails = (props) => {
  // const { user = {} } = useOutletContext()
  const { projectId = null, user = {} } = useContext(LayoutContext)
  const { access_role: accessRole = null, org_id: orgId = 0, is_management: isManagement = '' } = user?.currentUser;
  // const orgId = user?.currentUser?.org_id || 0;
  // const { taskId: encTaskId = 0 } = useParams()
  const { taskInfo: encTaskInfo = null } = useParams()
  const [taskInfo, setTaskInfo] = useState({})
  const [taskId, setTaskId] = useState(null)
  const [taskDetails, setTaskDetails] = useState({})
  const [viewFile, setViewFile] = useState(null)
  const [fileType, setFileType] = useState(null)
  const navigate = useNavigate()
  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [evidenceTypeId, setEvidenceTypeId] = useState(null);
  const [taskOwnersList, setTaskOwnersList] = useState([]);
  const [keyMembers, setKeyMembers] = useState([]);
  const [servicePartners, setServicePartners] = useState([]);
  const [priority, setPriority] = useState('');
  const [taskOwner, setTaskOwner] = useState({});
  const [approvalAuthority, setApprovalAuthority] = useState({});
  const [status, setStatus] = useState(null);
  const [canUpdateTask, setCanUpdateTask] = useState(false);
  const [dueDate, setDueDate] = useState(null);

  const [comments, setComments] = useState([]);
  const [showEditBox, setShowEditBox] = useState(-1);
  const [showRplyBox, setShowRplyBox] = useState(-1);
  const commentInpRef = useRef()
  const replyCommentInpRef = useRef([])
  const editCommentInpRef = useRef([])
  const [userMentionData, setUserMentionData] = useState([]);
  const [dueDateExpressions, setDueDateExpressions] = useState([]);
  const [mentionVal, setMentionVal] = useState('');
  const [editMentionVal, setEditMentionVal] = useState('');
  const [replyMentionVal, setReplyMentionVal] = useState('');
  const [formSubmitted, setFormSbmt] = useState(false)
  const [customErrors, setCustomErrors] = useState(null)
  const [showControlsText, setShowControlsText] = useState({})
  // const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [showButtons, setShowButtons] = useState(false)
  const [userType, setUserType] = useState(null)
  const [btns, setbtns] = useState({})
  const [modalData, setModalData] = useState({})
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })
  const applicableInpref = useRef([]);
  useEffect(() => {
    // if (encTaskId != 0) {
    //   let id = decryptData(encTaskId)
    //   // setTaskId(Number(id))
    //   setTaskId(id)
    // let setcookie = SetCookie('task_details', JSON.stringify({task_id:taskId,user_id:user?.currentUser?.user_id}),null, false)
    // }
    if (encTaskInfo != null) {
      let tmpTaskInfo = decryptData(encTaskInfo)
      tmpTaskInfo = JSON.parse(tmpTaskInfo)
      // console.log(tmpTaskInfo)
      if (Object.keys(taskInfo).length == 0) {
        setTaskInfo(tmpTaskInfo)
      }
      setTaskId(tmpTaskInfo.taskId)
      let setcookie = SetCookie('task_details', JSON.stringify({ task_id: taskId, user_id: user?.currentUser?.user_id }), null, false, false)
    }
  })
  useEffect(() => {
    if (Object.keys(taskDetails).length == 0 && taskId != null) {
      getTaskDetails()
    }
    if (taskId != null && comments.length == 0) {
      getCommentsList(taskId)
    }

  }, [taskId])

  useEffect(() => {
    if (taskOwnersList.length == 0 && projectId != null) {
      getTaskOwners()
    }
    if (keyMembers.length == 0 && projectId != null) {
      getKeyMembers()
    }
    if (servicePartners.length == 0 && projectId != null) {
      getServicePartners()
    }


  }, [projectId]);

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



  const getTaskDetails = async (tskId = null) => {
    let payloadUrl = `tasks/getTaskDetails/${tskId || taskId}`
    let method = "GET";
    let formData = {};
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res.status == 302 || res.status == 404) {
      navigate("/task-manager")
    }
    if (res && res.message == "Success") {
      let { task, evidence_needed, applicable_assets, audit_details } = res
      // if (task && task.length > 0) {
      //   task[0].iso_category = "A.13.1.1,A.13.1.2,A.13.1.3,A.13.1.1,A.13.1.2,A.13.1.3,A.13.1.1,A.13.1.2,A.13.1.3,A.13.1.1,A.13.1.2,A.13.1.3,A.13.1.1,A.13.1.2,A.13.1.3,A.13.1.1,A.13.1.2,A.13.1.3"
      // }
      let obj = { task: task, evidence_needed: evidence_needed, applicable_assets: applicable_assets, audit_details: audit_details }
      setTaskDetails(oldVal => ({ ...obj }))
      if (task && task.length > 0) {
        setPriority(task[0].priority)
        setStatus(task[0].task_status)
        setCanUpdateTask(task[0].task_status == "pending" ? true : false)
        setTaskOwner(oldVal => {
          let obj = { emp_name: task[0].task_owner, emp_id: task[0].task_owner_id, authority: task[0].authority }
          return { ...obj }
        })
        setApprovalAuthority(oldVal => {
          let obj = { emp_name: task[0].key_member, emp_id: task[0].key_member_id, authority: task[0].key_member_authority }
          return { ...obj }
        })
      }
      getButtons(obj)
      // fetchInfo("all_tasks",res.accounts_and_projects[0].project_id)
    }

  }
  const getTaskOwners = async () => {
    let payloadUrl = `tasks/getProjectMembers/${projectId}/task_owner`
    let method = "GET";
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
      setKeyMembers(oldVal => {
        return [...res.results]
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


  const handleSelect = (ranges) => {
    // {
    //   selection: {
    //     startDate: [native Date Object],
    //     endDate: [native Date Object],
    //   }
    // }
  }

  const getFileDetails = async (data = null) => {
    if (data != null) {

      let payloadUrl = `${data.evidence_url}`
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
          // reader.onloadend = () => {
          //   let fileType = contentType ? contentType.substr(contentType.lastIndexOf('/') + 1) : null;
          //   // let fileUrl = reader.result;
          //   let fileUrl = window.URL.createObjectURL(blob);

          //   if(fileType == 'xls' || fileType == 'xlsx' || fileType == 'vnd.ms-excel' || fileType == 'vnd.ms-word' || fileType == 'vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType == 'doc' || fileType == 'docx'){
          //     fileType = 'officeDocument';
          //     let getTimeStamp = encryptData((new Date().getTime())/1000)
          //     let newUrl = data.evidence_url.replace('/evidences/','/public/')
          //     fileUrl = newUrl+`/${getTimeStamp}`
          //   }
          //   setFileType(fileType)
          //   setViewFile(fileUrl)
          // };
          let fileType = contentType ? contentType.substr(contentType.lastIndexOf('/') + 1) : null;
          let fileUrl = window.URL.createObjectURL(blob);
          if (fileType == 'xls' || fileType == 'xlsx' || fileType == 'vnd.ms-excel' || fileType == 'vnd.ms-word' || fileType == 'vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType == 'doc' || fileType == 'docx') {
            fileType = 'officeDocument';
            let getTimeStamp = encryptData((new Date().getTime()) / 1000)
            let newUrl = data.evidence_url.replace('/evidences/', '/public/')
            fileUrl = newUrl + `/${getTimeStamp}`
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
    setEvidenceTypeId(null)
    switch (modalName) {
      case 'view_upload_evidence':
        if (data.evidence_type_id) {
          setEvidenceTypeId(data.evidence_type_id)
        }
        setModalType(modalName)
        setShowModal(true)
        break;
      case 'view_documents':
        if (data != null) {
          setViewFile(null);
          setFileType(null)
          let fileDetails = getFileDetails(data)

          setModalType(modalName)
          setShowModal(true)
        }
        break;
      case 'reduce_frequency_modal':
        setModalType(modalName)
        setShowModal(true)
        break;
      case 'update_task_details':
        if (data != null) {
          setModalData(oldVal => ({ ...data }))
          setModalType(modalName)
          setShowModal(true)
        }
        break;
      case 'upload_logo':
        setModalType(modalName)
        setShowModal(true)
        break;
      case 'show_audit_details':
        setModalType(modalName)
        setShowModal(true)
        break;

    }
  }

  const hideModal = (tskId = null, data = null) => {
    if (modalType == 'view_upload_evidence') {
      if (data != null) {
        let tmpTaskInfo = Object.assign({}, taskInfo)
        tmpTaskInfo = data
        navigate(`/task-details/${encryptData(JSON.stringify(tmpTaskInfo))}`, { replace: true })
      }
      getTaskDetails(tskId || taskId)
    }
    if (modalType == 'reduce_frequency_modal') {
      setDueDateExpressions(oldVal => {
        return [...[]]
      })
      getTaskDetails(tskId || taskId)
    }
    setModalType(null)
    setShowModal(false)
  }


  const updateTaskDetails = async (type = null, value = null, data = null) => {
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
      setCanUpdateTask(value == "pending" ? true : false)
    } else if (type == "due_date") {
      obj.dueDate = value
      setDueDate(oldVal => {
        return value
      })
    }
    if (data?.comment && data?.comment != null) {
      obj.comment = data.comment;
    }
    // console.log(obj,type,value);
    let upRes = await saveTaskDetails(obj);
    return upRes
  }

  const onChangeDate = (startDate = null, endDate = null) => {
    // updateTaskDetails("due_date", startDate)
    showModal("update_task_details", { type: "due_date", value: startDate, callingFn: updateTaskDetails })
  }

  const updateTaskStatus = async (type = null, value = null, data = null) => {
    if (type == null || value == null) {
      return false
    }
    setFormSbmt(true)
    let obj = {}
    switch (type) {
      case 'admin_status':
        obj.adminStatus = value
        break;
      case 'auditor_status':
        obj.auditorStatus = value
        break;
      case 'is_recalled':
        obj.is_recalled = value
        break;
    }
    if (data?.comment && data?.comment != null) {
      obj.comment = data.comment;
    }


    // saveTaskDetails(obj)
    let upRes = await saveTaskDetails(obj);
    return upRes
  }

  const saveTaskDetails = async (data = null, returnRes = false) => {
    if (data == null) {
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
    if (data.auditorStatus) {
      formData.auditor_status = data.auditorStatus;
    }
    if (data.is_recalled) {
      formData.is_recalled = data.is_recalled;
    }

    if (taskInfo.isVirtual == "Y") {
      formData.task_old_end_date = moment(taskInfo.dueDate, 'MMM DD, YYYY').format('YYYY-MM-DD');
      if (!data.dueDate) {
        formData.task_end_date = moment(taskInfo.dueDate, 'MMM DD, YYYY').format('YYYY-MM-DD');
      }
    }
    if (data?.comment && data?.comment != null) {
      formData.comment = data.comment;
    }
    // console.log(formData,taskInfo);
    // return
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    let tskId = taskId
    let tmpTaskInfo = Object.assign({}, taskInfo)
    let reloadUrl = false
    let result = {}
    if (res && res.message == "Success") {
      if (tmpTaskInfo.isVirtual == "Y" && res.project_task_id) {
        reloadUrl = true
        tskId = res.project_task_id || null
        tmpTaskInfo.isVirtual = "N"
        tmpTaskInfo.taskId = tskId
        // tmpTaskInfo.dueDate = !data.dueDate ? taskInfo.dueDate :  moment(formData.task_end_date, 'YYYY-MM-DD').format('MMM DD, YYYY')
        setTaskInfo(oldVal => {
          return { ...tmpTaskInfo }
        })
        if (tskId) {
          setTaskId(tskId)
        }
      }
      if (returnRes) {
        return tmpTaskInfo
      } else {
        if (reloadUrl) {
          navigate(`/task-details/${encryptData(JSON.stringify(tmpTaskInfo))}`, { replace: true })
          // window.location.reload()
        }
        getTaskDetails(tskId)
        getCommentsList(tskId)
        let msg = AIR_MSG.task_details_update_success;
        if(formData.task_status == "review"){
          msg = AIR_MSG.task_snd_approval_success
        }
        setShowAlert({ show: true, type: "success", message: msg })
        result = { message: "Success", tmpTaskInfo }
      }

    } else {
      if (returnRes) {
        return tmpTaskInfo
      } else {
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
        result = false
      }
    }
    setFormSbmt(false)
    return result
  }

  const toggleAlert = (val) => {
    setShowAlert(val)
  }

  const getCommentsList = async (tId = 0) => {
    if (tId == 0) {
      return false
    }

    let payloadUrl = `tasks/listComments/${tId || taskId}`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      setComments(oldVal => {
        return [...res.results]
      })
    }

  }
  const addComment = async (parentCommentId = 0, commentIndex = null) => {
    setCustomErrors(null)
    if (taskId == 0) {
      return false
    }
    let tskId = taskId
    let tmpTaskInfo = Object.assign({}, taskInfo)
    let reloadUrl = false
    if (tmpTaskInfo.isVirtual == "Y") {
      let fData = { task_end_date: moment(tmpTaskInfo.dueDate, 'MMM DD, YYYY').format('YYYY-MM-DD') };
      let upRes = await saveTaskDetails(fData, true);
      tskId = upRes.taskId
      tmpTaskInfo = upRes
      reloadUrl = true
    }
    let inpELe = commentIndex != null ? replyCommentInpRef.current[commentIndex] : commentInpRef.current;
    // let comment = inpELe.value
    let comment = mentionVal || inpELe.value
    if (!comment || comment == '') {
      return false
    }
    let payloadUrl = `tasks/addComment`
    let method = "POST";
    let formData = {
      project_task_id: tskId,
      comment_text: SanitizeHtml(comment),
      parent_comment_id: parentCommentId,
    }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      if (reloadUrl) {
        navigate(`/task-details/${encryptData(JSON.stringify(tmpTaskInfo))}`, { replace: true })
        getTaskDetails(tskId)
      } else {
        getCommentsList(tskId)
      }
      setMentionVal('')
      inpELe.value = ''
      setShowRplyBox(-1)
      setShowEditBox(-1)

    } else {
      let cErr = { addComment: { type: "invalid" } }
      setCustomErrors(oldVal => {
        return { ...cErr }
      })
    }

  }
  const updateComment = async (commentId = 0, commentIndex = null) => {
    setCustomErrors(null)
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
      comment_text: SanitizeHtml(comment),
      comment_id: commentId,
    }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      setEditMentionVal('')
      inpELe.value = '';
      getCommentsList(taskId)
      setShowRplyBox(-1)
      setShowEditBox(-1)
    } else {
      let cErr = { updateComment: { type: "invalid" } }
      setCustomErrors(oldVal => {
        return { ...cErr }
      })
    }

  }
  const delComment = async (commentId = 0) => {
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
  const delEvidence = async (evidenceId = 0) => {
    if (taskId == 0 || evidenceId == 0) {
      return false
    }
    setFormSbmt(true)
    toggleAlert({ show: false, type: 'success', message: '' })
    let payloadUrl = `evidences/deleteEvidence`
    let method = "DELETE";
    let formData = { evidence_ids: [evidenceId] }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      getTaskDetails(taskId)
    }
    setFormSbmt(false)
  }

  const toggleEditBox = (commentIndex = null) => {
    setCustomErrors(null)
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
                                      <button type="button" className="btn btn-primary-2 btn_05" onClick={() => { updateComment(comment.comment_id, cIndex) }}>Update</button>
                                      {/* <Button className="btn_1_inverse btn_1" variant="outline-dark" onClick={() => { updateComment(comment.comment_id, `${cIndex}_${subKey}`) }}>Update</Button> */}
                                      <Button className="btn_1 ml-2" variant="outline-dark" onClick={() => toggleEditBox(-1)}>Cancel</Button>
                                    </div>
                                  </div>
                                )
                              } else {
                                return <p className="mb-0">{comment.comment_text ? mentionStrToHtml(comment.comment_text) : ''}</p>
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

  const getDueDateExpressions = async (frequency = null) => {
    if (frequency == null) {
      return false
    }
    let payloadUrl = `tasks/getDueDateExpressions/${frequency}`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      setDueDateExpressions(oldVal => {
        return [...res.results]
      })
    }
  }

  const changeReduceFrequency = async (data = null) => {
    if (data == null) {
      return false
    }

    let tskId = taskId.toString().replace("v_", "")
    let payloadUrl = `tasks/reduceFrequency`
    let method = "POST";
    let formData = {
      project_task_id: Number(tskId),
      frequency: data.frequency,
      due_date_expression: data.expression,
      comment: data?.comment && data?.comment != "" ? data?.comment : ''
    }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      setShowAlert({ show: true, type: "success", message: AIR_MSG.task_frequency_update_success })
      return res
    } else {
      setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
    }
  }

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


  const onDelEvidence = async (type = '', data) => {
    if (type == '') {
      return false
    }
    setShowAlert({ show: true, type: "del_evidence_confirmation", message: "", data })
  }

  const downloadFile = async (data = null) => {
    if (data != null) {
      setFormSbmt(true)
      let payloadUrl = `${data.evidence_url}`
      let method = "GET";
      let response = await ApiService.fetchFile(payloadUrl, method);
      let jsonResponse = response.clone()
      let res = await response.arrayBuffer();
      if (res) {
        let contentType = response && response.headers.get('content-type') ? response.headers.get('content-type') : 'application/pdf';
        if (contentType.indexOf('application/json') == -1) {
          var blob = new Blob([res], { type: contentType });
          let url = window.URL.createObjectURL(blob)
          if (
            window.navigator &&
            window.navigator.msSaveOrOpenBlob
          ) return window.navigator.msSaveOrOpenBlob(blob);

          // For other browsers:
          // Create a link pointing to the ObjectURL containing the blob.
          const link = document.createElement('a');
          link.href = url;
          link.download = data.file_name;
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
        setFormSbmt(false)
      }
    }
  }

  const toggleFullText = (index = null, showFullText = false) => {
    if (index == null) {
      return false
    }
    let objArr = { ...showControlsText }
    objArr[index] = showFullText;
    setShowControlsText(oldVal => {
      return { ...objArr }
    })
  }

  const getButtons = (tskDetails = null) => {
    if (tskDetails == null) {
      return false
    }
    let { currentUser: usr } = user
    let btnsList = { out_of_scope: false, send_approval: false, reduce_frequency: false, mark_completed: false, recall: false, approve: false, reject: false, return: false, compliant: false, not_compliant: false }
    let buttonsobj = { ...btnsList };
    let { task = null } = tskDetails
    task = task && task[0]
    usr.user_type = Number(task.task_owner_id) == Number(usr.org_emp_id) ? 3 : usr.user_type
    // console.log(task);
    // console.log(usr);
    let showBtn = false
    let evUploadInfoArr = task.applicable_evidence_added.split("/");
    let evUploaded = evUploadInfoArr[0];
    let totalEvNeeded = evUploadInfoArr[1];
    /* 
    1= super_user, 2= key_member, 3 = task_owner, 4 = service_partner, 5 = auditor
    */
    if (usr.user_type == 1 || usr.user_type == 2) {
      if (Number(task.key_member_id) == Number(usr.org_emp_id) || usr.user_type == 1) {
        if (task.task_status == "pending" || task.task_status == "in_progress") {
          buttonsobj["out_of_scope"] = true;
          buttonsobj["reduce_frequency"] = true;
        } else if (task.task_status == "review") {
          buttonsobj["approve"] = true;
          buttonsobj["reject"] = true;
          buttonsobj["return"] = task.priority == "high" && task.is_recalled == "Y" || false;
        } else if (task.task_status == "completed") {
          buttonsobj["return"] = task.priority == "high" && task.is_recalled == "Y" || false;
        } else if (task.task_status == "audited") {

        } else if (task.task_status == "out_of_scope") {
          buttonsobj["recall"] = true;
        }
        showBtn = task.task_status == "completed" && task.auditor_status == "compliant" ? false : true;
      }
    } else if (usr.user_type == 3 || usr.user_type == 4) {
      if (task.task_status == "pending" || task.task_status == "in_progress") {
        buttonsobj["out_of_scope"] = true;
        buttonsobj["send_approval"] = (task.priority == "high" && evUploaded >= totalEvNeeded) || false;
        buttonsobj["reduce_frequency"] = true;
        buttonsobj["mark_completed"] = (task.priority != "high" && evUploaded >= totalEvNeeded) || false;
      } else if (task.task_status == "review") {
        buttonsobj["recall"] = true;
      } else if (task.task_status == "completed") {
        buttonsobj["recall"] = task.task_status == "completed" && task.auditor_status == "compliant" ? false : true;
      } else if (task.task_status == "audited") {

      } else if (task.task_status == "out_of_scope") {
        buttonsobj["recall"] = true;
      }
      showBtn = task.task_status == "completed" && task.auditor_status == "compliant" ? false : true;;
    } else if (usr.user_type == 5) {
      if (task.task_status == "completed") {
        buttonsobj["compliant"] = true;
        buttonsobj["not_compliant"] = true;
        showBtn = true;
      }
    }
    setShowButtons(showBtn)
    setbtns(oldVal => ({ ...buttonsobj }))
    setUserType(usr.user_type)
    console.log(task);
    console.log(showBtn, buttonsobj);
    return buttonsobj
  }

  const toggleEvidenceApplicable = async (evidenceTypeId = 0, isApplicable = "", data = null) => {
    if (taskId == 0 || evidenceTypeId == 0 || isApplicable == "" || data == null) {
      return false
    }
    let upRes = null
    let tskId = taskId
    if (taskInfo.isVirtual == "Y") {
      let fData = { task_end_date: moment(taskInfo.dueDate, 'MMM DD, YYYY').format('YYYY-MM-DD') };
      upRes = await saveTaskDetails(fData, true);
      tskId = upRes.taskId
    }
    let payloadUrl = `evidences/markEvidenceApplicable`
    let method = "POST";
    let formData = {
      project_task_id: (tskId).toString(),
      evidence_id: evidenceTypeId,
      is_applicable: isApplicable,
    }
    if (data?.comment && data?.comment != "") {
      formData.comment = data?.comment
    }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      setShowAlert({ show: true, type: "success", message: isApplicable == "Y" ? AIR_MSG.Evidence_mark_applicable_success : AIR_MSG.Evidence_mark_not_applicable_success })
      // getTaskDetails(taskId)
      // getCommentsList(taskId)
      let element = data.ele || null
      if(element){
        let is_enabled = element.checked ? "Y" : "N";
      }
      let is_enabled = element.checked ? "Y" : "N";
      getTaskDetails(tskId)
      getCommentsList(tskId)
    } else {
      setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
    }
    if (upRes) {
      let tmpTaskInfo = Object.assign({}, taskInfo)
      tmpTaskInfo = upRes
      navigate(`/task-details/${encryptData(JSON.stringify(tmpTaskInfo))}`, { replace: true })
    }
    return res

  }
  const recallTask = async (type = null, value = null, data = null) => {
    if (taskId == 0 || data == null) {
      return false
    }
    let payloadUrl = `tasks/recallTask/${taskId}`
    let method = "POST";
    let formData = {comment:''}
    if(data?.comment && data?.comment != ""){
      formData.comment = data?.comment
    }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      setShowAlert({ show: true, type: "success", message: taskDetails?.task[0]?.is_recalled == "N" ? AIR_MSG.task_recall_success : AIR_MSG.task_return_success })
      getTaskDetails(taskId)
      getCommentsList(taskId)
    } else {
      setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
    }
    return res
  }


  return (
    <>
      <Header />
      <div className="container-fluid">
        <div id="taskDetails_sec" className="taskDetail">
          <div className="task_overview_block">

            <div className="row">
              <div className="col-md-9 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
                <div className="card">
                  <div className="card-body p-0">
                    <div className="task_card_block">
                      <div className="card_block py-3">
                        <div className="d-flex justify-content-between align-items-center px-3">
                          <div className="task_name_block">
                            <span className="task_name mr-2">{taskDetails && taskDetails?.task && taskDetails?.task[0]?.title}</span>
                            {(() => {
                              if (isManagement == 'Y' && (userType && (userType == 1 || userType == 2) && canUpdateTask)) {
                                return (
                                  <>
                                    <div className="dropdown custom d-inline-block">
                                      <label id="priorityOptions" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className={`m-0 badge badge-pill badge-${priority.toLowerCase() == 'low' ? 'success' : (priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{priority.toUpperCase()}</label>
                                      <div className="dropdown-menu" aria-labelledby="priorityOptions">
                                        {/* <a className="dropdown-item link_url" onClick={() => updateTaskDetails('priority', 'low')}>Low</a>
                                        <a className="dropdown-item link_url" onClick={() => updateTaskDetails('priority', 'medium')}>Medium</a>
                                        <a className="dropdown-item link_url" onClick={() => updateTaskDetails('priority', 'high')}>High</a> */}
                                        <a className="dropdown-item link_url" onClick={() => showModal("update_task_details", { type: "priority", value: "low", callingFn: updateTaskDetails })}>Low</a>
                                        <a className="dropdown-item link_url" onClick={() => showModal("update_task_details", { type: "priority", value: "medium", callingFn: updateTaskDetails })}>Medium</a>
                                        <a className="dropdown-item link_url" onClick={() => showModal("update_task_details", { type: "priority", value: "high", callingFn: updateTaskDetails })}>High</a>
                                      </div>
                                    </div>
                                  </>
                                )
                              } else {
                                return (
                                  <>
                                    <div className="dropdown d-inline-block">
                                      <label id="priorityOptions" className={`m-0 badge badge-pill badge-${priority.toLowerCase() == 'low' ? 'success' : (priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{priority.toUpperCase()}</label>
                                    </div>
                                  </>
                                )
                              }
                            })()}
                          </div>
                          <div className="widget_box d-flex flex-column text-right">
                            <span className="fw-600">Task Owner</span>
                            {/* <span>{taskDetails && taskDetails?.task && taskDetails?.task[0]?.task_owner ? taskDetails?.task[0]?.task_owner : '-'}</span> */}
                            {(() => {
                              if (accessRole != 'auditor' && (userType && (userType == 1 || userType == 2) && canUpdateTask) && [...taskOwnersList, ...keyMembers, ...servicePartners] && [...taskOwnersList, ...keyMembers, ...servicePartners].length > 0) {
                                return (
                                  <div className="dropdown custom d-inline-block">
                                    <span id="statusOptions" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >{Object.keys(taskOwner).length > 0 && taskOwner.emp_name != '-' ? `${taskOwner.emp_name} (${taskOwner.authority})` : 'Not Assigned'}</span>
                                    <div className="dropdown-menu dropdown-menu-right" aria-labelledby="statusOptions">
                                      {(() => {
                                        if (taskOwnersList.length > 0) {
                                          return (
                                            <>
                                              <h6 className="dropdown-header pl-2">Task Owners</h6>
                                              {taskOwnersList && taskOwnersList.map((tOwner, tkey) => {
                                                // return <a key={tkey} className="dropdown-item link_url" onClick={() => updateTaskDetails('owner', tOwner)}>{tOwner.emp_name} ({tOwner.authority})</a>
                                                return <a key={tkey} className="dropdown-item link_url" onClick={() => showModal("update_task_details", { type: "owner", value: tOwner, callingFn: updateTaskDetails })}>{tOwner.emp_name} ({tOwner.authority})</a>
                                              })}
                                            </>
                                          )
                                        }
                                      })()}
                                      {(() => {
                                        if (keyMembers.length > 0) {
                                          return (
                                            <>
                                              <h6 className="dropdown-header pl-2">Key Members</h6>
                                              {keyMembers && keyMembers.map((tOwner, tkey) => {
                                                if (tOwner.authority.indexOf('v') != 0) {
                                                  // return <a key={tkey} className="dropdown-item link_url" onClick={() => updateTaskDetails('owner', tOwner)}>{tOwner.emp_name} ({tOwner.authority})</a>
                                                  return <a key={tkey} className="dropdown-item link_url" onClick={() => showModal("update_task_details", { type: "owner", value: tOwner, callingFn: updateTaskDetails })}>{tOwner.emp_name} ({tOwner.authority})</a>
                                                }

                                              })}
                                            </>
                                          )
                                        }
                                      })()}
                                      {(() => {
                                        if (servicePartners.length > 0) {
                                          return (
                                            <>
                                              <h6 className="dropdown-header pl-2">Service Partners</h6>
                                              {servicePartners && servicePartners.map((tOwner, tkey) => {
                                                // return <a key={tkey} className="dropdown-item link_url" onClick={() => updateTaskDetails('owner', tOwner)}>{tOwner.emp_name} ({tOwner.authority})</a>
                                                return <a key={tkey} className="dropdown-item link_url" onClick={() => showModal("update_task_details", { type: "owner", value: tOwner, callingFn: updateTaskDetails })}>{tOwner.emp_name} ({tOwner.authority})</a>
                                              })}
                                            </>
                                          )
                                        }
                                      })()}
                                    </div>
                                  </div>
                                )
                              } else {
                                return (
                                  <div className="dropdown d-inline-block">
                                    <span>{Object.keys(taskOwner).length > 0 && taskOwner.emp_name != '-' ? `${taskOwner.emp_name} (${taskOwner.authority})` : 'Not Assigned'}</span>
                                  </div>
                                )
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
                <div className="card">
                  <div className="card-body p-0">
                    <div className="task_card_block">
                      <div className="card_block py-3">
                        <div className="d-flex justify-content-between align-items-center px-3">
                          <div className="widget_box d-flex flex-column text-left">
                            <span className="fw-600">Due Date</span>
                            {(() => {
                              if (isManagement == 'Y' && (userType && (userType == 1 || userType == 2) && canUpdateTask)) {
                                return (
                                  <>
                                    {(() => {
                                      if (taskInfo.isVirtual == "Y") {
                                        return (
                                          <AirCalender type="date" aClassName="customTaskDetail" markDate={taskInfo && taskInfo.dueDate} changeFn={onChangeDate} autoApply={true} >
                                            <span className="airdatePicker">{(taskInfo && taskInfo.dueDate) ? taskInfo && taskInfo.dueDate : 'Not set'}</span>
                                          </AirCalender>
                                        )
                                      } else {
                                        return (
                                          <AirCalender type="date" aClassName="customTaskDetail" markDate={taskDetails && taskDetails?.task && taskDetails?.task[0]?.due_date} autoApply={true} changeFn={onChangeDate} >
                                            <span className="airdatePicker">{(taskDetails && taskDetails?.task && taskDetails?.task[0]?.due_date) ? taskDetails?.task[0]?.due_date : 'Not set'}</span>
                                          </AirCalender>
                                        )
                                      }
                                    })()}
                                  </>
                                )
                              } else {
                                return (
                                  <>
                                    {(() => {
                                      if (taskInfo.isVirtual == "Y") {
                                        return (
                                          <span className="">{(taskInfo && taskInfo.dueDate) ? taskInfo && taskInfo.dueDate : 'Not set'}</span>
                                        )
                                      } else {
                                        return (
                                          <span className="">{(taskDetails && taskDetails?.task && taskDetails?.task[0]?.due_date) ? taskDetails?.task[0]?.due_date : 'Not set'}</span>
                                        )
                                      }
                                    })()}

                                  </>
                                )
                              }

                            })()}

                            {/* <span>{taskDetails && taskDetails?.task && taskDetails?.task[0]?.due_date}</span> */}
                          </div>
                          <div className="widget_box d-flex flex-column text-right">
                            <span>Status</span>
                            {(() => {
                              if ((userType && (userType == 1 || userType == 2) && false) && status != null) {
                                return (
                                  <div className="dropdown custom d-inline-block text-left">
                                    <span id="statusOptions" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className={`text-${(status == "pending") ? 'danger' : (status == 'in_progress' ? 'warning' : (status == 'review' ? 'primary' : 'success'))}`}>{(status == "pending" ? 'Open' : (status == 'in_progress' ? 'In Progress' : (status == 'review' ? 'Under Review' : 'Completed')))}</span>
                                    <div className="dropdown-menu dropdown-menu-right" aria-labelledby="statusOptions">
                                      {/* <a className="dropdown-item link_url" onClick={() => updateTaskDetails('status', 'pending')}>Open</a>
                                      <a className="dropdown-item link_url" onClick={() => updateTaskDetails('status', 'in_progress')}>In Progress</a>
                                      <a className="dropdown-item link_url" onClick={() => updateTaskDetails('status', 'review')}>Under Review</a> */}
                                      <a className="dropdown-item link_url" onClick={() => showModal("update_task_details", { type: "status", value: "pending", callingFn: updateTaskDetails })}>Open</a>
                                      <a className="dropdown-item link_url" onClick={() => showModal("update_task_details", { type: "status", value: "in_progress", callingFn: updateTaskDetails })}>In Progress</a>
                                      <a className="dropdown-item link_url" onClick={() => showModal("update_task_details", { type: "status", value: "review", callingFn: updateTaskDetails })}>Under Review</a>
                                      {(() => {
                                        if (accessRole != 'auditor' && (isManagement != 'N' || priority != 'high') && showButtons && btns && btns.mark_completed) {
                                          return (
                                            // <a className="dropdown-item link_url" onClick={() => updateTaskDetails('status', 'completed')}>Completed</a>
                                            <a className="dropdown-item link_url" onClick={() => showModal("update_task_details", { type: "status", value: "completed", callingFn: updateTaskDetails })}>Completed</a>
                                          )
                                        }
                                      })()}

                                    </div>
                                  </div>
                                )
                              } else {
                                return (
                                  <div className="dropdown d-inline-block">
                                    {status
                                      ? <span id="statusOptions" className={`text-${status == "pending" ? 'danger' : (status == 'in_progress' ? 'warning' : (status == 'review' ? 'primary' : (status == 'out_of_scope' ? 'dark' : 'success')))}`}>{status == "pending" ? 'Open' : (status == 'in_progress' ? 'In Progress' : (status == 'review' ? 'Under Review' : (status == 'out_of_scope' ? 'Out Of Scope' : ( taskDetails.task[0].auditor_status == "compliant" ? 'Audited' : 'Completed'))))}</span>
                                      : <span className="d-inline-block h20"></span>
                                    }
                                  </div>
                                )
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div className="row mt-3">
            <div className="col-md-9 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Description</h5>
                  <p className="card-text">
                    {taskDetails && taskDetails?.task && taskDetails?.task[0]?.description}
                  </p>

                </div>
              </div>
              {/* <div className="card mt-4">
                <div className="card-body p-0">
                  <div className="task_card_block assets_block">
                    <div className="card_block p-3">
                      <Accordion >
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>Applicable Assets</Accordion.Header>
                          <Accordion.Body>
                            <div className="assets_list pl-2">
                              {(() => {
                                if (taskDetails && taskDetails?.applicable_assets && taskDetails?.applicable_assets?.peoples.length > 0) {
                                  return (
                                    <>
                                      <div className="assets_box pt-3">
                                        <div className="header"><span className="box_bullet mr-2"></span>People</div>
                                        <ul className="m-0 pl-4">
                                          <li className="d-flex justify-content-between">
                                            <span>&#8627;	 Employees:</span>
                                            <span>{taskDetails?.applicable_assets?.peoples[0]?.employees ? taskDetails?.applicable_assets?.peoples[0]?.employees : 0}</span>
                                          </li>
                                          <li className="d-flex justify-content-between">
                                            <span>&#8627;	 Consultants:</span>
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
                                        <div className="header"><span className="box_bullet mr-2"></span>Technology Assets</div>
                                        <ul className="m-0 pl-4">
                                          <li className="d-flex justify-content-between">
                                            <span>&#8627;	Endpoints:</span>
                                            <span>{taskDetails?.applicable_assets?.technology_assets[0]?.endpoints ? taskDetails?.applicable_assets?.technology_assets[0]?.endpoints : 0}</span>
                                          </li>
                                          <li className="d-flex justify-content-between">
                                            <span>&#8627;	Mobile Devices:</span>
                                            <span>{taskDetails?.applicable_assets?.technology_assets[0]?.mobile_devices ? taskDetails?.applicable_assets?.technology_assets[0]?.mobile_devices : 0}</span>
                                          </li>
                                          <li className="d-flex justify-content-between">
                                            <span>&#8627;	Servers:</span>
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
                                        <div className="header"><span className="box_bullet mr-2"></span>Vendors/Service Providers</div>
                                        <ul className="m-0 pl-4">
                                          {taskDetails?.applicable_assets?.vendors && taskDetails?.applicable_assets?.vendors.map((vendor, vIndex) => {
                                            return (
                                              <li key={vIndex} className="d-flex justify-content-between">
                                                <span>&#8627;	{vendor.vendor}</span>
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
                                        <div className="header"><span className="box_bullet mr-2"></span>Saas/Third Party Utility</div>
                                        <ul className="m-0 pl-4">
                                          {taskDetails?.applicable_assets?.third_party_utilities && taskDetails?.applicable_assets?.third_party_utilities.map((utility, uIndex) => {
                                            if (utility.is_selected == 'Y') {
                                              return (
                                                <li key={uIndex} className="d-flex justify-content-between">
                                                  <span>&#8627;	{utility.name}</span>
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
              <div className="card mt-4">
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
                              <span className="pt-1"> <i className="fa fa-file" aria-hidden="true"></i> {evidence.evidence_name}</span>
                              {canUpdateTask &&
                                <div className="d-flex align-items-center">
                                  <div className="control_button_block pl-3"><Button className="btn_1 btn_small fs-10 min_w_130" variant="outline-dark" onClick={() => showModal('view_upload_evidence', evidence)}>Upload Documents</Button></div>
                                  <div className="control_button_block pl-3">
                                    <OverlayTrigger
                                      placement={"top"}
                                      overlay={
                                        <Tooltip id={`tooltip-top`}>
                                          Mark Evidence as {evidence.is_applicable == "Y" ? "Not" : ""} Applicable
                                        </Tooltip>
                                      }
                                    >
                                      <div className="custom-control custom-switch">
                                        <input type="checkbox" className="custom-control-input" id={`customSwitch${eIndex}`} ref={el => applicableInpref.current[eIndex] = el} defaultChecked={evidence.is_applicable == "Y" ? true : false} onChange={(e) => showModal("update_task_details", { type: evidence.evidence_type_id, value: evidence.is_applicable == "Y" ? "N" : "Y",ele:e, callingFn: toggleEvidenceApplicable })} />
                                        <label className="custom-control-label" htmlFor={`customSwitch${eIndex}`} ></label>
                                      </div>
                                      {/* <Button className="btn_1 btn_small fs-10" variant="outline-dark" onClick={() => showModal("update_task_details", { type: evidence.evidence_type_id, value: evidence.is_applicable == "Y" ? "N" : "Y", callingFn: toggleEvidenceApplicable })}>{evidence.is_applicable == "Y" ? "N/A" : "A"}</Button> */}
                                    </OverlayTrigger>
                                  </div>
                                </div>
                              }
                            </div>
                            <div className="evidences_list px-4">
                              <ul className="m-0 p-0 px-2">
                                {evidence && evidence.evidence_uploaded && evidence.evidence_uploaded.length > 0 && evidence.evidence_uploaded.map((evDocs, evIndex) => {
                                  return (
                                    <li key={evIndex} className="d-flex justify-content-between my-2">
                                      <span className="link_url" onClick={() => showModal('view_documents', evDocs)}>&#8627; <span className="text_underline">{evDocs.file_name}</span> <span className={`badge badge-primary ${evDocs.collection_type == "manual" ? 'btn_08' : 'btn_09'}`}>{evDocs.collection_type == "auto" ? 'Automated' : 'Manual'}</span></span>
                                      <span className="action">
                                        {/* <span className="link_url" onClick={() => showModal('view_documents', evDocs)}><i className="fa fa-eye"></i></span> */}
                                        <span className="link_url" onClick={() => showModal('view_documents', evDocs)}><img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon small" /></span>
                                        <button className="border-0 bg-transparent pr-0" onClick={() => downloadFile(evDocs)} disabled={formSubmitted}><i className="fa fa-download"></i></button>
                                        {/* <button className="border-0 bg-transparent" onClick={() => delEvidence(evDocs.task_evidence_id)} disabled={formSubmitted}><i className="fa fa-trash"></i></button> */}
                                        {accessRole && accessRole != 'auditor' && status != "completed" && canUpdateTask
                                          ? <button className="border-0 bg-transparent" onClick={() => onDelEvidence("del_evidence_confirmation", { evidenceId: evDocs.task_evidence_id, tskId: taskId })} disabled={formSubmitted}><i className="fa fa-trash"></i></button>
                                          : ''
                                        }

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
                    {/* <div className="w-100 pb-3">
                      <div className="control_button_block pl-3">
                        <Button className="btn_2" variant="outline-dark">Sample Evidence library</Button>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
              {showButtons && btns &&
                <div className="card mt-4 taskDetails_btn sticky">
                  <div className="card-body p-0">
                    <div className="task_card_block">
                      <div className="taskDetails_btn_block px-3 d-flex py-4 flex-wrap justify-content-center align-items-center">
                        {showButtons && btns && btns.reduce_frequency &&
                          <div className="card_button_block ">
                            <Button className={`btn_1 btn_wide `} variant="outline-dark" disabled={formSubmitted || (taskDetails && taskDetails?.task && taskDetails?.task[0]?.task_frequency.toLowerCase() == 'weekly')} onClick={() => showModal("reduce_frequency_modal")}>Reduce Frequency</Button>
                          </div>
                        }
                        {showButtons && btns && btns.mark_completed &&
                          <div className="card_button_block pl-3">
                            <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => updateTaskDetails('status', 'completed')} disabled={formSubmitted}>Mark Complete</Button>
                          </div>
                        }
                        {showButtons && btns && btns.out_of_scope &&
                          <div className="card_button_block pl-3">
                            {/* <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => updateTaskStatus('task_status', 'out_of_scope')} disabled={formSubmitted}>Out Of Scope</Button> */}
                            <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => showModal("update_task_details", { type: "status", value: "out_of_scope", callingFn: updateTaskDetails })} disabled={formSubmitted}>Out Of Scope</Button>
                          </div>
                        }
                        {showButtons && btns && btns.approve &&
                          <div className="card_button_block pl-3">
                            <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => updateTaskStatus('admin_status', 'approved')} disabled={formSubmitted}>Approve</Button>
                          </div>
                        }
                        {showButtons && btns && btns.reject &&
                          <div className="card_button_block pl-3">
                            {/* <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => updateTaskStatus('admin_status', 'rejected')} disabled={formSubmitted}>Reject</Button> */}
                            <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => showModal("update_task_details", { type: "admin_status", value: "rejected", callingFn: updateTaskStatus })} disabled={formSubmitted}>Reject</Button>
                          </div>
                        }
                        {showButtons && btns && btns.compliant &&
                          <div className="card_button_block pl-3">
                            <Button className={`${taskDetails.task[0].auditor_status == "compliant" ? 'btn_05 btn-primary-2' : 'btn_1' }`} variant="outline-dark" disabled={formSubmitted || taskDetails.task[0].auditor_status == "compliant"} onClick={() => updateTaskStatus('auditor_status', 'compliant')}>Compliant</Button>
                          </div>
                        }
                        {showButtons && btns && btns.not_compliant &&
                          <div className="card_button_block pl-3">
                            {/* <Button className={`btn_1`} variant="outline-dark" disabled={formSubmitted} onClick={() => updateTaskStatus('auditor_status', 'not_compliant')}>Not Compliant</Button> */}
                            <Button className={`${taskDetails.task[0].auditor_status == "not_compliant" ? 'btn_05 btn-primary-2' : 'btn_1' }`} variant="outline-dark" disabled={formSubmitted || taskDetails.task[0].auditor_status == "not_compliant"} onClick={() => showModal("update_task_details", { type: "auditor_status", value: "not_compliant", callingFn: updateTaskStatus })}>Not Compliant</Button>
                          </div>
                        }
                        {showButtons && btns && btns.send_approval &&
                          <div className="card_button_block pl-3">
                            {/* <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => showModal("update_task_details", { type: "status", value: "review", callingFn: updateTaskDetails })} disabled={formSubmitted}>Send for Approval</Button> */}
                            <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => updateTaskDetails('status', 'review')} disabled={formSubmitted}>Send for Approval</Button>
                          </div>
                        }
                        {showButtons && btns && btns.recall &&
                          <div className="card_button_block pl-3">
                            {
                               taskDetails.task[0].task_status == "completed" && taskDetails.task[0].is_recalled == "Y"
                               ? <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => showModal("update_task_details", { type: "is_recalled", value: "N", callingFn: updateTaskStatus })} disabled={formSubmitted}>Withdraw Recall</Button>
                               : <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => showModal("update_task_details", { type: "recall", value: "recall", callingFn: recallTask })} disabled={formSubmitted}>Recall</Button>
                            }
                            {/* <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => showModal("update_task_details", { type: "recall", value: "recall", callingFn: recallTask })} disabled={formSubmitted || taskDetails.task[0].is_recalled == "Y"}>{taskDetails.task[0].is_recalled == "N" ? "Recall" : "Recalled"}</Button> */}
                            {/* <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => recallTask()} disabled={formSubmitted || taskDetails.task[0].is_recalled == "Y"}>{taskDetails.task[0].is_recalled == "N" ? "Recall" : "Recalled"}</Button> */}
                          </div>
                        }
                        {showButtons && btns && btns.return &&
                          <div className="card_button_block pl-3">
                            {/* <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => recallTask()} disabled={formSubmitted}>Return</Button> */}
                            <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => showModal("update_task_details", { type: "recall", value: "recall", callingFn: recallTask })} disabled={formSubmitted }>Return</Button>
                          </div>
                        }
                        {/* {(() => {
                          if (isManagement && isManagement == 'Y') {
                            return (
                              <>
                                <div className="card_button_block ">
                                  <Button className={`btn_1 btn_wide `} variant="outline-dark" disabled={formSubmitted || (taskDetails && taskDetails?.task && taskDetails?.task[0]?.task_frequency.toLowerCase() == 'weekly')} onClick={() => showModal("reduce_frequency_modal")}>Reduce Frequency</Button>
                                </div>
                              </>
                            )
                          }
                        })()}
                        
                        {(() => {
                          if (accessRole != 'auditor' && (isManagement != 'N' || priority != 'high') && (status != "completed")) {
                            return (
                              <div className="card_button_block pl-3">
                                <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => updateTaskDetails('status', 'completed')} disabled={formSubmitted}>Mark Completed</Button>
                              </div>
                            )
                          }
                        })()}

                        {(() => {
                          if (isManagement && isManagement == 'Y') {
                            return (
                              <>
                                <div className="card_button_block pl-3">
                                  <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => updateTaskStatus('admin_status', 'out_of_scope')} disabled={formSubmitted}>Out Of Scope</Button>
                                </div>
                              </>
                            )
                          }
                        })()}
                        {(() => {
                          if (isManagement && isManagement == 'Y' && priority == 'high') {
                            return (
                              <>
                                <div className="card_button_block pl-3">
                                  <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => updateTaskStatus('admin_status', 'approved')} disabled={formSubmitted}>Approve</Button>
                                </div>
                              </>
                            )
                          }
                        })()}
                        {(() => {
                          if (isManagement && isManagement == 'Y' && priority == 'high') {
                            return (
                              <>
                                <div className="card_button_block pl-3">
                                  <Button className={`btn_1 btn_wide`} variant="outline-dark" onClick={() => updateTaskStatus('admin_status', 'rejected')} disabled={formSubmitted}>Reject</Button>
                                </div>
                              </>
                            )
                          }
                        })()}


                        {(() => {
                          if (accessRole == 'auditor') {
                            return (
                              <>
                                <div className="card_button_block pl-3">
                                  <Button className={`btn_1`} variant="outline-dark" disabled={formSubmitted} onClick={() => updateTaskStatus('auditor_status', 'compliant')}>Compliant</Button>
                                </div>
                              </>
                            )
                          }
                        })()}
                        {(() => {
                          if (accessRole == 'auditor') {
                            return (
                              <>
                                <div className="card_button_block pl-3">
                                  <Button className={`btn_1`} variant="outline-dark" disabled={formSubmitted} onClick={() => updateTaskStatus('auditor_status', 'not_compliant')}>Not Compliant</Button>
                                </div>
                              </>
                            )
                          }
                        })()} */}

                      </div>
                    </div>
                  </div>
                </div>
              }
              <div className="card card_shadow mt-4">
                <div className="card-body p-10">
                  <h4 className="mb-3">Comments</h4>
                  {/* <div className="infobtn yrscpe mb-2">
                    <div className="card_button_block d-inline-block">
                      <Button className="btn_1 btn_wide font-weight-bold" variant="outline-dark">All</Button>
                    </div>
                    <div className="card_button_block d-inline-block ml-2">
                      <Button className="btn_1 btn_wide font-weight-bold" variant="outline-dark">Comments</Button>
                    </div>
                    <div className="card_button_block d-inline-block ml-2">
                      <Button className="btn_1_inverse btn_wide font-weight-bold" variant="outline-dark">History</Button>
                    </div>
                  </div> */}
                  <div className="form-group text_area">
                    {/* <textarea name="" id="" cols="20" rows="8" className="form-control border " placeholder="Add a comment... " ref={commentInpRef}></textarea> */}
                    <MentionsInput
                      value={mentionVal}
                      onChange={handleChange}
                      placeholder="Type anything, use the @ symbol to tag other users."
                      className="mentions_section fs-13"
                      inputRef={commentInpRef}>
                      <Mention
                        type="user"
                        trigger="@"
                        data={userMentionData}
                        className="mention_card_box"
                        renderSuggestion={renderUserSuggestion}
                      />
                    </MentionsInput>
                    {customErrors && customErrors.addComment && customErrors.addComment.type == "invalid" && <div className="text-danger fs-12 text_color_3 my-2">Invalid Comment </div>}
                    <div className="comment_btn_box text-right mt-3">
                      <button type="button" className="btn btn-primary-2 btn_05" onClick={() => addComment()}>Send</button>
                    </div>

                  </div>
                  <ul className="chatSection">
                    {(() => {
                      if (comments.length > 0) {
                        return (
                          <>
                            {comments && comments.map((comment, cIndex) => {
                              return (
                                <li key={cIndex} className="d-flex flex-column mb-4">
                                  <div className="chatItem m-0">
                                    {/* <img src="/assets/img/chatU2.svg" alt="" className="mr-2 p-1" /> */}
                                    <span className="air_initials m-0 mr-2" >
                                      <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(comment.commented_by_name)}</span>
                                    </span>
                                    <div className="flex-fill">
                                      <h4 className="mb-1">{comment.commented_by_name} <span className="timeState ml-2">{comment.commented_on}</span></h4>
                                      {(() => {
                                        if (showEditBox != -1 && showEditBox == cIndex) {
                                          return (
                                            <div className="edit_comment_box w-100">
                                              <div className="editInpField">
                                                {/* <textarea className="form-control border" rows={4} defaultValue={comment.comment_text} ref={el => (editCommentInpRef.current[cIndex] = el)}></textarea> */}
                                                <MentionsInput
                                                  inputRef={el => (editCommentInpRef.current[cIndex] = el)}
                                                  value={editMentionVal}
                                                  onChange={handleEditChange}
                                                  placeholder="Type anything, use the @ symbol to tag other users."
                                                  className="mentions_section">
                                                  <Mention
                                                    type="user"
                                                    trigger="@"
                                                    data={userMentionData}
                                                    className="mention_card_box"
                                                    renderSuggestion={renderUserSuggestion}
                                                  />
                                                </MentionsInput>
                                                {/* <input className="form-control" ref={el => (editCommentInpRef.current[cIndex] = el)} /> */}
                                                {customErrors && customErrors.updateComment && customErrors.updateComment.type == "invalid" && <div className="text-danger fs-12 text_color_3 my-2">Invalid Comment </div>}
                                              </div>
                                              <div className="editSubmitBtn text-right mt-3">
                                                <button type="button" className="btn btn-primary-2 btn_05" onClick={() => { updateComment(comment.comment_id, cIndex) }}>Update</button>
                                                {/* <Button className="btn_1_inverse btn_1" variant="secondary" onClick={() => { updateComment(comment.comment_id, cIndex) }}>Update</Button> */}
                                                <Button className="btn_1 ml-2" variant="outline-dark" onClick={() => toggleEditBox(-1)}>Cancel</Button>
                                              </div>
                                            </div>
                                          )
                                        } else {
                                          return <p className="mb-0">{comment.comment_text ? mentionStrToHtml(comment.comment_text) : ''}</p>
                                        }
                                      })()}
                                      {(() => {
                                        if (Number(user?.currentUser.org_emp_id) == Number(comment.commented_by_id)) {
                                          return (
                                            <>
                                              <span className="edit_reply_btn" onClick={() => { toggleEditBox(cIndex) }}>{showEditBox != -1 && showEditBox == cIndex ? 'cancel' : 'Edit'}</span>
                                              {/* <span className="edit_reply_btn" onClick={() => { toggleRplyBox(cIndex) }}>Reply</span> */}
                                              <span className="edit_reply_btn" onClick={() => { delComment(comment.comment_id) }}>Delete</span>
                                            </>
                                          )
                                        }
                                      })()}

                                    </div>
                                  </div>
                                  {comment.repliedComments.length > 0 && getSubComments(comment.repliedComments, cIndex)}

                                </li>
                              )

                            })}

                          </>
                        )
                      }
                    })()}

                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
              {(() => {
                if (priority == "high") {
                  return (
                    <>
                      <div className="card">
                        <div className="card-body p-0">
                          <div className="task_card_block task_control_block">
                            <div className="card_block control_block py-3">
                              <Accordion>
                                <Accordion.Item eventKey="0">
                                  <Accordion.Header>Approver</Accordion.Header>
                                  <Accordion.Body>
                                    <div className="card_box control_box">
                                      <div className="widget_box d-flex flex-column text-right">
                                        {(() => {
                                          if (keyMembers && keyMembers.length > 0 && (userType && (userType == 1 || userType == 2 || (userType == 3 && (Object.keys(approvalAuthority).length == 0 || !approvalAuthority.emp_id || approvalAuthority.emp_id == 0))) && canUpdateTask)) {
                                            return (
                                              <div className="dropdown custom d-inline-block text-left">
                                                <span id="statusOptions" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >{Object.keys(approvalAuthority).length > 0 && approvalAuthority.emp_name != '-' ? `${approvalAuthority.emp_name} (${approvalAuthority.authority})` : 'Not Assigned'}</span>
                                                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="statusOptions">
                                                  <h6 className="dropdown-header">Key Members</h6>
                                                  {keyMembers && keyMembers.map((member, tkey) => {
                                                    if (member.authority.indexOf('v') != 0) {
                                                      return <a key={tkey} className="dropdown-item link_url" onClick={() => updateTaskDetails('authority', member)}>{member.emp_name} ({member.authority})</a>
                                                    }
                                                  })}
                                                </div>
                                              </div>
                                            )
                                          } else {
                                            return (
                                              <div className="dropdown d-inline-block">
                                                <span id="statusOptions" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >{Object.keys(approvalAuthority).length > 0 && approvalAuthority.emp_name != '-' ? `${approvalAuthority.emp_name} (${approvalAuthority.authority})` : 'Not Assigned'}</span>
                                              </div>
                                            )
                                          }
                                        })()}
                                      </div>
                                    </div>
                                  </Accordion.Body>
                                </Accordion.Item>
                              </Accordion>

                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                }
              })()}
              <div className="card mt-4">
                <div className="card-body p-0">
                  <div className="task_card_block task_status_block">
                    <div className="card_block status_block py-3">
                      <Accordion activeKey="0" alwaysOpen>
                        <Accordion.Item eventKey="0">
                          <Accordion.Header className={`no_icn px-2`} onClick={null}>Task Info</Accordion.Header>
                          <Accordion.Body>
                            <div className="stat_block p-3">

                              <div className="stat_box">
                                <span>Task ID</span>
                                <span>{taskDetails && taskDetails?.task && taskDetails?.task[0]?.task_id}</span>
                              </div>
                              {/* <div className="stat_box">
                                <span>AUC ID</span>
                                <span>{taskDetails && taskDetails?.task && taskDetails?.task[0]?.auc_id}</span>
                              </div> */}
                              <div className="stat_box">
                                <span>Evidence Attached</span>
                                <span className="text_color_4">{taskDetails && taskDetails?.task && taskDetails?.task[0]?.evidence_added}</span>
                              </div>
                              <div className="stat_box">
                                <span>Frequency</span>
                                <span>{taskDetails && taskDetails?.task && taskDetails?.task[0]?.task_frequency}</span>
                              </div>
                              {taskDetails && taskDetails?.task && taskDetails?.task[0]?.task_status == "completed" && taskDetails?.task[0]?.completion_date &&
                                <div className="stat_box">
                                  <span>Completion Date</span>
                                  <span>{taskDetails && taskDetails?.task && taskDetails?.task[0]?.completion_date}</span>
                                </div>
                              }
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mt-4">
                <div className="card-body p-0">
                  <div className="task_card_block task_control_block">
                    <div className="card_block control_block py-3">
                      {/* <Accordion defaultActiveKey="0"> */}
                      <Accordion>
                        <Accordion.Item eventKey="0">
                          <Accordion.Header>Controls & Mapping</Accordion.Header>
                          <Accordion.Body>
                            {taskDetails && taskDetails?.task && taskDetails?.task[0]?.soc2_category &&
                              <div className="card_box control_box">
                                <span className="w70 d-inline-block">SOC 2</span>
                                <span className={`col pr-0 text-right line_clamp_2 ${showControlsText["soc2"] ? 'showFullText' : ''}`}>

                                  {taskDetails &&
                                    taskDetails?.task &&
                                    (taskDetails?.task[0]?.soc2_category.length < 70
                                      ? taskDetails?.task[0]?.soc2_category
                                      : (showControlsText["soc2"])
                                        ? <>{taskDetails?.task[0]?.soc2_category} <span className="link_url fs-9 fw-600 text_color_7" onClick={() => toggleFullText('soc2', false)} >..Show Less</span></>
                                        : <>{taskDetails?.task[0]?.soc2_category.substring(0, 70)} <span className="link_url fs-9 fw-600 text_color_7" onClick={() => toggleFullText('soc2', true)} >..Show More</span></>
                                    )
                                  }
                                </span>
                              </div>
                            }
                            {taskDetails && taskDetails?.task && taskDetails?.task[0]?.iso_category &&
                              <div className="card_box control_box">
                                <span className="w70 d-inline-block">ISO 27001</span>
                                {/* <span className="w-50 text-right">{taskDetails && taskDetails?.task && taskDetails?.task[0]?.iso_category}</span> */}
                                <span className={`col pr-0 text-right line_clamp_2 ${showControlsText["soc2"] ? 'showFullText' : ''}`}>
                                  {taskDetails &&
                                    taskDetails?.task &&
                                    (taskDetails?.task[0]?.iso_category.length < 70
                                      ? taskDetails?.task[0]?.iso_category
                                      : (showControlsText["iso"])
                                        ? <>{taskDetails?.task[0]?.iso_category} <span className="link_url fs-9 fw-600 text_color_7" onClick={() => toggleFullText('iso', false)} >..Show Less</span></>
                                        : <>{taskDetails?.task[0]?.iso_category.substring(0, 70)} <span className="link_url fs-9 fw-600 text_color_7" onClick={() => toggleFullText('iso', true)} >..Show More</span></>
                                    )
                                  }
                                </span>
                              </div>
                            }
                            {taskDetails && taskDetails?.task && taskDetails?.task[0]?.nist_csf_category &&
                              <div className="card_box control_box">
                                <span className="w70 d-inline-block">NIST</span>
                                {/* <span className="w-50 text-right">{taskDetails && taskDetails?.task && taskDetails?.task[0]?.nist_csf_category}</span> */}
                                <span className={`col pr-0 text-right line_clamp_2 ${showControlsText["soc2"] ? 'showFullText' : ''}`}>
                                  {taskDetails &&
                                    taskDetails?.task &&
                                    (taskDetails?.task[0]?.nist_csf_category.length < 70
                                      ? taskDetails?.task[0]?.nist_csf_category
                                      : (showControlsText["nist"])
                                        ? <>{taskDetails?.task[0]?.nist_csf_category} <span className="link_url fs-9 fw-600 text_color_7" onClick={() => toggleFullText('nist', false)} >..Show Less</span></>
                                        : <>{taskDetails?.task[0]?.nist_csf_category.substring(0, 70)} <span className="link_url fs-9 fw-600 text_color_7" onClick={() => toggleFullText('nist', true)} >..Show More</span></>
                                    )
                                  }
                                </span>
                              </div>
                            }
                            {taskDetails && taskDetails?.task && taskDetails?.task[0]?.health_category &&
                              <div className="card_box control_box">
                                <span className="w70 d-inline-block">Health</span>
                                <span className="col pr-0 text-right">{taskDetails && taskDetails?.task && taskDetails?.task[0]?.health_category}</span>
                              </div>
                            }

                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>

                    </div>
                  </div>
                </div>
              </div>

              {(() => {
                if (isManagement && isManagement == 'Y') {
                  return (
                    <>
                      <div className="card mt-4">
                        <div className="card-body p-0">
                          <div className="task_card_block task_control_block">
                            <div className="card_block control_block py-3">
                              <div className="card_box control_box">
                                <div className="w-100 widget_box d-flex text-right justify-content-center">
                                  <div className="card_button_block pl-3 ">
                                    <Button className={`btn_1 btn_wide `} variant="outline-dark" disabled={formSubmitted} onClick={() => showModal("show_audit_details")}>Audit Details</Button>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                }
              })()}

            </div>
          </div>
        </div>
      </div>

      {(() => {
        if (showAlert && showAlert.show && showAlert.type == "del_evidence_confirmation") {
          return (
            <SweetAlert
              danger
              showCancel
              confirmBtnText="Delete"
              confirmBtnBsStyle="danger"
              cancelBtnCssClass="btn btn-outline-secondary text_color_2"
              title="Are you sure  you want delete the evidence ?"
              onConfirm={() => delEvidence(showAlert?.data?.evidenceId, showAlert?.data?.tskId)}
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



      {(() => {
        if (modalType && modalType != '' && modalType != null) {
          if (modalType == 'view_upload_evidence') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={{ taskDetails, taskId: taskDetails.task[0].task_id, evidenceTypeId: evidenceTypeId, taskInfo, saveTaskDetails }}
              formSubmit={() => { }} />
          }
          if (modalType == 'view_documents') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={{ viewFile: viewFile, fileType: fileType }}
              formSubmit={() => { }} />
          }
          if (modalType == 'reduce_frequency_modal') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={{ dueDateExpressions, getDueDateExpressions, taskDetails, taskId: taskDetails.task[0].task_id }}
              formSubmit={changeReduceFrequency} />
          }
          if (modalType == 'update_task_details') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={modalData}
              formSubmit={() => null} />
          }
          if (modalType == 'show_audit_details') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={{ taskDetails, taskId: taskDetails.task[0].task_id }}
              formSubmit={() => { }} />
          }
        }
      })()}
    </>
  )
}

export default TaskDetails