import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../components/partials/Header";
import Styles from "../styles/AuditLogs.module.css"
import React, { useContext, useEffect, useState } from "react";
import { LayoutContext } from "../ContextProviders/LayoutContext";

const AuditLogs = (props) => {
  const { projectId = null, user = {} } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const superUser = user?.currentUser?.super_user
  // const projectId = 1;
  const [taskLogs, setTaskLogs] = useState([])
  const [employeeLogs, setEmployeeLogs] = useState([])
  const navigate = useNavigate()

  // const { register, handleSubmit, watch, formState: { errors } } = useForm(); // initialize the hook
  const [formSubmitted, setFormSbmt] = useState(false)
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [errorMsg, setErrorMsg] = useState(false);
  const { register, handleSubmit, watch, trigger, setValue, clearErrors, formState: { errors } } = useForm();
  

  
  // const { register, handleSubmit, watch, formState: { errors } } = useForm();
  

  const [viewType, setViewType] = useState(1)

  

  useEffect(() => {
    if(projectId != null){
      if(taskLogs.length == 0){
        getLogs(1)
      }
    }
    
  }, [projectId])

  

  

  const getLogs = async (type = 1) => {
    let payloadUrl = `reference/getAuditLogs/${projectId}/${'project_tasks'}`
    if(type == 2){
      payloadUrl = `reference/getAuditLogs/${projectId}/${'employees'}`
    }
    
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success" && res.results.length > 0) {
      let data = res.results
      if(type == 1){
        setTaskLogs(oldVal => {
          return [...data]
        })
      }else if(type == 2){
        setEmployeeLogs(oldVal => {
          return [...data]
        })
      }
    }
  }

  const switchView = (type = null) => {
    if (type == null) {
      return false
    }
    getLogs(type)
    setViewType(type)
  }


  return (
    <>
      <Header />
      {/* <div id="accordion" className="profileSec pl-lg-3 pr-lg-3 accordianSec  mt-3"> */}
      <div id="accordion" className="pl-lg-3 pr-lg-3 mt-3">
        <div className="card card_shadow_none p-2">
          <div className="card-header justify-content-between py-2 bg_color_2 border-0">
            <div className={`${Styles.config_tabs_box}`}>
              <a className={`link_url border text_color_2 ${viewType == 1 ? Styles.active : ''}`} onClick={() => switchView(1)}>Task Audit</a>
              <a className={`link_url border text_color_2 ${viewType == 2 ? Styles.active : ''}`} onClick={() => switchView(2)}>User Audit</a>
            </div>
          </div>
          <div className="card-body">
            {(() => {
              if (viewType == 1) {
                return (
                  <>
                    <div className={`table-responsive assessment_Table fc-scroller border border-top-0`}>
                      <table className="table mb-0">
                        <thead>
                          <tr>
                            <th><a className="link_url">Task Title</a></th>
                            <th><a className="link_url">Updated Field</a></th>
                            <th><a className="link_url">Before</a></th>
                            <th><a className="link_url">After</a></th>
                            <th><a className="link_url">Updated By</a></th>
                            <th><a className="link_url">Updated On</a></th>
                            
                          </tr>
                        </thead>
                        <tbody>

                          {viewType == 1 && taskLogs && taskLogs.length > 0 && React.Children.toArray(taskLogs.map((item,tlIndex) => {
                            return (
                              <tr>
                                <td>{item.title}</td>
                                <td>{item.updated_field}</td>
                                <td>{(item.before_update == -1 || item.before_update == "NA") ? "" : item.before_update}</td>
                                <td>{(item.after_update == -1 || item.after_update == "NA") ? "" : item.after_update}</td>
                                <td>{item.updated_by}</td>
                                <td>{item.updated_on}</td>
                              </tr>
                            )
                          }))}
                         
                        </tbody>

                      </table>
                    </div>
                  </>
                )

              } else if (viewType == 2) {
                return (
                  <>
<div className={`table-responsive assessment_Table fc-scroller border border-top-0`}>
                      <table className="table mb-0">
                        <thead>
                          <tr>
                            <th><a className="link_url">Employee Name</a></th>
                            <th><a className="link_url">Updated Field</a></th>
                            <th><a className="link_url">Before</a></th>
                            <th><a className="link_url">After</a></th>
                            <th><a className="link_url">Updated By</a></th>
                            <th><a className="link_url">Updated On</a></th>
                            
                          </tr>
                        </thead>
                        <tbody>
                          {employeeLogs && employeeLogs.length > 0 && React.Children.toArray(employeeLogs.map((item,elIndex) => {
                            return (
                              <tr>
                                <td>{item.employee}</td>
                                <td>{item.updated_field}</td>
                                <td>{item.before_update}</td>
                                <td>{item.after_update}</td>
                                <td>{item.updated_by}</td>
                                <td>{item.updated_on}</td>
                              </tr>
                            )
                          }))}
                        </tbody>

                      </table>
                    </div>
                  </>
                )
              }
            })()}


          </div>

        </div>
      </div>
      
    </>
  )
}

export default AuditLogs