import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie, FormatDate, sortArr, encryptData } from "../helpers/Helper";
import { useNavigate } from "react-router-dom";
import Header from "../components/partials/Header";
import React, { lazy, useContext, useEffect, useRef, useState } from "react";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import AirModal from "../elements/AirModal";
import DateRangePicker from "react-bootstrap-daterangepicker";
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from "moment";
import SweetAlert from "react-bootstrap-sweetalert";
import AirPagination from "../elements/AirPagination";
import { Dropdown, DropdownButton } from "react-bootstrap";
import AIR_MSG from "../helpers/AirMsgs";
import AirSelect from "../elements/AirSelect";
import Styles from "../styles/EvidenceManager.module.css"

// const LayoutContext = lazy(() => import("../ContextProviders/LayoutContext"))

const EvidenceManager = (props) => {
  const { projectId = null, user = null } = useContext(LayoutContext)
  const { access_role: accessRole = null, is_management: isManagement = '' } = user?.currentUser;
  const navigate = useNavigate()
  const [domains, setDomains] = useState([])
  const [selectedDomain, setSelDomain] = useState(-1)
  const [evidences, setEvidences] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [viewFileDetails, setViewFileDetails] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [evidenceSelected, setEvidenceSelected] = useState([]);

  const [viewFile, setViewFile] = useState(null)
  const [fileType, setFileType] = useState(null)
  const [taskDetails, setTaskDetails] = useState({})
  const [activeDomainId, setActiveDomainId] = useState(-1)
  const [activeDomainIndex, setActiveDomainIndex] = useState(-1)
  const [formSubmitted, setFormSbmt] = useState(false)
  const [thirdPartyConnectors, setThirdPartyConnectors] = useState([]);
  // const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const keywordRef = useRef();
  const dateRef = useRef();

  let paginateObj = {
    totalPages: 10,
    currentPage: 1,
    showAllPages: false,
    showPrevNextBtn: true,
    disablePages: [],
    itemsLimit: 20
  }
  const [paginate, setPaginate] = useState(paginateObj)

  /* const now = new Date()
  const numDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  let stDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  // stDate = `${stDate.getFullYear()}-${('00' + stDate.getMonth()).slice(-2)}-${('00' + stDate.getDate()).slice(-2)}`
  stDate = `${stDate.getFullYear()}-${('0001').slice(-2)}-${('0001').slice(-2)}`
  const startDate = FormatDate(null, stDate, 1)
  let edDate = new Date(now.getFullYear(), now.getMonth() + 1, numDays)
  // edDate = `${edDate.getFullYear()}-${('00' + edDate.getMonth()).slice(-2)}-${('00' + edDate.getDate()).slice(-2)}`
  edDate = `${edDate.getFullYear()}-${('0012').slice(-2)}-${('0031').slice(-2)}`
  const endDate = FormatDate(null, edDate, 1) */
  const startDate = moment().startOf('year')
  const endDate = moment().endOf('year')

  // const selectionRange = {
  //   'Today': [moment(), moment()],
  //   'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
  //   'Last 7 Days': [moment().subtract(6, 'days'), moment()],
  //   'Last 30 Days': [moment().subtract(29, 'days'), moment()],
  //   'This Month': [moment().startOf('month'), moment().endOf('month')],
  //   'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  // }
  const selectionRange = {
    'Today': [moment(), moment()],
    'Tomorrow': [moment().add(1, 'days'), moment().add(1, 'days')],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'This Week': [moment().startOf('isoWeek'), moment().endOf('isoWeek')],
    'Next Week': [moment().add(1, 'weeks').startOf('isoWeek'), moment().add(1, 'weeks').endOf('isoWeek')],
    'Previous Week': [moment().subtract(1, 'weeks').startOf('isoWeek'), moment().subtract(1, 'weeks').endOf('isoWeek')],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Next Month': [moment().add(1, 'month').startOf('month'), moment().add(1, 'month').endOf('month')],
    'Previous Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
  }
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })

  // sorting data
  const [activeCol, setActiveCol] = useState('')
  const [activeSortOrder, setActiveSortOrder] = useState('ASC')


  useEffect(() => {
    if (domains.length == 0 && projectId != null) {
      getDomains()
    }
    if (thirdPartyConnectors.length == 0 && projectId != null) {
      getThirdPartyCOnnectors();
    }
  }, [projectId])

  const refreshpage = async ()=>{
    window.location.reload(false);
    
  }

  const getDomains = async () => {
    let payloadUrl = `reference/getControlDomains`
    let method = "GET";
    let formData = {};

    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      let domainsArr = res.results
      if (domainsArr.length > 0) {
        let defaultDomainData = { id: -1, name: "All Domains", status: "A" }
        domainsArr.unshift(defaultDomainData)
        setDomains(oldVal => {
          return [...domainsArr]
        })
        if (evidences.length == 0) {
          getEvidences(-1, -1)
        }
      }

    }
  }
  const getEvidences = async (domainId = 0, dIndex = 0) => {

    let keyword = keywordRef && keywordRef?.current?.value ? keywordRef.current.value : '-1';
    let searchDateRange = dateRef.current ? dateRef.current : -1;
    let searchDateArr = searchDateRange != -1 ? searchDateRange.split('|') : []
    if (domainId == 0) {
      return false
    }
    let payloadUrl = `evidences/listEvidences`
    // let payloadUrl = `evidences/listEvidences/${projectId}/${domainId}`
    let method = "POST";
    let formData = {
      project_id: projectId,
      domain_id: domainId,
      keyword: keyword,
      start_date: searchDateArr.length > 0 ? searchDateArr[0] : moment(selectionRange["This Month"][0], 'MM/DD/YYYY').format('YYYY-MM-DD'),
      end_date: searchDateArr.length > 0 ? searchDateArr[1] : moment(selectionRange["This Month"][1], 'MM/DD/YYYY').format('YYYY-MM-DD'),
    };

    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      setEvidences(oldVal => {
        return [...res.results]
      })
      setActiveDomainId(domainId)
      setSelDomain(dIndex)
      // set pagination data

      let paginateObj = { ...paginate }
      paginateObj.totalPages = Math.ceil(res.results.length / paginateObj.itemsLimit);
      paginateObj.currentPage = 1;
      setPaginate(oldVal => {
        return { ...paginateObj }
      })
      let fList = res.results.slice(0, paginate.itemsLimit)
      setFilteredList(oldVal => {
        return [...fList]
      })
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

  const downloadFile = async (event, data = null) => {
    event.stopPropagation()
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
          let url = window.URL.createObjectURL(blob)
          // window.open(url,'_blank')

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
        } else {
          // let jres = await jsonResponse.json();
          // return {status:false,message:jres.message}
        }
      }
    }
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
      // showModal('view_task_details')
      if (task) {
        navigate(`/task-details/${encryptData(JSON.stringify({ taskId: task[0]?.task_id, dueDate: task[0]?.due_date, isVirtual: task[0]?.is_virtual }))}`)
      }

      // fetchInfo("all_tasks",res.accounts_and_projects[0].project_id)
    }
  }

  const showModal = async (modalName = null, data = null, event) => {
    event.stopPropagation();
    if (modalName == null) {
      return false
    }

    switch (modalName) {
      case 'view_documents':
        if (data != null) {
          setViewFile(null);
          setFileType(null)
          let fileDetails = getFileDetails(data)

          setModalType(modalName)
          setShowModal(true)
        }
        break;
      case 'view_task_details':
        setModalType(modalName)
        setShowModal(true)
        break;

    }
  }

  const hideModal = () => {
    setModalType(null)
    setShowModal(false)
  }

  const onDateChange = (start, end, label) => {
    let stDate = start.format('YYYY-MM-DD')
    let enDate = end.format('YYYY-MM-DD')
    dateRef.current = `${stDate}|${enDate}`
    getEvidences(activeDomainId, selectedDomain)
  }

  const onDelEvidence = async (event, type = '', data) => {
    event.stopPropagation()
    if (type == '') {
      return false
    }
    setShowAlert({ show: true, type: "del_evidence_confirmation", message: "", data })
  }

  const toggleAlert = (val) => {
    setShowAlert(val)
  }

  const delEvidence = async (evidenceIds = [], tskId = 0) => {
    if (evidenceIds.length == 0) {
      return false
    }
    setFormSbmt(true)
    toggleAlert({ show: false, type: 'success', message: '' })
    let payloadUrl = `evidences/deleteEvidence`
    let method = "DELETE";
    let formData = { evidence_ids: evidenceIds }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      getEvidences(activeDomainId, selectedDomain)
    }
    setFormSbmt(false)
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
    setEvidences(dataArr)
    setFilteredList(oldVal => {
      return [...dataArr]
    })
    setActiveCol(column)
    setActiveSortOrder(type)
  }

  const searchEvidencesByKeyword = (pgObj = null) => {
    let paginateObj = pgObj || paginate;
    let keyword = keywordRef?.current?.value
    keyword = keyword && keyword.replace(/ /g, '').length > 0 ? keyword : null;
    let items = []
    if (!keyword || keyword.length == 0 || keyword == null) {
      // setFilteredList(oldVal => {
      //   return [...evidences]
      // })
      items = [...evidences]
      paginateObj.totalPages = Math.ceil(items.length / paginateObj.itemsLimit)
      paginateObj.currentPage = (paginateObj.currentPage - 1) * paginateObj.itemsLimit < items.length ? paginateObj.currentPage : 1
      updateFilteredList(paginateObj, items)
      return false
    }


    for (let item of evidences) {

      let title = item.task_name ? (item.task_name).toLowerCase() : '';
      let uploaded_by = item.uploaded_by ? (item.uploaded_by).toLowerCase() : '';
      let fileName = item.file_name ? (item.file_name).toLowerCase() : '';
      let project_task_id = item.project_task_id ? (item.project_task_id).toString().toLowerCase() : '';
      if ((title).indexOf(keyword.toLowerCase()) != -1 ||
        (uploaded_by).indexOf(keyword.toLowerCase()) != -1 ||
        (fileName).indexOf(keyword.toLowerCase()) != -1 ||
        (project_task_id).indexOf(keyword.toLowerCase()) != -1
      ) {
        items.push(item)
      }
    }
    // setFilteredList(oldVal => {
    //   return [...items]
    // })

    paginateObj.totalPages = Math.ceil(items.length / paginateObj.itemsLimit)
    paginateObj.currentPage = (paginateObj.currentPage - 1) * paginateObj.itemsLimit < items.length ? paginateObj.currentPage : 1
    updateFilteredList(paginateObj, [...items])
  }

  const onChangeLimit = async (newLimit = "") => {
    if (newLimit == "") {
      return false
    }
    let items = [...evidences]
    let paginateObj = { ...paginate };
    paginateObj.itemsLimit = newLimit
    paginateObj.currentPage = 1
    paginateObj.totalPages = Math.ceil(items.length / paginateObj.itemsLimit)
    setPaginate(oldVal => {
      return { ...paginateObj }
    })
    searchEvidencesByKeyword(paginateObj)
    // updateFilteredList(paginateObj,items)
    // let currentPage = paginateObj.currentPage;
    // let limit = paginateObj.itemsLimit || 10
    // let offset = (currentPage-1)*limit

    // let fList = items.slice(offset,offset+limit)
    // setFilteredList(oldVal => {
    //   return [...fList]
    // })
  }
  const onClickPaginationItem = async (event, page = "") => {
    if (page == "") {
      return false
    }

    let paginateObj = { ...paginate };
    if (page == "first") {
      paginateObj.currentPage = 1
    } else if (page == "last") {
      paginateObj.currentPage = paginateObj.totalPages
    } else if (page == "next") {
      paginateObj.currentPage = paginateObj.currentPage + 1 <= paginateObj.totalPages ? paginateObj.currentPage + 1 : paginateObj.totalPages
    } else if (page == "prev") {
      paginateObj.currentPage = paginateObj.currentPage - 1 > 0 ? paginateObj.currentPage - 1 : 1
    }
    setPaginate(oldVal => {
      return { ...paginateObj }
    })
    // let currentPage = paginateObj.currentPage;
    // let limit = paginateObj.itemsLimit || 10
    // let offset = (currentPage-1)*limit
    // let items = [...evidences]
    // let fList = items.slice(offset,offset+limit)
    // setFilteredList(oldVal => {
    //   return [...fList]
    // })
    searchEvidencesByKeyword(paginateObj)
  }

  const updateFilteredList = (paginateObj = null, items = null) => {
    if (paginateObj == null || items == null) {
      return false
    }
    let currentPage = paginateObj.currentPage;
    let limit = paginateObj.itemsLimit || 10
    let offset = (currentPage - 1) * limit
    let fList = items.slice(offset, offset + limit)
    setFilteredList(oldVal => {
      return [...fList]
    })
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
      getEvidences(-1, -1)
      setShowAlert({ show: true, type: "success", message: res.message })
    } else {
      if (res && res.message) {
        setShowAlert({ show: true, type: "danger", message: res.message })
      } else {
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
      }

    }
  }

  const onSelectDomain = (data = null) => {
    if (data == null) {
      return false
    }
    let { dKey = null, domain = null } = data.value || {}
    if (dKey == null || domain == null) {
      return false
    }
    getEvidences(domain.id, dKey)
  }

  const handleChange = (event) => {
    event.stopPropagation()
    const { name, value: evidenceId, checked } = event.target;
    let tempSelected = [...evidenceSelected]
    if (name === "allSelect") {
      tempSelected = checked ? evidences.map(item => item.evidence_id) : [];
    } else {
      if (checked) {
        !tempSelected.includes(Number(evidenceId)) && tempSelected.push(Number(evidenceId));
      } else {
        tempSelected.includes(Number(evidenceId)) && tempSelected.splice(tempSelected.indexOf(Number(evidenceId)));
      }
    }
    setEvidenceSelected(oldVal => ([...tempSelected]));
  };

  const downloadAll = async (event, evidenceIds = null) => {
    event.stopPropagation()
    if (evidenceIds != null || evidenceIds.length > 0) {

      let payloadUrl = `${process.env.REACT_APP_API_URL}evidences/downloadEvidences`
      let method = "POST";
      let formData = { evidence_ids: evidenceIds }
      let response = await ApiService.fetchFile(payloadUrl, method, formData);
      let res = await response.arrayBuffer();
      if (res) {
        let contentType = response && response.headers.get('content-type') ? response.headers.get('content-type') : 'application/pdf';
        if (contentType.indexOf('application/json') == -1) {
          var blob = new Blob([res], { type: contentType });
          let url = window.URL.createObjectURL(blob)
          // window.open(url,'_blank')

          if (
            window.navigator &&
            window.navigator.msSaveOrOpenBlob
          ) return window.navigator.msSaveOrOpenBlob(blob);

          // For other browsers:
          // Create a link pointing to the ObjectURL containing the blob.
          const link = document.createElement('a');
          link.href = url;
          link.download = "evidences.zip";
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
            window.URL.revokeObjectURL(blob);
            link.remove();
          }, 100);

          // return {status:true,message:"Success"}
        }
      }
    }
  }

  return (
    <>
      <Header />
      <div className="container-fluid">
        <div className="row mb-3">
          <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
            <div className="d-flex align-items-center">

              <div className="flex-fill mainSearchbar evidence_filter_sec">
                <div className="flex-grow-1">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text bg-transparent border-0 srchInput"><img src="assets/img/gbl.gif" alt="" /></span>
                    </div>
                    <input type="text" name="" placeholder="Search Evidence" className="form-control border-0 pl-0" ref={keywordRef} onChangeCapture={() => searchEvidencesByKeyword()} />
                  </div>
                </div>
                <div className="Position-relative drpicker_block">
                  <DateRangePicker
                    initialSettings={{ startDate: selectionRange["This Month"][0], endDate: selectionRange["This Month"][1], ranges: selectionRange }}
                    onCallback={onDateChange}
                  >
                    <input id="drpicker" type="text" className="form-control border-0" name="date" placeholder="Select Date" />
                    {/* <i className="fa fa-calendar"></i> */}
                  </DateRangePicker>
                </div>


                {(() => {
                  if (domains && domains.length > 0) {
                    return (
                      <>
                        <div className="w200 evidence_dropdown_block">
                          <div className="userProfile evidenceDomainsDropdown w-100">
                            {/* <div className="dropdown fdrp w-100">
                              <button type="button" className="btn btn-primary dropdown-toggle viewMenu" data-toggle="dropdown">
                                <span>{selectedDomain == -1 ? `All Domains` : domains[selectedDomain].name}</span>
                              </button>
                              <div className="dropdown-menu mt-1">
                                <a className={`dropdown-item ${selectedDomain == -1 ? 'd-none' : ''}`} onClick={() => getEvidences(-1, -1)}> All Domains </a>
                                {domains.map((domain, dKey) => {
                                  return <a key={dKey} className={`dropdown-item ${selectedDomain == dKey ? 'd-none' : ''}`} onClick={() => getEvidences(domain.id, dKey)}>{domain.name} </a>
                                })}
                              </div>
                            </div> */}
                            <AirSelect cClass={`w-100 evidence_dropdown_box`}
                              cClassPrefix={`evidence_select`}
                              hideOptionOnSelect={false}
                              closeOnSelect={true}
                              selectType="All Domains"
                              changeFn={onSelectDomain}
                              selectOptions={domains && domains.length > 0 && domains.map((domain, dKey) => ({ value: { dKey, domain }, label: domain.name }))}
                              selected={[{ value: ({ dKey: 0, domain: domains[0] }), label: domains[0].name }]}
                              selectedValue={[]}
                              selectPlaceholder='Select Domain'
                              multi={false} />
                          </div>
                        </div>
                      </>
                    )
                  }
                })()}
                {/* <div className="search_evidence_btn">
                  <button className="btn btn-primary-2 btn_03 btn-sm px-0" onClick={() => getEvidences(activeDomainId, selectedDomain)}><i className="fa fa-search"></i></button>
                </div> */}
              </div>
              <div className={`col-auto p-0 pl-1`}>
                {accessRole && accessRole != 'auditor' &&
                  <div className="">
                    <button className={`btn btn-primary-2 btn_05 max_w_auto fs-10 p-1 mx-1 ${Styles.actn_btn}`} onClick={(e) => downloadAll(e, evidenceSelected)} disabled={evidenceSelected.length == 0}><i className="fa fa-download"></i></button>
                    {/* <DropdownButton
                      key={"primary"}
                      id={`dropdown-variants-${"primary"}`}
                      variant={`primary-2 btn_05 max_w_auto ${Styles.actn_btn} fs-10 p-1 mx-1 ${Styles.noDrpArrow}`}
                      title={<i className="fa fa-bars"></i>}
                      drop={"down"}
                      align="end"
                      className={`dropdown_toggle_custom2 ${Styles.dropdown_toggle_custom2}`}
                    >
                      <Dropdown.Item onClick={(e) => downloadAll(e, evidenceSelected)} disabled={evidenceSelected.length == 0}> <i className="fa fa-download mr-2" aria-hidden="true" ></i>Download</Dropdown.Item>
                      <Dropdown.Item onClick={(e) => onDelEvidence(e, "del_evidence_confirmation", { evidenceIds: evidenceSelected })} disabled={evidenceSelected.length == 0}><i className="fa fa-times mr-2" aria-hidden="true"></i>Delete</Dropdown.Item>



                    </DropdownButton> */}
                  </div>
                }
              </div>
              <div className={`col-auto p-0 pl-1`}>
                {accessRole && accessRole != 'auditor' &&
                  <div className="">
                    <button className={`btn btn-primary-2 btn_05 max_w_auto fs-10 p-1 mx-1 ${Styles.actn_btn}`} onClick={(e) => onDelEvidence(e, "del_evidence_confirmation", { evidenceIds: evidenceSelected })} disabled={evidenceSelected.length == 0}><i className="fa fa-trash"></i></button>
                    
                  </div>
                }
              </div>
              <div className={`col-auto p-0 pl-1`}>
              
                  <div className="">
                    <button className={`btn btn-primary-2 btn_05 max_w_auto fs-10 p-1 mx-1 ${Styles.actn_btn}`} onClick={(e) => refreshpage(e)}><i className="fa fa-repeat"></i></button>
                    
                  </div>
              
              </div>
              <div className={`col-auto p-0 pl-1`}>
                {/* <img src="assets/img/gbl.gif" alt="" /> */}
                {(() => {
                  if (isManagement === "Y") {
                    return (
                      <>
                        <div className="d-flex align-items-center justify-content-end">
                          <div className="text-right ml-1">

                            <DropdownButton
                              key={"primary"}
                              id={`dropdown-variants-${"primary"}`}
                              variant={`primary-2 btn_05 max_w_auto fs-11 px-4 ${Styles.btn_custom_size}`}
                              title={"Import Evidences"}
                              drop={"down"}
                              align="end"
                              className="dropdown_toggle_custom1"
                            >
                              <Dropdown.Item eventKey="-1" onClick={() => loadAutoEvidences(-1)}>All</Dropdown.Item>
                              {/* <Dropdown.Divider /> */}
                              {thirdPartyConnectors && thirdPartyConnectors.length > 0 && React.Children.toArray(thirdPartyConnectors.map((connector, coIndex) => {
                                return (
                                  <Dropdown.Item eventKey={connector.connector_id} onClick={() => loadAutoEvidences(connector.connector_id)}>{connector.name}</Dropdown.Item>
                                )
                              }))}



                            </DropdownButton>
                            {/* <button className="btn btn_1_inverse max_w_auto fs-10 p-1" onClick={() => loadAutoEvidences()}>Import Evidences</button> */}
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
        <div id="evidence_manager_sec" className="row">
          <div className="col-md-12 col-sm-12 col-lg-12">
            <div className="card border-0">

              {(() => {
                if (evidences && evidences.length > 0) {
                  return (
                    <>
                      <div id="vendor_assessment_section">
                        <div className="table-responsive vendor_table_block">
                          <table className="table table-borderless evidences_list">
                            <thead>
                              <tr>
                                {/* <th> <a onClick={() => sortData('project_task_id', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', evidences)} className="sort-by link_url">Task ID</a></th> */}
                                <th className="link_url"><span> <input type="checkbox" name={"allSelect"} onChange={(e) => handleChange(e)} /> </span></th>
                                <th width="200"><a onClick={() => sortData('task_name', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', evidences)} className="sort-by link_url">Task Name</a></th>
                                {/* <th><a onClick={() => sortData('project_name',activeSortOrder == 'ASC'? 'DESC' : 'ASC',evidences)} className="sort-by link_url">Project Name</a> </th> */}
                                <th><a onClick={() => sortData('file_name', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', evidences)} className="sort-by link_url">File Name</a> </th>
                                <th><a onClick={() => sortData('collection_type', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', evidences)} className="sort-by link_url">Type</a> </th>
                                <th><a onClick={() => sortData('uploaded_by', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', evidences)} className="sort-by link_url">Uploaded By</a> </th>
                                <th><a onClick={() => sortData('uploaded_on', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', evidences)} className="sort-by link_url">Uploaded On</a> </th>
                                <th className="w100 min_w_100">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* {evidences.map((evidence, eIndex) => { */}
                              {filteredList.map((evidence, eIndex) => {
                                return (
                                  // <tr key={eIndex} className="odd link_url" onClick={() => getTaskDetails(evidence.project_task_id)}>
                                  <tr key={eIndex} className="odd link_url">
                                    <td className="limit_text" ><span> <input type="checkbox" checked={(evidenceSelected && evidenceSelected.includes(Number(evidence.evidence_id)) || false)} name={evidence.evidence_id} value={evidence.evidence_id} onChange={(e) => handleChange(e)} /> </span></td>
                                    <td className="limit_text" onClick={() => getTaskDetails(evidence.project_task_id)}><span > {evidence.task_name} </span></td>
                                    {/* <td><span> {evidence.project_name} </span></td> */}
                                    <td onClick={() => getTaskDetails(evidence.project_task_id)}><span> {evidence.file_name} </span></td>
                                    <td className="text-capitalize" onClick={() => getTaskDetails(evidence.project_task_id)}><span> <span className={`badge badge-primary ${evidence.collection_type == "manual" ? 'btn_08' : 'btn_09'}`}>{evidence.collection_type == "auto" ? 'Automated' : 'Manual'}</span> </span></td>
                                    <td onClick={() => getTaskDetails(evidence.project_task_id)}><span> {evidence.uploaded_by} </span></td>
                                    <td onClick={() => getTaskDetails(evidence.project_task_id)}><span> {evidence.uploaded_on} </span></td>
                                    <td className="text-dark">
                                      {/* <span className="link_url" onClick={() => showModal('view_documents', evidence)}><i className="fa fa-eye"></i></span> */}
                                      <span className="link_url" onClick={(e) => showModal('view_documents', evidence, e)}><img src="/assets/img/quick_view.png" className="img-fluid quick_view_icon" /></span>
                                      {
                                        accessRole && accessRole != 'auditor'
                                          ? <>
                                            <span className="ml-2 link_url" onClick={(e) => downloadFile(e, evidence)}><i className="fa fa-download"></i></span>
                                            {
                                            (evidence.task_status != "pending")? "" :
                                          <button className="border-0 bg-transparent" onClick={(e) => onDelEvidence(e, "del_evidence_confirmation", { evidenceIds: [evidence.evidence_id], tskId: evidence.project_task_id })} ><i className="fa fa-trash"></i></button> 
                                          }
                                            
                                          </>
                                          : ''
                                      }
                                      {/* <button className="border-0 bg-transparent" onClick={() => delEvidence(evidence.evidence_id,evidence.project_task_id)} ><i className="fa fa-trash"></i></button> */}
                                      {/* <span className="ml-2 link_url" onClick={() => {}}><i className="fa fa-download"></i></span> */}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                        {(() => {
                          if (filteredList && filteredList.length > 0) {
                            return (
                              <div className="pagination_sec">
                                <AirPagination
                                  layout={1}
                                  totalItems={Number(evidences.length)}
                                  totalPages={Number(paginate?.totalPages)}
                                  currentPage={Number(paginate?.currentPage)}
                                  showAllPages={paginate?.showAllPages}
                                  showPrevNextBtn={paginate?.showPrevNextBtn}
                                  disablePages={paginate?.disablePages}
                                  limit={Number(paginate?.itemsLimit)}
                                  onChangeLimit={onChangeLimit}
                                  onClickFn={onClickPaginationItem}
                                  cClass='' />
                              </div>
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
              title={`Are you sure  you want delete the ${showAlert?.data?.evidenceIds.length > 1 ? 'evidences' : 'evidence'} ?`}
              onConfirm={() => delEvidence(showAlert?.data?.evidenceIds, showAlert?.data?.tskId)}
              confirmBtnCssClass={'btn_05'}
              onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
              focusConfirmBtn
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
          if (modalType == 'view_documents') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={{ viewFile: viewFile, fileType: fileType }}
              formSubmit={() => { }} />
          }
        }
        if (modalType && modalType != '' && modalType != null) {
          if (modalType == 'view_task_details') {
            return <AirModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={{ taskDetails }}
              formSubmit={() => { }} />
          }
        }
      })()}


    </>
  )
}

export default EvidenceManager