import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import Header from "../components/partials/Header";
import React, { useContext, useEffect, useState } from "react";
import AIR_MSG from "../helpers/AirMsgs";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import SweetAlert from "react-bootstrap-sweetalert";

const Project = (props) => {
  const { user = {}, setReloadHeader } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const AccountId = user?.currentUser?.account_id || 0;
  const AccountName = user?.currentUser?.account_name || 0;
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const { register, handleSubmit, resetField, formState: { errors } } = useForm();
  const [projects, setProjects] = useState([])
  const [formSubmitted, setFormSbmt] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' });
  useEffect(() => {
    if (projects.length == 0) {
      getProjects()
    }
  }, [])

  const getProjects = async () => {
    let payloadUrl = `configuration/getProjects`
    let method = "GET";
    let formData = {}
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let projects = res.results
      setProjects(res.results)
      // projects && projects.length > 0 && projects.map((project) => {

      // })

    }
  }


  const addProject = async (data) => {
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (!AccountId || AccountId == '' || !data.project_name || data.project_name == '') {
      return false
    };
    let payloadUrl = `configuration/addProject`
    let method = "POST";
    let formData = { account_id: AccountId, project_name: data.project_name }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      resetField("project_name")
      setReloadHeader(true)
      formRes = { status: true, err_status: false, type: "addProject", error: {}, msg: "" }
      setFormRes(formRes)
      getProjects();
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "addProject"
      formRes['error']['msg'] = ""

      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }

  const delProject = async (index = null, item = null) => {
    toggleAlert({ show: false, type: 'success', message: '' });
    if (index == null || item == null) {
      return false;
    }
    setFormSbmt(true)
    let payloadUrl = `configuration/editProject/${item.project_id}`
    
    let method = "POST";
    let formData = { status: "D"}
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      let tempArr = [...projects];
      tempArr.splice(index, 1)
      setProjects(oldVal => {
        return [...tempArr]
      })
    } else {
      formRes['err_status'] = true
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setFormSbmt(false)
  }
  const toggleAlert = (val) => {
    setShowAlert(val)
  }
  const onDel_Confirmation = async (event, type = '', data) => {
    event.stopPropagation()
    if (type == '') {
      return false
    }
    setShowAlert({ show: true, type: "del_project", message: "", data })
  }

  return (
    <>
      <Header />
      <div id="accordion" className="profileSec pl-lg-3 pr-lg-3 accordianSec  mt-3">
        <div className="card">
          <form onSubmit={handleSubmit(addProject)}>
            <div className="card-header justify-content-between py-4">
              <a className="card-title"></a>
              <button className="btn btn-primary-2 btn_03" type="submit" disabled={formSubmitted}>Add</button>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="formInline m-0">
                    <label htmlFor="">Account Name:</label>
                    <input type="text" className="form-control bg-transparent" {...register("account")} name="account" autoComplete="off" defaultValue={AccountName} readOnly={true} />
                  </div>
                  {errors.account?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.acc_name_required}</div>}
                </div>
                <div className="col-md-6">
                  <div className="formInline m-0">
                    <label htmlFor="">Project Name:</label>
                    <input type="text" className="form-control bg-transparent"{...register("project_name", { required: true })} name="project_name" autoComplete="off" defaultValue="" />
                  </div>
                  {errors.project_name?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.project_name_required}</div>}
                </div>
              </div>
              <div className="row">
                {
                  !formRes.status && formRes.err_status && formRes.error?.type == "addProject"
                    ? <div className="form_err text-danger"><div>{AIR_MSG.form_err('Project')}</div> </div>
                    : ''
                }
                {
                  formRes.status && formRes?.type == "addProject"
                    ? <div className="form_success text-success"><div>{AIR_MSG.form_success('Project', 'add')}</div> </div>
                    : ''
                }
              </div>

              <div className="search_result bg-white fs-14 mt-4">
                <div className="px-3 h_labels">
                  <div className="w200 flex-grow-1 ml-lg-3 ml-md-0">Project ID</div>
                  <div className="w200 flex-grow-1 ml-lg-3 ml-md-0 text-left text_color_2">Project Name</div>
                  <div className="w200 flex-grow-1 ml-lg-3 ml-md-0 text_color_2 mr-0 text-left ">Account Name</div>
                  <div className="mr-lg-3 w20" style={{ width: '20px' }}></div>
                </div>
                {projects && projects.length > 0 && React.Children.toArray(projects.map((item, pIndex) => {
                  return (
                    <div key={pIndex} className="px-3">
                      <div className="w200 flex-grow-1 ml-lg-3 ml-md-0">{item.project_id}</div>
                      <div className="w200 flex-grow-1 ml-lg-3 ml-md-0 text-left text_color_2">{item.project_name}</div>
                      <div className="w200 flex-grow-1 ml-lg-3 ml-md-0 text_color_2 mr-0 text-left">{item.account_name}</div>
                      {projects.length > 1 && <div className="mr-lg-3 w20"> 
                      {/* <a onClick={() => delProject(pIndex,item)} disabled={formSubmitted}> <img src="/assets/img/times.svg" alt="" className="plus" />  </a> */}
                      <button className="border-0 bg-transparent" onClick={(e) => onDel_Confirmation(e, "del_project",{pIndex, item})} disabled={formSubmitted}> <i className="fa fa-trash"></i></button>
                      </div>}
                    </div>
                  )
                })) }
              </div>
            </div>
          </form>

        </div>
      </div>
      {(() => {
              if (showAlert && showAlert.show && showAlert.type == "del_project") {
                return (
                  <SweetAlert
                    danger
                    showCancel
                    confirmBtnText="Delete"
                    confirmBtnBsStyle="danger"
                    cancelBtnCssClass="btn btn-outline-secondary text_color_2"
                    title={`Are you sure  you want delete this project?`}
                    onConfirm={() => delProject(showAlert?.data?.pIndex, showAlert?.data?.item)}
                    confirmBtnCssClass={'btn_05'}
                    onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
                    focusConfirmBtn
                  >
                  </SweetAlert>
                )
              } 
              
            }
            )()}
    </>
  )
}

export default Project