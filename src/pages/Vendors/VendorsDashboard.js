import ApiService from "../../services/ApiServices";
import { useNavigate } from "react-router-dom";
import Header from "../../components/partials/Header";
import Chart from 'react-apexcharts'
import { radialBarDefaultConfig, areaChartDefaultConfig, AreasplineDefaultConfig, radialMultiBarDefaultConfig, SemiDonutDefaultConfig } from "../../helpers/chartsConfig";
import { useContext, useEffect, useState } from "react";
import { LayoutContext } from "../../ContextProviders/LayoutContext";
import AIrInitials from "../../elements/AirInitials";
import Styles from "../../styles/VendorsDashboard.module.css"
import { GetInitials } from "../../helpers/Helper";
import ReactHighcharts from "react-highcharts";


const VendorsDashboard = (props) => {
  const { projectId, setProjectId, user = {}, updateData } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const [areaChartConfig, setAreaChartConfig] = useState(null)
  const [vendorsComplianceData, setVendorsComplianceData] = useState(null)
  const [approvedVendorsData, setApprovedVendorsData] = useState(null)
  const [inProgressVendorsData, setInProgressVendorsData] = useState(null)
  const [failedVendorsData, setFailedVendorsData] = useState(null)
  const [overDueVendorsData, setOverDueVendorsData] = useState(null)
  const [radicalBarChartConfig, setradicalBarChartConfig] = useState(null)
  const [chartData, setChartData] = useState({})
  const navigate = useNavigate()
  const monthArr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

  useEffect(() => {
    if (projectId != null && Object.keys(chartData).length == 0) {
      getDashboardData()
    }

  }, [projectId])

  useEffect(() => {
    if (Object.keys(chartData).length > 0) {

      if (radicalBarChartConfig == null) {
        let config = Object.assign({}, radialMultiBarDefaultConfig(chartData?.vendor_details?.total_vendors))
        config.options.colors = ["#319fa9", "#59e0f7", "#1974D3",]
        config.options.labels = ['Critcal (Major)', 'Critical (Minor)', 'Non Critical']
        config.options.plotOptions.radialBar.dataLabels.value.fontWeight = '600'
        config.options.plotOptions.radialBar.dataLabels.value.offsetY = 5
        config.series = [chartData?.vendor_details?.critical_major_vendors, chartData?.vendor_details?.critical_minor_vendors, chartData?.vendor_details?.non_critical_vendors]
        setradicalBarChartConfig(config)
      }
      if (vendorsComplianceData == null && Object.keys(chartData).length > 0) {
        let config = Object.assign({}, areaChartDefaultConfig())
        let data = chartData?.vendor_compliance || []
        let dataMonths = data.map((item, index) => item.month)
        let seriesData = []
        monthArr.map((month, mkey) => {
          let value = 0
          if (dataMonths.indexOf(mkey + 1) != -1) {
            let key = dataMonths.indexOf(mkey + 1)
            value = Number(data[key].compliance)
          }
          seriesData.push(value)
        })
        config.series[0].name = "Compliance"
        config.series[0].data = seriesData
        config.options.xaxis.type = "category"
        config.options.xaxis.categories = monthArr
        setVendorsComplianceData(config)
      }
      // if (approvedVendorsData == null) {
      //   let config = Object.assign({}, areaChartDefaultConfig())
      //   setApprovedVendorsData(config)
      // }
      // if (inProgressVendorsData == null) {
      //   let config = Object.assign({}, areaChartDefaultConfig())
      //   setInProgressVendorsData(config)
      // }
      // if (failedVendorsData == null) {
      //   let config = Object.assign({}, areaChartDefaultConfig())
      //   setFailedVendorsData(config)
      // }
      // if (overDueVendorsData == null) {
      //   let config = Object.assign({}, areaChartDefaultConfig())
      //   setOverDueVendorsData(config)
      // }

    }

    return () => {
      // setOilChart2Config(null)
    }
  }, [radicalBarChartConfig, approvedVendorsData, inProgressVendorsData, failedVendorsData, overDueVendorsData, chartData])

  const getDashboardData = async () => {
    let payloadUrl = `orgs/getVendorDashboard/${orgId}`
    let method = "GET";
    let formData = {};
    formData = {
      "project_id": Number(projectId),
      "start_date": "2022-01-01",
      "end_date": "2022-12-31"
    }
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      let dataArr = res.results
      // dataArr = dataArr[0];
      if (dataArr.length > 0) {
        let data = dataArr[0];
        setChartData(data)
      }

    }
  }

  const getSemiDonutDConfig = (type = null,val = 0, graphColor = null) => {
    if (type == null) {
      return false
    }
    let configData = Object.assign({}, SemiDonutDefaultConfig())

    if (type == 1) {
      // configData = Object.assign({}, SemiDonutDefaultConfig())
      configData.title.text = undefined
      configData.series[0].data = [{
        name: 'Red slice',
        y: val,
        color: graphColor || '#40c7de'
      }, {
        name: 'Blue slice',
        y: (100 - val),
        color: '#F0F2F8'
      }]

    }
    configData.chart.height = "180px"
    return configData
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


  return (
    <>
      <Header />
      <div id={Styles.v_dashbord_sec}>
        <div className="container-fluid">
          <div className="row mb-lg-0 mb-md-0 px-lg-2">
            <div className="col-xl-6 col-lg-12  col-md-12 d-flex pr-lg-0 mb-md-2 p-sm-0">
              <div className="card w-100 shadow border">
                <div className="card-body pb-0">
                  <h4 className="f-14">Vendor Details</h4>
                  {(() => {
                    if (radicalBarChartConfig != null) {
                      return (
                        <>
                          <div className="d-flex">
                            <div id="vendorDetail2" className="w-50">
                              <Chart options={radicalBarChartConfig.options} series={radicalBarChartConfig.series} type="radialBar" width={200} height={`200`} />
                            </div>
                            <div className="vendor_info_block flex-fill">
                              <div className={`${Styles.vendor_info_box} px-3`}>
                                <p className={`${Styles.count} ${Styles.color_1} fw-700 m-0`}>{chartData?.vendor_details?.critical_major_vendors}</p>
                                <p className="m-0"> Critcal (Major)</p>
                              </div>
                              <div className={`${Styles.vendor_info_box} px-3`}>
                                <p className={`${Styles.count} ${Styles.color_2} fw-700 m-0`}>{chartData?.vendor_details?.critical_minor_vendors}</p>
                                <p className="m-0"> Critical (Minor)</p>
                              </div>
                              <div className={`${Styles.vendor_info_box} px-3`}>
                                <p className={`${Styles.count} ${Styles.color_3} fw-700 m-0`}>{chartData?.vendor_details?.non_critical_vendors}</p>
                                <p className="m-0"> Non Critical</p>
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

            <div className="col-xl-3 col-lg-6 col-md-6 pl-lg-2 pr-lg-2 d-flex  mb-md-2 pr-md-1 p-sm-0">
              <div className="card shadow w-100 border">
                <div className="card-body pb-0">
                  <h4 className="f-14">Average Vendor Score</h4>
                  <div id="c4" className="d-flex align-items-center">
                    <section className="circle-chart">
                      <svg viewBox="0 0 35.83098862 35.83098862" width="200" height="170" xmlns="http://www.w3.org/2000/svg">
                        <circle className="circle-chart__background" stroke="#EDF0F4" strokeWidth="5" fill="none" cx="17.91549431" cy="17.91549431" r="14" />
                        <circle className="circle-chart__circle" stroke="#319fa9" strokeWidth="5" strokeDasharray={`${chartData?.vendor_details?.avg_score || 0},${100 - (chartData?.vendor_details?.avg_score || 0)}`} strokeLinecap="none" fill="none" cx="17.91549431" cy="17.91549431" r="14" />
                        <g className="circle-chart__info">
                          <text className="circle-chart__percent fw-600" x="18" y="18" alignmentBaseline="central" textAnchor="middle" fontSize="6">{chartData?.vendor_details?.avg_score || 0}%</text>
                        </g>
                      </svg>
                    </section>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 pl-lg-0 d-flex  mb-md-2 pl-md-1 p-sm-0">
              <div className="card shadow w-100">
                <div className="card-body pb-0">
                  <h4 className="f-14 text-nowrap">Average Time Taken by Vendor</h4>
                  <div id="c5" className="d-flex align-items-center">
                    <section className="circle-chart">
                      <svg viewBox="0 0 35.83098862 35.83098862" width="200" height="170" xmlns="http://www.w3.org/2000/svg">
                        <circle className="circle-chart__background" stroke="#EDF0F4" strokeWidth="5" fill="none" cx="17.91549431" cy="17.91549431" r="14" />
                        <circle className="circle-chart__circle" stroke="#59e0f7" strokeWidth="5" strokeDasharray={`${chartData?.vendor_details?.avg_time || 0},${100 - (chartData?.vendor_details?.avg_time || 0)}`} strokeLinecap="none" fill="none" cx="17.91549431" cy="17.91549431" r="14" />
                        <g className="circle-chart__info">
                          <text className="circle-chart__percent fw-600" x="18" y="15.5" alignmentBaseline="central" textAnchor="middle" fontSize="6">{chartData?.vendor_details?.avg_time || 0}</text>
                          <text className="circle-chart__subline fw-300" x="18" y="21.5" alignmentBaseline="central" textAnchor="middle" fontSize="4">Days</text>
                        </g>
                      </svg>
                    </section>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-lg-2 mb-md-2 p-sm-0 px-lg-2">
            <div className="col-lg-6 col-md-12 pr-lg-0 d-flex mb-md-2 mb-lg-0 p-sm-0">
              <div className="card shadow border w-100">
                <div className="card-body ">
                  <h4 className="f-14">Vendor Compliance</h4>
                  <div id="vendorC2" className="d-flex align-items-center h-100" style={{ minHeight: "290px" }}>
                    {
                      vendorsComplianceData != null
                        ? <Chart options={vendorsComplianceData.options} series={vendorsComplianceData.series} type="area" className="w-100" height={180} />
                        : ''
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 pl-lg-2 d-flex p-sm-0">
              <div className="card shadow border w-100">
                <div className="card-body pb-0">
                  <h4 className="f-14">Top 5 Least Score Vendors</h4>
                  <div>
                    <ul className="list-unstyled vendors_table_block">
                      {chartData?.least_score_vendors && chartData.least_score_vendors.length > 0 && chartData.least_score_vendors.map((vendor, vIndex) => {
                        return (
                          <li key={vIndex} className="d-flex align-items-center border-bottom p-2 justify-content-between">
                            <AIrInitials str={vendor.vendor_name} AiClass={'link_url mr-2'} showToolTip={`${vendor.vendor_name}`} />
                            <span className={`f-14 ${Styles.vendor_name}`}>{vendor.vendor_name}</span>
                            <a className={`f-14 ${Styles.vendor_email}`}>{vendor.email}</a>
                            <span className="f-14 vendor_score">{vendor.score}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-md-0 px-lg-2">
            <div className="col-lg-4 col-md-12 d-flex flex-lg-column flex-row pr-lg-0 mb-md-2 p-sm-0">
              <div className="card mb-md-0 mb-lg-2 shadow border mr-md-2 mr-lg-0 d-flex w-100">
                <div className="card-body pb-0 w-100">
                  <h4 className="f-14 ">Approved Assessments</h4>
                  <div className="d-flex align-items-center">
                    <div className="w-100 d-flex align-items-center mt-3 pt-1">
                      <img src="/assets/img/greenRight1.svg" alt="" width="32" className="mr-2" />
                      <span className="h2 mb-0 font-weight-bold">{chartData?.vendor_details?.approved_vendors || 0}</span>
                    </div>
                    { }
                    <div id="approvedVendor" className="mw-100 min-width-460-md">
                      {/* {
                          approvedVendorsData != null
                            ? <Chart options={approvedVendorsData.options} series={approvedVendorsData.series} type="area" height={120} />
                            : ''
                        } */}
                      <figure className="highcharts-figure">
                        <div id="containerdbl" className="h-180">
                          <ReactHighcharts config={getSemiDonutDConfig(1,chartData?.vendor_details?.approved_vendors && chartData?.vendor_details?.total_vendors ? ((chartData?.vendor_details?.approved_vendors/chartData?.vendor_details?.total_vendors)*100) : 0,"rgb(89 224 247)")} />
                        </div>
                      </figure>
                      {/* <img className="img-fluid" src="/assets/img/area_graph4.png" alt="graph" /> */}

                    </div>
                  </div>

                </div>
              </div>
              <div className="card shadow border d-flex mb-lg-0 w-100">
                <div className="card-body pb-0">
                  <h4 className="f-14 ">In - Progress Assessments</h4>

                  <div className="d-flex align-items-center">
                    <div className="w-100 d-flex align-items-center mt-3 pt-1">
                      <img src="/assets/img/inprogress1.svg" width="32" alt="" className="mr-2" />
                      <span className="h2 mb-0 font-weight-bold">{chartData?.vendor_details?.inprogress_vendors || 0}</span>
                    </div>

                    <div id="inprogressVendor" className="w-100">
                      {/* {
                          inProgressVendorsData != null
                            ? <Chart options={inProgressVendorsData.options} series={inProgressVendorsData.series} type="area" height={120} />
                            : ''
                        } */}
                      <figure className="highcharts-figure">
                        <div id="containerdbl" className="h-180">
                          <ReactHighcharts config={getSemiDonutDConfig(1,chartData?.vendor_details?.inprogress_vendors && chartData?.vendor_details?.total_vendors ? ((chartData?.vendor_details?.inprogress_vendors/chartData?.vendor_details?.total_vendors)*100) : 0,"rgb(49 159 169 / 60%)")} />
                        </div>
                      </figure>
                      {/* <img className="img-fluid" src="/assets/img/area_graph3.png" alt="graph" /> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 d-flex pr-lg-0 mb-md-2 pl-lg-2 pr-md-0 p-sm-0">
              <div className="card w-100 shadow border failed_vendor">
                <div className="card-body pb-0">
                  <h4 className="f-14 ">Failed Assessments</h4>
                  <div className="d-flex align-items-center">
                    <div className="w-100 d-flex align-items-center mt-3 pt-1">
                      <img src="/assets/img/error1.svg" width="32" alt="" className="mr-2" />
                      <span className="h2 mb-0 font-weight-bold">{chartData?.vendor_details?.failed_vendors_count || 0}</span>
                    </div>

                    <div id="failedVendor" className="w-100">
                      {/* {
                          failedVendorsData != null
                            ? <Chart options={failedVendorsData.options} series={failedVendorsData.series} type="area" height={120} />
                            : ''
                        } */}
                        <figure className="highcharts-figure">
                        <div id="containerdbl" className="h-180">
                          <ReactHighcharts config={getSemiDonutDConfig(1,chartData?.vendor_details?.failed_vendors_count && chartData?.vendor_details?.total_vendors ? ((chartData?.vendor_details?.failed_vendors_count/chartData?.vendor_details?.total_vendors)*100) : 0,"rgb(49 159 169 / 80%)")} />
                        </div>
                      </figure>
                      {/* <img className="img-fluid" src="/assets/img/area_graph2.png" alt="graph" /> */}
                    </div>
                  </div>
                  <div>
                    <ul className="list-unstyled sidebarNav">
                      {chartData?.failed_vendors && chartData.failed_vendors.length > 0 && chartData.failed_vendors.map((vendor, fvIndex) => {
                        return (
                          <li key={fvIndex} className="d-flex align-items-center border-bottom p-2">
                            <AIrInitials str={vendor.vendor_name} AiClass={'link_url mr-4'} showToolTip={`${vendor.vendor_name}`} />
                            <span className="f-14">{vendor.vendor_name}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 d-flex mb-md-2 pl-lg-2 pl-md-2 p-sm-0">
              <div className="card w-100 shadow border overdue_vendor">
                <div className="card-body pb-0">
                  <h4 className="f-14 ">Overdue Assessments</h4>
                  <div className="d-flex align-items-center">
                    <div className="w-100 d-flex align-items-center mt-3 pt-1">
                      <img src="/assets/img/overdue1.svg" width="32" alt="" className="mr-2" />
                      <span className="h2 mb-0 font-weight-bold">{chartData?.vendor_details?.overdue_vendors_count || 0}</span>
                    </div>
                    <div id="overdueVendor" className="w-100">
                      {/* {
                          overDueVendorsData != null
                            ? <Chart options={overDueVendorsData.options} series={overDueVendorsData.series} type="area" height={120} />
                            : ''
                        } */}
                        <figure className="highcharts-figure">
                        <div id="containerdbl" className="h-180">
                          <ReactHighcharts config={getSemiDonutDConfig(1,chartData?.vendor_details?.overdue_vendors_count && chartData?.vendor_details?.total_vendors ? ((chartData?.vendor_details?.overdue_vendors_count/chartData?.vendor_details?.total_vendors)*100) : 0,"rgb(25 116 211)")} />
                        </div>
                      </figure>
                      {/* <img className="img-fluid" src="/assets/img/area_graph1.png" alt="graph" /> */}
                    </div>
                  </div>
                  <div>
                    <ul className="list-unstyled sidebarNav">
                      {chartData?.overdue_vendors && chartData.overdue_vendors.length > 0 && chartData.overdue_vendors.map((vendor, ovIndex) => {
                        return (
                          <li key={ovIndex} className="d-flex align-items-center border-bottom p-2">
                            <AIrInitials str={vendor.vendor_name} AiClass={'link_url mr-4'} showToolTip={`${vendor.vendor_name}`} />
                            <span className="f-14">{vendor.vendor_name}</span>
                          </li>
                        )
                      })}
                    </ul>
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

export default VendorsDashboard