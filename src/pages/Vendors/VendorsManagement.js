import { useForm } from "react-hook-form";
import ApiService from "../../services/ApiServices";
import { SetCookie, GetCookie, encryptData, sortArr } from "../../helpers/Helper";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Header from "../../components/partials/Header";
import { lazy, useContext, useEffect, useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { LayoutContext } from "../../ContextProviders/LayoutContext";
import AirPagination from "../../elements/AirPagination";
import Styles from "../../styles/VendorsManagement.module.css"
import AirSelect from "../../elements/AirSelect";
import AIR_MSG from "../../helpers/AirMsgs";
import Loader from "../../components/partials/Loader";
import SweetAlert from "react-bootstrap-sweetalert";
import AirVendorModal from "../../elements/AirVendorModal";
// const LayoutContext = lazy(() => import("../ContextProviders/LayoutContext"))


const VendorsManagement = (props) => {
  // const {setShowLoader} = useContext(LayoutContext)
  // const { user = {} } = useOutletContext()
  const { projectId, setProjectId, user = {}, updateData } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const [view, setView] = useState('list')
  const [vendorCategories, setvendorCategories] = useState([])
  const [standardVendors, setStandardVendors] = useState([])
  const [orgVendors, setOrgVendors] = useState(null)
  const [filteredList, setFilteredList] = useState(null)
  const [selectedStdVendors, setSelectedStdVendors] = useState([])
  const [editVIndex, setEditVIndex] = useState(null)
  const [showEditBox, setShowEditBox] = useState(null)
  const [modifyVendor, setModifyVendor] = useState({})

  const editVendorCatInpRef = useRef([])
  const editVendorEmailInpRef = useRef([])
  const editVendorStatInpRef = useRef([])
  const navigate = useNavigate()

  // const { register, handleSubmit, watch, formState: { errors } } = useForm(); // initialize the hook
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const { register, handleSubmit, resetField, setValue, watch, formState: { errors } } = useForm();
  const form = watch()
  const [formSubmitted, setFormSbmt] = useState(false)
  const [errorMsg, setErrorMsg] = useState(false);
  const showLoader = false
  const searchKeyword = useRef()

  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })

  // sorting data
  const [activeCol, setActiveCol] = useState('')
  const [activeSortOrder, setActiveSortOrder] = useState('ASC')

  //modal
  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});

  useEffect(() => {

    initializeData()
  }, [user])

  const initializeData = () => {
    if (standardVendors.length == 0) {
      fetchInfo('standard_vendors')
    }
    if (vendorCategories.length == 0) {
      fetchInfo('vendor_categories')
    }
    if (!orgVendors || orgVendors.length == 0) {
      fetchInfo('org_vendors')
    }
  }



  const fetchInfo = async (type = '', projectInfo = null) => {
    if (type == '') {
      return false
    };

    let payloadUrl = ""
    let method = "POST";
    let formData = {};

    if (type == 'vendor_categories') {
      payloadUrl = `vendor_config/getVendorCategories`
      method = "GET";
    } else if (type == 'standard_vendors') {
      payloadUrl = `vendor_config/getStandardVendors`
      method = "GET";
    } else if (type == 'org_vendors') {
      payloadUrl = `vendor_config/getOrgVendors/${orgId}`
      method = "GET";
    }

    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      if (type == 'vendor_categories') {
        setvendorCategories(oldVal => {
          return [...res.results]
        })
      } else if (type == 'standard_vendors') {
        setStandardVendors(oldVal => {
          return [...res.results]
        })
      } else if (type == 'org_vendors') {
        setOrgVendors(oldVal => {
          return [...res.results]
        })
        setFilteredList(oldVal => {
          return [...res.results]
        })
      }
    }
  }


  const searchFilter = () => {
    let listArr = Object.assign([],orgVendors)
    let keyword = searchKeyword.current.value || '';
    let tempArr = listArr.filter((vendor,index)=>{
      let regexExp = new RegExp(keyword,'i')
      // console.log(keyword)
      
      let result = false
      if(vendor.name.search(regexExp) != -1 || vendor.email.search(regexExp) != -1 || vendor.category_name.search(regexExp) != -1 || vendor.status.search(regexExp) != -1){
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

  /* add vendor function start */
  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ]
  const onChangeAirSelect = (data) => {
    let objArr = []
    if (Object.keys(data).length > 0) {
      let stdVendor = standardVendors[data?.value];
      objArr.push(stdVendor)
    }
    // for (let selData of data) {
    //   if (standardVendors && standardVendors.length > 0 && standardVendors[selData?.value]) {
    //     let stdVendor = standardVendors[selData?.value]
    //     objArr.push(stdVendor)
    //   }
    // }
    // console.log(vendorId)
    if (objArr.length > 0) {
      setValue('vendor_id', objArr[0].vendor_id)
      setValue('vendor_name', objArr[0].name)
      setValue('category', 1)
    }

    setSelectedStdVendors(oldVal => {
      return [...objArr]
    })
  }

  const addVendor = async (data = null, standard = false) => {

    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (!standard) {
      if (!data || data.name == '' || !data.email || data.email == '') {
        return false
      }
    } else {
      if (data == null) {
        return false
      }
    };
    let payloadUrl = `vendor_config/addVendor`
    let method = "POST";
    let formData = {}
    if (standard) {
      formData = {
        org_id: orgId,
        vendor_id: data.vendor_id,
        name: data.vendor_name,
        email: '',
        category: 1,
      }
    } else {
      formData = {
        org_id: orgId,
        vendor_id: 0,
        name: data.name,
        email: data.email,
        category: Number(data.category),
      }
    }

    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      resetField("name")
      resetField("email")
      resetField("category")
      if(standard){
        resetField("vendor_id")
        resetField("vendor_name")
      }
      
      formRes = { status: true, err_status: false, type: "addVendor", error: {}, msg: "" }
      setFormRes(formRes)
      fetchInfo('org_vendors')
    } else {
      let msg = "";
      if (res.message != '' && res.message.toLowerCase() == "duplicate record") {
        msg = AIR_MSG.vendor_exists
      }
      formRes['err_status'] = true
      formRes['error']['type'] = "addVendor"
      formRes['error']['msg'] = msg

      setFormRes(oldVal => {
        return { ...formRes }
      })
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }

  const editVendor = async (vIndex = null) => {
    if (vIndex == null) {
      return false
    }
    let vendor = filteredList[vIndex] ? filteredList[vIndex] : false;
    if (vendor) {
      setEditVIndex(vIndex)
      setModifyVendor(oldVal => {
        return { ...vendor }
      })
    }
  }

  const updateVendor = async (vIndex = null, data = null, standard = false) => {
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    if (vIndex == null) {
      return false
    }
    let vendor = filteredList[vIndex] || false
    if (vendor) {
      let payloadUrl = `vendor_config/updateVendor/${vendor.org_vendor_id}`
      let method = "POST";

      let formData = {}
      if (editVendorEmailInpRef && editVendorEmailInpRef.current[vIndex] && editVendorEmailInpRef.current[vIndex].value) {
        formData.email = editVendorEmailInpRef.current[vIndex].value
      }
      if (editVendorCatInpRef && editVendorCatInpRef.current[vIndex] && editVendorCatInpRef.current[vIndex].value) {
        let key = editVendorCatInpRef.current[vIndex].value
        // console.log(key)
        formData.vendor_category = Number(key)
      }
      if (editVendorStatInpRef && editVendorStatInpRef.current[vIndex] && editVendorStatInpRef.current[vIndex].value) {
        formData.status = editVendorStatInpRef.current[vIndex].checked ? 'A' : 'I'
      }

      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "updateVendor", error: {}, msg: "" }
        setFormRes(formRes)
        setEditVIndex(null)
        setModifyVendor({})
        fetchInfo('org_vendors')
      } else {
        formRes['err_status'] = true
        formRes['error']['type'] = "updateVendor"
        formRes['error']['msg'] = ""

        setFormRes(formRes)
      }
      setTimeout(() => {
        formRes = { status: false, err_status: false, error: {} }
        setFormRes(formRes)
      }, 3000);
    }


  }
  const delVendor = async (vendorIndex = null) => {
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    let vendor = filteredList[vendorIndex] || false
    if (vendor) {
      let payloadUrl = `vendor_config/updateVendor/${vendor.org_vendor_id}`
      let method = "POST";

      let formData = {
        status: 'D'
      }

      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        formRes = { status: true, err_status: false, type: "delVendor", error: {}, msg: "" }
        setFormRes(formRes);
        fetchInfo('org_vendors');
      } else {
        formRes['err_status'] = true;
        formRes['error']['type'] = "delVendor";
        formRes['error']['msg'] = "";
        setFormRes(formRes);
      }
      toggleAlert({ show: false, type: 'success', message: '' })
      setTimeout(() => {
        formRes = { status: false, err_status: false, error: {} };
        setFormRes(formRes);
      }, 3000);
    }
  }
  /* add vendor function end */

  //Modal Vendor Managament
  const showModal = async (modalName = null, data = null) => {
    if (modalName == null) {
      return false
    }
    // setEvidenceTypeId(null)
    let fileType = null
    let modalObj = {}
    switch (modalName) {
      case 'add_vendor_tags_modal':
        if (data != null) {
          let mDataObj = data
          mDataObj.tags = []
          getVendorTags("vendor", data)
          setModalData(data)
        }
        setModalType(modalName)
        setShowModal(true)
        break;
      }
  }
  const hideModal = (data = null) => {
    setModalType(null)
    setShowModal(false)
    
    
  }


  const changeView = (tab = null) => {
    if (tab == null) {
      return false
    }
    setView(tab)
  }

  const onDelVendor= async (type = '',data) => {
    if (type == '') {
      return false
    }
    setShowAlert({ show: true, type: type, message: "",data })
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

  const getVendorTags = async (entity = "",data = null) => {
    if(entity == "" || data == null){
      return false
    }
    let payloadUrl = `reference/getTags/${entity}/${data.org_vendor_id}`
      let method = "GET";
      let res = await ApiService.fetchData(payloadUrl, method);
      if (res && res.message == "Success") {
          let tags = res.results
          let mDataObj = data
          mDataObj.delVendorTags = delVendorTags
          mDataObj.tags = tags
          setModalData(oldVal => {
            return {...mDataObj}
          })
      } 
      setFormSbmt(false)
  }
  const delVendorTags = async (tag_id = null,data = {}) => {
    if(tag_id == null){
      return false
    }
    let payloadUrl = `reference/deleteTag/${tag_id}`
      let method = "DELETE";
      let res = await ApiService.fetchData(payloadUrl, method);
      if (res && res.message == "Success") {
        getVendorTags("vendor", data)
      } 
      setFormSbmt(false)
  }
  const addVendorTags = async (modalName = "",data = null) => {
    if(modalName == "" || data == null){
      return false
    }
    let payloadUrl = `reference/addTags`
      let method = "POST";
      let formData = data;
      let res = await ApiService.fetchData(payloadUrl, method, formData);
      if (res && res.message == "Success") {
        
        setShowAlert({ show: true, type: "success", message: AIR_MSG.add_tag_success })
        return res;
      } else {
        setShowAlert({ show: true, type: "danger", message: AIR_MSG.technical_err })
        return false;
      }
      setFormSbmt(false)
  }


  // console.log(form)
  // console.log(errors)
  return (
    <>
      {/* Vendor list page start */}
      <div style={{ 'minHeight': 'calc(100vh - 50px)' }}>
        <Header defHeaderTitle={''} />
        <div id={Styles.v_management_sec} className="container-fluid">
          <div id="vendor_assessment_section" className="vendor_assessment_section">


            {(() => {
              if (view == 'list') {
                return (
                  <>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="d-flex align-items-center justify-content-between mb-3 ">
                          <div id="va_header_section">
                            <h1 className="mb-0 fs-18">Vendors List</h1>
                          </div>
                          <div className={`${Styles.vm_btns_box} text-right w-50`}>
                            <a className={`link_url`} onClick={() => changeView('definitions')}>View Definitions</a>
                            <a className={`btn btn-primary-2 btn_05`} onClick={() => changeView('add')} >Add vendor</a>
                          </div>
                        </div>

                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="card air_vendor border rounded">

                          <div className="card-body p-0">
                            <div className="vendor_search_block position-relative">
                              <input type="text" className={`form-control border-0 pl-4 fs-14`} ref={searchKeyword} placeholder="Search for Vendor Name, Email Id" onChange={() => searchFilter()} />
                              <span className={`${Styles.search_icn} search_icn position-absolute`}> <i className="fa fa-search fs-14"></i> </span>
                            </div>
                          </div>
                        </div>
                        <div className="card bg-transparent air_vendor rounded mt-4">
                          <div className="card-body p-0">
                            <div className="vendor_list_block vendor_table_block fs-13">
                              <div className="table-responsive">
                                {(() => {
                                  if (filteredList == null) {
                                    return <Loader showLoader={true} pos={'relative'}></Loader>
                                  } else {
                                    return (
                                      <>
                                        <table className="table table-sm table-borderless mb-0">
                                          <thead>
                                            <tr>
                                              <th className="vendor_name"><a onClick={() => sortData('name',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by link_url">Vendor Name</a></th>
                                              <th> <a onClick={() => sortData('category_name',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by link_url">Category</a></th>
                                              <th className="vendor_name"> <a onClick={() => sortData('email',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by link_url">Email</a></th>
                                              <th className=""> <a onClick={() => sortData('created_on',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by link_url">Added On</a></th>
                                              <th> <a onClick={() => sortData('status',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by link_url">Status</a></th>
                                              <th>Action</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {filteredList && filteredList.length > 0 && filteredList.map((vendor, ovIndex) => {
                                              return (
                                                <>
                                                  {(() => {
                                                    if (editVIndex == ovIndex) {
                                                      return (
                                                        <tr className="edit_active">
                                                          <td className="text-dark">{vendor.name}</td>
                                                          {(() => {
                                                            if (vendor.type == 'standard') {
                                                              return (
                                                                <>
                                                                  <td>{vendor.category_name}</td>
                                                                  <td>{vendor.email}</td>
                                                                </>
                                                              )
                                                            } else {
                                                              return (
                                                                <>
                                                                  <td>
                                                                    <select className="form-control w-auto pl-0" defaultValue={modifyVendor?.category_id} ref={el => (editVendorCatInpRef.current[`${ovIndex}`] = el)}>
                                                                      {vendorCategories && vendorCategories.length > 0 && vendorCategories.map((cat, catIndex) => {
                                                                        return <option value={cat.category_id}>{cat.name}</option>
                                                                      })}
                                                                    </select>
                                                                  </td>
                                                                  <td><input className="form-control w-auto pl-0" defaultValue={modifyVendor.email} ref={el => (editVendorEmailInpRef.current[`${ovIndex}`] = el)} /></td>
                                                                </>
                                                              )
                                                            }
                                                          })()}
                                                          <td><span>{vendor.created_on}</span></td>
                                                          <td>
                                                            <div className="custom-control custom-switch">
                                                              <input type="checkbox" className="custom-control-input" id="customSwitch1" defaultChecked={modifyVendor.status == 'Active' ? true : false} ref={el => (editVendorStatInpRef.current[`${ovIndex}`] = el)} />
                                                              <label className="custom-control-label" htmlFor="customSwitch1"></label>
                                                            </div>
                                                          </td>
                                                          <td>
                                                            <div className="d-flex justify-content-around action_btns">
                                                              <span className="edit text-success link_url" onClick={() => updateVendor(ovIndex)}><i className="fa fa-check"></i></span>
                                                              {/* <span className="delete text-danger link_url" onClick={() => delVendor(ovIndex)}><i className="fa fa-trash"></i></span> */}
                                                              <span className="delete text-danger link_url" onClick={() => onDelVendor("del_vendor_confirmation",{ovIndex})}><i className="fa fa-trash"></i></span>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      )
                                                    } else {
                                                      return (
                                                        <tr>

                                                          <td className="text-dark">{vendor.name}</td>
                                                          <td>{vendor.category_name}</td>
                                                          <td>{vendor.email}</td>
                                                          <td><span>{vendor.created_on}</span></td>
                                                          <td><span className={`p-1 badge ${vendor.status === "Active" ?  "badge-success" : "badge-danger"}`}>{vendor.status == "InActive" ? `In Active` : vendor.status}</span></td>
                                                          <td>
                                                            <div className="d-flex justify-content-around action_btns">
                                                              <span className="text-primary link_url" onClick={() => showModal('add_vendor_tags_modal',vendor)}><i className="fa fa-tags fs-14"></i></span>
                                                              <span className="edit link_url" onClick={() => editVendor(ovIndex)}><i className="fa fa-pencil fs-14"></i></span>
                                                              <span className="delete text-danger link_url" onClick={() => onDelVendor("del_vendor_confirmation",{ovIndex})}><i className="fa fa-trash fs-14"></i></span>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      )
                                                    }
                                                  })()}

                                                </>

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

                            {(() => {
                              if (filteredList && filteredList.length > 0 && false) {
                                return (
                                  <div className="pagination_sec">
                                    <AirPagination layout={1}
                                      totalPages={10}
                                      currentPage={1}
                                      showAllPages={true}
                                      showPrevNextBtn={true}
                                      disablePages={[]}
                                      cClass='' />
                                  </div>
                                )
                              }
                            })()}

                          </div>

                        </div>
                      </div>
                    </div>
                  </>

                )
              } else if (view == 'add') {
                return (
                  <>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="card air_vendor rounded">

                          <div className="card-body p-0">
                            <div className="add_vendor_block bg_07 px-3 py-3">
                              <form className={`vendor_custom_form2 ${Styles.vendor_custom_form2}`} onSubmit={handleSubmit((data) => addVendor(data, false))}>


                                <div className="form-row form-group rounded mx-0 align-items-center">
                                  <div className="col-md-6 d-flex align-items-center">
                                    {/* <input type="text" className="form-control bg-transparent" {...register("account")} name="account" autoComplete="off" defaultValue={AccountName} readOnly={true} /> */}
                                    <AirSelect cClass={'w-100 vendor_select_box v_popular_vendor'}
                                      cClassPrefix={'vendor_select'}
                                      hideOptionOnSelect={false}
                                      closeOnSelect={true}
                                      changeFn={onChangeAirSelect}
                                      selectOptions={standardVendors.map((vendor, index) => ({ value: index, label: vendor.name }))}
                                      selected={[]}
                                      selectPlaceholder='Select Popular Vendor'
                                      multi={false} />
                                  </div>
                                  <div className="col-md-6 d-flex align-items-center">
                                    <div className={`${Styles.buttom_submit_block} ${Styles.plus} buttom_submit_block plus`}>
                                      <button type="button" className="w-100 h-100" onClick={() => addVendor(form, true)}>
                                        <span className="d-inline-block">
                                          <img src="/assets/img/plus.svg" alt="" className="plus" />
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="w-100 mt-4 mb-3">
                                  <h6 className="fw-600">Or Add New Vendors</h6>
                                </div>
                                <div className="form-row form-group rounded mx-0">
                                  <div className="col">
                                    <input type="text" className="form-control bg-transparent" {...register("name", { required: true })} autoComplete="off" defaultValue={''} placeholder="Vendor Name" />
                                    {errors.name?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_name_required}</div>}
                                  </div>
                                  <div className="col">
                                    <select className="form-control bg-transparent" {...register("category", { required: true })} defaultValue={''}>
                                      <option value="" disabled>Select category</option>
                                      {vendorCategories && vendorCategories.length > 0 && vendorCategories.map((cat, catIndex) => {
                                        return <option key={catIndex} value={cat.category_id}>{cat.name}</option>
                                      })}
                                    </select>
                                    {errors.category?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_category_required}</div>}
                                  </div>
                                  <div className="col">
                                    <input type="email" className="form-control bg-transparent" {...register("email", { required: true })} autoComplete="off" defaultValue={editVendor.email} placeholder="Vendor Email" />
                                    {errors.email?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_email_required}</div>}
                                  </div>
                                  <div className="col-auto d-flex align-items-end">
                                    <div className={`${Styles.buttom_submit_block} ${Styles.plus} buttom_submit_block plus`}>
                                      <button type="submit" className="w-100 h-100">
                                        <span className="d-inline-block">
                                          <img src="/assets/img/plus.svg" alt="" className="plus" />
                                        </span>
                                      </button>
                                    </div>

                                  </div>
                                </div>


                                <div className="row">
                                  {
                                    !formRes.status && formRes.err_status && formRes.error?.type == "addVendor"
                                      ? <div className="form_err text-danger col-12"><div>{formRes.error.msg}</div> </div>
                                      : ''
                                  }
                                  {
                                    formRes.status && formRes?.type == "addVendor"
                                      ? <div className="form_success text-success col-12"><div>{AIR_MSG.form_success('Vendor', 'add')}</div> </div>
                                      : ''
                                  }
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>

                        <div className="card bg-transparent air_vendor rounded mt-4">
                          <div className="card-body p-0">

                            {(() => {
                              if (filteredList && filteredList.length > 0) {
                                return (
                                  <>
                                    <div className="vendor_list_block vendor_table_block fs-13">
                                      <div className="table-responsive">
                                        <table className="table table-sm table-borderless mb-0">
                                          <thead>
                                            <tr>
                                              <th className="vendor_name">Vendor Name</th>
                                              <th>Category</th>
                                              <th className="vendor_name">Email</th>
                                              <th>Status</th>
                                              <th>Action</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {filteredList && filteredList.length > 0 && filteredList.map((vendor, ovIndex) => {
                                              return (
                                                <>
                                                  {(() => {
                                                    if (editVIndex == ovIndex) {
                                                      return (
                                                        <tr className="edit_active">
                                                          <td className="text-dark">{vendor.name}</td>
                                                          {(() => {
                                                            if (vendor.type == 'standard') {
                                                              return (
                                                                <>
                                                                  <td>{vendor.category_name}</td>
                                                                  <td>{vendor.email}</td>
                                                                </>
                                                              )
                                                            } else {
                                                              return (
                                                                <>
                                                                  <td>
                                                                    <select className="form-control w-auto pl-0" defaultValue={modifyVendor?.category_id} ref={el => (editVendorCatInpRef.current[`${ovIndex}`] = el)}>
                                                                      {vendorCategories && vendorCategories.length > 0 && vendorCategories.map((cat, catIndex) => {
                                                                        return <option value={cat.category_id}>{cat.name}</option>
                                                                      })}
                                                                    </select>
                                                                  </td>
                                                                  <td><input className="form-control w-auto pl-0" defaultValue={modifyVendor.email} ref={el => (editVendorEmailInpRef.current[`${ovIndex}`] = el)} /></td>
                                                                </>
                                                              )
                                                            }
                                                          })()}
                                                          <td>
                                                            <div className="custom-control custom-switch">
                                                              <input type="checkbox" className="custom-control-input" id="customSwitch1" defaultChecked={modifyVendor.status == 'Active' ? true : false} ref={el => (editVendorStatInpRef.current[`${ovIndex}`] = el)} />
                                                              <label className="custom-control-label" htmlFor="customSwitch1"></label>
                                                            </div>
                                                          </td>
                                                          <td>
                                                            <div className="d-flex justify-content-around action_btns">
                                                              <span className="edit success link_url" onClick={() => updateVendor(ovIndex)}><i className="fa fa-check"></i></span>
                                                              {/* <span className="delete text-danger link_url" onClick={() => delVendor(ovIndex)}><i className="fa fa-trash"></i></span> */}
                                                              <span className="delete text-danger link_url" onClick={() => onDelVendor("del_vendor_confirmation",{ovIndex})}><i className="fa fa-trash"></i></span>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      )
                                                    } else {
                                                      return (
                                                        <tr>

                                                          <td className="text-dark">{vendor.name}</td>
                                                          <td>{vendor.category_name}</td>
                                                          <td>{vendor.email}</td>
                                                          <td><span className={`p-1 badge ${vendor.status === "Active" ?  "badge-success" : "badge-danger"}`}>{vendor.status == "InActive" ? `In Active` : vendor.status}</span></td>
                                                          <td>
                                                            <div className="d-flex justify-content-around action_btns">
                                                              <span className="edit link_url" onClick={() => editVendor(ovIndex)}><i className="fa fa-pencil fs-14"></i></span>
                                                              {/* <span className="delete text-danger link_url" onClick={() => delVendor(ovIndex)}><i className="fa fa-trash"></i></span> */}
                                                              <span className="delete text-danger link_url" onClick={() => onDelVendor("del_vendor_confirmation",{ovIndex})}><i className="fa fa-trash fs-14"></i></span>
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      )
                                                    }
                                                  })()}

                                                </>

                                              )
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    {/* <div className="row">
                                      <div className="col-12 text-right py-3">
                                        <button type="button" className="btn btn-primary-2 btn_05" onClick={() => changeView('list')}>Continue</button>
                                      </div>
                                    </div> */}
                                    {/* <div className="pagination_sec pt-3">
                                      <AirPagination layout={1}
                                        totalPages={10}
                                        currentPage={1}
                                        showAllPages={true}
                                        showPrevNextBtn={true}
                                        disablePages={[]}
                                        cClass='' />
                                    </div> */}
                                  </>
                                )
                              }
                            })()}




                          </div>

                        </div>
                      </div>
                    </div>
                  </>
                )
              } else if (view == 'definitions') {
                return (
                  <>
                    {/* <div className="container-fluid"> */}
                    <div className="row">
                      <div className="col-md-12">
                        <div className="d-flex align-items-center justify-content-between mb-3 ">
                          <div id="va_header_section">
                            <h1 className="mb-0">Definitions</h1>
                          </div>
                          <div className={`${Styles.vm_btns_box} text-right w-50`}>
                            <a className={`link_url`} onClick={() => changeView('definitions')}>View Definitions</a>
                            <a className={`btn btn-primary-2 btn_05`} onClick={() => changeView('add')} >Add vendor</a>
                          </div>
                        </div>

                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3 mb-2">

                        <div id="view_defination" className="accordion accordianSec questionnaire">

                          <div className="card ">

                            <div className="d-flex align-items-center">
                              <div className="card-header flex-grow-1 py-0 p-3" data-toggle="collapse" data-target="#cp1">
                                <a className="card-title" >
                                  View Definitions
                                </a>
                              </div>

                            </div>
                            <div id="cp1" className="collapse p-3 show" data-parent="#view_defination" >

                              <dl className="d-flex">
                                <dt className="text-nowrap w-25 fw-13">1. Critical (Major)</dt>
                                <dd className="fw-13 w-75">A major supplier/vendor/service which is vital to your operations and is responsible for protection of your data – client, IP, private etc. Example: CSPs – AWS, Azure etc.<br/><br/> These vendors have published their certifications and corresponding reports on their website for analysis by end clients.</dd>
                              </dl>
                              <dl className="d-flex">
                                <dt className="text-nowrap w-25 fw-13">2. Critical (Minor)</dt>
                                <dd className="fw-13 w-75">A minor supplier/vendor/service which is vital to your operations and is responsible for protection of your data – client, IP, private etc. Example: Penetration Testing Company, MSP (Managed Service Provider), Payroll system etc. </dd>
                              </dl>
                              <dl className="d-flex">
                                <dt className="text-nowrap w-25 fw-13">3. Non Critical</dt>
                                <dd className="fw-13 w-75">A supplier/vendor/service that does not have access to critical or, sensitive information and poses too threat to your data & organization. Example: Office Supplies Vendor.</dd>
                              </dl>
                            </div>



                          </div>
                          <div className="card ">

                            <div className="d-flex align-items-center">
                              <div className="card-header flex-grow-1 py-0 p-3 collapsed" data-toggle="collapse" data-target="#cp2">
                                <a className="card-title" >
                                  View Workflows
                                </a>
                              </div>

                            </div>
                            <div id="cp2" className="collapse p-3 " data-parent="#view_defination" >

                              <dl>
                                <dt className="text-nowrap w-25 fw-13">1. Critical (Major)</dt>
                                <dd className="fw-13 defiImg"><img src="/assets/img/definition/2.png" className="img-fluid" /></dd>
                              </dl>
                              <dl>
                                <dt className="text-nowrap w-25 fw-13">2. Critical (Minor)</dt>
                                <dd className="fw-13 defiImg"><img src="/assets/img/definition/3.png" className="img-fluid" /></dd>
                              </dl>
                              <dl>
                                <dt className="text-nowrap w-25 fw-13">3. Non Critical</dt>
                                <dd className="fw-13 defiImg"><img src="/assets/img/definition/1.png" className="img-fluid" /></dd>
                              </dl>
                            </div>



                          </div>
                        </div>

                      </div>

                    </div>
                    {/* </div> */}
                  </>
                )
              }
            })()}


          </div>
        </div>
      </div>
      {(() => {
              if (modalType && modalType != '' && modalType != null) {
                if (modalType == 'add_vendor_tags_modal') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={modalData}
                    formSubmit={addVendorTags} />
                }

              }
            })()}

      {(() => {
        if (showAlert && showAlert.show && showAlert.type == "del_vendor_confirmation") {
          return (
            <SweetAlert
              danger
              showCancel
              confirmBtnText="Delete"
              confirmBtnBsStyle="danger"
              cancelBtnCssClass="btn btn-outline-secondary text_color_2"
              title="Are you sure  you want delete the Vendor ?"
              onConfirm={() => delVendor(showAlert?.data?.ovIndex)}
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

export default VendorsManagement