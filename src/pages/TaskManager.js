import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie, FormatDate, GetInitials, GetRandomColor, ChangeDateFormat, encryptData, _Id } from "../helpers/Helper";
import { useNavigate, useOutletContext } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick
import SweetAlert from "react-bootstrap-sweetalert";
import AIR_MSG from "../helpers/AirMsgs";
import Multiselect from 'multiselect-react-dropdown';
import AirFilter from "../elements/AirFilter";
import AIrInitials from "../elements/AirInitials";
import Loader from "../components/partials/Loader";

const TaskManager = (props) => {
  // const { user = {} } = useOutletContext()
  // const orgId = user?.currentUser?.org_id || 0;
  const { projectId = null, user = {}, showLoader, setShowLoader } = useContext(LayoutContext)
  // const accessRole = user?.currentUser?.access_role || '';
  const { access_role: accessRole = null, org_id: orgId = 0, is_management: isManagement = '' } = user?.currentUser;
  const [viewType, setViewType] = useState({ board: true, calender: false })
  const [filterType, setfilterType] = useState("due_date")
  const [priority, setPriority] = useState("all")
  const [cardView, setCardViewe] = useState('all')
  const [filterCardView, setFilterCardView] = useState([])
  const [filterByRole, setFilterByRole] = useState('all')
  const [taskRoles, setTaskRoles] = useState([])
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
  const [dropDisabled, setDropDisabled] = useState('')
  const [dueDateExpressions, setDueDateExpressions] = useState([]);
  const [controlCategories, setControlCategories] = useState([]);
  const [controlCriterias, setControlCriterias] = useState([]);
  const [controlDomains, setControlDomains] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [frameworkCategories, setFrameworkCategories] = useState({});
  const [thirdPartyConnectors, setThirdPartyConnectors] = useState([]);
  // const [showLoader, setShowLoader] = useState(false);
  const defSavedFilters = (GetCookie("tmf") && JSON.parse(GetCookie("tmf"))) || {}
  const [checkFilters, setCheckFilters] = useState(defSavedFilters[projectId] || []);
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })

  // const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const now = new Date()
  const numDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  /* let stDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  stDate = `${stDate.getFullYear()}-${('00' + stDate.getMonth()).slice(-2)}-${('00' + stDate.getDate()).slice(-2)}`
  const startDate = FormatDate(null, stDate, 1) */
  // let edDate = new Date(now.getFullYear(), now.getMonth(), numDays)
  // edDate = `${edDate.getFullYear()}-${('00' + (edDate.getMonth()+1)).slice(-2)}-${('00' + edDate.getDate()).slice(-2)}`
  // const endDate = FormatDate(null, edDate, 1)
  const startDate = moment().startOf('month')
  const endDate = moment().endOf('month')

  const calendarRef = useRef()
  const keywordRef = useRef()

  useEffect(() => {
    if (controlCategories.length == 0) {
      getControlCategories()
    }
    if (controlCriterias.length == 0) {
      getControlCriteria()
    }
    if (controlDomains.length == 0) {
      getControlDomains()
    }
  }, []);

  useEffect(() => {


    if (projectId != null && controlDomains.length > 0) {
      let projectFilter = defSavedFilters[projectId]
      if (projectFilter) {
        setCheckFilters(oldVal => {
          return [...projectFilter]
        })
      }
      fetchInfo({ type: "all_tasks" }, projectFilter)
      // console.log(controlCriterias[0].length == 2)
    }

    // if (thirdPartyConnectors.length == 0 && projectId != null) {
    //   getThirdPartyCOnnectors();
    // }
  }, [projectId, controlDomains]);




  const getControlCategories = async () => {
    let payloadUrl = `reference/getControlCategories/soc2`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      setControlCategories(oldVal => {
        return [...res.results]
      })
    }

  }
  const getControlCriteria = async () => {
    let payloadUrl = `reference/getControlCriteria`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      setControlCriterias(oldVal => {
        return [...res.results]
      })
    }

  }
  const getControlDomains = async () => {
    let payloadUrl = `reference/getControlDomains`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      let ctrlDomains = res.results
      setControlDomains(oldVal => {
        return [...ctrlDomains]
      })
      // let tempArr = taskRoles || []
      // ctrlDomains.map((item, index, arr) => {
      //   let roleObj = { cat: "Domains", key: item.name, domain_id: item.id }
      //   tempArr.push(roleObj)
      // })
      // setTaskRoles(oldVal => {
      //   return [...tempArr]
      // })
    }
  }
  const getFrameWorks = async () => {
    let payloadUrl = `reference/getFrameworks`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      let tmpArr = res.results
      tmpArr.splice(tmpArr.findIndex(item => item.id == 100004))

      setFrameworks(oldVal => {
        return [...tmpArr]
      })
    }
  }
  const getFrameWorkControlCategories = async (framework = null) => {
    if (framework == null) {
      return false
    }
    // let paramVal = framework == 100001 ? 'soc2' : (framework == 100002 ? 'iso' : (framework == 100003 ? 'nist' : 'health'))
    // let payloadUrl = `reference/getControlCategories/${paramVal}`
    let payloadUrl = `reference/getControlCategories/${framework}`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      let catArr = res.results
      let tmpObj = { ...frameworkCategories }
      // tmpObj[paramVal] = catArr
      tmpObj[framework] = catArr
      setFrameworkCategories(oldVal => {
        return { ...tmpObj }
      })
    }
  }

  // const fetchInfo = async (type = '', project_id = 0, filter_type = null, priority_type = null, view = null) => {
  const fetchInfo = async (data = null, projectFilter = []) => {
    let { type = '', project_id = 0, filter_type = null, priority_type = null, view = null } = data || {}
    if (type == '') {
      return false
    };
    setShowLoader(true)
    let payloadUrl = ""
    let method = "POST";
    let formData = {};
    let currentView = view
    if (view == null) {
      currentView = viewType["board"] ? "board_view" : (viewType["card"] ? "card_view" : (viewType["timeline"] ? "timeline_view" : (viewType["calender"] ? "calender_view" : (viewType["out_of_scope"] ? "oot_of_scope_view" : "audited_view"))))
    } else {
      currentView = view == "board" ? "board_view" : (view == "card" ? "card_view" : (view == "timeline" ? "timeline_view" : (view == "calender" ? "calender_view" : (view == "out_of_scope" ? "oot_of_scope_view" : "audited_view"))))
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
      payloadUrl = `tasks/listTasks`
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
        tmpTasksByDates = [],
        filteredTasksArr = [];
      for (let task of allTasks) {
        let skipTask = filterSkipTask(task, projectFilter || checkFilters)
        if (skipTask) {
          continue
        }
        task.date = ChangeDateFormat(task.due_date, 2, 3)
        if (task.task_status == "pending") {
          view == "board" ? tmpPendingArr.push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("pending")) && tmpPendingArr.push(task)
        } else if (task.task_status == "in_progress") {
          view == "board" ? tmpInProgressArr.push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("in_progress")) && tmpInProgressArr.push(task)
        } else if (task.task_status == "review") {
          view == "board" ? tmpUnderReviewArr.push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("review")) && tmpUnderReviewArr.push(task)
        } else if (task.task_status == "completed") {
          view == "board" ? tmpCompletedArr.push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("completed")) && tmpCompletedArr.push(task)
        }
        if (!tmpTimelineDates.includes(task.due_date)) {
          tmpTimelineDates.push(task.due_date)
        }

        if (!Object.keys(tmpTasksByDates).includes(task.due_date)) {
          tmpTasksByDates[task.due_date] = []
        }
        view == "board" ? tmpTasksByDates[task.due_date].push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && tmpTasksByDates[task.due_date].push(task);
        view == "board" ? filteredTasksArr.push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && filteredTasksArr.push(task)
      }
      setTasks(oldVal => {
        return [...allTasks]
      })
      if(view == "calender"){
        filteredTasksArr = filteredTasksArr.filter(task => task.task_status != "completed" || (task.task_status == "completed" && task.auditor_status != "compliant"))
      }
      setFilteredTasks(oldVal => {
        return [...filteredTasksArr]
      })
      setPendingTasks(tmpPendingArr)
      setInProgressTasks(tmpInProgressArr)
      setUnderReviewTasks(tmpUnderReviewArr)
      setCompletedTasks(tmpCompletedArr)
      settimelineDates(tmpTimelineDates.sort())
      setTasksByDates(tmpTasksByDates)

      getTaskRoles(allTasks)
    }
    setShowLoader(false)
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
    'Tomorrow': [moment().add(1, 'days'), moment().add(1, 'days')],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'This Week': [moment().startOf('isoWeek'), moment().endOf('isoWeek')],
    'Next Week': [moment().add(1, 'weeks').startOf('isoWeek'), moment().add(1, 'weeks').endOf('isoWeek')],
    'Previous Week': [moment().subtract(1, 'weeks').startOf('isoWeek'), moment().subtract(1, 'weeks').endOf('isoWeek')],
    'This Month': [startDate, endDate],
    'Next Month': [moment().add(1, 'month').startOf('month'), moment().add(1, 'month').endOf('month')],
    'Previous Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
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
    // changeFilterType('due_date', view)

    let allTasks = [...tasks];
    let tmpPendingArr = [],
      tmpInProgressArr = [],
      tmpUnderReviewArr = [],
      tmpCompletedArr = [],
      tmpTimelineDates = [],
      tmpTasksByDates = [],
      filteredTasksArr = [];
    for (let task of allTasks) {
      let skipTask = filterSkipTask(task, checkFilters)
      if (skipTask) {
        continue
      }
      task.date = ChangeDateFormat(task.due_date, 2, 3)
      if (task.task_status == "pending") {
        view == "board" ? tmpPendingArr.push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("pending")) && tmpPendingArr.push(task)
      } else if (task.task_status == "in_progress") {
        view == "board" ? tmpInProgressArr.push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("in_progress")) && tmpInProgressArr.push(task)
      } else if (task.task_status == "review") {
        view == "board" ? tmpUnderReviewArr.push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("review")) && tmpUnderReviewArr.push(task)
      } else if (task.task_status == "completed") {
        view == "board" ? tmpCompletedArr.push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("completed")) && tmpCompletedArr.push(task)
      }
      if (!tmpTimelineDates.includes(task.due_date)) {
        tmpTimelineDates.push(task.due_date)
      }

      if (!Object.keys(tmpTasksByDates).includes(task.due_date)) {
        tmpTasksByDates[task.due_date] = []
      }
      view == "board" ? tmpTasksByDates[task.due_date].push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && tmpTasksByDates[task.due_date].push(task);
      view == "board" ? filteredTasksArr.push(task) : (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && filteredTasksArr.push(task)
    }
    setTasks(oldVal => {
      return [...allTasks]
    })
    if(view == "calender"){
      filteredTasksArr = filteredTasksArr.filter(task => task.task_status != "completed" || (task.task_status == "completed" && task.auditor_status != "compliant"))
    }
    setFilteredTasks(oldVal => {
      return [...filteredTasksArr]
    })
    setPendingTasks(tmpPendingArr)
    setInProgressTasks(tmpInProgressArr)
    setUnderReviewTasks(tmpUnderReviewArr)
    setCompletedTasks(tmpCompletedArr)
    settimelineDates(tmpTimelineDates.sort())
    setTasksByDates(tmpTasksByDates)
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
    // fetchInfo(cardView, projectId, filter, priority, view)
    let obj = { type: cardView, project_id: projectId, filter_type: filter, priority_type: priority, view: view }
    fetchInfo(obj)
  }
  const changePriority = (priorityType = "", view = null) => {
    if (priorityType == "") {
      return false
    }
    setPriority(priorityType)
    // fetchInfo(cardView, projectId, filterType, priorityType, view)
    let obj = { type: cardView, project_id: projectId, filter_type: filterType, priority_type: priorityType, view: view }
    fetchInfo(obj)
  }
  const changeCardView = (view = "") => {
    if (view == "") {
      return false
    }
    let type = "all"
    if (view == "all") {
      // fetchInfo('all_tasks')
      type = "all"
    } else if (view == 'pending') {
      // fetchInfo('pending')
      type = "pending"
    } else if (view == 'inProgress') {
      // fetchInfo('in_progress')
      type = "in_progress"
    } else if (view == 'review') {
      // fetchInfo('review')
      type = "review"
    } else if (view == 'completed') {
      // fetchInfo('completed')
      type = "completed"
    }
    let obj = { type: type }
    fetchInfo(obj)
    setCardViewe(view)
  }
  const changeCardViewfilter = (view = "") => {
    if (view == "") {
      return false
    }
    let tmpFilterArr = [...filterCardView] || [];

    if (tmpFilterArr.includes(view)) {
      let key = tmpFilterArr.indexOf(view)
      if (key != -1) {
        tmpFilterArr.splice(key, 1)
      }
    } else {
      if (view == "all") {
        tmpFilterArr = ["all"];
      } else {
        tmpFilterArr.includes("all") && tmpFilterArr.splice(tmpFilterArr.indexOf("all"), 1)
        tmpFilterArr.push(view)
      }

    }
    setFilterCardView(oldVal => {
      return [...tmpFilterArr]
    })

    let allTasks = [...tasks];
    let tmpPendingArr = [],
      tmpInProgressArr = [],
      tmpUnderReviewArr = [],
      tmpCompletedArr = [],
      tmpTimelineDates = [],
      tmpTasksByDates = [],
      filteredTasksArr = [];
    for (let task of allTasks) {
      let skipTask = filterSkipTask(task, checkFilters)
      if (skipTask) {
        continue
      }
      task.date = ChangeDateFormat(task.due_date, 2, 3)
      if (task.task_status == "pending") {
        (tmpFilterArr.length == 0 || tmpFilterArr.includes("all") || tmpFilterArr.includes("pending")) && tmpPendingArr.push(task)
      } else if (task.task_status == "in_progress") {
        (tmpFilterArr.length == 0 || tmpFilterArr.includes("all") || tmpFilterArr.includes("in_progress")) && tmpInProgressArr.push(task)
      } else if (task.task_status == "review") {
        (tmpFilterArr.length == 0 || tmpFilterArr.includes("all") || tmpFilterArr.includes("review")) && tmpUnderReviewArr.push(task)
      } else if (task.task_status == "completed") {
        (tmpFilterArr.length == 0 || tmpFilterArr.includes("all") || tmpFilterArr.includes("completed")) && tmpCompletedArr.push(task)
      }
      if (!tmpTimelineDates.includes(task.due_date)) {
        tmpTimelineDates.push(task.due_date)
      }

      if (!Object.keys(tmpTasksByDates).includes(task.due_date)) {
        tmpTasksByDates[task.due_date] = []
      }
      (tmpFilterArr.length == 0 || tmpFilterArr.includes("all") || tmpFilterArr.includes(task.task_status)) && tmpTasksByDates[task.due_date].push(task);
      (tmpFilterArr.length == 0 || tmpFilterArr.includes("all") || tmpFilterArr.includes(task.task_status)) && filteredTasksArr.push(task)

    }

    setTasks(oldVal => {
      return [...allTasks]
    })
    if(viewType == "calender"){
      filteredTasksArr = filteredTasksArr.filter(task => task.task_status != "completed" || (task.task_status == "completed" && task.auditor_status != "compliant"))
    }
    setFilteredTasks(oldVal => {
      return [...filteredTasksArr]
    })

    setPendingTasks(tmpPendingArr)
    setInProgressTasks(tmpInProgressArr)
    setUnderReviewTasks(tmpUnderReviewArr)
    setCompletedTasks(tmpCompletedArr)
    settimelineDates(tmpTimelineDates)
    setTasksByDates(tmpTasksByDates)

    // let type = "all"
    // if (view == "all") {
    //   // fetchInfo('all_tasks')
    //   type = "all"
    // } else if (view == 'pending') {
    //   // fetchInfo('pending')
    //   type = "pending"
    // } else if (view == 'inProgress') {
    //   // fetchInfo('in_progress')
    //   type = "in_progress"
    // } else if (view == 'review') {
    //   // fetchInfo('review')
    //   type = "review"
    // } else if (view == 'completed') {
    //   // fetchInfo('completed')
    //   type = "completed"
    // }
    // let obj = { type: type }
    // fetchInfo(obj)
    // setCardViewe(view)
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
        getFrameWorks();
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

  const renderEventContent = (eventInfo) => {
    let evInfo = Object.assign({ title: eventInfo.event.title }, eventInfo.event.extendedProps)
    // let statClass = `${evInfo.priority == 'low' ? 'low' : (evInfo.priority == 'medium' ? 'medium' : 'high')}`
    let statClass = `${evInfo.task_status == 'pending' ? 'todo_Filter' : (evInfo.task_status == 'in_progress' ? 'inProgress_Filter' : (evInfo.task_status == 'review' ? 'underReview_Filter' : 'complete_Filter'))}`
    return (
      <>
        <div className={`fc-event-custom d-flex ${statClass} align-items-center justify-content-between`}
          onMouseOver={(e) => handleEventClick(e, eventInfo, "open")}
          onMouseOut={(e) => handleEventClick(e, eventInfo, "close")}
          // onClick={null}>
          onClick={() => goToUrl("task_details", evInfo)}>
          <div className="event_info mw-100 pl-2">
            <span className="event_task_icn mr-1"><img src="/assets/img/work.svg" className="img-fluid" /></span>
            <span className="d-inline-block w-100">{eventInfo.event.title}</span>
          </div>
          <div className="event_owner pr-1 text-right">
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
    setShowLoader(true)
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
        tmpTasksByDates = [],
        filteredTasksArr = [];
      for (let task of allTasks) {
        let skipTask = filterSkipTask(task, checkFilters)
        if (skipTask) {
          continue
        }
        task.date = ChangeDateFormat(task.due_date, 2, 3)
        if (task.task_status == "pending") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("pending")) && tmpPendingArr.push(task)
        } else if (task.task_status == "in_progress") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("in_progress")) && tmpInProgressArr.push(task)
        } else if (task.task_status == "review") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("review")) && tmpUnderReviewArr.push(task)
        } else if (task.task_status == "completed") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("completed")) && tmpCompletedArr.push(task)
        }
        if (!tmpTimelineDates.includes(task.due_date)) {
          tmpTimelineDates.push(task.due_date)
        }

        if (!Object.keys(tmpTasksByDates).includes(task.due_date)) {
          tmpTasksByDates[task.due_date] = []
        }
        (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && tmpTasksByDates[task.due_date].push(task);
        (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && filteredTasksArr.push(task)
      }
      setTasks(oldVal => {
        return [...allTasks]
      })
      if(viewType == "calender"){
        filteredTasksArr = filteredTasksArr.filter(task => task.task_status != "completed" || (task.task_status == "completed" && task.auditor_status != "compliant"))
      }
      setFilteredTasks(oldVal => {
        return [...filteredTasksArr]
      })
      setPendingTasks(tmpPendingArr)
      setInProgressTasks(tmpInProgressArr)
      setUnderReviewTasks(tmpUnderReviewArr)
      setCompletedTasks(tmpCompletedArr)
      settimelineDates(tmpTimelineDates.sort())
      setTasksByDates(tmpTasksByDates)
    }

    if (type == 'prev') {
      calRef.prev();
    } else {
      calRef.next();
    }
    setShowLoader(false)
  }

  const searchTaskByKeyword = async () => {
    let keyword = keywordRef?.current?.value
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
      let skipTask = filterSkipTask(task, checkFilters)
      if (skipTask) {
        continue
      }
      let title = task.title ? (task.title).toLowerCase() : '';
      let description = task.description ? (task.description).toLowerCase() : '';
      let task_owner = task.task_owner ? (task.task_owner).toLowerCase() : '';
      let project_task_id = task.project_task_id ? (task.project_task_id).toString().toLowerCase() : '';
      let authority = task.authority ? (task.authority).toString().toLowerCase() : '';
      if ((title).indexOf(keyword.toLowerCase()) != -1 ||
        (description).indexOf(keyword.toLowerCase()) != -1 ||
        (task_owner).indexOf(keyword.toLowerCase()) != -1 ||
        (authority).indexOf(keyword.toLowerCase()) != -1 ||
        (project_task_id).indexOf(keyword.toLowerCase()) != -1
      ) {
        // tempTaskArr.push(task)

        if (task.task_status == "pending") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("pending")) && tmpPendingArr.push(task)
        } else if (task.task_status == "in_progress") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("in_progress")) && tmpInProgressArr.push(task)
        } else if (task.task_status == "review") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("review")) && tmpUnderReviewArr.push(task)
        } else if (task.task_status == "completed") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("completed")) && tmpCompletedArr.push(task)
        }
        if (!tmpTimelineDates.includes(task.due_date)) {
          tmpTimelineDates.push(task.due_date)
        }

        if (!Object.keys(tmpTasksByDates).includes(task.due_date)) {
          tmpTasksByDates[task.due_date] = []
        }
        (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && tmpTasksByDates[task.due_date].push(task);
        (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && tempTaskArr.push(task)
      }
    }
    if(viewType == "calender"){
      tempTaskArr = tempTaskArr.filter(task => task.task_status != "completed" || (task.task_status == "completed" && task.auditor_status != "compliant"))
    }
    setFilteredTasks(oldVal => {
      return [...tempTaskArr]
    })

    setPendingTasks(tmpPendingArr)
    setInProgressTasks(tmpInProgressArr)
    setUnderReviewTasks(tmpUnderReviewArr)
    setCompletedTasks(tmpCompletedArr)
    settimelineDates(tmpTimelineDates.sort())
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
      <Popover.Body>
        {(() => {
          if (eventPopupData) {
            return (
              <>
                <div id="calendar-popup">
                  <div id="event" className={`taskDetailmodal ${eventPopupData.task_status}`}>
                    <div className="px-2 mb-1 d-flex align-items-start flex-column">
                      <h4 className="mb-1">{eventPopupData.title}</h4>
                      <a href="" className={`my-2 stSbar stSbar_${eventPopupData.task_status == 'pending' ? 'todo' : (eventPopupData.task_status == 'in_progress' ? 'in_progress' : (eventPopupData.task_status == 'review' ? 'review' : 'completed'))} d-inline-block`}>{eventPopupData.task_status == 'pending' ? 'Open' : (eventPopupData.task_status == 'in_progress' ? 'In Progress' : (eventPopupData.task_status == 'review' ? 'Under Review' : 'Completed'))}</a>
                      <p className="fs-12 fw-400 text_color_2 mb-2"><i className="fa fa-tasks"></i>&nbsp;&nbsp;&nbsp;<span>Evidence Attached : {eventPopupData.evidence_added}</span> </p>
                      <p className="fs-12 fw-400 text_color_2 mb-2"><i className="fa fa-calendar"></i>&nbsp;&nbsp;&nbsp;<span className={`${eventPopupData.highlight_due_date == 'Y' ? 'text-danger font-weight-bold' : ''}`}>{eventPopupData.due_date}</span> </p>
                      {eventPopupData.auditor_status != 'NA' &&
                        <p>
                          <i className="fa fa-tasks" aria-hidden="true"></i>&nbsp;
                          <span>
                            Compliant Status
                            {
                              eventPopupData.auditor_status && eventPopupData.auditor_status == 'compliant'
                                ? <i className="fa fa-check text-success ml-2 fs-17" aria-hidden="true"></i>
                                : <i className="fa fa-times text-danger ml-2 fs-17" aria-hidden="true"></i>
                            }
                          </span>
                        </p>
                      }
                    </div>
                    <div className={`d-flex justify-content-between p-2 align-items-center popup_footer ${eventPopupData.task_status}`}>
                      <div className="d-flex align-items-start flex-column">
                        <label className={`m-0 fw-800 badge badge-pill badge-${eventPopupData.priority.toLowerCase() == 'low' ? 'success' : (eventPopupData.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{eventPopupData.priority.toUpperCase()}</label>
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

  const onDragUpdate = async (result) => {
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
      let taskInfo = allTasks[taskDetailIndex]
      let priority = taskInfo.priority
      if (isManagement == 'N' && priority == "high") {
        setDropDisabled('completed')
      } else {
        setDropDisabled('')
      }
    }
  }
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
        tmpTasksByDates = [],
        filteredTasksArr = [];
      for (let task of allTasks) {
        let skipTask = filterSkipTask(task, checkFilters)
        if (skipTask) {
          continue
        }
        task.date = ChangeDateFormat(task.due_date, 2, 3)
        if (task.task_status == "pending") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("pending")) && tmpPendingArr.push(task)
        } else if (task.task_status == "in_progress") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("in_progress")) && tmpInProgressArr.push(task)
        } else if (task.task_status == "review") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("review")) && tmpUnderReviewArr.push(task)
        } else if (task.task_status == "completed") {
          (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("completed")) && tmpCompletedArr.push(task)
        }
        if (!tmpTimelineDates.includes(task.due_date)) {
          tmpTimelineDates.push(task.due_date)
        }

        if (!Object.keys(tmpTasksByDates).includes(task.due_date)) {
          tmpTasksByDates[task.due_date] = []
        }
        (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && tmpTasksByDates[task.due_date].push(task);
        (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && filteredTasksArr.push(task)
      }
      setTasks(oldVal => {
        return [...allTasks]
      })
      if(viewType == "calender"){
        filteredTasksArr = filteredTasksArr.filter(task => task.task_status != "completed" || (task.task_status == "completed" && task.auditor_status != "compliant"))
      }
      setFilteredTasks(oldVal => {
        return [...filteredTasksArr]
      })
      setPendingTasks(tmpPendingArr)
      setInProgressTasks(tmpInProgressArr)
      setUnderReviewTasks(tmpUnderReviewArr)
      setCompletedTasks(tmpCompletedArr)
      settimelineDates(tmpTimelineDates)
      setTasksByDates(tmpTasksByDates)
      let payloadUrl = `tasks/updateTaskDetails/${draggableIdArray[0]}`
      let method = "POST";
      let formData = { task_status: dId }
      let taskInfo = allTasks.find((task) => task.project_task_id == draggableIdArray[0])
      // console.log(taskInfo);
      if (taskInfo.is_virtual == "Y") {
        formData.task_old_end_date = moment(taskInfo.due_date, 'MMM DD, YYYY').format('YYYY-MM-DD');
        formData.task_end_date = moment(taskInfo.due_date, 'MMM DD, YYYY').format('YYYY-MM-DD');
      }
      let res = await ApiService.fetchData(payloadUrl, method, formData);

      if (res?.status_code == "air200") {
        // Check response if needed
      }
    } else {
      /* if (sId == "pending") {
        let data = [...pendingTasks];
        const result = taskReorder(data,source.index, destination.index)
        setPendingTasks(result)
      } else if (sId == "in_progress") {
        let data = [...inProgresstasks];
        const result = taskReorder(data,source.index, destination.index)
        setInProgressTasks(result)
      } else if (sId == "review") {
        let data = [...underReviewtasks];
        const result = taskReorder(data,source.index, destination.index)
        setUnderReviewTasks(result)
      } else if (sId == "completed") {
        let data = [...completedtasks];
        const result = taskReorder(data,source.index, destination.index)
        setCompletedTasks(result)
      } */
    }
  }


  const getTaskRoles = async (tasksArr = null) => {
    let allTasks = Object.assign([], tasksArr || tasks)
    let tempArr = []
    allTasks.map((item, index, arr) => {
      let roleObj = { cat: "Authority", key: item.authority }
      let userObj = { cat: "Task Owner", key: item.task_owner }
      let approverObj = { cat: "Approver", key: `${item.key_member} (${item.key_member_authority || "-"})`, key_member: item.key_member, authority: item.key_member_authority }
      if (item.authority != '-' && item.authority != null && tempArr.find((ele) => ele.key == roleObj.key) == undefined) {
        tempArr.push(roleObj)
      }
      if (item.task_owner != '-' && item.task_owner != null && tempArr.find((ele) => ele.key == userObj.key) == undefined) {
        tempArr.push(userObj)
      }
      if (item.key_member != '-' && item.key_member != null && tempArr.find((ele) => ele.key == approverObj.key) == undefined) {
        tempArr.push(approverObj)
      }
    })
    let PriorityFilterArr = [
      { cat: "Priority", key: "Low" },
      { cat: "Priority", key: "Medium" },
      { cat: "Priority", key: "High" }
    ]
    // new filters start
    let EvidencesFilter = [
      { cat: "Evidence", key: "None" },
      { cat: "Evidence", key: "Partial" },
      { cat: "Evidence", key: "All" }
    ]
    let CompliantStatFilter = [
      { cat: "Compliant Status", key: "Compliant" },
      { cat: "Compliant Status", key: "Not Compliant" },
    ]
    let FrequencyFilter = [
      { cat: "Frequency", key: "Annually" },
      { cat: "Frequency", key: "Bi-Annually" },
      { cat: "Frequency", key: "Quarterly" },
      { cat: "Frequency", key: "Monthly" },
      { cat: "Frequency", key: "Weekly" },
    ]
    let domainsFilter = []
    controlDomains && controlDomains.length && controlDomains.map((item, index, arr) => {
      let roleObj = { cat: "Domains", key: item.name, domain_id: item.id }
      domainsFilter.push(roleObj)
    })
    setTaskRoles(oldVal => {
      return [...tempArr]
    })
    // new filters end
    let objArr = [...domainsFilter, ...tempArr, ...PriorityFilterArr, ...EvidencesFilter, ...CompliantStatFilter, ...FrequencyFilter]
    objArr = [...new Map(objArr.map((item) => [item["key"], item])).values()];
    setTaskRoles(oldVal => {
      // return [...tempArr, ...PriorityFilterArr]
      return [...objArr]
    })
  }

  const changeRoleFilter = (filterArr = []) => {
    // if (filterArr.length == 0) {
    //   return false
    // }
    setCheckFilters(oldVal => {
      return [...filterArr]
    })
    let savedFilters = (GetCookie("tmf") && JSON.parse(GetCookie("tmf"))) || {}
    savedFilters[projectId] = filterArr
    SetCookie("tmf", JSON.stringify(savedFilters))
    let allTasks = [...tasks];
    let tmpPendingArr = [],
      tmpInProgressArr = [],
      tmpUnderReviewArr = [],
      tmpCompletedArr = [],
      tmpTimelineDates = [],
      tmpTasksByDates = [],
      filteredTasksArr = [];
    for (let task of allTasks) {
      let skipTask = filterSkipTask(task, filterArr)
      if (skipTask) {
        continue
      }
      task.date = ChangeDateFormat(task.due_date, 2, 3)
      if (task.task_status == "pending") {
        (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("pending")) && tmpPendingArr.push(task)
      } else if (task.task_status == "in_progress") {
        (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("in_progress")) && tmpInProgressArr.push(task)
      } else if (task.task_status == "review") {
        (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("review")) && tmpUnderReviewArr.push(task)
      } else if (task.task_status == "completed") {
        (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes("completed")) && tmpCompletedArr.push(task)
      }
      if (!tmpTimelineDates.includes(task.due_date)) {
        tmpTimelineDates.push(task.due_date)
      }

      if (!Object.keys(tmpTasksByDates).includes(task.due_date)) {
        tmpTasksByDates[task.due_date] = []
      }
      (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && tmpTasksByDates[task.due_date].push(task);
      (filterCardView.length == 0 || filterCardView.includes("all") || filterCardView.includes(task.task_status)) && filteredTasksArr.push(task)
    }

    setTasks(oldVal => {
      return [...allTasks]
    })
    if(viewType == "calender"){
      filteredTasksArr = filteredTasksArr.filter(task => task.task_status != "completed" || (task.task_status == "completed" && task.auditor_status != "compliant"))
    }
    setFilteredTasks(oldVal => {
      return [...filteredTasksArr]
    })
    setPendingTasks(tmpPendingArr)
    setInProgressTasks(tmpInProgressArr)
    setUnderReviewTasks(tmpUnderReviewArr)
    setCompletedTasks(tmpCompletedArr)
    settimelineDates(tmpTimelineDates)
    setTasksByDates(tmpTasksByDates)
    // setFilterByRole(role)


  }

  const filterSkipTask = (task = null, filterArr = []) => {
    let skipTask = false
    if (task == null) {
      return skipTask
    }
    let evidencesAdded = (task.evidence_added && task.evidence_added != "-" && Number(task.evidence_added.split('/')[0])) || 0
    let totalEvidences = (task.evidence_added && task.evidence_added != "-" && Number(task.evidence_added.split('/')[1])) || 0
    let taskEvidencesStat = evidencesAdded >= totalEvidences ? "all" : (evidencesAdded > 0 && evidencesAdded < totalEvidences ? "partial" : "none")
    let rolesFilter = [],
      usersFilter = [],
      priorityFilter = [],
      domainsFilter = [],
      approverFilter = [],
      evidenceFilter = [],
      compliantStatFilter = [],
      frequencyFilter = [];
    for (let filter of filterArr) {
      if (filter.cat.toLowerCase() == "authority") {
        rolesFilter.push(filter.key)
      }
      if (filter.cat.toLowerCase() == "task owner") {
        usersFilter.push(filter.key)
      }
      if (filter.cat.toLowerCase() == "priority") {
        priorityFilter.push(filter.key.toLowerCase())
      }
      if (filter.cat.toLowerCase() == "domains") {
        domainsFilter.push(filter.domain_id)
      }
      //new filters start
      if (filter.cat.toLowerCase() == "approver") {
        approverFilter.push(filter)
      }
      if (filter.cat.toLowerCase() == "evidence") {
        evidenceFilter.push(filter.key.toLowerCase())
      }
      if (filter.cat.toLowerCase() == "compliant status") {
        compliantStatFilter.push(filter.key.toLowerCase())
      }
      if (filter.cat.toLowerCase() == "frequency") {
        frequencyFilter.push(filter.key)
      }
      //new filters end
    }

    if (rolesFilter.length > 0 && !rolesFilter.includes(task.authority)) {
      skipTask = true
    }

    if (usersFilter.length > 0 && !usersFilter.includes(task.task_owner)) {
      skipTask = true
    }
    if (priorityFilter.length > 0 && !priorityFilter.includes(task.priority)) {
      skipTask = true
    }
    if (domainsFilter.length > 0 && !domainsFilter.includes(task.domain_id)) {
      skipTask = true
    }
    if (approverFilter.length > 0 && !approverFilter.find(item => item.key_member == task.key_member && item.authority == task.key_member_authority)) {
      skipTask = true
    }
    if (evidenceFilter.length > 0 && !evidenceFilter.includes(taskEvidencesStat)) {
      skipTask = true
    }
    if (compliantStatFilter.length > 0 && !compliantStatFilter.includes(task.auditor_status)) {
      skipTask = true
    }
    if (frequencyFilter.length > 0 && !frequencyFilter.includes(task.task_frequency)) {
      skipTask = true
    }

    let keyword = keywordRef?.current?.value
    let title = task.title ? (task.title).toLowerCase() : '';
    let description = task.description ? (task.description).toLowerCase() : '';
    let task_owner = task.task_owner ? (task.task_owner).toLowerCase() : '';
    let project_task_id = task.project_task_id ? (task.project_task_id).toString().toLowerCase() : '';
    let authority = task.authority ? (task.authority).toString().toLowerCase() : '';

    if (keyword) {
      if ((title).indexOf(keyword.toLowerCase()) == -1 &&
        (description).indexOf(keyword.toLowerCase()) == -1 &&
        (task_owner).indexOf(keyword.toLowerCase()) == -1 &&
        (authority).indexOf(keyword.toLowerCase()) == -1 &&
        (project_task_id.toString()).indexOf(keyword.toLowerCase()) == -1
      ) {
        skipTask = true
      }
    }
    return skipTask
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
      let obj = { type: "all_tasks" }
      fetchInfo(obj)
      setFrameworkCategories({})
      setShowAlert({ show: true, type: "success", message: AIR_MSG.create_task_success })
      return res
    } else {
      setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
    }
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

  return (
    <>
      {/* {true && <Loader showLoader={true} pos={'fixed'} lClass={"cus_loader_fixed_1"} ></Loader>} */}
      <Header />
      <div id="task_manager_sec" className="container-fluid">
        <div className="row">
          <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
            <div className="d-flex align-items-center ">
              <div className="mainSearchbar flex-fill">
                <div className="flex-grow-1">
                  {(() => {
                    if (!viewType['calender']) {
                      return (
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text bg-transparent border-0 srchInput"><img src="assets/img/gbl.gif" alt="" /></span>
                          </div>
                          <input type="text" name="" placeholder="Search Task" className="form-control border-0 pl-0" ref={keywordRef} onChangeCapture={() => searchTaskByKeyword()} />
                        </div>
                      )
                    }
                  })()}
                </div>


                {(() => {
                  if (!viewType["calender"] && accessRole != 'auditor') {
                    return (
                      <div className="Position-relative drpicker_block">
                        <DateRangePicker
                          initialSettings={{ startDate: startDate, endDate: endDate, ranges: selectionRange, showCustomRangeLabel: true, singleDatePicker: false }}
                          // onApply={() => fetchInfo(cardView)}
                          onApply={() => fetchInfo({ type: cardView },checkFilters)}
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
                          <div className="dropdown fdrp w150">
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
                                } else if (viewType["out_of_scope"]) {
                                  return "Out Of Scope"
                                } else if (viewType["audited"]) {
                                  return "Audited"
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
                {/* <div className={`col-auto`}>
                {(() => {
                  if (accessRole && accessRole != 'auditor' && isManagement == "Y") {
                    return (
                      <div className="min_w_auto w-auto max_w_auto">
                        <div className="userProfile">
                          <div className="position-relative">
                            <button type="button" className="border-0 bg-transparent" onClick={() => toggleFilterDropdown("air_multi_sel")}>
                              <span><i class="fa fa-filter"></i></span>
                            </button>
                            <Multiselect
                              id="air_multi_sel"
                              displayValue="key"
                              groupBy="cat"
                              onKeyPressFn={function noRefCheck() { }}
                              onRemove={(item) => changeRoleFilter(item)}
                              onSearch={function noRefCheck() { }}
                              onSelect={(item) => changeRoleFilter(item)}
                              className="custom_air_filter position-absolute"
                              options={taskRoles}
                              selectedValues={defSavedFilters[projectId]}
                              showCheckbox
                            />
                          </div>


                        </div>
                      </div>
                    )
                  }
                })()}
              </div> */}
                {/* <div className={`dotMenu ${isManagement === "N" ? 'px-3' : ''}`}>
                <img className="invisible" src="assets/img/gbl.gif" alt="" />
                {(() => {
                  if (isManagement === "Y") {
                    return (
                      <>
                        <div className="d-flex align-items-center justify-content-end">
                          <div className="text-right ml-1">

                            <DropdownButton
                              key={"primary"}
                              id={`dropdown-variants-${"primary"}`}
                              variant="primary-2 btn_05 max_w_auto fs-10 p-1"
                              title={"Import Evidences"}
                              drop={"down"}
                              align="end"
                              className="dropdown_toggle_custom1"
                            >
                              <Dropdown.Item eventKey="-1" onClick={() => loadAutoEvidences(-1)}>All</Dropdown.Item>
                              
                              {thirdPartyConnectors && thirdPartyConnectors.length > 0 && React.Children.toArray(thirdPartyConnectors.map((connector, coIndex) => {
                                return (
                                  <Dropdown.Item eventKey={connector.connector_id} onClick={() => loadAutoEvidences(connector.connector_id)}>{connector.name}</Dropdown.Item>
                                )
                              }))}



                            </DropdownButton>
                          </div>
                        </div>
                      </>
                    )
                  }
                })()}
              </div> */}
              </div>
              {(() => {
                if (accessRole && accessRole != 'auditor') {
                  return (
                    <AirFilter
                      id="air_multi_sel"
                      displayValue="key"
                      groupBy="cat"
                      onKeyPressFn={function noRefCheck() { }}
                      onRemove={(item) => changeRoleFilter(item)}
                      onSearch={function noRefCheck() { }}
                      onSelect={(item) => changeRoleFilter(item)}
                      className=""
                      options={taskRoles}
                      selectedValues={defSavedFilters[projectId] || []}
                      showCheckbox />
                  )
                }
              })()}
              {(() => {
                if (accessRole && accessRole != 'auditor') {
                  return (
                    <>
                      <div className={`col-auto p-0 pl-1`}>
                        <div className="">
                          <OverlayTrigger overlay={
                            <Tooltip id={`tooltip-top`}>
                              Out Of Scope Tasks
                            </Tooltip>
                          }
                            placement={"top"}>
                            <button className={`btn btn-primary-2 bg_color_2 w40 fs-10 p-1 mx-1 p-2`} onClick={(e) => changeView("out_of_scope")} ><img className="img-fluid" src="/assets/img/out_of_scope_icn.png" /></button>
                          </OverlayTrigger>

                        </div>
                      </div>
                    </>
                  )
                }
              })()}
              {(() => {
                if (accessRole && accessRole != 'auditor') {
                  return (
                    <>
                      <div className={`col-auto p-0 pl-1`}>
                        <div className="">
                          <OverlayTrigger overlay={
                            <Tooltip id={`tooltip-top`}>
                              Audited Tasks
                            </Tooltip>
                          }
                            placement={"top"}>
                            <button className={`btn btn-primary-2 bg_color_2 w40 fs-10 p-1 mx-1 p-2`} onClick={(e) => changeView("audited")} ><img className="img-fluid" src="/assets/img/audit_icn.jpg" /></button>
                          </OverlayTrigger>
                        </div>
                      </div>
                    </>
                  )
                }
              })()}
              {/* {(() => {
                if (accessRole && accessRole != 'auditor' && isManagement == "Y") {
                  return (
                    <div className={`tsk_manager_filter_section ml-2`}>
                      <div className="bg-white w-100 h-100">

                        <div className="min_w_auto w-auto max_w_auto">
                          <div className="userProfile text-center">
                            <div className="position-relative w-100 fs-18 mt-1">
                              <button type="button" className="border-0 bg-transparent h35 w-100" onClick={() => toggleFilterDropdown("air_multi_sel")}>
                                <span><i class="fa fa-filter"></i></span>
                              </button>
                              <Multiselect
                                id="air_multi_sel"
                                displayValue="key"
                                groupBy="cat"
                                onKeyPressFn={function noRefCheck() { }}
                                onRemove={(item) => changeRoleFilter(item)}
                                onSearch={function noRefCheck() { }}
                                onSelect={(item) => changeRoleFilter(item)}
                                className="custom_air_filter position-absolute fs-13"
                                options={taskRoles}
                                selectedValues={defSavedFilters[projectId]}
                                showCheckbox
                              />
                            </div>


                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
              })()} */}

            </div>

            {(() => {
              if (accessRole != 'auditor') {
                if (viewType["board"]) {
                  return (
                    <>
                      <div className="gridcontainer">
                        <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
                          <div className="grid_item">
                            <div className="card">
                              <div className="card-header d-flex justify-content-between align-items-center">
                                <h4><span className="badge badge-danger">Open ({pendingTasks && pendingTasks.length > 0 ? pendingTasks.length : 0})</span> </h4>
                                <div className="d-flex">

                                  {(() => {
                                    if (isManagement === "Y") {
                                      return (
                                        <>
                                          <div className="text-right">
                                            <OverlayTrigger
                                              placement={"top"}
                                              overlay={
                                                <Tooltip id={`tooltip-top`}>
                                                  Add new task
                                                </Tooltip>
                                              }
                                            >
                                              <a className="info btn_03" onClick={() => showModal('add_new_task')}> <img src="/assets/img/plus.svg" alt="" className="plus" /> </a>
                                            </OverlayTrigger>
                                          </div>
                                        </>
                                      )
                                    }
                                  })()}
                                </div>


                              </div>
                              <Droppable key="pending" droppableId="pending" isDropDisabled={true}>
                                {(provided, snapshot) => (
                                  <div className={`card-body ${isManagement === "Y" ? "task_can_manage" : ""}`} ref={provided.innerRef} {...provided.droppableProps}>
                                    {pendingTasks && pendingTasks.length > 0 && pendingTasks.map((p_task, pIndex) => {
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
                                              <div className={`gridboxbody link_url ${p_task.overdue == "Y" ? "bg_12" : ""}`} onClick={() => goToUrl("task_details", p_task)}>
                                                <h4 className="d-flex">{p_task.title}</h4>
                                                <p><i className="fa fa-tasks"></i><span>Evidence Attached : {p_task.evidence_added}</span> </p>
                                                <p><i className="fa fa-calendar"></i><span className={`${p_task.highlight_due_date == 'Y' ? 'text-danger font-weight-bold' : ''}`}>{p_task.due_date}</span> </p>
                                                {(() => {
                                                  if (p_task.auditor_status != 'NA') {
                                                    return (
                                                      <p>
                                                        <i className="fa fa-tasks" aria-hidden="true"></i>
                                                        <span>
                                                          Compliant Status
                                                          {
                                                            p_task.auditor_status && p_task.auditor_status == 'compliant'
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
                                                <div>
                                                  <label className={`m-0 badge badge-pill badge-${p_task.priority.toLowerCase() == 'low' ? 'success' : (p_task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{p_task.priority.toUpperCase()}</label>
                                                </div>
                                                <div className="d-flex align-items-center ">
                                                  {p_task.admin_status == "rejected" &&
                                                    <OverlayTrigger overlay={
                                                      <Tooltip id={`tooltip-top`}>
                                                        Rejected
                                                      </Tooltip>
                                                    }
                                                      placement={"top"}>
                                                      <p className="mr-2 position-relative d-inline-block m-0 w20 rejected_icn"><i className="fa fa-file-text-o fs-16 mt-1 text-dark"></i> <i className="fa fa-times fw-200 fs-9 position-absolute"></i></p>
                                                    </OverlayTrigger>
                                                  }
                                                  <AIrInitials str={p_task.task_frequency.toLowerCase() == "bi-annually" ? "half-yearly" : p_task.task_frequency} AiClass={'mr-2'} bgClass={`bg_13`} showToolTip={`${p_task.task_frequency}`} />
                                                  <OverlayTrigger overlay={
                                                    <Tooltip id={`tooltip-top`}>
                                                      Quick View
                                                    </Tooltip>
                                                  }
                                                    placement={"top"}>
                                                    <p className="m-0 mr-3 link_url" onClick={() => getTaskDetails(p_task.project_task_id)}><img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon ml-2" /></p>
                                                  </OverlayTrigger>
                                                  <OverlayTrigger overlay={
                                                    <Tooltip id={`tooltip-top`}>
                                                      {p_task.task_owner && p_task.task_owner.length > 0 && p_task.task_owner != '-' ? `${p_task.task_owner} (${p_task.authority ? p_task.authority : '-'})` : "Not Assigned"}
                                                    </Tooltip>
                                                  }
                                                    placement={"top"}>
                                                    {p_task.task_owner && p_task.task_owner.length > 0 && p_task.task_owner != '-'
                                                      ? <span className="air_initials m-0" > <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(p_task.task_owner)}</span></span>
                                                      : <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a>
                                                    }
                                                  </OverlayTrigger>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      )
                                    })}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                          {/* <div className="grid_item">
                            <div className="card">
                              <div className="card-header">
                                <h4><span className="badge badge-warning">In Progress ({inProgresstasks && inProgresstasks.length > 0 ? inProgresstasks.length : 0})</span> </h4>
                              </div>
                              <Droppable key="in_progress" droppableId="in_progress" isDropDisabled={true}>
                                {(provided, snapshot) => (
                                  <div className={`card-body ${isManagement === "Y" ? "task_can_manage" : ""}`} ref={provided.innerRef} {...provided.droppableProps}>
                                    {inProgresstasks && inProgresstasks.length > 0 && inProgresstasks.map((ip_task, pIndex) => {
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
                                              <div className="gridboxbody link_url" onClick={() => goToUrl("task_details", ip_task)}>
                                                <h4>{ip_task.title}</h4>
                                                <p><i className="fa fa-tasks"></i><span>Evidence Attached : {ip_task.evidence_added}</span> </p>
                                                <p><i className="fa fa-calendar"></i><span className={`${ip_task.highlight_due_date == 'Y' ? 'text-danger font-weight-bold' : ''}`}>{ip_task.due_date}</span> </p>
                                                {(() => {
                                                  if (ip_task.auditor_status != 'NA') {
                                                    return (
                                                      <p>
                                                        <i className="fa fa-tasks" aria-hidden="true"></i>
                                                        <span>
                                                          Compliant Status
                                                          {
                                                            ip_task.auditor_status && ip_task.auditor_status == 'compliant'
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
                                                <div>
                                                  <label className={`m-0 badge badge-pill badge-${ip_task.priority.toLowerCase() == 'low' ? 'success' : (ip_task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{ip_task.priority.toUpperCase()}</label>
                                                </div>
                                                <div className="d-flex align-items-center ">
                                                  <OverlayTrigger overlay={
                                                    <Tooltip id={`tooltip-top`}>
                                                      Quick View
                                                    </Tooltip>
                                                  }
                                                    placement={"top"}>
                                                    <p className="m-0 mr-3 link_url" onClick={() => getTaskDetails(ip_task.project_task_id)}><img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon ml-2" /></p>
                                                  </OverlayTrigger>
                                                  <OverlayTrigger overlay={
                                                    <Tooltip id={`tooltip-top`}>
                                                      {ip_task.task_owner && ip_task.task_owner.length > 0 && ip_task.task_owner != '-' ? `${ip_task.task_owner} (${ip_task.authority ? ip_task.authority : '-'})` : "Not Assigned"}
                                                    </Tooltip>
                                                  }
                                                    placement={"top"}>
                                                    {ip_task.task_owner && ip_task.task_owner.length > 0 && ip_task.task_owner != '-'
                                                      ? <span className="air_initials m-0" > <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(ip_task.task_owner)}</span></span>
                                                      : <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a>
                                                    }
                                                  </OverlayTrigger>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      )
                                    })}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div> */}
                          <div className="grid_item">
                            <div className="card">
                              <div className="card-header">
                                {/* <h4>Under Review ({underReviewtasks && underReviewtasks.length > 0 ? underReviewtasks.length : 0})</h4> */}
                                <h4><span className="badge badge-primary">Under Review ({underReviewtasks && underReviewtasks.length > 0 ? underReviewtasks.length : 0})</span> </h4>
                              </div>
                              <Droppable key="review" droppableId="review" isDropDisabled={true}>
                                {(provided, snapshot) => (
                                  <div className={`card-body ${isManagement === "Y" ? "task_can_manage" : ""}`} ref={provided.innerRef} {...provided.droppableProps}>
                                    {underReviewtasks && underReviewtasks.length > 0 && underReviewtasks.map((ur_task, pIndex) => {
                                      return (
                                        <Draggable
                                          key={`${ur_task.project_task_id}_${pIndex}`}
                                          draggableId={`${ur_task.project_task_id.toString()}__${pIndex}`}
                                          index={pIndex}
                                        >
                                          {(provided, snapshot) => (
                                            <div className="gridBox"
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
                                              <div className={`gridboxbody link_url ${ur_task.overdue == "Y" ? "bg_12" : ""}`} onClick={() => goToUrl("task_details", ur_task)}>
                                                <h4>{ur_task.title}</h4>
                                                {/* <p>
                                                  <img src="assets/img/gbl.gif" alt="folder" />
                                                  <span>{ur_task.description}</span>
                                                  <label className={`m-0 badge badge-pill badge-${ur_task.priority.toLowerCase() == 'low' ? 'success' : (ur_task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{ur_task.priority.toUpperCase()}</label>
                                                </p>
                                                <p><img src="assets/img/gbl.gif" alt="date" /><span>Created {ur_task.created_at}</span> </p> */}
                                                <p><i className="fa fa-tasks"></i><span>Evidence Attached : {ur_task.evidence_added}</span> </p>
                                                <p><i className="fa fa-calendar"></i><span className={`${ur_task.highlight_due_date == 'Y' ? 'text-danger font-weight-bold' : ''}`}>{ur_task.due_date}</span> </p>
                                                {(() => {
                                                  if (ur_task.auditor_status != 'NA') {
                                                    return (
                                                      <p>
                                                        <i className="fa fa-tasks" aria-hidden="true"></i>
                                                        <span>
                                                          Compliant Status
                                                          {
                                                            ur_task.auditor_status && ur_task.auditor_status == 'compliant'
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
                                                <div>
                                                  <label className={`m-0 badge badge-pill badge-${ur_task.priority.toLowerCase() == 'low' ? 'success' : (ur_task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{ur_task.priority.toUpperCase()}</label>
                                                </div>
                                                <div className="d-flex align-items-center ">
                                                  <AIrInitials str={ur_task.task_frequency.toLowerCase() == "bi-annually" ? "half-yearly" : ur_task.task_frequency} AiClass={'mr-2'} bgClass={`bg_13`} showToolTip={`${ur_task.task_frequency}`} />
                                                  <OverlayTrigger overlay={
                                                    <Tooltip id={`tooltip-top`}>
                                                      Quick View
                                                    </Tooltip>
                                                  }
                                                    placement={"top"}>
                                                    {/* <p className="link_url " onClick={() => getTaskDetails(ur_task.project_task_id)}>{filterStr(ur_task.project_task_id, "v_", "")} <img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon ml-2" /></p> */}

                                                    <p className="m-0 mr-3 link_url" onClick={() => getTaskDetails(ur_task.project_task_id)}><img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon ml-2" /></p>
                                                  </OverlayTrigger>
                                                  <OverlayTrigger overlay={
                                                    <Tooltip id={`tooltip-top`}>
                                                      {ur_task.task_owner && ur_task.task_owner.length > 0 && ur_task.task_owner != '-' ? `${ur_task.task_owner} (${ur_task.authority ? ur_task.authority : '-'})` : "Not Assigned"}
                                                    </Tooltip>
                                                  }
                                                    placement={"top"}>
                                                    {ur_task.task_owner && ur_task.task_owner.length > 0 && ur_task.task_owner != '-'
                                                      ? <span className="air_initials m-0" > <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(ur_task.task_owner)}</span></span>
                                                      : <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a>
                                                    }
                                                  </OverlayTrigger>
                                                </div>

                                                {/* <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a> */}
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      )
                                    })}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </div>
                          <div className="grid_item">
                            <div className="card">
                              <div className="card-header">
                                {/* <h4>Completed ({completedtasks && completedtasks.length > 0 ? completedtasks.length : 0})</h4> */}
                                <h4><span className="badge badge-success">Completed ({completedtasks && completedtasks.length > 0 ? completedtasks.filter(task => task.task_status == "completed" && task.auditor_status != 'compliant').length : 0})</span> </h4>
                              </div>
                              {/* <Droppable key="completed" droppableId="completed" isDropDisabled={dropDisabled == "completed" || false}> */}
                              <Droppable key="completed" droppableId="completed" isDropDisabled={true}>
                                {(provided, snapshot) => (
                                  <div className={`card-body ${isManagement === "Y" ? "task_can_manage" : ""}`} ref={provided.innerRef} {...provided.droppableProps}>
                                    {completedtasks && completedtasks.length > 0 && completedtasks.map((c_task, pIndex) => {
                                      if (c_task.task_status == "completed" && c_task.auditor_status != "compliant") {
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
                                                <div className={`gridboxbody link_url ${c_task.overdue == "Y" ? "bg_12" : ""}`} onClick={() => goToUrl("task_details", c_task)}>
                                                  <h4>{c_task.title}</h4>
                                                  {/* <p>
                                                  <img src="assets/img/gbl.gif" alt="folder" />
                                                  <span>{c_task.description}</span>
                                                  <label className={`m-0 badge badge-pill badge-${c_task.priority.toLowerCase() == 'low' ? 'success' : (c_task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{c_task.priority.toUpperCase()}</label>
                                                </p>
                                                <p><img src="assets/img/gbl.gif" alt="date" /><span>Created {c_task.created_at}</span> </p> */}
                                                  <p><i className="fa fa-tasks"></i><span>Evidence Attached : {c_task.evidence_added}</span> </p>
                                                  <p><i className="fa fa-calendar"></i><span className={`${c_task.highlight_due_date == 'Y' ? 'text-danger font-weight-bold' : ''}`}>{c_task.due_date}</span> </p>
                                                  {(() => {
                                                    if (c_task.auditor_status != 'NA') {
                                                      return (
                                                        <p>
                                                          <i className="fa fa-tasks" aria-hidden="true"></i>
                                                          <span>
                                                            Compliant Status
                                                            {
                                                              c_task.auditor_status && c_task.auditor_status == 'compliant'
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
                                                  <div>
                                                    <label className={`m-0 badge badge-pill badge-${c_task.priority.toLowerCase() == 'low' ? 'success' : (c_task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{c_task.priority.toUpperCase()}</label>
                                                  </div>
                                                  <div className="d-flex align-items-center ">
                                                    <AIrInitials str={c_task.task_frequency.toLowerCase() == "bi-annually" ? "half-yearly" : c_task.task_frequency} AiClass={'mr-2'} bgClass={`bg_13`} showToolTip={`${c_task.task_frequency}`} />
                                                    <OverlayTrigger overlay={
                                                      <Tooltip id={`tooltip-top`}>
                                                        Quick View
                                                      </Tooltip>
                                                    }
                                                      placement={"top"}>
                                                      {/* <p className="link_url " onClick={() => getTaskDetails(c_task.project_task_id)}>{filterStr(c_task.project_task_id, "v_", "")} <img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon ml-2" /></p> */}

                                                      <p className="m-0 mr-3 link_url" onClick={() => getTaskDetails(c_task.project_task_id)}><img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon ml-2" /></p>
                                                    </OverlayTrigger>
                                                    <OverlayTrigger overlay={
                                                      <Tooltip id={`tooltip-top`}>
                                                        {c_task.task_owner && c_task.task_owner.length > 0 && c_task.task_owner != '-' ? `${c_task.task_owner} (${c_task.authority ? c_task.authority : '-'})` : "Not Assigned"}
                                                      </Tooltip>
                                                    }
                                                      placement={"top"}>
                                                      {c_task.task_owner && c_task.task_owner.length > 0 && c_task.task_owner != '-'
                                                        ? <span className="air_initials m-0" > <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(c_task.task_owner)}</span></span>
                                                        : <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a>
                                                      }
                                                    </OverlayTrigger>
                                                  </div>

                                                  {/* <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a> */}
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        )
                                      }

                                    })}
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
                            <li className={`page-item ${filterCardView.length == 0 || filterCardView.includes("all") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('all')} className="page-link">All Tasks</a></li>
                            <li className={`page-item ${filterCardView.includes("pending") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('pending')} className="page-link">Open</a></li>
                            {/* <li className={`page-item ${filterCardView.includes("in_progress") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('in_progress')} className="page-link">In Progress</a></li> */}
                            <li className={`page-item ${filterCardView.includes("review") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('review')} className="page-link">Under Review</a></li>
                            <li className={`page-item ${filterCardView.includes("completed") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('completed')} className="page-link">Completed</a></li>
                          </ul>
                        </div>
                      </div>
                      <div className={`gridcontainer card_container ${isManagement === "Y" ? "task_can_manage" : ""}`}>
                        <div className="grid_item">
                          <div className="card">
                            {/* <div className="card-body d-flex flex-wrap w-100"> */}
                            <div className="card-body">
                              {tasks && tasks.length > 0 &&
                                <>
                                  {[...pendingTasks, ...inProgresstasks, ...underReviewtasks, ...completedtasks] && [...pendingTasks, ...inProgresstasks, ...underReviewtasks, ...completedtasks].length > 0 && [...pendingTasks, ...inProgresstasks, ...underReviewtasks, ...completedtasks].map((task, tIndex) => {
                                    if (task.task_status != "completed" || (task.task_status == "completed" && task.auditor_status != "compliant")) {
                                      return (
                                        <div className="">
                                          <div key={tIndex} className={`gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                            {/* <div className="gridboxbody link_url" onClick={() => navigate(`/task-details/${encryptData(task.project_task_id)}`)}> */}
                                            <div className={`gridboxbody link_url ${task.overdue == "Y" ? "bg_12" : ""}`} onClick={() => goToUrl("task_details", task)}>
                                              <h4 className="h35">{task.title}</h4>
                                              <a className="my-2" href="#">{task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a>
                                              <p><i className="fa fa-tasks"></i>&nbsp;&nbsp;&nbsp;<span>Evidence Attached : {task.evidence_added}</span> </p>
                                              <p><i className="fa fa-calendar"></i>&nbsp;&nbsp;&nbsp;<span className={`${task.highlight_due_date == 'Y' ? 'text-danger font-weight-bold' : ''}`}>{task.due_date}</span> </p>
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
                                                } else {
                                                  return <p className="h20"></p>
                                                }
                                              })()}
                                            </div>
                                            <div className="gridboxfooter">
                                              <div>
                                                <label className={`m-0 badge badge-pill badge-${task.priority.toLowerCase() == 'low' ? 'success' : (task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} ml-auto`}>{task.priority.toUpperCase()}</label>
                                              </div>
                                              <div className="d-flex align-items-center ">
                                                {task.admin_status == "rejected" &&
                                                  <OverlayTrigger overlay={
                                                    <Tooltip id={`tooltip-top`}>
                                                      Rejected
                                                    </Tooltip>
                                                  }
                                                    placement={"top"}>
                                                    <p className="mr-2 position-relative d-inline-block m-0 w20 rejected_icn"><i className="fa fa-file-text-o fs-16 mt-1 text-dark"></i> <i className="fa fa-times fw-200 fs-9 position-absolute"></i></p>
                                                  </OverlayTrigger>
                                                }
                                                <AIrInitials str={task.task_frequency.toLowerCase() == "bi-annually" ? "half-yearly" : task.task_frequency} AiClass={'mr-2'} bgClass={`bg_13`} showToolTip={`${task.task_frequency}`} />
                                                <OverlayTrigger overlay={
                                                  <Tooltip id={`tooltip-top`}>
                                                    Quick View
                                                  </Tooltip>
                                                }
                                                  placement={"top"}>
                                                  {/* <p className="link_url " onClick={() => getTaskDetails(task.project_task_id)}>{filterStr(task.project_task_id, "v_", "")} <img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon ml-2" /></p> */}

                                                  <p className="m-0 mr-3 link_url " onClick={() => getTaskDetails(task.project_task_id)}><img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon ml-2" /></p>
                                                </OverlayTrigger>
                                                <OverlayTrigger overlay={
                                                  <Tooltip id={`tooltip-top`}>
                                                    {task.task_owner && task.task_owner.length > 0 && task.task_owner != '-' ? `${task.task_owner} (${task.authority ? task.authority : '-'})` : "Not Assigned"}
                                                  </Tooltip>
                                                }
                                                  placement={"top"}>
                                                  {task.task_owner && task.task_owner.length > 0 && task.task_owner != '-'
                                                    ? <span className="air_initials m-0" > <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(task.task_owner)}</span></span>
                                                    : <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a>
                                                  }
                                                </OverlayTrigger>
                                              </div>

                                              {/* <a href="#" className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a> */}
                                            </div>

                                          </div>
                                        </div>
                                      )
                                    }

                                  })}
                                </>
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
                            <li className={`page-item ${filterCardView.length == 0 || filterCardView.includes("all") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('all')} className="page-link">All Tasks</a></li>
                            <li className={`page-item ${filterCardView.includes("pending") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('pending')} className="page-link">Open</a></li>
                            {/* <li className={`page-item ${filterCardView.includes("in_progress") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('in_progress')} className="page-link">In Progress</a></li> */}
                            <li className={`page-item ${filterCardView.includes("review") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('review')} className="page-link">Under Review</a></li>
                            <li className={`page-item ${filterCardView.includes("completed") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('completed')} className="page-link">Completed</a></li>
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
                                    if (task.task_status != "completed" || (task.task_status == "completed" && task.auditor_status != "compliant")) {
                                      return (
                                        // <div key={tIndex} onClick={() => navigate(`/task-details/${encryptData(task.project_task_id)}`)} className={`link_url gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                        <div key={tIndex} onClick={() => goToUrl("task_details", task)} className={`link_url gridBox ${task.overdue == "Y" ? "bg_12" : ""} ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                          <div className="gridboxbody">
                                            <div className="col p-0">
                                              {/* <p>{task.project_task_id}</p> */}
                                              {/* <p className="w100">{filterStr(task.project_task_id, "v_", "")}</p> */}
                                              <h4 className="col p-0">{task.title}</h4>
                                            </div>
                                            <p className="w60">{/* <img src="/assets/img/gbl.gif" alt="folder" height="1" width="1" /> <span>{task.description}</span> */}<label className={`m-0 badge badge-pill badge-${task.priority.toLowerCase() == 'low' ? 'success' : (task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')}`}>{task.priority.toUpperCase()}</label></p>
                                            {/* <p className="w100"> <a href="" className="statusClr">{task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p> */}
                                            <p className="w100"> <a href="" className={`statusClr ${task.task_status == "out_of_scope" ? 'bg_06' : ''}`}>{task.task_status == "pending" ? 'Open' : (task.task_status == "out_of_scope" ? 'Out Of Scope' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>

                                            <p className="position-relative d-inline-block m-0 w20 rejected_icn min_w_auto pb-1">
                                              {task.admin_status == "rejected" &&
                                                <OverlayTrigger
                                                  placement={"top"}
                                                  overlay={
                                                    <Tooltip id={`tooltip-top`}>
                                                      Rejected
                                                    </Tooltip>
                                                  }
                                                >
                                                  <p className="m-0"><i className="fa fa-file-text-o fs-16 mt-1 text-dark"></i> <i className="fa fa-times fw-200 fs-9 position-absolute"></i></p>
                                                </OverlayTrigger>

                                              }
                                            </p>

                                            <p className="col-auto w40 p-0 min_w_auto">
                                              <AIrInitials str={task.task_frequency.toLowerCase() == "bi-annually" ? "half-yearly" : task.task_frequency} AiClass={'ml-auto'} bgClass={`bg_13`} showToolTip={`${task.task_frequency}`} />
                                            </p>
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
                                              <OverlayTrigger
                                                placement={"top"}
                                                overlay={
                                                  <Tooltip id={`tooltip-top`}>
                                                    Quick View
                                                  </Tooltip>
                                                }
                                              >
                                                <p
                                                  className="m-0 pl-1 text-dark link_url "
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    getTaskDetails(task.project_task_id);
                                                  }}
                                                >
                                                  {/* <i className="pl-2 fa fa-eye"></i> */}
                                                  <span className=""><img className="img-fluid quick_view_icon" src="/assets/img/quick_view.png" /></span>
                                                </p>
                                              </OverlayTrigger>
                                            </p>
                                          </div>
                                        </div>
                                      )
                                    }
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
                            <li className={`page-item ${filterCardView.length == 0 || filterCardView.includes("all") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('all')} className="page-link">All Tasks</a></li>
                            <li className={`page-item ${filterCardView.includes("pending") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('pending')} className="page-link">Open</a></li>
                            {/* <li className={`page-item ${filterCardView.includes("in_progress") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('in_progress')} className="page-link">In Progress</a></li> */}
                            <li className={`page-item ${filterCardView.includes("review") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('review')} className="page-link">Under Review</a></li>
                            <li className={`page-item ${filterCardView.includes("completed") ? 'active' : ''}`}><a onClick={() => changeCardViewfilter('completed')} className="page-link">Completed</a></li>
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
                                events={filteredTasks}
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
                } else if (viewType["out_of_scope"]) {
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
                                        Out Of Scope Tasks
                                      </h4>
                                    </div>
                                    <div className="card-body">
                                      {filteredTasks && filteredTasks.length > 0 && filteredTasks.map((task, tIndex) => {
                                        if (task.task_status == "out_of_scope") {
                                          return (
                                            <div key={tIndex} onClick={() => goToUrl("task_details", task)} className={`link_url gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                              <div className="gridboxbody">
                                                <div className="col p-0">
                                                  <p className="w100">{task.project_task_id}</p>
                                                  <h4 className="col p-0">{task.title}</h4>
                                                </div>
                                                <p className="w60"><label className={`m-0 badge badge-pill badge-${task.priority.toLowerCase() == 'low' ? 'success' : (task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} mr-auto`}>{task.priority.toUpperCase()}</label></p>
                                                <p className="w100">
                                                  {task.auditor_status == "NA" ? "" : task.auditor_status == "not_compliant" ? "Not Compliant" : "Compliant"}
                                                </p>
                                                <p className="w100"> <a href="" className="statusClr bg_06">{task.task_status == "pending" ? 'Open' : (task.task_status == "out_of_scope" ? 'Out Of Scope' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>
                                                <p className="col-auto w40 p-0 min_w_auto">
                                                  <AIrInitials str={task.task_frequency.toLowerCase() == "bi-annually" ? "half-yearly" : task.task_frequency} AiClass={'ml-auto'} bgClass={`bg_13`} showToolTip={`${task.task_frequency}`} />
                                                </p>
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
                                                </p>
                                              </div>
                                            </div>
                                          )
                                        }


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
                } else if (viewType["audited"]) {
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
                                        Audited Tasks
                                      </h4>
                                    </div>
                                    <div className="card-body">
                                      {filteredTasks && filteredTasks.length > 0 && filteredTasks.map((task, tIndex) => {
                                        if (task.task_status == "completed" && task.auditor_status == "compliant") {
                                          return (
                                            <div key={tIndex} onClick={() => goToUrl("task_details", task)} className={`link_url gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                              <div className="gridboxbody">
                                                <div className="col p-0">
                                                  <p className="w100">{task.project_task_id}</p>
                                                  <h4 className="col p-0">{task.title}</h4>
                                                </div>
                                                <p className="w60"><label className={`m-0 badge badge-pill badge-${task.priority.toLowerCase() == 'low' ? 'success' : (task.priority.toLowerCase() == 'medium' ? 'warning' : 'danger')} mr-auto`}>{task.priority.toUpperCase()}</label></p>
                                                <p className="w100">
                                                  {task.auditor_status == "NA" ? "Pending" : task.auditor_status == "not_compliant" ? "Not Compliant" : "Compliant"}
                                                </p>
                                                <p className="w100"> <a href="" className="statusClr">{task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>
                                                <p className="col-auto w40 p-0 min_w_auto">
                                                  <AIrInitials str={task.task_frequency.toLowerCase() == "bi-annually" ? "half-yearly" : task.task_frequency} AiClass={'ml-auto'} bgClass={`bg_13`} showToolTip={`${task.task_frequency}`} />
                                                </p>
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
                                                </p>
                                              </div>
                                            </div>
                                          )
                                        }


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
              AmclassName={(viewType["board"] || viewType["card"]) && taskDetails.task[0].task_status}
              formSubmit={() => { }} />
          }
          if (modalType == 'add_new_task') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              modalData={{ dueDateExpressions, getDueDateExpressions, controlCategories, controlCriterias, controlDomains, frameworks, frameworkCategories, getFrameWorkControlCategories }}
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
              customClassName={'air_alert'}
              timeout={3000}
            />
          )
        }
      })()}

    </>
  )
}

export default TaskManager