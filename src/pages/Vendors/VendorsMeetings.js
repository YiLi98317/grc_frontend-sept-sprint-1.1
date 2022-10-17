import { useForm } from "react-hook-form";
import ApiService from "../../services/ApiServices";
import { SetCookie, GetCookie, encryptData, sortArr } from "../../helpers/Helper";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Header from "../../components/partials/Header";
import React, { lazy, useContext, useEffect, useRef, useState } from "react";
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


const VendorsMeetings = (props) => {
  // const {setShowLoader} = useContext(LayoutContext)
  // const { user = {} } = useOutletContext()
  const { projectId, setProjectId, user = {}, updateData } = useContext(LayoutContext)
  const navigate = useNavigate()
  const orgId = user?.currentUser?.org_id || 0;
  const [view, setView] = useState('list')
  const [reviewCalls, setReviewCalls] = useState([])
  const [filteredList, setFilteredList] = useState(null)
  
  

  // const { register, handleSubmit, watch, formState: { errors } } = useForm(); // initialize the hook
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  // const { register, handleSubmit, resetField, setValue, watch, formState: { errors } } = useForm();
  // const form = watch()
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
  },[])

  const initializeData = () => {
    if (reviewCalls.length == 0) {
      fetchInfo('list')
    }
  }



  const fetchInfo = async (type = '', projectInfo = null) => {
    if (type == '') {
      return false
    };

    let payloadUrl = ""
    let method = "POST";
    let formData = {};

    if (type == 'list1') {
      payloadUrl = `vendor_config/getVendorCategories`
      method = "GET";
    } 

    let obj = {
      vendor_name: "avp123@mailinator.com",
      date: "Aug 23, 2022",
      time: "07:50 pm",
      scheduled_by: "Deepak Hasani",
      status: "Active",
    }
    let reviewCalssArr = [obj, obj, obj, obj, obj, obj, obj, obj, obj]
    setFilteredList(oldVal =>{
      return [...reviewCalssArr]
    })
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success") {
      if (type == 'list1') {
        // setvendorCategories(oldVal => {
        //   return [...res.results]
        // })
      }
    }
  }


  const searchFilter = () => {
    let listArr = Object.assign([],reviewCalls)
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
  //Modal Vendor Managament
  const showModal = async (modalName = null, data = null) => {
    if (modalName == null) {
      return false
    }
    // setEvidenceTypeId(null)
    let fileType = null
    let modalObj = {}
    switch (modalName) {
      case 'add_review_call_modal':
        if (data != null) {
          let mDataObj = data
          mDataObj.tags = []
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

  const onDelReviewCall = (type = '',data) => {
    if (type == '') {
      return false
    }
    setShowAlert({ show: true, type: type, message: "",data })
  }

  const delReviewCall = () => {

  }
  const addReviewCall = () => {

  }
  const editReviewCall = () => {

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
                            <h1 className="mb-0 fs-18">Schedule Calls</h1>
                          </div>
                          <div className={`${Styles.vm_btns_box} text-right w-50`}>
                            <a className={`btn btn-primary-2 btn_05 btn_wide`} onClick={() => showModal('add_review_call_modal')} >Schedule Review call</a>
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
                                              <th> <a onClick={() => sortData('category_name',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by link_url">Date</a></th>
                                              <th className="vendor_name"> <a onClick={() => sortData('email',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by link_url">Time</a></th>
                                              <th className=""> <a onClick={() => sortData('created_on',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by link_url">Scheduled By</a></th>
                                              <th> <a onClick={() => sortData('status',activeSortOrder == 'ASC'? 'DESC' : 'ASC',filteredList)} className="sort-by link_url">Status</a></th>
                                              <th>Action</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {filteredList && filteredList.length > 0 && React.Children.toArray(filteredList.map((item, rcIndex) => {
                                              return (
                                                <tr>

                                                  <td className="text-dark">{item.vendor_name}</td>
                                                  <td>{item.date}</td>
                                                  <td>{item.time}</td>
                                                  <td><span>{item.scheduled_by}</span></td>
                                                  <td><span className={`p-1 badge ${item.status === "Active" ?  "badge-success" : "badge-danger"}`}>{item.status == "InActive" ? `In Active` : item.status}</span></td>
                                                  <td>
                                                    <div className="d-flex justify-content-around action_btns">
                                                      <span className="edit link_url" onClick={() => editReviewCall(rcIndex)}><i className="fa fa-pencil fs-14"></i></span>
                                                      <span className="delete text-danger link_url" onClick={() => onDelReviewCall("del_confirmation",{rcIndex})}><i className="fa fa-trash fs-14"></i></span>
                                                    </div>
                                                  </td>
                                                </tr>
                                              )
                                            })) }
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
              }
            })()}


          </div>
        </div>
      </div>
      {(() => {
              if (modalType && modalType != '' && modalType != null) {
                if (modalType == 'add_review_call_modal') {
                  return <AirVendorModal
                    show={openModal}
                    modalType={modalType}
                    hideModal={hideModal}
                    modalData={modalData}
                    formSubmit={addReviewCall} />
                }

              }
            })()}

      {(() => {
        if (showAlert && showAlert.show && showAlert.type == "del_confirmation") {
          return (
            <SweetAlert
              danger
              showCancel
              confirmBtnText="Delete"
              confirmBtnBsStyle="danger"
              cancelBtnCssClass="btn btn-outline-secondary text_color_2"
              title="Are you sure  you want delete the review call ?"
              onConfirm={() => delReviewCall(showAlert?.data?.ovIndex)}
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

export default VendorsMeetings