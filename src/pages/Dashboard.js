import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie, encryptData } from "../helpers/Helper";
import { useNavigate } from "react-router-dom";
import Header from "../components/partials/Header";
import ReactHighcharts from 'react-highcharts';
import Chart from 'react-apexcharts'
import { AreasplineDefaultConfig, pieDefaultConfig, radialBarDefaultConfig, SemiDonutDefaultConfig, radialBarGuageDefaultConfig, radialBarCustAngleDefaultConfig } from "../helpers/chartsConfig";
import { useContext, useEffect, useState } from "react";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import AIrInitials from "../elements/AirInitials";
import "../styles/ComplianceDashboard.css";
import * as htmlToImage from "html-to-image";
import DashboardPDF from "../elements/DashboardPdf";
import { PDFViewer, PDFDownloadLink, pdf } from '@react-pdf/renderer';
import Loader from "../components/partials/Loader";
import { MultiSelect } from "react-multi-select-component";
import { OverlayTrigger, Tooltip } from "react-bootstrap";


const Dashboard = (props) => {
  const options = [

    { label: "Complaince Level", value: "compliance_level" },
    { label: "Sustenance Adherence", value: "sustenance_adherence" },
    { label: "Task Level Weekly", value: "weekly_adherence" },
    { label: "Task Level Monthly", value: "monthly_adherence" },
    { label: "Task table", value: "task_grid" },
    { label: "Task SLA Adherence", value: "sla_adherence" },
    { label: "Failing Domain", value: "failing_cd" },
    { label: "Tasks", value: "tasks" },
    { label: "Adherence Comparison", value: "adherence_comparison" },
  ];
  const options_keyperson = [
    { label: "Tasks", value: "tasks" },
    { label: "Task Level Weekly", value: "weekly_adherence" },
    { label: "Task Level Monthly", value: "monthly_adherence" },
    { label: "Task table", value: "task_grid" },
    { label: "Task SLA Adherence", value: "sla_adherence" }
  ]
  const { projectId = null, user = {} } = useContext(LayoutContext)
  // const accessRole = user?.currentUser?.access_role || '';
  const { access_role: accessRole = null, org_id: orgId = 0, is_management: isManagement = '' } = user?.currentUser;
  const navigate = useNavigate()
  // const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [taskView, setTaskView] = useState('critical')
  const [oilChart2Config, setOilChart2Config] = useState(null)
  const [oilChartConfig, setOilChartConfig] = useState(null)
  const [radicalBarGuageChartConfig, setradicalBarGuageChartConfig] = useState(null)
  const [radicalBarAngleChartConfig, setradicalBarAngleChartConfig] = useState(null)
  const [radicalBarChartConfig, setradicalBarChartConfig] = useState(null)
  const [chartData, setChartData] = useState({})
  const [criticalTasks, setCriticalTasks] = useState([])
  const [outOfScopeTasks, setOutOfScopeTasks] = useState([])
  const [notCompliantTasks, setnotCompliantTasks] = useState([])
  const [overDueTasks, setoverDueTasks] = useState([])
  const [notifiedTask, setNotifiedTask] = useState([])
  const [pdfshow, setPdfshow] = useState(false)
  const [downloaddisable, setDownloaddisable] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [selected, setSelected] = useState([]);


  useEffect(() => {
    if (projectId != null && Object.keys(chartData).length == 0) {
      getDashboardData()
    }
    if (criticalTasks.length == 0 && projectId != null) {
      getTasksByStatus('critical')
    }
    // if (outOfScopeTasks.length == 0 && projectId != null) {
    //   getTasksByStatus()
    // }

  }, [projectId])

  useEffect(() => {
    if (Object.keys(chartData).length > 0) {
      if (oilChart2Config == null) {
        let config = Object.assign({}, pieDefaultConfig())
        config.series[0].data = [{
          name: '',
          y: chartData.monthly_adherence,
          selected: true,
          color: "rgb(49 158 169 / 40%)"

        }, {
          name: '',
          y: (100 - chartData.monthly_adherence),
          color: "rgb(49 158 169)"
        }]
        setOilChart2Config(config)
      }
      if (oilChartConfig == null) {
        let config = Object.assign({}, pieDefaultConfig())
        // weekly_adherence
        config.series[0].data = [{
          name: '',
          y: chartData.weekly_adherence,
          selected: true,
          color: "rgb(49 158 169)"

        }, {
          name: '',
          y: (100 - chartData.weekly_adherence),
          color: "rgb(49 158 169 / 40%)"
        }]
        setOilChartConfig(config)
      }
      if (radicalBarChartConfig == null) {
        let config = Object.assign({}, radialBarDefaultConfig())
        config.series = [chartData.benchmark_adherence, chartData.client_adherence]
        config.options.colors = ['#2774d3', '#40c7de']
        setradicalBarChartConfig(config)
      }
      if (radicalBarGuageChartConfig == null) {
        let config = Object.assign({}, radialBarGuageDefaultConfig())
        config.series = [chartData.sustenance_adherence]
        config.options.labels = ['Sustenance Adherence']
        setradicalBarGuageChartConfig(config)
      }
      if (radicalBarAngleChartConfig == null) {
        let config = Object.assign({}, radialBarCustAngleDefaultConfig())
        config.series = [chartData.tasks_count.high, chartData.tasks_count.medium, chartData.tasks_count.low]
        config.options.colors = ['#ff0000', '#ffa500', '#008000', '#000000']
        config.options.labels = ['High', 'Medium', 'Low', 'Total']
        config.options.legend.fontSize = '12px';
        config.options.legend.fontWeight = '600';
        config.options.legend.formatter = function (seriesName, opts) {
          if (seriesName == 'Total') {
            return seriesName + ":  " + chartData.tasks_count.total
          } else {
            return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
          }

        }
        setradicalBarAngleChartConfig(config)
      }
    }

    return () => {
      // setOilChart2Config(null)
    }
  }, [oilChart2Config, oilChartConfig, radicalBarChartConfig, chartData])

  const getDashboardData = async () => {
    let payloadUrl = `orgs/getDashboard`
    let method = "POST";
    let formData = {};
    formData = {
      "project_id": Number(projectId),
      "start_date": "2022-01-01",
      "end_date": "2022-12-31"
    }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let dataArr = res.results
      // dataArr = dataArr[0];
      if (dataArr.length > 0) {
        let data = dataArr[0];
        setChartData(data)
        //setSelected(data.dashboard_widgets);


        if (isManagement == "N" && accessRole != "auditor") {
          if (options_keyperson && options_keyperson.length > 0) {
            let tempArr = options_keyperson.filter((opt, index) => data.dashboard_widgets.includes(opt.value));
            setSelected(oldVal => {
              return [...tempArr]
            })
          }

        } else {


          if (options && options.length > 0) {
            let tempArr = options.filter((opt, index) => data.dashboard_widgets.includes(opt.value));
            setSelected(oldVal => {
              return [...tempArr]
            })
          }
        }
      }

    }

  }
  const getCriticalTasks = async () => {
    let payloadUrl = `tasks/getCriticalTasks`
    let method = "POST";
    let formData = {};
    formData = {
      "project_id": Number(projectId),
      // "start_date": "01/24/2021",
      // "end_date": "01/24/2022"
      "start_date": "2022-01-01",
      "end_date": "2023-01-01"
    }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let criticalArr = res.results
      if (criticalArr.length > 0) {
        setCriticalTasks(oldVal => {
          return [...criticalArr]
        })

      }

    }
  }
  const getOutOfScopeTasks = async () => {
    let payloadUrl = `tasks/getOutofScopeTasks`
    let method = "POST";
    let formData = {};
    formData = {
      "project_id": Number(projectId),
      // "start_date": "01/24/2021",
      // "end_date": "01/24/2022"
      "start_date": "2022-01-01",
      "end_date": "2023-01-01"
    }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let criticalArr = res.results
      if (criticalArr.length > 0) {
        setOutOfScopeTasks(oldVal => {
          return [...criticalArr]
        })

      }

    }
  }
  const getTasksByStatus = async (status = '') => {
    if (status == '') {
      return false
    }
    let payloadUrl = `tasks/listTasksByStatus`
    let method = "POST";
    let formData = {};
    formData = {
      "project_id": Number(projectId),
      status: status,
      "start_date": "2022-01-01",
      "end_date": "2023-01-01"
    }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      if (status == 'critical') {
        let criticalArr = res.results
        if (criticalArr.length > 0) {
          setCriticalTasks(oldVal => {
            return [...criticalArr]
          })

        }
      } else if (status == 'out_of_scope') {
        let outOfScopeArr = res.results
        if (outOfScopeArr.length > 0) {
          setOutOfScopeTasks(oldVal => {
            return [...outOfScopeArr]
          })
        }
      } else if (status == 'not_compliant') {
        let notCompliantArr = res.results
        if (notCompliantArr.length > 0) {
          setnotCompliantTasks(oldVal => {
            return [...notCompliantArr]
          })
        }
      }
      else if (status == 'overdue') {
        let overDueArr = res.results
        if (overDueArr.length > 0) {
          setoverDueTasks(oldVal => {
            return [...overDueArr]
          })
        }
      }
      else if (status == 'reminded') {
        let notifiedTaskArr = res.results
        if (notifiedTaskArr.length > 0) {
          setNotifiedTask(oldVal => {
            return [...notifiedTaskArr]
          })
        }
      }
    }
  }

  const getSemiDonutDConfig = (type = null) => {
    if (type == null) {
      return false
    }
    let configData = Object.assign({}, SemiDonutDefaultConfig())

    if (type == 1) {
      // configData = Object.assign({}, SemiDonutDefaultConfig())
      configData.title.text = `${chartData.failing_domains}%`
      configData.series[0].data = [{
        name: 'Red slice',
        y: chartData.failing_domains,
        color: '#40c7de'
      }, {
        name: 'Blue slice',
        y: (100 - chartData.failing_domains),
        color: '#F0F2F8'
      }]

    } else if (type == 2) {
      configData.title.text = `${chartData.failing_controls}%`
      configData.series[0].data = [{
        name: 'Red slice',
        y: chartData.failing_controls,
        color: '#309daa'
      }, {
        name: 'Blue slice',
        y: (100 - chartData.failing_controls),
        color: '#F0F2F8'
      }]
    }
    configData.chart.height = "180px"
    return configData
  }

  const switchTaskView = (type = null) => {
    if (type == null) {
      return false
    }
    getTasksByStatus(type)
    setTaskView(type)
  }

  const onChangeDate = (type = null) => {
    if (type == null) {
      return false
    }
  }

  const genArr = (number = null) => {
    if (number == null) {
      return [];
    }
    return Array.from(Array(number).keys()).map((val, index) => index + 1)
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

  const getPDFdataApi = async () => {
    let payloadUrl = `tasks/listTasksByStatus`
    let method = "POST";
    let formData_critical = {};
    let formData_outscope = {};
    let formData_notcomplaint = {};
    let formData_overdue = {};
    let formData_notified = {};
    formData_critical = {
      "project_id": Number(projectId),
      status: 'critical',
      "start_date": "2022-01-01",
      "end_date": "2023-01-01"
    }
    let res0 = await ApiService.fetchData(payloadUrl, method, formData_critical);

    formData_outscope = {
      "project_id": Number(projectId),
      status: 'out_of_scope',
      "start_date": "2022-01-01",
      "end_date": "2023-01-01"
    }
    let res1 = await ApiService.fetchData(payloadUrl, method, formData_outscope);

    formData_notcomplaint = {
      "project_id": Number(projectId),
      status: 'not_compliant',
      "start_date": "2022-01-01",
      "end_date": "2023-01-01"
    }
    let res2 = await ApiService.fetchData(payloadUrl, method, formData_outscope);

    formData_overdue = {
      "project_id": Number(projectId),
      status: 'overdue',
      "start_date": "2022-01-01",
      "end_date": "2023-01-01"
    }
    let res3 = await ApiService.fetchData(payloadUrl, method, formData_overdue);

    formData_notified = {
      "project_id": Number(projectId),
      status: 'reminded',
      "start_date": "2022-01-01",
      "end_date": "2023-01-01"
    }
    let res4 = await ApiService.fetchData(payloadUrl, method, formData_notified);


    return { critical: res0, outofscope: res1, notcompliant: res2, overdue: res3, notified: res4 };
  }


  const handleDownloadPdf = async () => {
    setShowLoader(true)
    const responses = await getPDFdataApi();
    let criticalArr = [];
    let outofscope = [];
    let notcompliant = [];
    let overdue = [];
    let notified = [];
    if (responses.critical && responses.critical.message == "Success") {
      criticalArr = responses.critical.results
    }
    if (responses.outofscope && responses.outofscope.message == "Success") {
      outofscope = responses.outofscope.results
    }
    if (responses.notcompliant && responses.notcompliant.message == "Success") {
      notcompliant = responses.notcompliant.results
    }
    if (responses.overdue && responses.overdue.message == "Success") {
      overdue = responses.overdue.results
    }
    if (responses.notified && responses.notified.message == "Success") {
      notified = responses.notified.results
    }
    setTimeout(async () => {
      const dataURL = await htmlToImage.toPng(
        document.getElementById("element22")
      );
      let check_grid = selected.some(item => item.value === 'task_grid');
      const dashboardPdfdata = { dashboardimg: dataURL, criticalTasks: criticalArr, outOfScopeTasks: outofscope, notCompliantTasks: notcompliant, overdueTasks: overdue, notifiedTasks: notified, grid_flag: check_grid };
      const blob = await pdf(<DashboardPDF {...dashboardPdfdata} />).toBlob();
      downloadPdf(blob, `Sustenance Dashboard.pdf`);
      setPdfshow(false);
      setShowLoader(false);
    }, 1100);
    setPdfshow(true);


  };

  const downloadPdf = (blob = null, filename = "") => {
    if (blob == null || filename == "") {
      return false;
    }
    const link = document.createElement("a");
    // create a blobURI pointing to our Blob
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    // some browser needs the anchor to be in the doc
    document.body.append(link);
    link.click();
    link.remove();
    // in case the Blob uses a lot of memory
    setTimeout(() => URL.revokeObjectURL(link.href), 3000);
  };
  const examplefn = async (data) => {
    setSelected([...data]);
    let newSelectedData = [];
    data.map(item => newSelectedData.push(item.value));

    (newSelectedData.length == 0) ? setDownloaddisable(true) : setDownloaddisable(false)
    let payloadUrl = "employees/updateDashboardWidgets"
    let method = "POST";
    let formData = { widgets: newSelectedData }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      //OnSuccess Logic Here  
    }

  }


  return (
    <>
      <Header />


      <div className="download_pdf_sections text-right px-3 mb-1">

        {
          (isManagement == "N" && accessRole != "auditor") ?
            <MultiSelect style={{ "font-size": "12px" }}
              options={options_keyperson}
              value={selected}
              onChange={examplefn}
              labelledBy="Select Layout"
              className="btn dropdown_layout"
              hasSelectAll={true}

            /> :
            <MultiSelect style={{ "font-size": "12px" }}
              options={options}
              value={selected}
              onChange={examplefn}
              labelledBy="Select Layout"
              className="btn dropdown_layout"
              hasSelectAll={true}

            />
        }


        <OverlayTrigger
          key={"bottom"}
          placement={"bottom"}
          overlay={
            <Tooltip id={`tooltip-right`}>
              Download as PDF
            </Tooltip>
          }
        >
          <button className="btn btn-primary-2 btn_05" style={{ "marginTop": "-5px" }} type="button" onClick={handleDownloadPdf} disabled={downloaddisable}>
            <span className="fa fa-download"></span>
          </button>
        </OverlayTrigger>
      </div>

      {showLoader && <Loader showLoader={showLoader} pos={'fixed'} lClass={"cus_loader_fixed_1"} ></Loader>}
      {
        !pdfshow ?
          <div id="element" className="container-fluid" style={{ paddingBottom: "10px", overflowX: "hidden" }}>

            {(() => {
              if (isManagement == "N" && accessRole != "auditor") {
                return (
                  <>
                    <div className="row ma_bot">

                      <div className="col-lg-12 col-md-12 mob_pad">
                        <div className="row ma_bot   task_box_card">
                          {(selected.some(item => item.value == "tasks")) &&
                            <div className="flex-fill boxes_flex_1">
                              <div className="card card_shadow" >
                                <div className="card-body  task_level">
                                  <span className="position-absolute">Tasks</span>
                                  {/* <p> <span>Task Level</span> - Sustenance Adherence</p>
                    <span className="value"> {chartData.sustenance_adherence}%</span> */}
                                  <div id="radialAngleChart" className="h-180 position-relative">
                                    {
                                      radicalBarGuageChartConfig != null
                                        ? <Chart options={radicalBarAngleChartConfig.options} series={radicalBarAngleChartConfig.series} type="radialBar" width={250} height={`250`} />
                                        : ''
                                    }

                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                          {(selected.some(item => item.value == "weekly_adherence")) &&
                            <div className="flex-fill boxes_flex_1 ">
                              <div className="card card_shadow">
                                <div className="card-body  task_level task_level1">
                                  <p> <span>Task Level</span> - Weekly Adherence</p>
                                  <span className="value"> {chartData.weekly_adherence}%</span>

                                  {
                                    oilChartConfig
                                      ? <div id="oilChart"><ReactHighcharts config={oilChartConfig} /></div>
                                      : ''
                                  }
                                </div>
                              </div>
                            </div>
                          }
                          {(selected.some(item => item.value == "monthly_adherence")) &&
                            <div className="flex-fill boxes_flex_1 ">
                              <div className="card card_shadow">
                                <div className="card-body  task_level task_level1">
                                  <p> <span>Task Level</span> - Monthly Adherence</p>
                                  <span className="value"> {chartData.monthly_adherence}%</span>
                                  {
                                    oilChart2Config
                                      ? <div id="oilChart2"><ReactHighcharts config={oilChart2Config} /></div>
                                      : ''
                                  }

                                </div>
                              </div>
                            </div>
                          }
                        </div>
                        <div className="row task_box_card task_box_grid">
                          {(selected.some(item => item.value == "task_grid")) &&
                            <div className="boxes_flex_21 flex-fill margin_top">
                              <div className="gridcontainer timecontainer dashboard m-0 p-0">
                                <div className="grid_item">
                                  <div className="card card_shadow_none p-2">
                                    <div className="card-header d-flex flex-column bg-transparent">
                                      <div className="mb-2">
                                        <h4 className="fs-14 fw-600">Task Insights</h4>
                                      </div>
                                      <div className="d-flex justify-content-between">
                                        <div className="config_tabs_box">
                                          <a className={`link_url border text_color_2 ${taskView == 'critical' ? 'active' : ''}`} onClick={() => switchTaskView('critical')}>High Priority Open Task</a>
                                          <a className={`link_url border text_color_2 ${taskView == 'out_of_scope' ? 'active' : ''}`} onClick={() => switchTaskView('out_of_scope')}>Out Of Scope Task</a>
                                          <a className={`link_url border text_color_2 ${taskView == 'not_compliant' ? 'active' : ''}`} onClick={() => switchTaskView('not_compliant')}>Not Compliant Task</a>

                                        </div>
                                        <div className="fw-500 text_color_2">
                                          <span>{taskView == 'critical' ? criticalTasks.length : (taskView == 'out_of_scope' ? outOfScopeTasks.length : (taskView == 'not_compliant' ? notCompliantTasks.length : 0))}</span>/<span>{chartData?.tasks_count?.total || 0}</span>
                                        </div>
                                      </div>

                                    </div>
                                    <div className="card-body">
                                      {(() => {
                                        if (taskView == 'critical') {
                                          return (
                                            <>
                                              {criticalTasks && criticalTasks.length > 0 && criticalTasks.map((task, ctIndex) => {
                                                return (
                                                  <div key={ctIndex} onClick={() => goToUrl("task_details", task)} className={`link_url task_block gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                                    <div className="gridboxbody">
                                                      <div className="col p-0">
                                                        {/* <p className="link_url task_id">{task.project_task_id}</p> */}
                                                        <h4 className="col p-0">{task.title}</h4>
                                                      </div>
                                                      {/* <p className="m-0"><img src="assets/img/gbl.gif" alt="folder" /> <span>{task.description}</span></p> */}
                                                      <p className="m-0 ml-lg-4 ml-xl-0 status">
                                                        <a className="statusClr">
                                                          {task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>
                                                      <p className="jus_end m-0">
                                                        {/* <a href="#" className="active"><img src="assets/img/boxuser.svg" alt="" /></a> */}
                                                        <AIrInitials str={task.task_owner} AiClass={''} showToolTip={`${task.task_owner} (${task.authority})`} />
                                                      </p>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </>
                                          )

                                        } else if (taskView == 'out_of_scope') {
                                          return (
                                            <>
                                              {outOfScopeTasks && outOfScopeTasks.length > 0 && outOfScopeTasks.map((task, ostIndex) => {
                                                return (
                                                  <div key={ostIndex} onClick={() => goToUrl("task_details", task)} className={`link_url task_block gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                                    <div className="gridboxbody">
                                                      <div className="col p-0">
                                                        {/* <p className="link_url task_id" onClick={() => goToUrl("task_details", task)}>{task.project_task_id}</p> */}
                                                        <h4 className="col p-0">{task.title}</h4>
                                                      </div>
                                                      {/* <p className="m-0"><img src="assets/img/gbl.gif" alt="folder" /> <span>{task.description}</span></p> */}
                                                      {/* <p className="m-0 ml-lg-4 ml-xl-0 status"> <a className="statusClr">{task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p> */}
                                                      <p className="jus_end m-0">
                                                        {/* <a href="#" className="active"><img src="assets/img/boxuser.svg" alt="" /></a> */}
                                                        <AIrInitials str={task.task_owner} AiClass={''} showToolTip={`${task.task_owner} (${task.authority})`} />
                                                      </p>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </>
                                          )
                                        } else if (taskView == 'not_compliant') {
                                          return (
                                            <>
                                              {notCompliantTasks && notCompliantTasks.length > 0 && notCompliantTasks.map((task, ostIndex) => {
                                                return (
                                                  <div key={ostIndex} onClick={() => goToUrl("task_details", task)} className={`link_url task_block gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                                    <div className="gridboxbody">
                                                      <div className="col p-0">
                                                        {/* <p className="link_url task_id" onClick={() => goToUrl("task_details", task)}>{task.project_task_id}</p> */}
                                                        <h4 className="col p-0">{task.title}</h4>
                                                      </div>
                                                      {/* <p className="m-0"><img src="assets/img/gbl.gif" alt="folder" /> <span>{task.description}</span></p> */}
                                                      <p className="m-0 ml-lg-4 ml-xl-0 status"> <a className="statusClr">{task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>
                                                      <p className="jus_end m-0">
                                                        {/* <a href="#" className="active"><img src="assets/img/boxuser.svg" alt="" /></a> */}
                                                        <AIrInitials str={task.task_owner} AiClass={''} showToolTip={`${task.task_owner} (${task.authority})`} />
                                                      </p>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </>
                                          )
                                        }
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                          {(selected.some(item => item.value == "sla_adherence")) &&
                            <div className="boxes_flex_1 flex-fill ">
                              <div className="row">
                                <div className="col-lg-12 ">
                                  <div className="card card_shadow">
                                    <div className="card-body task_level task_level2">
                                      <span>Task SLA Adherence</span>
                                      <p className="compli_text">Compliance Adherence & SLAs met</p>
                                      <section className="circle-chart">
                                        <svg viewBox="0 0 35.83098862 35.83098862" width="200" height="185" xmlns="http://www.w3.org/2000/svg" className="mw-100">
                                          <circle className="circle-chart__background" stroke="#EDF0F4" strokeWidth="4" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                          <circle className="circle-chart__circle" stroke="#319fa9" strokeWidth="4" strokeDasharray={`${chartData.sla_adherence},${100 - chartData.sla_adherence}`} strokeLinecap="none" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                          <g className="circle-chart__info">
                                            <text className="circle-chart__percent" x="16.91549431" y="16.5" alignmentBaseline="central" textAnchor="middle" fontSize="8">{chartData.sla_adherence}%</text>
                                            <text className="circle-chart__subline" x="16.91549431" y="21.5" alignmentBaseline="central" textAnchor="middle" fontSize="2">SLA COMPLETED</text>
                                          </g>
                                        </svg>
                                      </section>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </div>

                  </>
                )
              } else {
                return (
                  <>
                    <div className="row ma_bot">

                      <div className="col-lg-12 col-md-12 mob_pad">
                        <div className="row ma_bot   task_box_card d-flex">
                          {(selected.some(item => item.value == "compliance_level")) &&
                            <div className=" flex-fill boxes_flex_1">
                              <div className="card card_shadow">
                                <div className="card-body ">
                                  <p> <span className="box_heading_dash">Compliance Level</span> </p>
                                  <svg height="0" width="0" className="svg-clip" >
                                    <defs>
                                      <clipPath id="clip" clipPathUnits="objectBoundingBox">
                                        <path d="M1,.21 Q1,0 .81,.09L.187,.4 Q0,.5 .187,.59L.81,.90 Q1,1 1,.79Z" />
                                      </clipPath>
                                    </defs>
                                  </svg>
                                  <div className="traingle">
                                    {chartData.compliance_level && chartData.compliance_level > 0 && genArr(chartData.compliance_level).map((val, comIndex) => {
                                      return <div className="svg-triangle" data-bs-toggle="tooltip" title={`Level ${comIndex + 1}`}><span >Level {comIndex + 1}</span></div>
                                    })}
                                    {chartData.compliance_level && chartData.compliance_level > 0 && genArr(4 - chartData.compliance_level).map((val, comIndex) => {
                                      return <div className="svg-triangle blank" data-bs-toggle="tooltip" title={`Level ${(chartData.compliance_level + (comIndex + 1))}`}><span >Level {(chartData.compliance_level + (comIndex + 1))}</span></div>
                                    })}
                                  </div>

                                </div>
                              </div>
                            </div>
                          }
                          {(selected.some(item => item.value == "sustenance_adherence")) &&
                            <div className=" flex-fill boxes_flex_1">
                              <div className="card card_shadow">
                                <div className="card-body  task_level">
                                  <p> <span>Sustenance Adherence</span> </p>
                                  <div id="Compliance_Standars position-relative" className="h-180">
                                    {
                                      radicalBarGuageChartConfig != null
                                        ? <Chart options={radicalBarGuageChartConfig.options} series={radicalBarGuageChartConfig.series} type="radialBar" height={`250`} />
                                        : ''
                                    }

                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                          {(selected.some(item => item.value == "weekly_adherence")) &&
                            <div className=" flex-fill boxes_flex_1">
                              <div className="card card_shadow">
                                <div className="card-body  task_level task_level1">
                                  <p> <span>Task Level</span> - Weekly Adherence</p>
                                  <span className="value"> {chartData.weekly_adherence}%</span>

                                  {
                                    oilChartConfig
                                      ? <div id="oilChart"><ReactHighcharts config={oilChartConfig} /></div>
                                      : ''
                                  }
                                </div>
                              </div>
                            </div>
                          }

                          {(selected.some(item => item.value == "monthly_adherence")) &&
                            <div className=" flex-fill boxes_flex_1">
                              <div className="card card_shadow">
                                <div className="card-body  task_level task_level1">
                                  <p> <span>Task Level</span> - Monthly Adherence</p>
                                  <span className="value"> {chartData.monthly_adherence}%</span>
                                  {
                                    oilChart2Config
                                      ? <div id="oilChart2"><ReactHighcharts config={oilChart2Config} /></div>
                                      : ''
                                  }

                                </div>
                              </div>
                            </div>
                          }
                        </div>
                        <div className="row task_box_card task_box_grid d-flex">
                          {(selected.some(item => item.value == "task_grid")) &&
                            <div className="boxes_flex_21 flex-fill margin_top">
                              <div className="gridcontainer timecontainer dashboard m-0 p-0">
                                <div className="grid_item">
                                  <div className="card card_shadow_none p-2">
                                    <div className="card-header d-flex flex-column bg-transparent">
                                      <div className="mb-2">
                                        <h4 className="fs-14 fw-600">Task Insights</h4>
                                      </div>
                                      <div className="d-flex justify-content-between">
                                        <div className="config_tabs_box">
                                          <a className={`link_url border text_color_2 ${taskView == 'critical' ? 'active' : ''}`} onClick={() => switchTaskView('critical')}>High Priority Open</a>
                                          <a className={`link_url border text_color_2 ${taskView == 'out_of_scope' ? 'active' : ''}`} onClick={() => switchTaskView('out_of_scope')}>Out Of Scope</a>
                                          <a className={`link_url border text_color_2 ${taskView == 'not_compliant' ? 'active' : ''}`} onClick={() => switchTaskView('not_compliant')}>Not Compliant</a>
                                          <a className={`link_url border text_color_2 ${taskView == 'overdue' ? 'active' : ''}`} onClick={() => switchTaskView('overdue')}>Overdue</a>
                                          <a className={`link_url border text_color_2 ${taskView == 'reminded' ? 'active' : ''}`} onClick={() => switchTaskView('reminded')}>Upcoming High Priority</a>
                                        </div>
                                        <div className="fw-500 text_color_2">
                                          <span>{taskView == 'critical' ? criticalTasks.length : (taskView == 'out_of_scope' ? outOfScopeTasks.length : (taskView == 'overdue' ? overDueTasks.length : (taskView == 'reminded' ? notifiedTask.length : (taskView == 'not_compliant' ? notCompliantTasks.length : 0))))}</span>/<span>{chartData?.tasks_count?.total || 0}</span>
                                        </div>
                                      </div>

                                    </div>
                                    <div className="card-body">
                                      {(() => {
                                        if (taskView == 'critical') {
                                          return (
                                            <>
                                              {criticalTasks && criticalTasks.length > 0 && criticalTasks.map((task, ctIndex) => {
                                                return (
                                                  <div key={ctIndex} onClick={() => goToUrl("task_details", task)} className={`link_url task_block gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                                    <div className="gridboxbody">
                                                      <div className="col p-0">
                                                        {/* <p className="link_url task_id">{task.project_task_id}</p> */}
                                                        <h4 className="col p-0">{task.title}</h4>
                                                      </div>
                                                      {/* <p className="m-0"><img src="assets/img/gbl.gif" alt="folder" /> <span>{task.description}</span></p> */}
                                                      <p className="m-0 ml-lg-4 ml-xl-0 status"> <a className="statusClr">{task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>
                                                      <p className="jus_end m-0">
                                                        {/* <a href="#" className="active"><img src="assets/img/boxuser.svg" alt="" /></a> */}
                                                        <AIrInitials str={task.task_owner} AiClass={''} showToolTip={`${task.task_owner} (${task.authority})`} />
                                                      </p>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </>
                                          )

                                        } else if (taskView == 'out_of_scope') {
                                          return (
                                            <>
                                              {outOfScopeTasks && outOfScopeTasks.length > 0 && outOfScopeTasks.map((task, ostIndex) => {
                                                return (
                                                  <div key={ostIndex} onClick={() => goToUrl("task_details", task)} className={`link_url task_block gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                                    <div className="gridboxbody">
                                                      <div className="col p-0">
                                                        {/* <p className="link_url task_id">{task.project_task_id}</p> */}
                                                        <h4 className="col p-0">{task.title}</h4>
                                                      </div>
                                                      {/* <p className="m-0"><img src="assets/img/gbl.gif" alt="folder" /> <span>{task.description}</span></p> */}
                                                      {/* <p className="m-0 ml-lg-4 ml-xl-0 status"> <a className="statusClr">{task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p> */}
                                                      <p className="jus_end m-0">
                                                        {/* <a href="#" className="active"><img src="assets/img/boxuser.svg" alt="" /></a> */}
                                                        <AIrInitials str={task.task_owner} AiClass={''} showToolTip={`${task.task_owner} (${task.authority})`} />
                                                      </p>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </>
                                          )
                                        } else if (taskView == 'not_compliant') {
                                          return (
                                            <>
                                              {notCompliantTasks && notCompliantTasks.length > 0 && notCompliantTasks.map((task, ostIndex) => {
                                                return (
                                                  <div key={ostIndex} onClick={() => goToUrl("task_details", task)} className={`link_url task_block gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                                    <div className="gridboxbody">
                                                      <div className="col p-0">
                                                        {/* <p className="link_url task_id">{task.project_task_id}</p> */}
                                                        <h4 className="col p-0">{task.title}</h4>
                                                      </div>
                                                      {/* <p className="m-0"><img src="assets/img/gbl.gif" alt="folder" /> <span>{task.description}</span></p> */}
                                                      <p className="m-0 ml-lg-4 ml-xl-0 status"> <a className="statusClr">{task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>
                                                      <p className="jus_end m-0">
                                                        {/* <a href="#" className="active"><img src="assets/img/boxuser.svg" alt="" /></a> */}
                                                        <AIrInitials str={task.task_owner} AiClass={''} showToolTip={`${task.task_owner} (${task.authority})`} />
                                                      </p>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </>
                                          )
                                        }
                                        else if (taskView == 'overdue') {
                                          return (
                                            <>
                                              {overDueTasks && overDueTasks.length > 0 && overDueTasks.map((task, ostIndex) => {
                                                return (
                                                  <div key={ostIndex} onClick={() => goToUrl("task_details", task)} className={`link_url task_block gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                                    <div className="gridboxbody">
                                                      <div className="col p-0">
                                                        {/* <p className="link_url task_id">{task.project_task_id}</p> */}
                                                        <h4 className="col p-0">{task.title}</h4>
                                                      </div>
                                                      {/* <p className="m-0"><img src="assets/img/gbl.gif" alt="folder" /> <span>{task.description}</span></p> */}
                                                      <p className="m-0 ml-lg-4 ml-xl-0 status"> <a className="statusClr">{task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>
                                                      <p className="jus_end m-0">
                                                        {/* <a href="#" className="active"><img src="assets/img/boxuser.svg" alt="" /></a> */}
                                                        <AIrInitials str={task.task_owner} AiClass={''} showToolTip={`${task.task_owner} (${task.authority})`} />
                                                      </p>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </>
                                          )
                                        }
                                        else if (taskView == 'reminded') {
                                          return (
                                            <>
                                              {notifiedTask && notifiedTask.length > 0 && notifiedTask.map((task, ostIndex) => {
                                                return (
                                                  <div key={ostIndex} onClick={() => goToUrl("task_details", task)} className={`link_url task_block gridBox ${task.task_status == "pending" ? 'todo_Filter' : (task.task_status == "in_progress" ? 'inProgress_Filter' : (task.task_status == "review" ? 'underReview_Filter' : (task.task_status == "completed" ? 'complete_Filter' : '')))}`}>
                                                    <div className="gridboxbody">
                                                      <div className="col p-0">
                                                        {/* <p className="link_url task_id" onClick={() => goToUrl("task_details", task)}>{task.project_task_id}</p> */}
                                                        <h4 className="col p-0">{task.title}</h4>
                                                      </div>
                                                      {/* <p className="m-0"><img src="assets/img/gbl.gif" alt="folder" /> <span>{task.description}</span></p> */}
                                                      <p className="m-0 ml-lg-4 ml-xl-0 status"> <a className="statusClr">{task.task_status == "pending" ? 'Open' : (task.task_status == "in_progress" ? 'In Progress' : (task.task_status == "review" ? 'Under Review' : (task.task_status == "completed" ? 'Completed' : '')))}</a></p>
                                                      <p className="jus_end m-0">
                                                        {/* <a href="#" className="active"><img src="assets/img/boxuser.svg" alt="" /></a> */}
                                                        <AIrInitials str={task.task_owner} AiClass={''} showToolTip={`${task.task_owner} (${task.authority})`} />
                                                      </p>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </>
                                          )
                                        }
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          }

                          {(selected.some(item => item.value == "sla_adherence")) &&
                            <div className="boxes_flex_1 flex-fill ">
                              <div className="row">
                                <div className="col-lg-12 ">
                                  <div className="card card_shadow">
                                    <div className="card-body task_level task_level2">
                                      <span>Task SLA Adherence</span>
                                      <p className="compli_text">Compliance Adherence & SLAs met</p>
                                      <section className="circle-chart">
                                        <svg viewBox="0 0 35.83098862 35.83098862" width="200" height="185" xmlns="http://www.w3.org/2000/svg" className="mw-100">
                                          <circle className="circle-chart__background" stroke="#EDF0F4" strokeWidth="4" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                          <circle className="circle-chart__circle" stroke="#319fa9" strokeWidth="4" strokeDasharray={`${chartData.sla_adherence},${100 - chartData.sla_adherence}`} strokeLinecap="none" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                          <g className="circle-chart__info">
                                            <text className="circle-chart__percent" x="16.91549431" y="16.5" alignmentBaseline="central" textAnchor="middle" fontSize="8">{chartData.sla_adherence}%</text>
                                            <text className="circle-chart__subline" x="16.91549431" y="21.5" alignmentBaseline="central" textAnchor="middle" fontSize="2">SLA COMPLETED</text>
                                          </g>
                                        </svg>
                                      </section>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="row  mb-3 task_box_card_fall d-flex">
                      {(selected.some(item => item.value == "failing_cd")) &&
                        <div className="boxes_flex_1 flex-fill mob_pad">
                          <div className="card card_shadow">
                            <div className="card-body p-0">
                              <div className="row  falling_height">
                                <div className="col-lg-6 col-sm-6 col-12 falling_do">
                                  <figure className="highcharts-figure">
                                    <div id="containersin" className="h-180">
                                      <ReactHighcharts config={getSemiDonutDConfig(1)} />
                                    </div>
                                  </figure>
                                  <p className="falling_dot position-relative text-center"> <span></span>Failing Domains</p>
                                </div>
                                <div className="col-lg-6 col-sm-6 col-12 falling_do">
                                  <figure className="highcharts-figure">
                                    <div id="containerdbl" className="h-180">
                                      <ReactHighcharts config={getSemiDonutDConfig(2)} />
                                    </div>
                                  </figure>
                                  <p className="falling_dot position-relative text-center"> <span className="blue_color"></span>Failing Controls</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                      {(selected.some(item => item.value == "tasks")) &&
                        <div className="boxes_flex_1 flex-fill">
                          <div className="card card_shadow" style={{ "height": '210px' }}>
                            <div className="card-body  task_level">
                              <span className="position-absolute">Tasks</span>
                              {/* <p> <span>Task Level</span> - Sustenance Adherence</p>
                    <span className="value"> {chartData.sustenance_adherence}%</span> */}
                              <div id="radialAngleChart" className="h-180 position-relative">
                                {
                                  radicalBarGuageChartConfig != null
                                    ? <Chart options={radicalBarAngleChartConfig.options} series={radicalBarAngleChartConfig.series} type="radialBar" width={250} height={`250`} />
                                    : ''
                                }

                              </div>
                            </div>
                          </div>
                        </div>
                      }
                      {(selected.some(item => item.value == "adherence_comparison")) &&
                        <div className="boxes_flex_1 flex-fill mob_pad">
                          <div className="row">
                            <div className="col-lg-12">
                              <div className="card card_shadow" style={{ "height": '210px' }}>
                                <div className="card-body  task_level ">
                                  {/* <span>Adherence as compared to other companies</span> */}
                                  <span>Adherence Comparison</span>
                                  <div className="d-flex align-items-center justify-content-between h-150">
                                    <div>
                                      <p className="adher"><span></span> Benchmark Adherence</p>
                                      <p className="adherence"><span></span>Your Adherence</p>
                                    </div>
                                    <div>
                                      <div id="chart1">
                                        <div id="radial-chart">
                                          {
                                            radicalBarChartConfig != null
                                              ? <Chart options={radicalBarChartConfig.options} series={radicalBarChartConfig.series} type="radialBar" width={200} height={`230`} />
                                              : ''
                                          }

                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </>
                )
              }

            })()}
          </div>

          // below ui only used for PDF rendering 
          :
          <div id="element22" className="container-fluid" style={{ paddingBottom: "10px" }}>
            {(() => {
              if (isManagement == "N" && accessRole != "auditor") {
                return (
                  <>
                    <div className="row ma_bot">

                      <div className="col-lg-12 col-md-12 mob_pad">
                        <div className="row ma_bot   task_box_card">

                          {(selected.some(item => item.value == "weekly_adherence")) &&
                            <div className="boxes_flex_1 flex-fill ">
                              <div className="card card_shadow">
                                <div className="card-body  task_level task_level1">
                                  <p> <span>Task Level</span> - Weekly Adherence</p>
                                  <span className="value"> {chartData.weekly_adherence}%</span>

                                  {
                                    oilChartConfig
                                      ? <div id="oilChart"><ReactHighcharts config={oilChartConfig} /></div>
                                      : ''
                                  }
                                </div>
                              </div>
                            </div>
                          }
                          {(selected.some(item => item.value == "monthly_adherence")) &&
                            <div className="boxes_flex_1 flex-fill ">
                              <div className="card card_shadow">
                                <div className="card-body  task_level task_level1">
                                  <p> <span>Task Level</span> - Monthly Adherence</p>
                                  <span className="value"> {chartData.monthly_adherence}%</span>
                                  {
                                    oilChart2Config
                                      ? <div id="oilChart2"><ReactHighcharts config={oilChart2Config} /></div>
                                      : ''
                                  }

                                </div>
                              </div>
                            </div>
                          }
                        </div>
                        <div className="row task_box_card task_box_grid">
                          {(selected.some(item => item.value == "tasks")) &&
                            <div className="boxes_flex_1 flex-fill">
                              <div className="card card_shadow" >
                                <div className="card-body  task_level">
                                  <span className="position-absolute">Tasks</span>
                                  <div id="radialAngleChart" className="h-180 position-relative">
                                    {
                                      radicalBarGuageChartConfig != null
                                        ? <Chart options={radicalBarAngleChartConfig.options} series={radicalBarAngleChartConfig.series} type="radialBar" width={250} height={`250`} />
                                        : ''
                                    }

                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                          {(selected.some(item => item.value == "sla_adherence")) &&
                            <div className="boxes_flex_1 flex-fill ">
                              <div className="row">
                                <div className="col-lg-12 ">
                                  <div className="card card_shadow">
                                    <div className="card-body task_level task_level2">
                                      <span>Task SLA Adherence</span>
                                      <p className="compli_text">Compliance Adherence & SLAs met</p>
                                      <section className="circle-chart">
                                        <svg viewBox="0 0 35.83098862 35.83098862" width="200" height="185" xmlns="http://www.w3.org/2000/svg" className="mw-100">
                                          <circle className="circle-chart__background" stroke="#EDF0F4" strokeWidth="4" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                          <circle className="circle-chart__circle" stroke="#319fa9" strokeWidth="4" strokeDasharray={`${chartData.sla_adherence},${100 - chartData.sla_adherence}`} strokeLinecap="none" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                          <g className="circle-chart__info">
                                            <text className="circle-chart__percent" x="16.91549431" y="16.5" alignmentBaseline="central" textAnchor="middle" fontSize="8">{chartData.sla_adherence}%</text>
                                            <text className="circle-chart__subline" x="16.91549431" y="21.5" alignmentBaseline="central" textAnchor="middle" fontSize="2">SLA COMPLETED</text>
                                          </g>
                                        </svg>
                                      </section>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    </div>

                  </>
                )
              } else {
                return (
                  <>
                    <div className="row ma_bot">
                      <div className="col-lg-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
                        <div className="align-items-center d-flex justify-content-between my-3">
                          <div>

                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12 col-md-12 mob_pad">
                        <div className="row ma_bot task_box_card d-flex">
                          {(selected.some(item => item.value == "compliance_level")) &&
                            <div className="boxes_flex_1 flex-fill">
                              <div className="card card_shadow">
                                <div className="card-body  task_level position-relative ">
                                  <p> <span>Compliance Level</span> </p>
                                  <svg height="0" width="0" className="svg-clip" >
                                    <defs>
                                      <clipPath id="clip" clipPathUnits="objectBoundingBox">
                                        <path d="M1,.21 Q1,0 .81,.09L.187,.4 Q0,.5 .187,.59L.81,.90 Q1,1 1,.79Z" />
                                      </clipPath>
                                    </defs>
                                  </svg>
                                  <div className="traingle">
                                    {chartData.compliance_level && chartData.compliance_level > 0 && genArr(chartData.compliance_level).map((val, comIndex) => {
                                      return <div className="svg-triangle" data-bs-toggle="tooltip" title={`Level ${comIndex + 1}`}><span >Level {comIndex + 1}</span></div>
                                    })}
                                    {chartData.compliance_level && chartData.compliance_level > 0 && genArr(4 - chartData.compliance_level).map((val, comIndex) => {
                                      return <div className="svg-triangle blank" data-bs-toggle="tooltip" title={`Level ${(chartData.compliance_level + (comIndex + 1))}`}><span >Level {(chartData.compliance_level + (comIndex + 1))}</span></div>
                                    })}
                                  </div>

                                </div>
                              </div>
                            </div>
                          }
                          {(selected.some(item => item.value == "sustenance_adherence")) &&
                            <div className="boxes_flex_1 flex-fill ">
                              <div className="card card_shadow">
                                <div className="card-body  task_level">
                                  <p> <span>Sustenance Adherence</span> </p>

                                  <div id="Compliance_Standars position-relative" className="h-180">
                                    {
                                      radicalBarGuageChartConfig != null
                                        ? <Chart options={radicalBarGuageChartConfig.options} series={radicalBarGuageChartConfig.series} type="radialBar" height={`250`} />
                                        : ''
                                    }

                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                          {(selected.some(item => item.value == "weekly_adherence")) &&
                            <div className="boxes_flex_1 flex-fill ">
                              <div className="card card_shadow">
                                <div className="card-body  task_level task_level1">
                                  <p> <span>Task Level</span> - Weekly Adherence</p>
                                  <span className="value"> {chartData.weekly_adherence}%</span>

                                  {
                                    oilChartConfig
                                      ? <div id="oilChart"><ReactHighcharts config={oilChartConfig} /></div>
                                      : ''
                                  }
                                </div>
                              </div>
                            </div>
                          }
                          {(selected.some(item => item.value == "monthly_adherence")) &&
                            <div className="boxes_flex_1 flex-fill ">
                              <div className="card card_shadow">
                                <div className="card-body  task_level task_level1">
                                  <p> <span>Task Level</span> - Monthly Adherence</p>
                                  <span className="value"> {chartData.monthly_adherence}%</span>
                                  {
                                    oilChart2Config
                                      ? <div id="oilChart2"><ReactHighcharts config={oilChart2Config} /></div>
                                      : ''
                                  }

                                </div>
                              </div>
                            </div>
                          }
                        </div>

                      </div>
                    </div>
                    <div className="row  mb-3 task_box_card_fall d-flex">
                      {(selected.some(item => item.value == "failing_cd")) &&
                        <div className="boxes_flex_1 flex-fill mob_pad">
                          <div className="card card_shadow">
                            <div className="card-body p-0">
                              <div className="row  falling_height">
                                <div className="col-lg-6 col-sm-6 col-12 falling_do">
                                  <figure className="highcharts-figure">
                                    <div id="containersin" className="h-180">
                                      <ReactHighcharts config={getSemiDonutDConfig(1)} />
                                    </div>
                                  </figure>
                                  <p className="falling_dot position-relative text-center"> <span></span>Failing Domains</p>
                                </div>
                                <div className="col-lg-6 col-sm-6 col-12 falling_do">
                                  <figure className="highcharts-figure">
                                    <div id="containerdbl" className="h-180">
                                      <ReactHighcharts config={getSemiDonutDConfig(2)} />
                                    </div>
                                  </figure>
                                  <p className="falling_dot position-relative text-center"> <span className="blue_color"></span>Failing Controls</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                      {(selected.some(item => item.value == "tasks")) &&
                        <div className="boxes_flex_1 flex-fill">
                          <div className="card card_shadow" style={{ "height": '210px' }}>
                            <div className="card-body  task_level">
                              <span className="position-absolute">Tasks</span>
                              <div id="radialAngleChart" className="h-180 position-relative">
                                {
                                  radicalBarGuageChartConfig != null
                                    ? <Chart options={radicalBarAngleChartConfig.options} series={radicalBarAngleChartConfig.series} type="radialBar" width={250} height={`250`} />
                                    : ''
                                }

                              </div>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                    <div className="row  mb-3 task_box_card_fall d-flex">
                      {(selected.some(item => item.value == "sla_adherence")) &&
                        <div className="boxes_flex_1 flex-fill ">
                          <div className="row">
                            <div className="col-lg-12 ">
                              <div className="card card_shadow">
                                <div className="card-body task_level task_level2">
                                  <span>Task SLA Adherence</span>
                                  <p className="compli_text">Compliance Adherence & SLAs met</p>
                                  <section className="circle-chart">
                                    <svg viewBox="0 0 35.83098862 35.83098862" width="200" height="185" xmlns="http://www.w3.org/2000/svg" className="mw-100">
                                      <circle className="circle-chart__background" stroke="#EDF0F4" strokeWidth="4" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                      <circle className="circle-chart__circle" stroke="#319fa9" strokeWidth="4" strokeDasharray={`${chartData.sla_adherence},${100 - chartData.sla_adherence}`} strokeLinecap="none" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                      <g className="circle-chart__info">
                                        <text className="circle-chart__percent" x="16.91549431" y="16.5" alignmentBaseline="central" textAnchor="middle" fontSize="8">{chartData.sla_adherence}%</text>
                                        <text className="circle-chart__subline" x="16.91549431" y="21.5" alignmentBaseline="central" textAnchor="middle" fontSize="2">SLA COMPLETED</text>
                                      </g>
                                    </svg>
                                  </section>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                      {(selected.some(item => item.value == "adherence_comparison")) &&
                        <div className="boxes_flex_1 flex-fill mob_pad">
                          <div className="row">
                            <div className="col-lg-12">
                              <div className="card card_shadow" style={{ "height": '278px' }}>
                                <div className="card-body  task_level">
                                  <span>Adherence Comparison</span>
                                  <div className="d-flex align-items-center justify-content-between h-150">
                                    <div>
                                      <p className="adher"><span></span> Benchmark Adherence</p>
                                      <p className="adherence"><span></span>Your Adherence</p>
                                    </div>
                                    <div>
                                      <div id="chart1">
                                        <div id="radial-chart">
                                          {
                                            radicalBarChartConfig != null
                                              ? <Chart options={radicalBarChartConfig.options} series={radicalBarChartConfig.series} type="radialBar" width={200} height={`230`} />
                                              : ''
                                          }

                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </>
                )
              }

            })()}
          </div>
      }
    </>
  )
}

export default Dashboard