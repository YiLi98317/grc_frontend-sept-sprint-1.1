import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie, FormatDate, GetInitials, GetRandomColor, ChangeDateFormat, encryptData } from "../helpers/Helper";
import { useNavigate, useOutletContext } from "react-router-dom";
import Header from "../components/partials/Header";
import { useContext, useEffect, useRef, useState } from "react";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from "moment";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Calendar } from 'react-date-range';
import AirModal from "../elements/AirModal";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import { Button, Overlay, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick
const TestPage2 = (props) => {
  const { user = {} } = useOutletContext()
  const orgId = user?.currentUser?.org_id || 0;
  const { projectId = null } = useContext(LayoutContext)
  const accessRole = user?.currentUser?.access_role || '';
  const [viewType, setViewType] = useState({ board: true, calender: false })
  const [filterType, setfilterType] = useState("due_date")
  const [priority, setPriority] = useState("all")
  const [cardView, setCardViewe] = useState('all')
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [tasksByDates, setTasksByDates] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [inProgresstasks, setInProgressTasks] = useState([]);
  const [underReviewtasks, setUnderReviewTasks] = useState([]);
  const [completedtasks, setCompletedTasks] = useState([]);
  const [timelineDates, settimelineDates] = useState([]);
  const [dates, setDates] = useState({});
  const navigate = useNavigate()
  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [taskDetails, setTaskDetails] = useState({})
  const [viewFile, setViewFile] = useState(null)
  const [fileType, setFileType] = useState(null)
  const [showEventPopup, setShowEventPopup] = useState(false)
  const [eventPopupTarget, setEventPopupTarget] = useState(null)
  const [eventPopupData, setEventPopupData] = useState(null)
  const eventRef = useRef(null);
  // const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const now = new Date()
  const numDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  let stDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  stDate = `${stDate.getFullYear()}-${('00' + stDate.getMonth()).slice(-2)}-${('00' + stDate.getDate()).slice(-2)}`
  // stDate = `${stDate.getFullYear()}-${('0001').slice(-2)}-${('0001').slice(-2)}`
  const startDate = FormatDate(null, stDate, 1)
  let edDate = new Date(now.getFullYear(), now.getMonth() + 1, numDays)
  edDate = `${edDate.getFullYear()}-${('00' + edDate.getMonth()).slice(-2)}-${('00' + edDate.getDate()).slice(-2)}`
  // edDate = `${edDate.getFullYear()}-${('0012').slice(-2)}-${('0031').slice(-2)}`
  const endDate = FormatDate(null, edDate, 1)

  const calendarRef = useRef()
  const keywordRef = useRef()

  useEffect(() => {
    if (projectId != null) {
      fetchInfo("all_tasks")
    }
  }, [projectId]);

  const fetchInfo = async (type = '', project_id = 0, filter_type = null, priority_type = null, view = null) => {
    if (type == '') {
      return false
    };
    let payloadUrl = ""
    let method = "POST";
    let formData = {};
    let currentView = view
    if (view == null) {
      currentView = viewType["board"] ? "board_view" : (viewType["card"] ? "card_view" : (viewType["timeline"] ? "timeline_view" : "calender_view"))
    } else {
      currentView = view == "board" ? "board_view" : (view == "card" ? "card_view" : (view == "timeline" ? "timeline_view" : "calender_view"))
    }
    let sDate = startDate
    let eDate = endDate
    let drPickerEl = document.getElementById('drpicker')
    let dateRange = null
    if (drPickerEl) {
      dateRange = drPickerEl.value;
      dateRange = dateRange ? dateRange : null
    }
    if (dateRange) {
      let drArr = dateRange.replace(/\s/g, '').split('-');
      if (drArr.length > 0) {
        let sDateArr = drArr[0].split('/')
        let eDateArr = drArr[1].split('/')
        if (currentView != "calender_view") {
          sDate = `${sDateArr[2]}-${sDateArr[0]}-${sDateArr[1]}`
          eDate = `${eDateArr[2]}-${eDateArr[0]}-${eDateArr[1]}`
        } else {
          let stDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
          let edDate = new Date(now.getFullYear(), now.getMonth() + 1, numDays)
          sDate = `${stDate.getFullYear()}-${('00' + stDate.getMonth()).slice(-2)}-${('00' + stDate.getDate()).slice(-2)}`;
          eDate = `${edDate.getFullYear()}-${('00' + edDate.getMonth()).slice(-2)}-${('00' + edDate.getDate()).slice(-2)}`;
          // sDate = FormatDate(null, sDate, 1)
          // eDate = FormatDate(null, eDate, 1)
        }

      }
    } else {
      let stDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      let edDate = new Date(now.getFullYear(), now.getMonth() + 1, numDays)
      sDate = `${stDate.getFullYear()}-${('00' + stDate.getMonth()).slice(-2)}-${('00' + stDate.getDate()).slice(-2)}`;
      eDate = `${edDate.getFullYear()}-${('00' + edDate.getMonth()).slice(-2)}-${('00' + edDate.getDate()).slice(-2)}`;
    }
    let filter = filter_type || filterType;
    let priorityType = priority_type || priority

    if (type == 'all_tasks') {
      // https://zp5ffmsibc.us-east-1.awsapprunner.com/tasks/listTasks
      payloadUrl = `tasks/listTasks`
      method = "POST";
      formData = { project_id: projectId || project_id, authority: accessRole, start_date: sDate, end_date: eDate, task_status: "all", date_criteria: filter, priority: priorityType, view: currentView }
    } else {
      // https://zp5ffmsibc.us-east-1.awsapprunner.com/tasks/listTasks
      payloadUrl = `tasks/listTasks/`
      method = "POST";
      formData = { project_id: projectId || project_id, authority: accessRole, start_date: sDate, end_date: eDate, task_status: type, date_criteria: filter, priority: priorityType, view: currentView }
    }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      // if (type == 'all_tasks') {
      let allTasks = res.results;
      let tmpPendingArr = [],
        tmpInProgressArr = [],
        tmpUnderReviewArr = [],
        tmpCompletedArr = [],
        tmpTimelineDates = [],
        tmpTasksByDates = [];
      for (let task of allTasks) {
        task.date = ChangeDateFormat(task.due_date, 2, 3)
        if (task.task_status == "pending") {
          tmpPendingArr.push(task)
        } else if (task.task_status == "in_progress") {
          tmpInProgressArr.push(task)
        } else if (task.task_status == "review") {
          tmpUnderReviewArr.push(task)
        } else if (task.task_status == "completed") {
          tmpCompletedArr.push(task)
        }
        if (!tmpTimelineDates.includes(task.due_date)) {
          tmpTimelineDates.push(task.due_date)
        }

        if (!Object.keys(tmpTasksByDates).includes(task.due_date)) {
          tmpTasksByDates[task.due_date] = []
        }
        tmpTasksByDates[task.due_date].push(task)
      }
      setTasks(oldVal => {
        return [...allTasks]
      })
      setFilteredTasks(oldVal => {
        return [...allTasks]
      })
      setPendingTasks(tmpPendingArr)
      setInProgressTasks(tmpInProgressArr)
      setUnderReviewTasks(tmpUnderReviewArr)
      setCompletedTasks(tmpCompletedArr)
      settimelineDates(tmpTimelineDates)
      setTasksByDates(tmpTasksByDates)
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
    'Previous Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Next Month': [moment().add(1, 'month').startOf('month'), moment().add(1, 'month').endOf('month')],
  }

  const handleSelect = (ranges) => {

    // {
    //   selection: {
    //     startDate: [native Date Object],
    //     endDate: [native Date Object],
    //   }
    // }
  }

  const changeView = (view = "") => {
    if (view == "") {
      return false
    }
    let obj = {}
    obj["board"] = false;
    obj["card"] = false;
    obj["timeline"] = false;
    obj["calender"] = false;
    obj[view] = true;
    setViewType(oldVal => {
      return { ...obj }
    })
    changeFilterType('due_date', view)
    /* if (view == "calender") {
      changeFilterType('due_date',view)
    } else {
      changeFilterType('start_date',view)
    } */
  }
  const changeFilterType = (filter = "", view = null) => {
    if (filter == "") {
      return false
    }
    setfilterType(filter)
    fetchInfo(cardView, projectId, filter, priority, view)
  }
  const changePriority = (priorityType = "", view = null) => {
    if (priorityType == "") {
      return false
    }
    setPriority(priorityType)
    fetchInfo(cardView, projectId, filterType, priorityType, view)
  }
  const changeCardView = (view = "") => {
    if (view == "") {
      return false
    }
    if (view == "all") {
      fetchInfo('all_tasks')
    } else if (view == 'pending') {
      fetchInfo('pending')
    } else if (view == 'inProgress') {
      fetchInfo('in_progress')
    } else if (view == 'review') {
      fetchInfo('review')
    } else if (view == 'completed') {
      fetchInfo('completed')
    }
    setCardViewe(view)
  }


  const getTaskDetails = async (taskId = null) => {
    if (taskId == null) {
      return false
    }
    let payloadUrl = `tasks/getTaskDetails/${taskId}`
    let method = "GET";
    let formData = {};
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      let { task, evidence_needed, applicable_assets } = res
      setTaskDetails(oldVal => {
        let obj = { task: task, evidence_needed: evidence_needed, applicable_assets: applicable_assets }
        return { ...obj }
      })
      showModal('view_task_details')
      // console.log(user)
      // let setcookie = SetCookie('task_details', JSON.stringify({task_id:taskId,user_id:user?.currentUser?.user_id}),null, false)
      // fetchInfo("all_tasks",res.accounts_and_projects[0].project_id)
    }
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
            fileUrl = data.evidence_url
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

    }
  }

  const hideModal = () => {
    if (modalType == "view_task_details") {
      fetchInfo("all_tasks")
    }
    setModalType(null)
    setShowModal(false)
  }

  const renderEventContent = (eventInfo) => {
    let evInfo = Object.assign({ title: eventInfo.event.title }, eventInfo.event.extendedProps)
    let statClass = `${evInfo.priority == 'low' ? 'low' : (evInfo.priority == 'medium' ? 'medium' : 'high')}`
    return (
      <>
        {/* <div className={`fc-event-custom ${statClass} d-flex align-items-center justify-content-between`} onClick={(e) => handleEventClick(e, eventInfo, "open")}> */}
        <div className={`fc-event-custom d-flex ${statClass} align-items-center justify-content-between`}
          onMouseOver={(e) => handleEventClick(e, eventInfo, "open")}
          onMouseOut={(e) => handleEventClick(e, eventInfo, "close")}
          // onClick={() => navigate(`/task-details/${encryptData(evInfo.project_task_id)}`)}>
          onClick={() => goToUrl("task_details", evInfo)}>
          <div className="event_info mw-100 pl-2">
            <span className="event_task_icn mr-1"><img src="/assets/img/work.svg" className="img-fluid" /></span>
            <span className="d-inline-block">{eventInfo.event.title}</span>
          </div>
          <div className="event_owner pr-2">
            {(() => {
              if (evInfo.task_owner && evInfo.task_owner != '-') {
                return (
                  <span className="air_initials m-0" >
                    <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(evInfo.task_owner)}</span>
                  </span>
                )
              } else {
                return (
                  <span className="no_task_owner_box m-0" >
                    <img src="assets/img/user_invalid64.png" alt="" className="img-fluid" />
                  </span>
                )

              }
            })()}
          </div>
        </div>
      </>
    )
  }

  const handleEventClick = (event, eventInfo, type = null) => {
    if (type == null) {
      return false
    }
    let evInfo = Object.assign({ title: eventInfo.event.title }, eventInfo.event.extendedProps)
    if (type == "open") {
      setEventPopupData(evInfo)
      setShowEventPopup(!showEventPopup);
      setEventPopupTarget(event.target);
    } else {
      setEventPopupData(null)
      setShowEventPopup(!showEventPopup);
      setEventPopupTarget(null);

    }


  }

  const handleCalendarNav = async (type = null, ev) => {
    if (type == null) {
      return false
    }
    let calRef = calendarRef.current.getApi()
    let navDate = calRef.getDate()

    let navDays = new Date(navDate.getFullYear(), type == 'prev' ? (navDate.getMonth()) : (navDate.getMonth() + 2), 0).getDate()
    let calStDate = `${navDate.getFullYear()}-${type == 'prev' ? ('00' + navDate.getMonth()).slice(-2) : ('00' + (navDate.getMonth() + 2)).slice(-2)}-01`
    let calEndDate = `${navDate.getFullYear()}-${type == 'prev' ? ('00' + navDate.getMonth()).slice(-2) : ('00' + (navDate.getMonth() + 2)).slice(-2)}-${('00' + navDays).slice(-2)}`
    let payloadUrl = `tasks/listTasks`
    let method = "POST";
    let formData = {}
    let sDate = calStDate
    let eDate = calEndDate
    let filter = filterType;
    let priorityType = priority
    if (filterType == 'all_tasks') {
      formData = { project_id: projectId, authority: accessRole, start_date: sDate, end_date: eDate, task_status: "all", date_criteria: filter, priority: priorityType, view: "calender_view" }
    } else {
      formData = { project_id: projectId, authority: accessRole, start_date: sDate, end_date: eDate, task_status: cardView, date_criteria: filter, priority: priorityType, view: "calender_view" }
    }

    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success" && res.results.length > 0) {
      // if (type == 'all_tasks') {
      let allTasks = res.results;
      let tmpPendingArr = [],
        tmpInProgressArr = [],
        tmpUnderReviewArr = [],
        tmpCompletedArr = [],
        tmpTimelineDates = [],
        tmpTasksByDates = [];
      for (let task of allTasks) {
        task.date = ChangeDateFormat(task.due_date, 2, 3)
        if (task.task_status == "pending") {
          tmpPendingArr.push(task)
        } else if (task.task_status == "in_progress") {
          tmpInProgressArr.push(task)
        } else if (task.task_status == "review") {
          tmpUnderReviewArr.push(task)
        } else if (task.task_status == "completed") {
          tmpCompletedArr.push(task)
        }
        if (!tmpTimelineDates.includes(task.due_date)) {
          tmpTimelineDates.push(task.due_date)
        }

        if (!Object.keys(tmpTasksByDates).includes(task.due_date)) {
          tmpTasksByDates[task.due_date] = []
        }
        tmpTasksByDates[task.due_date].push(task)
      }
      setTasks(oldVal => {
        return [...allTasks]
      })
      setFilteredTasks(oldVal => {
        return [...allTasks]
      })
      setPendingTasks(tmpPendingArr)
      setInProgressTasks(tmpInProgressArr)
      setUnderReviewTasks(tmpUnderReviewArr)
      setCompletedTasks(tmpCompletedArr)
      settimelineDates(tmpTimelineDates)
      setTasksByDates(tmpTasksByDates)
    }

    if (type == 'prev') {
      calRef.prev();
    } else {
      calRef.next();
    }
  }

  const searchTaskByKeyword = async () => {
    let keyword = keywordRef.current.value
    keyword = keyword && keyword.replace(/ /g, '').length > 0 ? keyword : null;
    if (!keyword || keyword.length == 0 || keyword == null) {
      setFilteredTasks(oldVal => {
        return [...tasks]
      })
      return false
    }
    let tempTaskArr = []
    let tmpPendingArr = [],
      tmpInProgressArr = [],
      tmpUnderReviewArr = [],
      tmpCompletedArr = [],
      tmpTimelineDates = [],
      tmpTasksByDates = [];
    for (let task of tasks) {
      let title = task.title ? (task.title).toLowerCase() : '';
      let description = task.description ? (task.description).toLowerCase() : '';
      let task_owner = task.task_owner ? (task.task_owner).toLowerCase() : '';
      let project_task_id = task.project_task_id ? (task.project_task_id).toString().toLowerCase() : '';
      if ((title).indexOf(keyword.toLowerCase()) != -1 ||
        (description).indexOf(keyword.toLowerCase()) != -1 ||
        (task_owner).indexOf(keyword.toLowerCase()) != -1 ||
        (project_task_id).indexOf(keyword.toLowerCase()) != -1
      ) {
        tempTaskArr.push(task)

        if (task.task_status == "pending") {
          tmpPendingArr.push(task)
        } else if (task.task_status == "in_progress") {
          tmpInProgressArr.push(task)
        } else if (task.task_status == "review") {
          tmpUnderReviewArr.push(task)
        } else if (task.task_status == "completed") {
          tmpCompletedArr.push(task)
        }
        if (!tmpTimelineDates.includes(task.due_date)) {
          tmpTimelineDates.push(task.due_date)
        }

        if (!Object.keys(tmpTasksByDates).includes(task.due_date)) {
          tmpTasksByDates[task.due_date] = []
        }
        tmpTasksByDates[task.due_date].push(task)
      }
    }
    setFilteredTasks(oldVal => {
      return [...tempTaskArr]
    })

    setPendingTasks(tmpPendingArr)
    setInProgressTasks(tmpInProgressArr)
    setUnderReviewTasks(tmpUnderReviewArr)
    setCompletedTasks(tmpCompletedArr)
    settimelineDates(tmpTimelineDates)
    setTasksByDates(tmpTasksByDates)
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


  const popover = (
    <Popover id="popover-calendar">
      {/* <Popover.Header as="h3">Popover right</Popover.Header> */}
      <Popover.Body>
        {(() => {
          if (eventPopupData) {
            return (
              <>
                <div id="calendar-popup">
                  <div id="event" className="taskDetailmodal">
                    <div className="px-2 mb-1 d-flex align-items-start flex-column">
                      <h4 className="mb-1">{eventPopupData.description}</h4>
                      <a href="" className={`stSbar stSbar_${eventPopupData.task_status == 'pending' ? 'todo' : (eventPopupData.task_status == 'in_progress' ? 'in_progress' : (eventPopupData.task_status == 'under_review' ? 'review' : 'completed'))} d-inline-block`}>{eventPopupData.task_status == 'pending' ? 'Todo' : (eventPopupData.task_status == 'in_progress' ? 'In Progress' : (eventPopupData.task_status == 'under_review' ? 'Under Review' : 'Completed'))}</a>
                    </div>

                    <div className="d-flex justify-content-between px-2 align-items-center">
                      <div className="d-flex align-items-start flex-column">
                        <div className="d-flex align-items-center tskname mb-1">
                          <img src="assets/img/gbl.gif" alt="folder" className="mr-1" />
                          <span className="">{eventPopupData.title}</span>
                        </div>

                        {/* <span>{eventPopupData.project_task_id}</span> */}
                        <span>{filterStr(eventPopupData.project_task_id, "v_", "")}</span>
                      </div>
                      <div>

                        {(() => {

                          if (eventPopupData.task_owner && eventPopupData.task_owner != '-') {
                            return (
                              <span className="air_initials m-0" >
                                <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(eventPopupData.task_owner)}</span>
                              </span>
                            )
                          } else {
                            return (
                              <span className="no_task_owner_box m-0" >
                                <img src="/assets/img/user_invalid64.png" className="img-fluid" alt="no user img" height="30" width="30" />
                              </span>
                            )

                          }
                        })()}

                      </div>

                    </div>
                  </div>

                </div>
              </>
            )
          }
        })()}

      </Popover.Body>
    </Popover>
  );

  const getItemStyle = (isDragging, draggableStyle) => ({
    background: isDragging ? "#fff7e5" : "",
    ...draggableStyle
  });

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    // dropped outside the list
    if (!destination) {
      return;
    }
    const sId = source.droppableId;
    const dId = destination.droppableId;
    const draggableIdArray = draggableId.split("__");

    if (sId !== dId) {
      let allTasks = tasks;
      let taskDetailIndex = allTasks.findIndex(e => e.project_task_id.toString() == draggableIdArray[0]);
      allTasks[taskDetailIndex]["task_status"] = dId;

      let tmpPendingArr = [],
        tmpInProgressArr = [],
        tmpUnderReviewArr = [],
        tmpCompletedArr = [],
        tmpTimelineDates = [],
        tmpTasksByDates = [];
      for (let task of allTasks) {
        task.date = ChangeDateFormat(task.due_date, 2, 3)
        if (task.task_status == "pending") {
          tmpPendingArr.push(task)
        } else if (task.task_status == "in_progress") {
          tmpInProgressArr.push(task)
        } else if (task.task_status == "review") {
          tmpUnderReviewArr.push(task)
        } else if (task.task_status == "completed") {
          tmpCompletedArr.push(task)
        }
        if (!tmpTimelineDates.includes(task.due_date)) {
          tmpTimelineDates.push(task.due_date)
        }

        if (!Object.keys(tmpTasksByDates).includes(task.due_date)) {
          tmpTasksByDates[task.due_date] = []
        }
        tmpTasksByDates[task.due_date].push(task)
      }
      setTasks(oldVal => {
        return [...allTasks]
      })
      setFilteredTasks(oldVal => {
        return [...allTasks]
      })

      if (dId == "pending") {
        let taskSourceIndex = tmpPendingArr.findIndex(e => e.project_task_id.toString() == draggableIdArray[0]);
        tmpPendingArr = taskReorder(tmpPendingArr, taskSourceIndex, destination.index)
      } else if (dId == "in_progress") {
        let taskSourceIndex = tmpInProgressArr.findIndex(e => e.project_task_id.toString() == draggableIdArray[0]);
        tmpInProgressArr = taskReorder(tmpInProgressArr, taskSourceIndex, destination.index)
      } else if (dId == "review") {
        let taskSourceIndex = tmpUnderReviewArr.findIndex(e => e.project_task_id.toString() == draggableIdArray[0]);
        tmpUnderReviewArr = taskReorder(tmpUnderReviewArr, taskSourceIndex, destination.index)
      } else if (dId == "completed") {
        let taskSourceIndex = tmpCompletedArr.findIndex(e => e.project_task_id.toString() == draggableIdArray[0]);
        tmpCompletedArr = taskReorder(tmpCompletedArr, taskSourceIndex, destination.index)
      }

      setPendingTasks(tmpPendingArr)
      setInProgressTasks(tmpInProgressArr)
      setUnderReviewTasks(tmpUnderReviewArr)
      setCompletedTasks(tmpCompletedArr)
      settimelineDates(tmpTimelineDates)
      setTasksByDates(tmpTasksByDates)
      let payloadUrl = `tasks/updateTaskDetails/${draggableIdArray[0]}`
      let method = "POST";
      let formData = { task_status: dId }
      let res = await ApiService.fetchData(payloadUrl, method, formData);

      if (res?.status_code == "air200") {
        // Check response
      }
    } else {
      if (sId == "pending") {
        let data = [...pendingTasks];
        const result = taskReorder(data, source.index, destination.index)
        setPendingTasks(result)
      } else if (sId == "in_progress") {
        let data = [...inProgresstasks];
        const result = taskReorder(data, source.index, destination.index)
        setInProgressTasks(result)
      } else if (sId == "review") {
        let data = [...underReviewtasks];
        const result = taskReorder(data, source.index, destination.index)
        setUnderReviewTasks(result)
      } else if (sId == "completed") {
        let data = [...completedtasks];
        const result = taskReorder(data, source.index, destination.index)
        setCompletedTasks(result)
      }
    }
  }

  const taskReorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  return (
    <>
      <Header />
      <div id="task_manager_sec" className="container-fluid">
        <div className="row">
          <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
            <div className="mainSearchbar">
              <div className="flex-grow-1">
                {(() => {
                  if (!viewType['calender']) {
                    return (
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text bg-transparent border-0 srchInput"><img src="assets/img/gbl.gif" alt="" /></span>
                        </div>
                        <input type="text" name="" placeholder="Search task name, project name, Task ID, username…" className="form-control border-0 pl-0" ref={keywordRef} onChangeCapture={() => searchTaskByKeyword()} />
                      </div>
                    )
                  }
                })()}
              </div>
              {(() => {
                if (accessRole != 'auditor') {
                  return (
                    <div>
                      <div className="userProfile">
                        <div className="dropdown fdrp">
                          <button type="button" className="btn btn-primary dropdown-toggle viewMenu" data-toggle="dropdown">
                            {priority && (priority == 'all' ? `Priority (${priority.toUpperCase()})` : priority.toUpperCase())}
                          </button>
                          <div className="dropdown-menu mt-1">
                            <a className={`dropdown-item ${priority == "all" ? "d-none" : ""} link_url`} onClick={() => changePriority("all")}>Priority (All) </a>
                            <a className={`dropdown-item ${priority == "low" ? "d-none" : ""} link_url`} onClick={() => changePriority("low")}>Low</a>
                            <a className={`dropdown-item ${priority == "medium" ? "d-none" : ""} link_url`} onClick={() => changePriority("medium")}>Medium</a>
                            <a className={`dropdown-item ${priority == "high" ? "d-none" : ""} link_url`} onClick={() => changePriority("high")}>High</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
              })()}

              {(() => {
                if (!viewType["calender"] && accessRole != 'auditor') {
                  return (
                    <div>
                      <div className="userProfile">
                        <div className="dropdown fdrp">
                          <button type="button" className="btn btn-primary dropdown-toggle viewMenu" data-toggle="dropdown">
                            {(() => {
                              if (filterType == "start_date") {
                                return "Start Date"
                              } else if (filterType == "due_date") {
                                return "Due Date"
                              }
                            })()}
                          </button>
                          <div className="dropdown-menu mt-1">
                            <a className={`dropdown-item ${filterType == "start_date" ? "d-none" : ""} link_url`} onClick={() => changeFilterType("start_date")}>Start Date</a>
                            <a className={`dropdown-item ${filterType == "due_date" ? "d-none" : ""} link_url`} onClick={() => changeFilterType("due_date")}>Due Date</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
              })()}
              {(() => {
                if (!viewType["calender"] && accessRole != 'auditor') {
                  return (
                    <div className="Position-relative drpicker_block">
                      <DateRangePicker
                        initialSettings={{ startDate: startDate, endDate: endDate, ranges: selectionRange, showCustomRangeLabel: false }}
                        onApply={() => fetchInfo(cardView)}
                      >
                        <input id="drpicker" type="text" className="form-control border-0" name="date" placeholder="Select Date" />
                      </DateRangePicker>


                      <i className="fa fa-calendar link_url" onClick={() => { document.getElementById("drpicker").click() }}></i>
                    </div>
                  )
                }
              })()}

              {(() => {
                if (accessRole != 'auditor') {
                  return (
                    <div>
                      <div className="userProfile">
                        <div className="dropdown fdrp">
                          <button type="button" className="btn btn-primary dropdown-toggle viewMenu" data-toggle="dropdown">
                            {(() => {
                              if (viewType["board"]) {
                                return "Board View"
                              } else if (viewType["card"]) {
                                return "Card View"
                              } else if (viewType["timeline"]) {
                                return "Timeline View"
                              } else if (viewType["calender"]) {
                                return "Calender View"
                              }
                            })()}
                          </button>
                          <div className="dropdown-menu mt-1">
                            <a className={`dropdown-item ${viewType == "board" ? "d-none" : ""} link_url`} onClick={() => changeView("board")}>Board View</a>
                            <a className={`dropdown-item ${viewType == "card" ? "d-none" : ""} link_url`} onClick={() => changeView("card")}>Card View</a>
                            <a className={`dropdown-item ${viewType == "timeline" ? "d-none" : ""} link_url`} onClick={() => changeView("timeline")}>Timeline View</a>
                            <a className={`dropdown-item ${viewType == "calender" ? "d-none" : ""} link_url`} onClick={() => changeView("calender")}>Calender View</a>
                          </div>
                        </div>
                      </div>


                    </div>
                  )
                }
              })()}

              <div className="dotMenu">
                {/* <img src="assets/img/gbl.gif" alt="" /> */}
              </div>


            </div>
            {(() => {
              if (accessRole != 'auditor') {
                if (viewType["board"]) {
                  return (
                    <>
                      <div className="gridcontainer">
                        <DragDropContext onDragEnd={onDragEnd}>
                          <div className="grid_item">
                            <div className="card">
                              <div className="card-header">
                                {/* <h4>To DO ({pendingTasks && pendingTasks.length > 0 ? pendingTasks.length : 0})</h4> */}
                                <h4>
                                  <span className="badge badge-danger">
                                    To DO (
                                    {pendingTasks && pendingTasks.length > 0
                                      ? pendingTasks.length
                                      : 0}
                                    )
                                  </span>{" "}
                                </h4>
                              </div>
                              <Droppable key="pending" droppableId="pending">
                                {(provided, snapshot) => (
                                  <div
                                    className="card-body"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                  >
                                    {pendingTasks &&
                                      pendingTasks.length > 0 &&
                                      pendingTasks.map((p_task, pIndex) => {
                                        return (
                                          <Draggable
                                            key={`${p_task.project_task_id}_${pIndex}`}
                                            draggableId={`${p_task.project_task_id.toString()}__${pIndex}`}
                                            index={pIndex}
                                          >
                                            {(provided, snapshot) => (
                                              <div
                                                className="gridBox"
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(
                                                  snapshot.isDragging,
                                                  provided.draggableProps.style
                                                )}
                                              >
                                                {/* <div className="gridboxbody link_url" onClick={() => navigate(`/task-details/${encryptData(p_task.project_task_id)}`)}> */}
                                                <div
                                                  className="gridboxbody link_url"
                                                  onClick={() =>
                                                    goToUrl(
                                                      "task_details",
                                                      p_task
                                                    )
                                                  }
                                                >
                                                  <h4 className="d-flex">
                                                    {p_task.title}
                                                  </h4>
                                                  <p>
                                                    <img
                                                      src="assets/img/gbl.gif"
                                                      alt="folder"
                                                    />
                                                    <span>
                                                      {p_task.description}
                                                    </span>
                                                    <label
                                                      className={`m-0 badge badge-pill badge-${p_task.priority.toLowerCase() ==
                                                          "low"
                                                          ? "success"
                                                          : p_task.priority.toLowerCase() ==
                                                            "medium"
                                                            ? "warning"
                                                            : "danger"
                                                        } ml-auto`}
                                                    >
                                                      {p_task.priority.toUpperCase()}
                                                    </label>
                                                  </p>
                                                  <p>
                                                    <img
                                                      src="assets/img/gbl.gif"
                                                      alt="date"
                                                    />
                                                    <span>
                                                      Created{" "}
                                                      {p_task.created_at}
                                                    </span>{" "}
                                                  </p>
                                                  <p>
                                                    <img
                                                      src="assets/img/gbl.gif"
                                                      alt="date"
                                                    />
                                                    <span
                                                      className={`${p_task.highlight_due_date ==
                                                          "Y"
                                                          ? "text-danger font-weight-bold"
                                                          : ""
                                                        }`}
                                                    >
                                                      Due Date {p_task.due_date}
                                                    </span>{" "}
                                                  </p>
                                                  {(() => {
                                                    if (
                                                      p_task.auditor_status !=
                                                      "NA"
                                                    ) {
                                                      return (
                                                        <p>
                                                          <i
                                                            className="fa fa-tasks"
                                                            aria-hidden="true"
                                                          ></i>
                                                          <span>
                                                            Compliant Status
                                                            {p_task.auditor_status &&
                                                              p_task.auditor_status ==
                                                              "compliant" ? (
                                                              <i
                                                                className="fa fa-check text-success ml-2 fs-17"
                                                                aria-hidden="true"
                                                              ></i>
                                                            ) : (
                                                              <i
                                                                className="fa fa-times text-danger ml-2 fs-17"
                                                                aria-hidden="true"
                                                              ></i>
                                                            )}
                                                          </span>
                                                        </p>
                                                      );
                                                    }
                                                  })()}
                                                </div>
                                                <div className="gridboxfooter">
                                                  <OverlayTrigger
                                                    placement={"top"}
                                                    overlay={
                                                      <Tooltip
                                                        id={`tooltip-top`}
                                                      >
                                                        Quick View
                                                      </Tooltip>
                                                    }
                                                  >
                                                    {/* <p className="link_url " onClick={() => getTaskDetails(p_task.project_task_id)}>{p_task.project_task_id} <i className="pl-2 fa fa-eye"></i></p> */}
                                                    <p
                                                      className="link_url "
                                                      onClick={() =>
                                                        getTaskDetails(
                                                          p_task.project_task_id
                                                        )
                                                      }
                                                    >
                                                      {filterStr(
                                                        p_task.project_task_id,
                                                        "v_",
                                                        ""
                                                      )}{" "}
                                                      <i className="pl-2 fa fa-eye"></i>
                                                    </p>
                                                  </OverlayTrigger>

                                                  {(() => {
                                                    if (
                                                      p_task.task_owner &&
                                                      p_task.task_owner.length >
                                                      0 &&
                                                      p_task.task_owner != "-"
                                                    ) {
                                                      return (
                                                        <>
                                                          <OverlayTrigger
                                                            placement={"top"}
                                                            overlay={
                                                              <Tooltip
                                                                id={`tooltip-top`}
                                                              >
                                                                {
                                                                  p_task.task_owner
                                                                }{" "}
                                                                (
                                                                {
                                                                  p_task.authority
                                                                }
                                                                )
                                                              </Tooltip>
                                                            }
                                                          >
                                                            <span className="air_initials m-0">
                                                              <span
                                                                className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center"
                                                                style={{
                                                                  background:
                                                                    GetRandomColor(),
                                                                }}
                                                              >
                                                                {GetInitials(
                                                                  p_task.task_owner
                                                                )}
                                                              </span>
                                                            </span>
                                                          </OverlayTrigger>
                                                        </>
                                                      );
                                                    } else {
                                                      return (
                                                        <OverlayTrigger
                                                          placement={"top"}
                                                          overlay={
                                                            <Tooltip
                                                              id={`tooltip-top`}
                                                            >
                                                              Not Assigned
                                                            </Tooltip>
                                                          }
                                                        >
                                                          <a
                                                            href="#"
                                                            className="user_invalid"
                                                          >
                                                            <img
                                                              src="/assets/img/user_invalid64.png"
                                                              alt=""
                                                            />
                                                          </a>
                                                        </OverlayTrigger>
                                                      );
                                                    }
                                                  })()}
                                                  {/* <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a> */}
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        );
                                      })}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                          <div className="grid_item">
                            <div className="card">
                              <div className="card-header">
                                {/* <h4>In Progress ({inProgresstasks && inProgresstasks.length > 0 ? inProgresstasks.length : 0})</h4> */}
                                <h4>
                                  <span className="badge badge-warning">
                                    In Progress (
                                    {inProgresstasks &&
                                      inProgresstasks.length > 0
                                      ? inProgresstasks.length
                                      : 0}
                                    )
                                  </span>{" "}
                                </h4>
                              </div>
                              <Droppable
                                key="in_progress"
                                droppableId="in_progress"
                              >
                                {(provided, snapshot) => (
                                  <div
                                    className="card-body"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                  >
                                    {inProgresstasks &&
                                      inProgresstasks.length > 0 &&
                                      inProgresstasks.map((ip_task, pIndex) => {
                                        return (
                                          <Draggable
                                            key={`${ip_task.project_task_id}_${pIndex}`}
                                            draggableId={`${ip_task.project_task_id.toString()}__${pIndex}`}
                                            index={pIndex}
                                          >
                                            {(provided, snapshot) => (
                                              <div
                                                className="gridBox"
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(
                                                  snapshot.isDragging,
                                                  provided.draggableProps.style
                                                )}
                                              >
                                                {/* <div className="gridboxbody link_url" onClick={() => navigate(`/task-details/${encryptData(ip_task.project_task_id)}`)}> */}
                                                <div
                                                  className="gridboxbody link_url"
                                                  onClick={() =>
                                                    goToUrl(
                                                      "task_details",
                                                      ip_task
                                                    )
                                                  }
                                                >
                                                  <h4>{ip_task.title}</h4>
                                                  <p>
                                                    <img
                                                      src="assets/img/gbl.gif"
                                                      alt="folder"
                                                    />
                                                    <span>
                                                      {ip_task.description}
                                                    </span>
                                                    <label
                                                      className={`m-0 badge badge-pill badge-${ip_task.priority.toLowerCase() ==
                                                          "low"
                                                          ? "success"
                                                          : ip_task.priority.toLowerCase() ==
                                                            "medium"
                                                            ? "warning"
                                                            : "danger"
                                                        } ml-auto`}
                                                    >
                                                      {ip_task.priority.toUpperCase()}
                                                    </label>
                                                  </p>
                                                  <p>
                                                    <img
                                                      src="assets/img/gbl.gif"
                                                      alt="date"
                                                    />
                                                    <span>
                                                      Created{" "}
                                                      {ip_task.created_at}
                                                    </span>{" "}
                                                  </p>
                                                  <p>
                                                    <img
                                                      src="assets/img/gbl.gif"
                                                      alt="date"
                                                    />
                                                    <span
                                                      className={`${ip_task.highlight_due_date ==
                                                          "Y"
                                                          ? "text-danger font-weight-bold"
                                                          : ""
                                                        }`}
                                                    >
                                                      Due Date{" "}
                                                      {ip_task.due_date}
                                                    </span>{" "}
                                                  </p>
                                                  {(() => {
                                                    if (
                                                      ip_task.auditor_status !=
                                                      "NA"
                                                    ) {
                                                      return (
                                                        <p>
                                                          <i
                                                            className="fa fa-tasks"
                                                            aria-hidden="true"
                                                          ></i>
                                                          <span>
                                                            Compliant Status
                                                            {ip_task.auditor_status &&
                                                              ip_task.auditor_status ==
                                                              "compliant" ? (
                                                              <i
                                                                className="fa fa-check text-success ml-2 fs-17"
                                                                aria-hidden="true"
                                                              ></i>
                                                            ) : (
                                                              <i
                                                                className="fa fa-times text-danger ml-2 fs-17"
                                                                aria-hidden="true"
                                                              ></i>
                                                            )}
                                                          </span>
                                                        </p>
                                                      );
                                                    }
                                                  })()}
                                                </div>
                                                <div className="gridboxfooter">
                                                  <OverlayTrigger
                                                    placement={"top"}
                                                    overlay={
                                                      <Tooltip
                                                        id={`tooltip-top`}
                                                      >
                                                        Quick View
                                                      </Tooltip>
                                                    }
                                                  >
                                                    {/* <p className="link_url " onClick={() => getTaskDetails(ip_task.project_task_id)}>{ip_task.project_task_id} <i className="pl-2 fa fa-eye"></i></p> */}
                                                    <p
                                                      className="link_url "
                                                      onClick={() =>
                                                        getTaskDetails(
                                                          ip_task.project_task_id
                                                        )
                                                      }
                                                    >
                                                      {filterStr(
                                                        ip_task.project_task_id,
                                                        "v_",
                                                        ""
                                                      )}{" "}
                                                      <i className="pl-2 fa fa-eye"></i>
                                                    </p>
                                                  </OverlayTrigger>

                                                  {(() => {
                                                    if (
                                                      ip_task.task_owner &&
                                                      ip_task.task_owner
                                                        .length > 0 &&
                                                      ip_task.task_owner != "-"
                                                    ) {
                                                      return (
                                                        <>
                                                          <OverlayTrigger
                                                            placement={"top"}
                                                            overlay={
                                                              <Tooltip
                                                                id={`tooltip-top`}
                                                              >
                                                                {
                                                                  ip_task.task_owner
                                                                }{" "}
                                                                (
                                                                {
                                                                  ip_task.authority
                                                                }
                                                                )
                                                              </Tooltip>
                                                            }
                                                          >
                                                            <span className="air_initials m-0">
                                                              <span
                                                                className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center"
                                                                style={{
                                                                  background:
                                                                    GetRandomColor(),
                                                                }}
                                                              >
                                                                {GetInitials(
                                                                  ip_task.task_owner
                                                                )}
                                                              </span>
                                                            </span>
                                                          </OverlayTrigger>
                                                        </>
                                                      );
                                                    } else {
                                                      return (
                                                        <OverlayTrigger
                                                          placement={"top"}
                                                          overlay={
                                                            <Tooltip
                                                              id={`tooltip-top`}
                                                            >
                                                              Not Assigned
                                                            </Tooltip>
                                                          }
                                                        >
                                                          <a
                                                            href="#"
                                                            className="user_invalid"
                                                          >
                                                            <img
                                                              src="/assets/img/user_invalid64.png"
                                                              alt=""
                                                            />
                                                          </a>
                                                        </OverlayTrigger>
                                                      );
                                                    }
                                                  })()}
                                                  {/* <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a> */}
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        );
                                      })}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                          <div className="grid_item">
                            <div className="card">
                              <div className="card-header">
                                {/* <h4>Under Review ({underReviewtasks && underReviewtasks.length > 0 ? underReviewtasks.length : 0})</h4> */}
                                <h4>
                                  <span className="badge badge-primary">
                                    Under Review (
                                    {underReviewtasks &&
                                      underReviewtasks.length > 0
                                      ? underReviewtasks.length
                                      : 0}
                                    )
                                  </span>{" "}
                                </h4>
                              </div>
                              <Droppable key="review" droppableId="review">
                                {(provided, snapshot) => (
                                  <div
                                    className="card-body"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                  >
                                    {underReviewtasks &&
                                      underReviewtasks.length > 0 &&
                                      underReviewtasks.map(
                                        (ur_task, pIndex) => {
                                          return (
                                            <Draggable
                                              key={`${ur_task.project_task_id}_${pIndex}`}
                                              draggableId={`${ur_task.project_task_id.toString()}__${pIndex}`}
                                              index={pIndex}
                                            >
                                              {(provided, snapshot) => (
                                                <div
                                                  className="gridBox"
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  style={getItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps
                                                      .style
                                                  )}
                                                >
                                                  {/* <div className="gridboxbody link_url" onClick={() => navigate(`/task-details/${encryptData(ur_task.project_task_id)}`)}> */}
                                                  <div
                                                    className="gridboxbody link_url"
                                                    onClick={() =>
                                                      goToUrl(
                                                        "task_details",
                                                        ur_task
                                                      )
                                                    }
                                                  >
                                                    <h4>{ur_task.title}</h4>
                                                    <p>
                                                      <img
                                                        src="assets/img/gbl.gif"
                                                        alt="folder"
                                                      />
                                                      <span>
                                                        {ur_task.description}
                                                      </span>
                                                      <label
                                                        className={`m-0 badge badge-pill badge-${ur_task.priority.toLowerCase() ==
                                                            "low"
                                                            ? "success"
                                                            : ur_task.priority.toLowerCase() ==
                                                              "medium"
                                                              ? "warning"
                                                              : "danger"
                                                          } ml-auto`}
                                                      >
                                                        {ur_task.priority.toUpperCase()}
                                                      </label>
                                                    </p>
                                                    <p>
                                                      <img
                                                        src="assets/img/gbl.gif"
                                                        alt="date"
                                                      />
                                                      <span>
                                                        Created{" "}
                                                        {ur_task.created_at}
                                                      </span>{" "}
                                                    </p>
                                                    <p>
                                                      <img
                                                        src="assets/img/gbl.gif"
                                                        alt="date"
                                                      />
                                                      <span
                                                        className={`${ur_task.highlight_due_date ==
                                                            "Y"
                                                            ? "text-danger font-weight-bold"
                                                            : ""
                                                          }`}
                                                      >
                                                        Due Date{" "}
                                                        {ur_task.due_date}
                                                      </span>{" "}
                                                    </p>
                                                    {(() => {
                                                      if (
                                                        ur_task.auditor_status !=
                                                        "NA"
                                                      ) {
                                                        return (
                                                          <p>
                                                            <i
                                                              className="fa fa-tasks"
                                                              aria-hidden="true"
                                                            ></i>
                                                            <span>
                                                              Compliant Status
                                                              {ur_task.auditor_status &&
                                                                ur_task.auditor_status ==
                                                                "compliant" ? (
                                                                <i
                                                                  className="fa fa-check text-success ml-2 fs-17"
                                                                  aria-hidden="true"
                                                                ></i>
                                                              ) : (
                                                                <i
                                                                  className="fa fa-times text-danger ml-2 fs-17"
                                                                  aria-hidden="true"
                                                                ></i>
                                                              )}
                                                            </span>
                                                          </p>
                                                        );
                                                      }
                                                    })()}
                                                  </div>
                                                  <div className="gridboxfooter">
                                                    <OverlayTrigger
                                                      placement={"top"}
                                                      overlay={
                                                        <Tooltip
                                                          id={`tooltip-top`}
                                                        >
                                                          Quick View
                                                        </Tooltip>
                                                      }
                                                    >
                                                      {/* <p className="link_url " onClick={() => getTaskDetails(ur_task.project_task_id)}>{ur_task.project_task_id} <i className="pl-2 fa fa-eye"></i></p> */}
                                                      <p
                                                        className="link_url "
                                                        onClick={() =>
                                                          getTaskDetails(
                                                            ur_task.project_task_id
                                                          )
                                                        }
                                                      >
                                                        {filterStr(
                                                          ur_task.project_task_id,
                                                          "v_",
                                                          ""
                                                        )}{" "}
                                                        <i className="pl-2 fa fa-eye"></i>
                                                      </p>
                                                    </OverlayTrigger>
                                                    {(() => {
                                                      if (
                                                        ur_task.task_owner &&
                                                        ur_task.task_owner
                                                          .length > 0 &&
                                                        ur_task.task_owner !=
                                                        "-"
                                                      ) {
                                                        return (
                                                          <>
                                                            <OverlayTrigger
                                                              placement={"top"}
                                                              overlay={
                                                                <Tooltip
                                                                  id={`tooltip-top`}
                                                                >
                                                                  {
                                                                    ur_task.task_owner
                                                                  }{" "}
                                                                  (
                                                                  {
                                                                    ur_task.authority
                                                                  }
                                                                  )
                                                                </Tooltip>
                                                              }
                                                            >
                                                              <span className="air_initials m-0">
                                                                <span
                                                                  className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center"
                                                                  style={{
                                                                    background:
                                                                      GetRandomColor(),
                                                                  }}
                                                                >
                                                                  {GetInitials(
                                                                    ur_task.task_owner
                                                                  )}
                                                                </span>
                                                              </span>
                                                            </OverlayTrigger>
                                                          </>
                                                        );
                                                      } else {
                                                        return (
                                                          <OverlayTrigger
                                                            placement={"top"}
                                                            overlay={
                                                              <Tooltip
                                                                id={`tooltip-top`}
                                                              >
                                                                Not Assigned
                                                              </Tooltip>
                                                            }
                                                          >
                                                            <a
                                                              href="#"
                                                              className="user_invalid"
                                                            >
                                                              <img
                                                                src="/assets/img/user_invalid64.png"
                                                                alt=""
                                                              />
                                                            </a>
                                                          </OverlayTrigger>
                                                        );
                                                      }
                                                    })()}
                                                    {/* <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a> */}
                                                  </div>
                                                </div>
                                              )}
                                            </Draggable>
                                          );
                                        }
                                      )}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                          <div className="grid_item">
                            <div className="card">
                              <div className="card-header">
                                {/* <h4>Completed ({completedtasks && completedtasks.length > 0 ? completedtasks.length : 0})</h4> */}
                                <h4>
                                  <span className="badge badge-success">
                                    Completed (
                                    {completedtasks && completedtasks.length > 0
                                      ? completedtasks.length
                                      : 0}
                                    )
                                  </span>{" "}
                                </h4>
                              </div>
                              <Droppable
                                key="completed"
                                droppableId="completed"
                              >
                                {(provided, snapshot) => (
                                  <div
                                    className="card-body"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                  >
                                    {completedtasks &&
                                      completedtasks.length > 0 &&
                                      completedtasks.map((c_task, pIndex) => {
                                        return (
                                          <Draggable
                                            key={`${c_task.project_task_id}_${pIndex}`}
                                            draggableId={`${c_task.project_task_id.toString()}__${pIndex}`}
                                            index={pIndex}
                                          >
                                            {(provided, snapshot) => (
                                              <div
                                                className="gridBox"
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(
                                                  snapshot.isDragging,
                                                  provided.draggableProps.style
                                                )}
                                              >
                                                {/* <div className="gridboxbody link_url" onClick={() => navigate(`/task-details/${encryptData(c_task.project_task_id)}`)}> */}
                                                <div
                                                  className="gridboxbody link_url"
                                                  onClick={() =>
                                                    goToUrl(
                                                      "task_details",
                                                      c_task
                                                    )
                                                  }
                                                >
                                                  <h4>{c_task.title}</h4>
                                                  <p>
                                                    <img
                                                      src="assets/img/gbl.gif"
                                                      alt="folder"
                                                    />
                                                    <span>
                                                      {c_task.description}
                                                    </span>
                                                    <label
                                                      className={`m-0 badge badge-pill badge-${c_task.priority.toLowerCase() ==
                                                          "low"
                                                          ? "success"
                                                          : c_task.priority.toLowerCase() ==
                                                            "medium"
                                                            ? "warning"
                                                            : "danger"
                                                        } ml-auto`}
                                                    >
                                                      {c_task.priority.toUpperCase()}
                                                    </label>
                                                  </p>
                                                  <p>
                                                    <img
                                                      src="assets/img/gbl.gif"
                                                      alt="date"
                                                    />
                                                    <span>
                                                      Created{" "}
                                                      {c_task.created_at}
                                                    </span>{" "}
                                                  </p>
                                                  <p>
                                                    <img
                                                      src="assets/img/gbl.gif"
                                                      alt="date"
                                                    />
                                                    <span
                                                      className={`${c_task.highlight_due_date ==
                                                          "Y"
                                                          ? "text-danger font-weight-bold"
                                                          : ""
                                                        }`}
                                                    >
                                                      Due Date {c_task.due_date}
                                                    </span>{" "}
                                                  </p>
                                                  {(() => {
                                                    if (
                                                      c_task.auditor_status !=
                                                      "NA"
                                                    ) {
                                                      return (
                                                        <p>
                                                          <i
                                                            className="fa fa-tasks"
                                                            aria-hidden="true"
                                                          ></i>
                                                          <span>
                                                            Compliant Status
                                                            {c_task.auditor_status &&
                                                              c_task.auditor_status ==
                                                              "compliant" ? (
                                                              <i
                                                                className="fa fa-check text-success ml-2 fs-17"
                                                                aria-hidden="true"
                                                              ></i>
                                                            ) : (
                                                              <i
                                                                className="fa fa-times text-danger ml-2 fs-17"
                                                                aria-hidden="true"
                                                              ></i>
                                                            )}
                                                          </span>
                                                        </p>
                                                      );
                                                    }
                                                  })()}
                                                </div>
                                                <div className="gridboxfooter">
                                                  <OverlayTrigger
                                                    placement={"top"}
                                                    overlay={
                                                      <Tooltip
                                                        id={`tooltip-top`}
                                                      >
                                                        Quick View
                                                      </Tooltip>
                                                    }
                                                  >
                                                    {/* <p className="link_url " onClick={() => getTaskDetails(c_task.project_task_id)}>{c_task.project_task_id} <i className="pl-2 fa fa-eye"></i></p> */}
                                                    <p
                                                      className="link_url "
                                                      onClick={() =>
                                                        getTaskDetails(
                                                          c_task.project_task_id
                                                        )
                                                      }
                                                    >
                                                      {filterStr(
                                                        c_task.project_task_id,
                                                        "v_",
                                                        ""
                                                      )}{" "}
                                                      <i className="pl-2 fa fa-eye"></i>
                                                    </p>
                                                  </OverlayTrigger>
                                                  {(() => {
                                                    if (
                                                      c_task.task_owner &&
                                                      c_task.task_owner.length >
                                                      0 &&
                                                      c_task.task_owner != "-"
                                                    ) {
                                                      return (
                                                        <>
                                                          <OverlayTrigger
                                                            placement={"top"}
                                                            overlay={
                                                              <Tooltip
                                                                id={`tooltip-top`}
                                                              >
                                                                {
                                                                  c_task.task_owner
                                                                }{" "}
                                                                (
                                                                {
                                                                  c_task.authority
                                                                }
                                                                )
                                                              </Tooltip>
                                                            }
                                                          >
                                                            <span className="air_initials m-0">
                                                              <span
                                                                className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center"
                                                                style={{
                                                                  background:
                                                                    GetRandomColor(),
                                                                }}
                                                              >
                                                                {GetInitials(
                                                                  c_task.task_owner
                                                                )}
                                                              </span>
                                                            </span>
                                                          </OverlayTrigger>
                                                        </>
                                                      );
                                                    } else {
                                                      return (
                                                        <OverlayTrigger
                                                          placement={"top"}
                                                          overlay={
                                                            <Tooltip
                                                              id={`tooltip-top`}
                                                            >
                                                              Not Assigned
                                                            </Tooltip>
                                                          }
                                                        >
                                                          <a
                                                            href="#"
                                                            className="user_invalid"
                                                          >
                                                            <img
                                                              src="/assets/img/user_invalid64.png"
                                                              alt=""
                                                            />
                                                          </a>
                                                        </OverlayTrigger>
                                                      );
                                                    }
                                                  })()}
                                                  {/* <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a> */}
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        );
                                      })}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                        </DragDropContext>
                      </div>
                    </>
                  )

                } else if (viewType["card"]) {
                  return (
                    <>
                      <div className="align-items-center d-flex justify-content-between my-3">
                        <div>
                          <ul className="pagination mb-0 filterview">
                            <li className={`page-item ${cardView == 'all' ? 'active' : ''}`}><a onClick={() => changeCardView('all')} className="page-link">All Task</a></li>
                            <li className={`page-item ${cardView == 'pending' ? 'active' : ''}`}><a onClick={() => changeCardView('pending')} className="page-link">To Do</a></li>
                            <li className={`page-item ${cardView == 'inProgress' ? 'active' : ''}`}><a onClick={() => changeCardView('inProgress')} className="page-link">In Progress</a></li>
                            <li className={`page-item ${cardView == 'review' ? 'active' : ''}`}><a onClick={() => changeCardView('review')} className="page-link">Under Review</a></li>
                            <li className={`page-item ${cardView == 'completed' ? 'active' : ''}`}><a onClick={() => changeCardView('completed')} className="page-link">Complete</a></li>
                          </ul>
                        </div>
                      </div>
                      <div className="gridcontainer card_container">
                        <div className="grid_item">
                          <div className="card">
                            <div className="card-body d-flex w-100">
                              {pendingTasks && pendingTasks.length > 0 &&
                                <div className="w-25">
                                  {pendingTasks && pendingTasks.length > 0 && pendingTasks.map((task, tIndex) => {
                                    return (

                                      <div key={tIndex} className={`gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                        {/* <div className="gridboxbody link_url" onClick={() => navigate(`/task-details/${encryptData(task.project_task_id)}`)}> */}
                                        <div className="gridboxbody link_url" onClick={() => goToUrl("task_details", task)}>
                                          <h4>{task.title}</h4>
                                          <a className="my-2" href="#">{task.task_status == "pending" ? 'To Do' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a>
                                          <p className="w-100"><img src="assets/img/gbl.gif" alt="folder" height="1" width="1" /> &nbsp;<span>{task.description}</span><label className={`m-0 badge badge-pill badge-${task.priority.toLowerCase() == 'low' ? 'success' : (task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{task.priority.toUpperCase()}</label></p>
                                          <p><img src="assets/img/gbl.gif" alt="date" height="1" width="1" />&nbsp; <span>Created {task.created_at}</span> </p>
                                          <p><img src="assets/img/gbl.gif" alt="date" height="1" width="1" />&nbsp; <span className={`${task.highlight_due_date == 'Y' ? 'text-danger font-weight-bold' : ''}`}>Due Date {task.due_date}</span> </p>
                                          {(() => {
                                            if (task.auditor_status != 'NA') {
                                              return (
                                                <p>
                                                  <i className="fa fa-tasks" aria-hidden="true"></i>&nbsp;
                                                  <span>
                                                    Compliant Status
                                                    {
                                                      task.auditor_status && task.auditor_status == 'compliant'
                                                        ? <i className="fa fa-check text-success ml-2 fs-17" aria-hidden="true"></i>
                                                        : <i className="fa fa-times text-danger ml-2 fs-17" aria-hidden="true"></i>
                                                    }
                                                  </span>
                                                </p>
                                              )
                                            }
                                          })()}
                                        </div>
                                        <div className="gridboxfooter">
                                          <OverlayTrigger

                                            placement={"top"}
                                            overlay={
                                              <Tooltip id={`tooltip-top`}>
                                                Quick View
                                              </Tooltip>
                                            }
                                          >
                                            {/* <p className="m-0 link_url " onClick={() => getTaskDetails(task.project_task_id)}>{task.project_task_id} <i className="pl-2 fa fa-eye"></i></p> */}
                                            <p className="m-0 link_url " onClick={() => getTaskDetails(task.project_task_id)}>{filterStr(task.project_task_id, "v_", "")} <i className="pl-2 fa fa-eye"></i></p>
                                          </OverlayTrigger>
                                          {/* <p className="m-0">{task.project_task_id}</p> */}
                                          {/* <a href="#"><img src="/assets/img/user_invalid64.png" alt="" /></a> */}
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
                                                  <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a>
                                                </OverlayTrigger>
                                              )

                                            }
                                          })()}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              }
                              {inProgresstasks && inProgresstasks.length > 0 &&
                                <div className="w-25">
                                  {inProgresstasks && inProgresstasks.length > 0 && inProgresstasks.map((task, tIndex) => {
                                    return (

                                      <div key={tIndex} className={`gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                        {/* <div className="gridboxbody link_url" onClick={() => navigate(`/task-details/${encryptData(task.project_task_id)}`)}> */}
                                        <div className="gridboxbody link_url" onClick={() => goToUrl("task_details", task)}>
                                          <h4>{task.title}</h4>
                                          <a className="my-2" href="#">{task.task_status == "pending" ? 'To Do' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a>
                                          <p className="w-100"><img src="assets/img/gbl.gif" alt="folder" height="1" width="1" />&nbsp; <span>{task.description}</span><label className={`m-0 badge badge-pill badge-${task.priority.toLowerCase() == 'low' ? 'success' : (task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{task.priority.toUpperCase()}</label></p>
                                          <p><img src="assets/img/gbl.gif" alt="date" height="1" width="1" />&nbsp;<span>Created {task.created_at}</span> </p>
                                          <p><img src="assets/img/gbl.gif" alt="date" height="1" width="1" />&nbsp;<span className={`${task.highlight_due_date == 'Y' ? 'text-danger font-weight-bold' : ''}`}>Due Date {task.due_date}</span> </p>
                                          {(() => {
                                            if (task.auditor_status != 'NA') {
                                              return (
                                                <p>
                                                  <i className="fa fa-tasks" aria-hidden="true"></i>&nbsp;
                                                  <span>
                                                    Compliant Status
                                                    {
                                                      task.auditor_status && task.auditor_status == 'compliant'
                                                        ? <i className="fa fa-check text-success ml-2 fs-17" aria-hidden="true"></i>
                                                        : <i className="fa fa-times text-danger ml-2 fs-17" aria-hidden="true"></i>
                                                    }
                                                  </span>
                                                </p>
                                              )
                                            }
                                          })()}
                                        </div>
                                        <div className="gridboxfooter">
                                          <OverlayTrigger

                                            placement={"top"}
                                            overlay={
                                              <Tooltip id={`tooltip-top`}>
                                                Quick View
                                              </Tooltip>
                                            }
                                          >
                                            {/* <p className="m-0 link_url " onClick={() => getTaskDetails(task.project_task_id)}>{task.project_task_id} <i className="pl-2 fa fa-eye"></i></p> */}
                                            <p className="m-0 link_url " onClick={() => getTaskDetails(task.project_task_id)}>{filterStr(task.project_task_id, "v_", "")} <i className="pl-2 fa fa-eye"></i></p>
                                          </OverlayTrigger>
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
                                                  <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a>
                                                </OverlayTrigger>
                                              )

                                            }
                                          })()}
                                          {/* <a href="#"><img src="/assets/img/user_invalid64.png" alt="" /></a> */}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              }
                              {underReviewtasks && underReviewtasks.length > 0 &&
                                <div className="w-25">
                                  {underReviewtasks && underReviewtasks.length > 0 && underReviewtasks.map((task, tIndex) => {
                                    return (

                                      <div key={tIndex} className={`gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                        {/* <div className="gridboxbody link_url" onClick={() => navigate(`/task-details/${encryptData(task.project_task_id)}`)}> */}
                                        <div className="gridboxbody link_url" onClick={() => goToUrl("task_details", task)}>
                                          <h4>{task.title}</h4>
                                          <a className="my-2" href="#">{task.task_status == "pending" ? 'To Do' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a>
                                          <p className="w-100"><img src="assets/img/gbl.gif" alt="folder" height="1" width="1" />&nbsp; <span>{task.description}</span> <label className={`m-0 badge badge-pill badge-${task.priority.toLowerCase() == 'low' ? 'success' : (task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{task.priority.toUpperCase()}</label></p>
                                          <p><img src="assets/img/gbl.gif" alt="date" height="1" width="1" />&nbsp;<span>Created {task.created_at}</span> </p>
                                          <p><img src="assets/img/gbl.gif" alt="date" height="1" width="1" />&nbsp;<span className={`${task.highlight_due_date == 'Y' ? 'text-danger font-weight-bold' : ''}`}>Due Date {task.due_date}</span> </p>
                                          {(() => {
                                            if (task.auditor_status != 'NA') {
                                              return (
                                                <p>
                                                  <i className="fa fa-tasks" aria-hidden="true"></i>&nbsp;
                                                  <span>
                                                    Compliant Status
                                                    {
                                                      task.auditor_status && task.auditor_status == 'compliant'
                                                        ? <i className="fa fa-check text-success ml-2 fs-17" aria-hidden="true"></i>
                                                        : <i className="fa fa-times text-danger ml-2 fs-17" aria-hidden="true"></i>
                                                    }
                                                  </span>
                                                </p>
                                              )
                                            }
                                          })()}
                                        </div>
                                        <div className="gridboxfooter">
                                          <OverlayTrigger

                                            placement={"top"}
                                            overlay={
                                              <Tooltip id={`tooltip-top`}>
                                                Quick View
                                              </Tooltip>
                                            }
                                          >
                                            {/* <p className="m-0 link_url " onClick={() => getTaskDetails(task.project_task_id)}>{task.project_task_id} <i className="pl-2 fa fa-eye"></i></p> */}
                                            <p className="m-0 link_url " onClick={() => getTaskDetails(task.project_task_id)}>{filterStr(task.project_task_id, "v_", "")} <i className="pl-2 fa fa-eye"></i></p>
                                          </OverlayTrigger>
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
                                                  <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a>
                                                </OverlayTrigger>
                                              )

                                            }
                                          })()}
                                          {/* <a href="#"><img src="/assets/img/user_invalid64.png" alt="" /></a> */}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              }
                              {completedtasks && completedtasks.length > 0 &&
                                <div className="w-25">
                                  {completedtasks && completedtasks.length > 0 && completedtasks.map((task, tIndex) => {
                                    return (

                                      <div key={tIndex} className={`gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                        {/* <div className="gridboxbody link_url" onClick={() => navigate(`/task-details/${encryptData(task.project_task_id)}`)}> */}
                                        <div className="gridboxbody link_url" onClick={() => goToUrl("task_details", task)}>
                                          <h4>{task.title}</h4>
                                          <a className="my-2" href="#">{task.task_status == "pending" ? 'To Do' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a>
                                          <p><img src="assets/img/gbl.gif" alt="folder" height="1" width="1" />&nbsp; <span>{task.description}</span><label className={`m-0 badge badge-pill badge-${task.priority.toLowerCase() == 'low' ? 'success' : (task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{task.priority.toUpperCase()}</label></p>
                                          <p><img src="assets/img/gbl.gif" alt="date" height="1" width="1" />&nbsp;<span>Created {task.created_at}</span> </p>
                                          <p><img src="assets/img/gbl.gif" alt="date" height="1" width="1" />&nbsp;<span className={`${task.highlight_due_date == 'Y' ? 'text-danger font-weight-bold' : ''}`}>Due Date {task.due_date}</span> </p>
                                          {(() => {
                                            if (task.auditor_status != 'NA') {
                                              return (
                                                <p>
                                                  <i className="fa fa-tasks" aria-hidden="true"></i>&nbsp;
                                                  <span>
                                                    Compliant Status
                                                    {
                                                      task.auditor_status && task.auditor_status == 'compliant'
                                                        ? <i className="fa fa-check text-success ml-2 fs-17" aria-hidden="true"></i>
                                                        : <i className="fa fa-times text-danger ml-2 fs-17" aria-hidden="true"></i>
                                                    }
                                                  </span>
                                                </p>
                                              )
                                            }
                                          })()}
                                        </div>
                                        <div className="gridboxfooter">
                                          <OverlayTrigger

                                            placement={"top"}
                                            overlay={
                                              <Tooltip id={`tooltip-top`}>
                                                Quick View
                                              </Tooltip>
                                            }
                                          >
                                            {/* <p className="m-0 link_url " onClick={() => getTaskDetails(task.project_task_id)}>{task.project_task_id} <i className="pl-2 fa fa-eye"></i></p> */}
                                            <p className="m-0 link_url " onClick={() => getTaskDetails(task.project_task_id)}>{filterStr(task.project_task_id, "v_", "")} <i className="pl-2 fa fa-eye"></i></p>
                                          </OverlayTrigger>
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
                                                  <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a>
                                                </OverlayTrigger>
                                              )

                                            }
                                          })()}
                                          {/* <a href="#"><img src="/assets/img/user_invalid64.png" alt="" /></a> */}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              }
                            </div>


                          </div>
                        </div>



                      </div>
                    </>
                  )

                } else if (viewType["timeline"]) {
                  return (
                    <>
                      <div className="align-items-center d-flex justify-content-between my-3">
                        <div>
                          <ul className="pagination mb-0 filterview">
                            <li className={`page-item ${cardView == 'all' ? 'active' : ''}`}><a onClick={() => changeCardView('all')} className="page-link">All Task</a></li>
                            <li className={`page-item ${cardView == 'pending' ? 'active' : ''}`}><a onClick={() => changeCardView('pending')} className="page-link">To Do</a></li>
                            <li className={`page-item ${cardView == 'inProgress' ? 'active' : ''}`}><a onClick={() => changeCardView('inProgress')} className="page-link">In Progress</a></li>
                            <li className={`page-item ${cardView == 'review' ? 'active' : ''}`}><a onClick={() => changeCardView('review')} className="page-link">Under Review</a></li>
                            <li className={`page-item ${cardView == 'completed' ? 'active' : ''}`}><a onClick={() => changeCardView('completed')} className="page-link">Complete</a></li>
                          </ul>
                        </div>
                      </div>
                      <div className="gridcontainer timecontainer">
                        {timelineDates && timelineDates.length > 0 && timelineDates.map((date, dIndex) => {
                          return (
                            <div key={dIndex} className="grid_item">
                              <div className="card">
                                <div className="align-items-center card-header d-flex justify-content-between py-2">
                                  <h4><img src="/assets/img/gbl.gif" alt="" className="mr-2 timeIcon" height="1" width="1" /> {date}</h4>
                                </div>
                                <div className="card-body">
                                  {tasksByDates && tasksByDates[date] && tasksByDates[date].length > 0 && tasksByDates[date].map((task, tIndex) => {
                                    return (
                                      // <div key={tIndex} onClick={() => navigate(`/task-details/${encryptData(task.project_task_id)}`)} className={`link_url gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                      <div key={tIndex} onClick={() => goToUrl("task_details", task)} className={`link_url gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                        <div className="gridboxbody">
                                          <div className="col p-0">
                                            {/* <p>{task.project_task_id}</p> */}
                                            <p className="w100">{filterStr(task.project_task_id, "v_", "")}</p>

                                            <h4 className="col p-0">{task.title}</h4>
                                          </div>
                                          <p className="w60">{/* <img src="/assets/img/gbl.gif" alt="folder" height="1" width="1" /> <span>{task.description}</span> */}<label className={`m-0 badge badge-pill badge-${task.priority.toLowerCase() == 'low' ? 'success' : (task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')}`}>{task.priority.toUpperCase()}</label></p>
                                          <p className="w100"> <a href="" className="statusClr">{task.task_status == "pending" ? 'To Do' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>
                                          <p className="col-auto w-auto px-3 min_w_auto">
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
                                            <OverlayTrigger

                                              placement={"top"}
                                              overlay={
                                                <Tooltip id={`tooltip-top`}>
                                                  Quick View
                                                </Tooltip>
                                              }
                                            >
                                              <p
                                                className="m-0 pl-2 text-dark link_url "
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  getTaskDetails(task.project_task_id);
                                                }}
                                              >
                                                <i className="pl-2 fa fa-eye"></i>
                                              </p>
                                            </OverlayTrigger>
                                          </p>
                                        </div>
                                      </div>
                                    )

                                  })}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )
                } else if (viewType["calender"]) {
                  return (
                    <>
                      <div className="align-items-center d-flex justify-content-between my-3">
                        <div>
                          <ul className="pagination mb-0 filterview">
                            <li className={`page-item ${cardView == 'all' ? 'active' : ''}`}><a onClick={() => changeCardView('all')} className="page-link">All Task</a></li>
                            <li className={`page-item ${cardView == 'pending' ? 'active' : ''}`}><a onClick={() => changeCardView('pending')} className="page-link">To Do</a></li>
                            <li className={`page-item ${cardView == 'inProgress' ? 'active' : ''}`}><a onClick={() => changeCardView('inProgress')} className="page-link">In Progress</a></li>
                            <li className={`page-item ${cardView == 'review' ? 'active' : ''}`}><a onClick={() => changeCardView('review')} className="page-link">Under Review</a></li>
                            <li className={`page-item ${cardView == 'completed' ? 'active' : ''}`}><a onClick={() => changeCardView('completed')} className="page-link">Complete</a></li>
                          </ul>
                        </div>
                        {/* <div id="calendarTools">dfsadf</div> */}
                        {/* [...pendingTasks,...inProgresstasks,...underReviewtasks,...completedtasks] */}
                      </div>
                      <div id="calendar">
                        {(() => {
                          if (tasks) {
                            return (
                              <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                events={tasks}
                                // events={(fetchCalInfo, successCallback, failureCallback) => onCalBtnClick(fetchCalInfo, successCallback, failureCallback)}
                                customButtons={{
                                  prev: {
                                    text: 'Prev',
                                    click: (fetchCalInfo) => handleCalendarNav('prev', fetchCalInfo)
                                  },
                                  next: {
                                    text: 'Next',
                                    click: (fetchCalInfo) => handleCalendarNav('next', fetchCalInfo)
                                  },
                                }}

                                headerToolbar={{
                                  right: 'next',
                                  center: 'title',
                                  left: 'prev'
                                }}
                                eventContent={renderEventContent}
                              />
                            )
                          }
                        })()}

                      </div>
                      <div ref={eventRef} className="calendar-popover">
                        <Overlay
                          show={showEventPopup}
                          target={eventPopupTarget}
                          containerPadding={0}
                          overlay={popover}
                          container={eventRef}
                        >
                          {popover}
                        </Overlay>
                      </div>

                    </>
                  )
                }
              } else {
                return (
                  <>
                    <div className="gridcontainer timecontainer auditor">
                      {(() => {
                        if (tasks && tasks.length > 0) {
                          return (
                            <>
                              <div className="grid_item">
                                <div className="card">
                                  <div className="align-items-center card-header d-flex justify-content-between py-2">
                                    <h4>
                                      {/* <img src="/assets/img/gbl.gif" alt="" className="mr-2 timeIcon" height="1" width="1" />  */}
                                      Tasks
                                    </h4>
                                  </div>
                                  <div className="card-body">
                                    {filteredTasks && filteredTasks.length > 0 && filteredTasks.map((task, tIndex) => {
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
                                            <p className="w100"> <a href="" className="statusClr">{task.task_status == "pending" ? 'To Do' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>
                                            <p className="col-auto w-auto px-3 min_w_auto">
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

                                    })}
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
              }
            })()}

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
              AmClass={(viewType["board"] || viewType["card"]) && taskDetails.task[0].task_status}
              formSubmit={() => { }} />
          }
        }
      })()}
    </>
  )
}

export default TestPage2