import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie, FormatDate, GetInitials, GetRandomColor, ChangeDateFormat, encryptData, _Id } from "../helpers/Helper";
import { useNavigate, useOutletContext } from "react-router-dom";
import Header from "../components/partials/Header";
import React, { useContext, useEffect, useRef, useState } from "react";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from "moment";

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import AirModal from "../elements/AirModal";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import { Button, Dropdown, DropdownButton, Overlay, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import SweetAlert from "react-bootstrap-sweetalert";
import AIR_MSG from "../helpers/AirMsgs";
import Multiselect from 'multiselect-react-dropdown';

const MyTasks = (props) => {
  // const { user = {} } = useOutletContext()
  // const orgId = user?.currentUser?.org_id || 0;
  const { projectId = null, user = {} } = useContext(LayoutContext)
  // const accessRole = user?.currentUser?.access_role || '';
  const { access_role: accessRole = null, org_id: orgId = 0, is_management: isManagement = '' } = user?.currentUser;
  const [viewType, setViewType] = useState({ board: true, calender: false })
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const navigate = useNavigate()
  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [taskDetails, setTaskDetails] = useState({})
  const [viewFile, setViewFile] = useState(null)
  const [fileType, setFileType] = useState(null)

  const [dueDateExpressions, setDueDateExpressions] = useState([]);
  const [controlCategories, setControlCategories] = useState([]);
  const [controlCriterias, setControlCriterias] = useState([]);
  const [controlDomains, setControlDomains] = useState([]);
  const [thirdPartyConnectors, setThirdPartyConnectors] = useState([]);
  const [checkFilters, setCheckFilters] = useState([]);
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })
  const [showNoTaskMsg, setShowNoTaskMsg] = useState(false)
  const [cardView, setCardView] = useState('my_tasks')

  const now = new Date()
  const numDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const startDate = moment().startOf('month')
  const endDate = moment().endOf('month')
  const calendarRef = useRef()
  const keywordRef = useRef()

  useEffect(() => {
    if (projectId != null) {
      fetchInfo({ type: "my_tasks" })
    }

    // if (controlCategories.length == 0 && projectId != null) {
    //   getControlCategories()
    // }
    // if (controlCriterias.length == 0 && projectId != null) {
    //   getControlCriteria()
    // }
    // if (controlDomains.length == 0 && projectId != null) {
    //   getControlDomains()
    // }
    // if (thirdPartyConnectors.length == 0 && projectId != null) {
    //   getThirdPartyCOnnectors();
    // }
  }, [projectId]);





  // const fetchInfo = async (type = '', project_id = 0, filter_type = null, priority_type = null, view = null) => {
  const fetchInfo = async (data = null) => {
    let { type = '' } = data || {}
    if (type == '') {
      return false
    };
    setShowNoTaskMsg(false)
    // type = approval/my_tasks
    let payloadUrl = `tasks/listMyTasks/${projectId}/${type}`
    let method = "GET";
    let formData = {};
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      // let allTasks = [];
      let allTasks = res.results;
      if (allTasks.length > 0) {
        setTasks(oldVal => {
          return [...allTasks]
        })
        setFilteredTasks(oldVal => {
          return [...allTasks]
        })
      } else {
        setShowNoTaskMsg(true)
      }

    }
    // }
  }


  /* const selectionRange = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  } */
  const selectionRange = {
    'Today': [moment(), moment()],
    'Previous Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    'This Month': [startDate, endDate],
    'Next Month': [moment().add(1, 'month').startOf('month'), moment().add(1, 'month').endOf('month')],
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

          let fileType = contentType ? contentType.substr(contentType.lastIndexOf('/') + 1) : null;
          // let fileUrl = reader.result;
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

    switch (modalName) {
      case 'view_task_details':
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
      case 'add_new_task':
        setModalType(modalName)
        setShowModal(true)
        break;
      case 'import_tasks':
        setModalType(modalName)
        setShowModal(true)
        break;

    }
  }

  const hideModal = () => {
    if (modalType == "view_task_details") {
      // fetchInfo("all_tasks")
      let obj = { type: "all_tasks" }
      fetchInfo(obj)
    }
    setModalType(null)
    setShowModal(false)
  }


  const filterStr = (str = null, replaceVal = '', toVal = '') => {
    if (str == null || str == '') {
      return str
    }
    // console.log(str)
    // return str.toString().replace(replaceVal,toVal)
    return str
  }

  const goToUrl = (page = '', data = {}) => {
    if (page == '') {
      return
    }
    let url = ''
    if (page == "task_details") {
      let obj = {
        taskId: data.project_task_id,
        dueDate: data.due_date,
        isVirtual: data.is_virtual
      }
      url = `/task-details/${encryptData(JSON.stringify(obj))}`
    }
    if (url != '') {
      navigate(url)
    }

  }



  /* const taskReorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }; */

  const getDueDateExpressions = async (frequency = null) => {
    if (frequency == null) {
      return false
    }
    let payloadUrl = `tasks/getDueDateExpressions/${frequency}`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      const result = res.results
      setDueDateExpressions(oldVal => {
        return [...result]
      })
      if (result && result.length > 0) {
        return result[0]["due_date_expression"];
      }
      return false;
    }
  }

  const addNewTask = async (formData = null) => {
    if (formData == null) {
      return false
    }
    let payloadUrl = `tasks/createTask`
    let method = "POST";
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      // fetchInfo("all_tasks")
      let obj = { type: "my_tasks" }
      fetchInfo(obj)
      return res
    }
  }


  const getThirdPartyCOnnectors = async () => {
    // /configuration/getThirdPartyConnectors/:project_id
    let payloadUrl = `configuration/getThirdPartyConnectors/${projectId}`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      // fetchInfo("all_tasks")
      setThirdPartyConnectors(oldVal => {
        return [...res.results]
      })
      return res
    }
  }

  const loadAutoEvidences = async (connectorId = null) => {
    if (connectorId == null) {
      return false
    }
    let payloadUrl = `evidences/uploadAutoEvidence/${projectId}/${connectorId}`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method, {}, '', process.env.REACT_APP_CONNECTOR_API_URL);
    if (res && res.message == "Success") {
      // fetchInfo("all_tasks")
      let obj = { type: "all_tasks" }
      fetchInfo(obj)
      setShowAlert({ show: true, type: "success", message: res.message })
    } else {
      if (res && res.message) {
        setShowAlert({ show: true, type: "danger", message: res.message })
      } else {
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
      }

    }
  }

  const toggleAlert = (val) => {
    setShowAlert(val)
  }

  const toggleFilterDropdown = (id = null) => {
    if (id == null) {
      return false
    }
    _Id(`${id}_input`).click()
  }

  const importTasks = async (formData = null) => {
    if (formData == null) {
      return false
    }
    return false
    let payloadUrl = `tasks/createTask`
    let method = "POST";
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      // fetchInfo("all_tasks")
      let obj = { type: "all_tasks" }
      fetchInfo(obj)
      return res
    }
  }
  const changeCardView = (view = "") => {
    if (view == "") {
      return false
    }
    let obj = { type: view }
    fetchInfo(obj)
    setCardView(view)
  }

  return (
    <>
      <Header />
      <div id="task_manager_sec" className="container-fluid">
        <div className="row">
          <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
            <div className="align-items-center d-flex justify-content-between my-3">
              <div>
                <ul className="pagination mb-0 filterview">
                  <li className={`page-item ${cardView == 'my_tasks' ? 'active' : ''}`}><a onClick={() => changeCardView('my_tasks')} className="page-link w150 max_w_auto">Open</a></li>
                  <li className={`page-item ${cardView == 'approval' ? 'active' : ''}`}><a onClick={() => changeCardView('approval')} className="page-link w150 max_w_auto">Approval Awaited</a></li>
                </ul>
              </div>
            </div>
            <div className="gridcontainer timecontainer auditor">

              <div className="grid_item">
                <div className="card">
                  <div className="align-items-center card-header d-flex justify-content-between py-2">
                    <h4>
                      {/* <img src="/assets/img/gbl.gif" alt="" className="mr-2 timeIcon" height="1" width="1" />  */}
                      Tasks
                    </h4>
                  </div>
                  <div className="card-body">
                    {filteredTasks && filteredTasks.length > 0 && React.Children.toArray(filteredTasks.map((task, tIndex) => {
                      return (
                        // <div key={tIndex} onClick={() => getTaskDetails(task.project_task_id)} className={`link_url gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                        <div key={tIndex} onClick={() => goToUrl("task_details", task)} className={`link_url gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                          <div className="gridboxbody">
                            <div className="col p-0">
                              <p className="w100">{task.project_task_id}</p>
                              {/* <h4>{task.description}</h4> */}
                              <h4 className="col p-0">{task.title}</h4>
                            </div>
                            <p className="w60">{/* <img src="/assets/img/gbl.gif" alt="folder" height="1" width="1" /> <span>{task.title}</span> */}<label className={`m-0 badge badge-pill badge-${task.priority.toLowerCase() == 'low' ? 'success' : (task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} mr-auto`}>{task.priority.toUpperCase()}</label></p>
                            <p className="w100">
                              {task.auditor_status == "NA" ? "Pending" : task.auditor_status == "not_compliant" ? "Not Compliant" : "Compliant"}
                            </p>
                            <p className="w100"> <a href="" className="statusClr">{task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>
                            <p className="col-auto w85 px-3 min_w_auto">
                              {(() => {
                                if (task.task_owner && task.task_owner.length > 0 && task.task_owner != '-') {
                                  return (
                                    <>
                                      <OverlayTrigger
                                        placement={"top"}
                                        overlay={
                                          <Tooltip id={`tooltip-top`}>
                                            {task.task_owner} ({task.authority})
                                          </Tooltip>
                                        }
                                      >
                                        <span className="air_initials m-0" >
                                          <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(task.task_owner)}</span>
                                        </span>
                                      </OverlayTrigger>

                                    </>
                                  )
                                } else {
                                  return (
                                    <OverlayTrigger
                                      placement={"top"}
                                      overlay={
                                        <Tooltip id={`tooltip-top`}>
                                          Not Assigned
                                        </Tooltip>
                                      }
                                    >
                                      <a href="#" className="user_invalid"><img src="assets/img/user_invalid64.png" alt="" /></a>
                                    </OverlayTrigger>
                                  )

                                }
                              })()}
                              {/* <a href="#" className="active"><img src="/assets/img/user_invalid64.png" alt="" /></a>  */}
                            </p>
                          </div>
                        </div>
                      )
                    }))}
                    {showNoTaskMsg && <div className="d-flex justify-content-center mt-5">{AIR_MSG.no_task_assigned_msg}</div>}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {(() => {
        if (modalType && modalType != '' && modalType != null) {
          if (modalType == 'view_task_details') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={{
                taskDetails,
              }}
              AmSize={'md'}
              AmclassName={(viewType["board"] || viewType["card"]) && taskDetails.task[0].task_status}
              formSubmit={() => { }} />
          }
          if (modalType == 'add_new_task') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              modalData={{ dueDateExpressions, getDueDateExpressions, controlCategories, controlCriterias, controlDomains }}
              hideModal={hideModal}
              formSubmit={addNewTask} />
          }
          if (modalType == 'import_tasks') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              modalData={{}}
              hideModal={hideModal}
              formSubmit={importTasks} />
          }
        }
      })()}


      {(() => {
        if (showAlert && showAlert.show && showAlert.type == "success") {
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

export default MyTasks