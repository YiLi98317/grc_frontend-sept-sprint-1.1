import { useForm } from "react-hook-form";
import ApiService from "../../services/ApiServices";
import { SetCookie, GetCookie, encryptData, sortArr } from "../../helpers/Helper";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Header from "../../components/partials/Header";
import { lazy, useContext, useEffect, useRef, useState, Fragment } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { LayoutContext } from "../../ContextProviders/LayoutContext";
import AirPagination from "../../elements/AirPagination";
import Styles from "../../styles/VendorConf.module.css"
import AIR_MSG from "../../helpers/AirMsgs";
import Loader from "../../components/partials/Loader";
import SweetAlert from "react-bootstrap-sweetalert";
// const LayoutContext = lazy(() => import("../ContextProviders/LayoutContext"))


const VendorConfiguration = (props) => {
  // const {setShowLoader} = useContext(LayoutContext)
  // const { user = {} } = useOutletContext()
  const { projectId, setProjectId, user = {}, updateData } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const [view, setView] = useState('manage_members')
  const [vendorCertifications, setVendorCertifications] = useState([])
  const [members, setMembers] = useState(null)
  const [filteredList, setFilteredList] = useState(null)
  const [memberRoles, setMemberRoles] = useState([])

  const [editMemIndex, setEditMemIndex] = useState(null)

  const editMemRoleInpRef = useRef([])
  const editMemEmailInpRef = useRef([])
  const editMemStatInpRef = useRef([])
  const navigate = useNavigate()
  // const { register, handleSubmit, watch, formState: { errors } } = useForm(); // initialize the hook
  const { register, handleSubmit, resetField, setValue, watch, formState: { errors } } = useForm();
  const [formSubmitted, setFormSbmt] = useState(false)
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [errorMsg, setErrorMsg] = useState(false);
  const [showContentLaoder, setShowContentLaoder] = useState(false);
  // const showLoader = false
  const searchKeyword = useRef()
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })

  // sorting data
  const [activeCol, setActiveCol] = useState('')
  const [activeSortOrder, setActiveSortOrder] = useState('ASC')

  useEffect(() => {

    initializeData()
  }, [user])

  const initializeData = () => {

    if (vendorCertifications.length == 0) {
      fetchInfo("vendor_certifications")
    }

    if (!members || members.length == 0) {
      fetchInfo('vendor_employees')
    }
    if (memberRoles.length == 0) {
      fetchInfo('member_roles')
    }


  }



  const fetchInfo = async (type = '', projectInfo = null) => {
    if (type == '') {
      return false
    };

    let payloadUrl = ""
    let method = "POST";
    let formData = {};

    if (type == 'vendor_certifications') {
      payloadUrl = `vendor_config/getVendorCertifications/${orgId}`
      method = "GET";
    } else if (type == 'vendor_employees') {
      payloadUrl = `vendor_config/getOrgVendorEmployees/${orgId}`
      method = "GET";
    } else if (type == 'member_roles') {
      payloadUrl = 'reference/getVendorAuthorities/Y'
      method = "GET";
    }

    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      if (type == 'vendor_certifications') {
        setVendorCertifications(oldVal => {
          return [...res.results]
        })
      } else if (type == 'vendor_employees') {
        setMembers(oldVal => {
          return [...res.results]
        })
        setFilteredList(oldVal => {
          return [...res.results]
        })
      } else if (type == "member_roles") {
        setMemberRoles(oldVal => {
          return [...res.results]
        })
      }
    }
  }

  const searchFilter = () => {
    let listArr = Object.assign([],members)
    let keyword = searchKeyword.current.value || '';
    let tempArr = listArr.filter((member,index)=>{
      let regexExp = new RegExp(keyword,'i')
      // console.log(keyword)
      
      let result = false
      if(member.first_name.search(regexExp) != -1 || 
          member.email.search(regexExp) != -1 || 
          member.authority.search(regexExp) != -1 || 
          member.last_name.search(regexExp) != -1
        ){
        result = true
      }else{
        result = false
      }
      return result
    })
    setFilteredList(oldVal =>{
      return [...tempArr]
    })
  }

  const addOrUpdateVendorCertification = async (certIndex = null, ele = null) => {
    if (certIndex == null || ele == null) {
      return false;
    }
    let certDetails = vendorCertifications[certIndex] ? vendorCertifications[certIndex] : false
    if (certDetails) {
      let payloadUrl = "vendor_config/addVendorCertifications"
      let method = "POST";
      let formData = { certification_id: certDetails.cert_id, org_id: orgId, is_added: ele.checked ? 'Y' : 'N' }
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {

      } else {
        formRes['err_status'] = true
        formRes['error']['msg'] = AIR_MSG.technical_err
        setFormRes(formRes)
      }
    }

  }

  const addMember = async (data = null) => {
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (data == null) {
      return false
    } else if (!data.first_name || !data.first_name || !data.email || data.email == '' || !data.authority_id || data.authority_id == '') {
      return false
    };

    setFormSbmt(true)
    let payloadUrl = `vendor_config/addOrgVendorEmployee`
    let method = "POST";
    // data.first_name = data.name.split(' ')[0] ? data.name.split(' ')[0] : ''
    // data.last_name = data.name.split(' ')[1] ? data.name.split(' ')[1] : ''
    let formData = {
      org_id: orgId,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      authority_id: Number(data.authority_id),
    }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      resetField("first_name")
      resetField("last_name")
      resetField("email")
      resetField("authority")
      formRes = { status: true, err_status: false, type: "addMember", error: {}, msg: "" }
      setFormRes(formRes)
      fetchInfo('vendor_employees')
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "addMember"
      formRes['error']['msg'] = ""

      setFormRes(formRes)
    }
    setFormSbmt(false)
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }

  const editMember = async (mIndex = null) => {
    if (mIndex == null) {
      return false
    }
    let member = members[mIndex] ? members[mIndex] : false;
    if (member) {
      setEditMemIndex(mIndex)

    }
  }

  const updateMember = async (mIndex = null, data = null, standard = false) => {
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (mIndex == null) {
      return false
    }
    let member = members[mIndex] || false
    if (member) {
      let payloadUrl = `vendor_config/editOrgVendorEmployee/${member.org_emp_id}`
      let method = "POST";

      let formData = {}
      // if (editMemEmailInpRef.current[mIndex] && editMemEmailInpRef.current[mIndex].value) {
      //   formData.email = editMemEmailInpRef.current[mIndex].value
      // }
      if (editMemRoleInpRef.current[mIndex] && editMemRoleInpRef.current[mIndex].value) {
        let key = editMemRoleInpRef.current[mIndex].value;
        formData.authority_id = Number(key)
      }
      if (editMemStatInpRef.current[mIndex] && editMemStatInpRef.current[mIndex].value) {
        formData.status = editMemStatInpRef.current[mIndex].checked ? 'A' : 'I'
      }

      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "updateMember", error: {}, msg: "" }
        setFormRes(formRes)
        setEditMemIndex(null)
        fetchInfo('vendor_employees')
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "updateMember"
        formRes['error']['msg'] = ""

        setFormRes(formRes)
      }
      setTimeout(() => {
        formRes = { status: false, err_status: false, error: {} }
        setFormRes(formRes)
      }, 3000);
    }


  }
  const delMember = async (mIndex = null) => {
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (mIndex == null) {
      return false
    }
    let member = members[mIndex] || false
    if (member) {
      let payloadUrl = `vendor_config/editOrgVendorEmployee/${member.org_emp_id}`
      let method = "POST";

      let formData = {
        status: 'D'
      }
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "updateMember", error: {}, msg: "" }
        setFormRes(formRes)
        setEditMemIndex(null)
        fetchInfo('vendor_employees')
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "updateMember"
        formRes['error']['msg'] = ""

        setFormRes(formRes)
      }
      setTimeout(() => {
        formRes = { status: false, err_status: false, error: {} }
        setFormRes(formRes)
      }, 3000);
    }
    toggleAlert({ show: false, type: 'success', message: '' })
  }

  const changeView = (tab = null) => {
    if (tab == null) {
      return false
    }
    setView(tab)
  }

  const onDelMember= async (type = '',data) => {
    if (type == '') {
      return false
    }
    setShowAlert({ show: true, type: "del_member_confirmation", message: "",data })
  }

  const toggleAlert = (val) => {
    setShowAlert(val)
  }

  const sortData = async (column = '', type = '',items = []) =>{
    if(column == '' || type == '' || items.length == 0){
      return false
    }
    let sortOpts = {
      sortBy: column , 
      sortOrder: type, 
      activeCol: activeCol,
      activeSortOrder: activeSortOrder,
      items: items
    }
    let dataArr = sortArr(sortOpts);
    setFilteredList(dataArr)
    setActiveCol(column)
    setActiveSortOrder(type)
  }

  return (
    <>
      {/* Vendor list page start */}
      <div style={{ 'minHeight': 'calc(100vh - 50px)' }}>
        <Header defHeaderTitle={''} />
        <div id={Styles.v_config_sec} className="container-fluid">
          <div id="vendor_assessment_section" className={`vendor_assessment_section`}>
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex align-items-center justify-content-between">
                  <div id="va_header_section" className="" >
                    {/* <h1>Certification</h1>
                    <span>Select the minium certification required for the vendor aprroval.</span> */}
                  </div>
                  <div className={`config_tabs_box ${Styles.config_tabs_box}`}>
                    <a className={`link_url border text_color_2 ${view == 'manage_members' ? Styles.active : ''}`} onClick={() => changeView('manage_members')} >Members Management</a>
                    <a className={`link_url border text_color_2 ${view == 'certification' ? Styles.active : ''}`} onClick={() => changeView('certification')} >Certification</a>
                  </div>
                </div>

              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                {(() => {
                  if (view == 'certification') {
                    return (
                      <div className="card bg-transparent air_vendor rounded mt-3">
                        <div className="card-body p-0">
                          <div className={`vendor_certificatons_block vendor_table_block ${Styles.vendor_table_block}`}>
                            <div className="table-responsive">
                              <table className="table table-sm table-borderless mb-0">
                                <thead>
                                  <tr>
                                    <th className="pl-3 pl-md-4">Certification</th>
                                    <th className="pl-3 pl-md-4">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {vendorCertifications && vendorCertifications.length > 0 && vendorCertifications.map((cert, cIndex) => {
                                    return (
                                      <tr key={cIndex}>
                                        <td className="pl-3 pl-md-4 text-dark">{cert.name}</td>
                                        <td className="pl-3 pl-md-4">
                                          <div className="custom-control custom-switch">
                                            <input type="checkbox" className="custom-control-input" id={`customSwitch${cIndex}`} defaultChecked={cert.is_added == "Y" ? true : false} onChange={(e) => addOrUpdateVendorCertification(cIndex, e.target)} />
                                            <label className="custom-control-label" htmlFor={`customSwitch${cIndex}`} ></label>
                                          </div>
                                        </td>

                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* <div className="pagination_sec">
                      <AirPagination layout={1}
                        totalPages={vendorCertifications.length/3}
                        currentPage={1}
                        showAllPages={true}
                        showPrevNextBtn={true}
                        disablePages={[]}
                        cClass='' />
                    </div> */}
                        </div>

                      </div>
                    )
                  } else {
                    return (
                      <div className="container-fluid mt-3">
                        <div className="row mb-3">
                          <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
                            <div className="mainSearchbar">
                              <div className="flex-grow-1 position-static">
                                <div className="input-group">
                                  <div className="input-group-prepend">
                                    <span className="input-group-text bg-transparent border-0 srchInput"><img
                                      src="/assets/img/gbl.gif" alt="" /></span>
                                  </div>
                                  <input type="text" name="" placeholder="Search for Name, Email ID"
                                    className="form-control border-0 pl-0 fs-14" ref={searchKeyword} onChange={() => searchFilter()} />
                                </div>
                              </div>
                              <div className="invisible">
                                <input type="text" className="form-control border-0" name="date"
                                  placeholder="Select Date" />
                                <i className="fa fa-calendar"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3 mb-2">

                            <div id="accordion" className="accordion accordianSec vendorConfig">

                              <div className="card border-0 overShow">
                                <div className="newBx bg_07">
                                  <div id="cp2" className="card-body p-0  collapse show bg-transparent ">
                                    <div className="p-lg-2 mb-lg-3 p-2 my-3 mb-3 ml-3 mr-3  bg-white rounded triggerResult">
                                      <form className={`vendor_custom_form2 ${Styles.vendor_custom_form2}`} onSubmit={handleSubmit(addMember)}>
                                        <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                                          <div className="w-100 mr-2">
                                            <input type="text" className="form-control" placeholder="Enter First Name" {...register("first_name", { required: true })} />
                                            {errors.first_name?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.fname_required}</div>}
                                          </div>
                                          <div className="w-100 mr-2">
                                            <input type="text" className="form-control" placeholder="Enter Last Name" {...register("last_name", { required: true })} />
                                            {errors.last_name?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.lname_required}</div>}
                                          </div>
                                          <div className="w-100 mr-2 triggerDate">
                                            <select name="" id="" defaultValue="" className="form-control" {...register("authority_id", { required: true })}>
                                              <option value="">Member Role</option>
                                              {memberRoles && memberRoles.length > 0 && memberRoles.map((role, mrIndex) => {
                                                return (
                                                  <option key={mrIndex} value={role.id}>{role.name}</option>
                                                )
                                              })}
                                            </select>
                                            {errors.name?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_emp_authority_required}</div>}
                                          </div>
                                          <div className="w-100 mr-2">
                                            <input type="text" className="form-control" placeholder="Contact Email ID" {...register("email", { required: true })} />
                                            {errors.name?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_emp_email_required}</div>}
                                          </div>
                                          <div>
                                            <button type="submit" className="border-0 bg-transparent col-auto p-0" disabled={formSubmitted}>
                                              <a onClick={null} className="info btn_03"> <img src="/assets/img/plus.svg" alt="" className="plus" /> </a>
                                            </button>

                                          </div>
                                        </div>
                                      </form>
                                    </div>

                                  </div>


                                </div>
                              </div>
                              <div className={`table-responsive card assessment_Table ${Styles.conf_table}`}>
                                <div className="card-body p-0">
                                  {(() => {
                                    if (filteredList == null) {
                                      return <Loader showLoader={true} pos={'relative'}></Loader>
                                    }
                                    if (filteredList && filteredList.length > 0) {
                                      return (
                                        <>
                                          <table className="table mb-0">
                                            <thead>
                                              <tr>
                                                <th><a onClick={() => sortData('first_name',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by">Name</a></th>
                                                <th><a onClick={() => sortData('authority_id',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by">Role</a></th>
                                                <th><a onClick={() => sortData('email',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by">Email</a></th>
                                                <th><a onClick={() => sortData('status',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by">Status</a></th>
                                                <th><a onClick={() => null} className="sort-by">Action</a></th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {filteredList && filteredList.length > 0 && filteredList.map((member, mIndex) => {
                                                return (
                                                  <Fragment key={mIndex}>
                                                    {(() => {
                                                      if (editMemIndex == mIndex) {
                                                        return (
                                                          <tr key={mIndex} className="edit_active">
                                                            <td className="text-dark">{member.first_name} {member.last_name}</td>
                                                            <td>
                                                              <select className="form-control w-auto pl-0" defaultValue={filteredList[mIndex].authority_id} ref={el => (editMemRoleInpRef.current[`${mIndex}`] = el)}>
                                                                {memberRoles && memberRoles.length > 0 && memberRoles.map((role, mrIndex) => {
                                                                  return <option key={mrIndex} value={role.id}>{role.name}</option>
                                                                })}
                                                              </select>
                                                            </td>
                                                            <td>{member.email}</td>
                                                            <td>
                                                              <div className="custom-control custom-switch">
                                                                <input type="checkbox" className="custom-control-input" id="customSwitch1" defaultChecked={filteredList[mIndex].status == 'A' ? true : false} ref={el => (editMemStatInpRef.current[`${mIndex}`] = el)} />
                                                                <label className="custom-control-label" htmlFor="customSwitch1"></label>
                                                              </div>
                                                            </td>
                                                            <td>
                                                              <div className="d-flex justify-content-around action_btns w60">
                                                                <span className="edit text-success link_url" onClick={() => updateMember(mIndex)}><i className="fa fa-check"></i></span>
                                                                {/* <span className="delete text-danger link_url" onClick={() => delMember(mIndex)}><i className="fa fa-trash"></i></span> */}
                                                                <span className="delete text-danger link_url" onClick={() => onDelMember("del_member_confirmation",{mIndex})}><i className="fa fa-trash"></i></span>
                                                              </div>
                                                            </td>
                                                          </tr>
                                                        )
                                                      } else {
                                                        return (
                                                          <tr>
                                                            <td className="themeBlc">{member.first_name} {member.last_name}</td>
                                                            <td>{member.authority}</td>
                                                            <td>{member.email}</td>
                                                            <td>{member.status == 'A' ? <span className="p-1 badge badge-success">Active</span> : <span className="p-1 badge badge-danger">In Active</span>}</td>
                                                            <td>
                                                              <div className="d-flex justify-content-around action_btns w60">
                                                                <span className="edit link_url" onClick={() => editMember(mIndex)}><i className="fa fa-pencil fs-14"></i></span>
                                                                {/* <span className="delete text-danger link_url" onClick={() => delMember(mIndex)}><i className="fa fa-trash"></i></span> */}
                                                                <span className="delete text-danger link_url" onClick={() => onDelMember("del_member_confirmation",{mIndex})}><i className="fa fa-trash fs-14"></i></span>
                                                              </div>
                                                            </td>
                                                          </tr>
                                                        )
                                                      }
                                                    })()}
                                                  </Fragment>
                                                )
                                              })}
                                            </tbody>
                                          </table>
                                        </>
                                      )
                                    }
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                          {(() => {
                            if (filteredList && filteredList.length > 0 && false) {
                              return (
                                <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3 fixedBottom h-651">
                                  <div className="d-flex justify-content-between align-items-end row-cols-3 my-2 w-100 ">
                                    <div>
                                      <select name="" id="" className="form-control gLbl w-auto">
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="30">30</option>
                                        <option value="40">40</option>
                                      </select>
                                    </div>
                                    <div>
                                      <ul className="pagination justify-content-center gLbl mb-0">
                                        <li><a href="#" className="page-link bg-transparent border-0"><i
                                          className="fa fa-angle-double-left" aria-hidden="true"></i></a></li>
                                        <li><a href="#" className="page-link bg-transparent border-0"><i
                                          className="fa fa-angle-left" aria-hidden="true"></i></a></li>
                                        <li><a href="#" className="page-link bg-transparent border-0 themeBlc">1</a></li>
                                        <li><a href="#" className="page-link bg-transparent border-0"><i
                                          className="fa fa-angle-right" aria-hidden="true"></i></a></li>
                                        <li><a href="#" className="page-link bg-transparent border-0"><i
                                          className="fa fa-angle-double-right" aria-hidden="true"></i></a></li>
                                      </ul>
                                    </div>
                                    <div className="d-flex justify-content-end">
                                      <p className="mb-0 gLbl">Showing 01 to 03 of 03 entries</p>
                                    </div>

                                  </div>
                                </div>
                              )
                            }
                          })()}

                        </div>
                      </div>
                    )
                  }
                })()}

              </div>
            </div>
          </div>
        </div>
      </div>

      {(() => {
        if (showAlert && showAlert.show && showAlert.type == "del_member_confirmation") {
          return (
            <SweetAlert
              danger
              showCancel
              confirmBtnText="Delete"
              confirmBtnBsStyle="danger"
              cancelBtnCssClass="btn btn-outline-secondary text_color_2"
              title="Are you sure  you want delete the Member ?"
              onConfirm={() => delMember(showAlert?.data?.mIndex)}
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
      {/* Vendor list page end */}
    </>
  )
}

export default VendorConfiguration