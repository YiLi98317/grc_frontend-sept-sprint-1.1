import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import Header from "../components/partials/Header";
import { useContext, useEffect, useState } from "react";
import AIR_MSG from "../helpers/AirMsgs";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import AirSelect from "../elements/AirSelect";
import AirPagination from "../elements/AirPagination";
import AirCalender from "../elements/AirCalender";
import AirVendorModal from "../elements/AirVendorModal";

const ComingSoon2 = (props) => {
  const { user = {}, setReloadHeader, loginType = null } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const AccountId = user?.currentUser?.account_id || 0;
  const AccountName = user?.currentUser?.account_name || 0;
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const { register, handleSubmit, resetField, watch, formState: { errors } } = useForm();

  // trigger questionare states
  const [tQuestions, setTQuestions] = useState([])

  const [modalType, setModalType] = useState(null)
  const [openModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({})

  useEffect(() => {
    if (tQuestions.length == 0) {
      let tqArr = [
        {
          vendor: 'Office 365',
          question: `Questionnaire Template_1`,
          deadline: `Mar 02 2022`,
        },
        {
          vendor: 'Azure',
          question: `Questionnaire Template_1`,
          deadline: `Mar 02 2022`,
        },
        {
          vendor: 'Amazon Web Services',
          question: `Questionnaire Template_1`,
          deadline: `Mar 02 2022`,
        },
      ];
      setTQuestions(tqArr)
    }
  }, [])


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


  // comming soon pages function 
  /* add vendor function start */
  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ]
  const onChangeAirSelect = (newVal) => {
  }
  /* add vendor function end */

  /* Add trigger questionaire functions start */
  const addTriggerQuestionaire = () => {

  }
  const delQuest = () => {

  }

  const onChangeDate = (type = null) => {
    if (type == null) {
      return false
    }
  }

  const showModal = async (modalName = null, data = null) => {
    if (modalName == null) {
      return false
    }
    // setEvidenceTypeId(null)
    let fileType = null
    switch (modalName) {
      case 'revert_modal':
        if (data != null) {
          setModalData(data)
        }
        setModalType(modalName)
        setShowModal(true)
      break;
    }
  }

  const hideModal = () => {
    setModalType(null)
    setShowModal(false)
  }

  const onSubmitForm = (modalName = null,data = null) => {
    if(modalName == null || data == null){
      return false
    }
  }
  /* Add trigger questionaire functions end */

  return (
    <>
      {/* Add Vendor page start */}
      <div style={{ 'minHeight': 'calc(100vh - 50px)' }}>
        <Header defHeaderTitle={'Add Vendor'} />
        <div className="container-fluid">
          <div id="vendor_assessment_section">
            <div className="row">
              <div className="col-md-12">
                <div className="card air_vendor rounded">

                  <div className="card-body p-0">
                    <div className="add_vendor_block bg_07 px-3 py-3">
                      <form className="vendor_custom_form2" onSubmit={handleSubmit(addProject)}>


                        <div className="form-row form-group rounded mx-0">
                          <div className="col-md-6">
                            <AirSelect cClass={'vendor_select_box'}
                              cClassPrefix={'vendor_select'}
                              hideOptionOnSelect={false}
                              closeOnSelect={false}
                              changeFn={onChangeAirSelect}
                              selectOptions={options}
                              selected={[]}
                              multi={true} />
                            {errors.account?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.acc_name_required}</div>}
                          </div>
                        </div>
                        <div className="w-100 mt-4 mb-3">
                          <h6 className="fw-600">Or Add New Vendors</h6>
                        </div>
                        <div className="form-row form-group rounded mx-0">
                          <div className="col">
                            <input type="text" className="form-control bg-transparent" {...register("name")} autoComplete="off" defaultValue={AccountName} />
                            {errors.name?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_name_required}</div>}
                          </div>
                          <div className="col">
                            <select className="form-control bg-transparent" {...register("category")} defaultValue={''}>
                              <option value="" disabled>Select category</option>
                              <option value="1">Category 1</option>
                              <option value="2">Category 2</option>
                              <option value="3">Category 3</option>
                            </select>
                            {errors.category?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_category_required}</div>}
                          </div>
                          <div className="col">
                            <input type="text" className="form-control bg-transparent" {...register("email")} autoComplete="off" defaultValue={AccountName} />
                            {errors.email?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_email_required}</div>}
                          </div>
                          <div className="col-auto d-flex align-items-end">
                            <div className="buttom_submit_block plus">
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
                      </form>
                    </div>


                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add Vendor page end */}

      {/* Edit/Update vendor page start */}
      <div style={{ 'minHeight': 'calc(100vh - 50px)' }}>
        <Header defHeaderTitle={'Add Vendor'} />
        <div className="container-fluid">
          <div id="vendor_assessment_section">
            <div className="row">
              <div className="col-md-12">
                <div className="card air_vendor rounded">

                  <div className="card-body p-0">
                    <div className="add_vendor_block bg_07 px-3 py-3">
                      <form className="vendor_custom_form2" onSubmit={handleSubmit(addProject)}>


                        <div className="form-row form-group rounded mx-0">
                          <div className="col-md-6">
                            {/* <input type="text" className="form-control bg-transparent" {...register("account")} name="account" autoComplete="off" defaultValue={AccountName} readOnly={true} /> */}
                            <AirSelect cClass={'vendor_select_box'}
                              cClassPrefix={'vendor_select'}
                              hideOptionOnSelect={false}
                              closeOnSelect={false}
                              changeFn={onChangeAirSelect}
                              selectOptions={options}
                              selected={[]}
                              multi={true} />
                            {errors.account?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.acc_name_required}</div>}
                          </div>
                        </div>
                        <div className="w-100 mt-4 mb-3">
                          <h6 className="fw-600">Or Add New Vendors</h6>
                        </div>
                        <div className="form-row form-group rounded mx-0">
                          <div className="col">
                            <input type="text" className="form-control bg-transparent" {...register("name")} autoComplete="off" defaultValue={AccountName} />
                            {errors.name?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_name_required}</div>}
                          </div>
                          <div className="col">
                            <select className="form-control bg-transparent" {...register("category")} defaultValue={''}>
                              <option value="" disabled>Select category</option>
                              <option value="1">Category 1</option>
                              <option value="2">Category 2</option>
                              <option value="3">Category 3</option>
                            </select>
                            {errors.category?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_category_required}</div>}
                          </div>
                          <div className="col">
                            <input type="text" className="form-control bg-transparent" {...register("email")} autoComplete="off" defaultValue={AccountName} />
                            {errors.email?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_email_required}</div>}
                          </div>
                          <div className="col-auto d-flex align-items-end">
                            <div className="buttom_submit_block plus">
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
                      </form>
                    </div>
                  </div>
                </div>

                <div className="card bg-transparent air_vendor rounded mt-4">
                  <div className="card-body p-0">
                    <div className="vendor_list_block vendor_table_block">
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
                            <tr>
                              <td className="text-dark">Amazon Web Services</td>
                              <td>Common</td>
                              <td>alan.jones@office365@gmail.com</td>
                              <td>Active</td>
                              <td>
                                <div className="d-flex justify-content-around action_btns">
                                  <span className="edit"><i className="fa fa-pencil"></i></span>
                                  <span className="delete text-danger"><i className="fa fa-trash"></i></span>
                                </div>
                              </td>
                            </tr>
                            <tr className="edit_active">
                              <td className="text-dark">Office365</td>
                              <td>
                                <select className="form-control w-auto pl-0" defaultValue={"Non-common"}>
                                  <option value={'Non-common'}>Non-common</option>
                                  <option value={'common'}>Common</option>
                                </select>
                              </td>
                              <td><input className="form-control w-auto pl-0" defaultValue={'alan.jones@office365@gmail.com'} /></td>
                              <td>
                                <div className="custom-control custom-switch">
                                  <input type="checkbox" className="custom-control-input" id="customSwitch1" defaultChecked={true} />
                                  <label className="custom-control-label" htmlFor="customSwitch1"></label>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex justify-content-around action_btns">
                                  <span className="edit"><i className="fa fa-pencil"></i></span>
                                  <span className="delete text-danger"><i className="fa fa-trash"></i></span>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-dark">Office365</td>
                              <td>Non-Common</td>
                              <td>alan.jones@office365@gmail.com</td>
                              <td>Active</td>
                              <td>
                                <div className="d-flex justify-content-around action_btns">
                                  <span className="edit"><i className="fa fa-pencil"></i></span>
                                  <span className="delete text-danger"><i className="fa fa-trash"></i></span>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-dark">Azure</td>
                              <td>Non-Critical</td>
                              <td>Sam.nol@azure.com</td>
                              <td>Inactive</td>
                              <td>
                                <div className="d-flex justify-content-around action_btns">
                                  <span className="edit"><i className="fa fa-pencil"></i></span>
                                  <span className="delete text-danger"><i className="fa fa-trash"></i></span>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pagination_sec">
                      <AirPagination layout={1}
                        totalPages={10}
                        currentPage={1}
                        showAllPages={true}
                        showPrevNextBtn={true}
                        disablePages={[]}
                        cClass='' />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Edit/Update vendor page end */}

      {/* Vendor list page start */}
      <div style={{ 'minHeight': 'calc(100vh - 50px)' }}>
        <Header defHeaderTitle={'Vendor List'} />
        <div className="container-fluid">
          <div id="vendor_assessment_section">
            <div className="row">
              <div className="col-md-12">
                <div className="card air_vendor border rounded">

                  <div className="card-body p-0">
                    <div className="vendor_search_block position-relative">
                      <input type="text" className={`form-control border-0 pl-4`} placeholder="Search for Vendor Name, Email Id" />
                      <span className="position-absolute search_icn"> <i className="fa fa-search"></i> </span>
                    </div>
                  </div>
                </div>

                <div className="card bg-transparent air_vendor rounded mt-4">
                  <div className="card-body p-0">
                    <div className="vendor_list_block vendor_table_block">
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
                            <tr>
                              <td className="text-dark">Amazon Web Services</td>
                              <td>Common</td>
                              <td>alan.jones@office365@gmail.com</td>
                              <td>Active</td>
                              <td>
                                <div className="d-flex justify-content-around action_btns">
                                  <span className="edit"><i className="fa fa-pencil"></i></span>
                                  <span className="delete text-danger"><i className="fa fa-trash"></i></span>
                                </div>
                              </td>
                            </tr>
                            <tr className="edit_active">
                              <td className="text-dark">Office365</td>
                              <td>
                                <select className="form-control w-auto pl-0" defaultValue={"Non-common"}>
                                  <option value={'Non-common'}>Non-common</option>
                                  <option value={'common'}>Common</option>
                                </select>
                              </td>
                              <td><input className="form-control w-auto pl-0" defaultValue={'alan.jones@office365@gmail.com'} /></td>
                              <td>
                                <div className="custom-control custom-switch">
                                  <input type="checkbox" className="custom-control-input" id="customSwitch1" defaultChecked={true} />
                                  <label className="custom-control-label" htmlFor="customSwitch1"></label>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex justify-content-around action_btns">
                                  <span className="edit"><i className="fa fa-pencil"></i></span>
                                  <span className="delete text-danger"><i className="fa fa-trash"></i></span>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-dark">Office365</td>
                              <td>Non-Common</td>
                              <td>alan.jones@office365@gmail.com</td>
                              <td>Active</td>
                              <td>
                                <div className="d-flex justify-content-around action_btns">
                                  <span className="edit"><i className="fa fa-pencil"></i></span>
                                  <span className="delete text-danger"><i className="fa fa-trash"></i></span>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-dark">Azure</td>
                              <td>Non-Critical</td>
                              <td>Sam.nol@azure.com</td>
                              <td>Inactive</td>
                              <td>
                                <div className="d-flex justify-content-around action_btns">
                                  <span className="edit"><i className="fa fa-pencil"></i></span>
                                  <span className="delete text-danger"><i className="fa fa-trash"></i></span>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="pagination_sec">
                      <AirPagination layout={1}
                        totalPages={10}
                        currentPage={1}
                        showAllPages={true}
                        showPrevNextBtn={true}
                        disablePages={[]}
                        cClass='' />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Vendor list page end */}

      {/* Trigger Questionaire page start */}
      <div style={{ 'minHeight': 'calc(100vh - 50px)' }}>
        <Header defHeaderTitle={''} />
        <div className="container-fluid">
          <div id="vendor_assessment_section">
            <div className="row">
              <div className="col-md-12">
                <div className="card air_vendor rounded">

                  <div className="card-body p-0">
                    <div className="bg_color_1 px-3 py-3">
                      <form className="vendor_custom_form2" onSubmit={handleSubmit(addProject)}>

                        <div className="w-100 mb-3">
                          <h6 className="fw-600 fs-12">Trigger Questionnaire</h6>
                        </div>
                        <div className="form-row form-group rounded mx-0">
                          {/* <div className="col">
                            <input type="text" className="form-control bg-transparent" {...register("name")} autoComplete="off" defaultValue={AccountName} />
                            {errors.name?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_name_required}</div>}
                          </div> */}
                          <div className="col">
                            <select className="form-control bg-transparent" {...register("vendor")} defaultValue={''}>
                              <option value="" disabled>Select Vendor</option>
                              <option value="1">Office365</option>
                              <option value="2">Azure</option>
                              <option value="3">Amazon Web Services</option>
                            </select>
                            {errors.category?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_category_required}</div>}
                          </div>
                          <div className="col">
                            {/* <input type="text" className="form-control bg-transparent" {...register("email")} autoComplete="off" defaultValue={AccountName} /> */}
                            <AirCalender type="date" aClassName="" changeFn={onChangeDate} >
                              <span className="d-block position-relative deadline_box">
                                <input type="text" className="form-control bg-transparent pr-3" name="deadline" placeholder="Select Deadline" />
                                <i className="fa fa-calendar position-absolute"></i>
                              </span>
                            </AirCalender>
                            {errors.email?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_email_required}</div>}
                          </div>
                          <div className="col">
                            <select className="form-control bg-transparent" {...register("vendor")} defaultValue={''}>
                              <option value="" disabled>Select Questionnaire</option>
                              <option value="1">Questionnaire Template_1</option>
                              <option value="2">Questionnaire Template_2</option>
                              <option value="3">Questionnaire Template_3</option>
                            </select>
                            {errors.category?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_category_required}</div>}
                          </div>
                          <div className="col-auto d-flex align-items-end">
                            <div className="buttom_submit_block plus">
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
                      </form>
                    </div>

                    <div className="search_result bg-white ">
                      <div className="px-3 h_labels">
                        <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0">Vendor/Questionnaire</div>
                        <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text_color_3 mr-2">Deadline</div>
                        <div className="mr-lg-3 w20" style={{ width: '20px' }}></div>
                      </div>
                      {tQuestions && tQuestions.length > 0 && tQuestions.map((ques, tqIndex) => {
                        return (
                          <div key={tqIndex} className="px-3">
                            <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0">
                              <p className="m-0 text-dark fw-500">{ques.vendor}</p>
                              <p className="m-0">{ques.question}</p>
                            </div>
                            <div className="w-20 flex-grow-1 ml-lg-3 ml-md-0 text_color_3 mr-2">{ques.deadline}</div>
                            <div className="mr-lg-3 w20"><a onClick={() => delQuest(tqIndex)}> <img src="/assets/img/times.svg" alt="" className="plus" />  </a></div>
                          </div>
                        )
                      })}
                    </div>


                  </div>

                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Trigger Questionaire page end */}

      {/* Evidence manager page start */}
      <div style={{ 'minHeight': 'calc(100vh - 50px)' }}>
        <Header defHeaderTitle={''} />
        <div className="container-fluid">

          <div id="vendor_assessment_section">
            <div className="row">
              <div className="col-md-12">
                <div id="va_header_section" className="mb-3" >
                  <h1>Evidence manager</h1>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="card air_vendor rounded">

                  <div className="card-body p-0">
                    <div className="add_vendor_block bg_07 px-3 py-3">
                      <form className="vendor_custom_form2" onSubmit={handleSubmit(addProject)}>


                        <div className="form-row">
                          <div className="col-md-6">
                            <div className="form-group rounded mx-0 px-3">
                              <select className="form-control" defaultValue="" {...register("vendor")}>
                                <option value=""> Select Vendor</option>
                                <option value="1"> Vendor 1</option>
                                <option value="2"> Vendor 2</option>
                                <option value="3"> Vendor 3</option>
                              </select>
                            </div>
                            {errors.vendor?.type === 'required' && <div className="field_err text-danger">{AIR_MSG.vendor_select_required}</div>}
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
                      </form>
                    </div>


                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Evidence manager page end */}

      {/* Vendor questionaire page start */}
      <div style={{ 'minHeight': 'calc(100vh - 50px)' }}>
        <Header defHeaderTitle={''} />
        <div className="container-fluid">

          <div id="vendor_assessment_section">
            <div className="row">
              <div className="col-md-12">
                <div id="va_header_section" className="mb-3" >
                  <h1>Office 365</h1>
                </div>
              </div>
            </div>
            <div id="accordion" className="accordion pl-lg-3 pr-lg-3 accordianSec">
              <div className="card ">
                <div className="d-flex align-items-center">
                  <div id="vat0" className="card-header flex-grow-1 collapsed" data-toggle="collapse" href="#vap0" aria-expanded="true">
                    <a className="card-title w-100 d-flex">
                      <span>Question 1</span>
                      <span className="complete_check d-inline-block ml-auto" onClick={() => showModal('revert_modal') }><i className="fa fa-check-circle"></i></span>
                    </a>
                  </div>
                  
                </div>
                <div id="vap0" className="card-body p-0 collapse" data-parent="#accordion">

                  <div className={`px-3 py-2 bg-white rounded`}>
                    <div className="accordian_box pl-3">
                      <p className="m-0 mb-2">Do we have the required security cert for your level of critical. If yes, then upload and mark date of issuance.</p>
                      <p className="m-0 mb-2">Certificate have been attached</p>
                      <div className="doc_req_box">
                        <p className="m-0 mb-2">Evidence</p>
                        <ul className="m-0 pl-3">
                          <li>
                            <p className="d-flex align-items-center justify-content-between">
                              <div>Cert.pdf</div>
                              <div>
                                <span className="mr-2"> <i className="fa fa-eye"></i> </span>
                                <span> <i className="fa fa-cloud-download"></i> </span>
                              </div>
                            </p>
                          </li>
                          <li>
                            <p className="d-flex align-items-center justify-content-between">
                              <div>Cert_1.pdf</div>
                              <div>
                                <span className="mr-2"> <i className="fa fa-eye"></i> </span>
                                <span> <i className="fa fa-cloud-download"></i> </span>
                              </div>
                            </p>
                          </li>
                          <li>
                            <p className="d-flex align-items-center justify-content-between">
                              <div>Cert_2.pdf</div>
                              <div>
                                <span className="mr-2"> <i className="fa fa-eye"></i> </span>
                                <span> <i className="fa fa-cloud-download"></i> </span>
                              </div>
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
              <div className="card ">
                <div className="d-flex align-items-center">
                  <div id="vat1" className="card-header flex-grow-1 collapsed" data-toggle="collapse" href="#vap1" aria-expanded="true">
                    <a className="card-title w-100 d-flex">
                      <span>Question 2</span>
                      <span className="complete_check d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                    </a>
                  </div>
                  
                </div>
                <div id="vap1" className="card-body p-0 collapse" data-parent="#accordion">

                  <div className={`px-3 py-2 bg-white rounded`}>
                    <div className="accordian_box pl-3">
                      <p className="m-0 mb-2">Do we have the required security cert for your level of critical. If yes, then upload and mark date of issuance.</p>
                      <p className="m-0 mb-2">Certificate have been attached</p>
                      <div className="doc_req_box">
                        <p className="m-0 mb-2">Evidence</p>
                        <ul className="m-0 pl-3">
                          <li>
                            <p className="d-flex align-items-center justify-content-between">
                              <div>Cert.pdf</div>
                              <div>
                                <span className="mr-2"> <i className="fa fa-eye"></i> </span>
                                <span> <i className="fa fa-cloud-download"></i> </span>
                              </div>
                            </p>
                          </li>
                          <li>
                            <p className="d-flex align-items-center justify-content-between">
                              <div>Cert_1.pdf</div>
                              <div>
                                <span className="mr-2"> <i className="fa fa-eye"></i> </span>
                                <span> <i className="fa fa-cloud-download"></i> </span>
                              </div>
                            </p>
                          </li>
                          <li>
                            <p className="d-flex align-items-center justify-content-between">
                              <div>Cert_2.pdf</div>
                              <div>
                                <span className="mr-2"> <i className="fa fa-eye"></i> </span>
                                <span> <i className="fa fa-cloud-download"></i> </span>
                              </div>
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
              <div className="card ">
                <div className="d-flex align-items-center">
                  <div id="vat2" className="card-header flex-grow-1 collapsed" data-toggle="collapse" href="#vap2" aria-expanded="true">
                    <a className="card-title w-100 d-flex">
                      <span>Question 3</span>
                      <span className="complete_check d-inline-block ml-auto"><i className="fa fa-check-circle"></i></span>
                    </a>
                  </div>
                  
                </div>
                <div id="vap2" className="card-body p-0 collapse" data-parent="#accordion">

                  <div className={`px-3 py-2 bg-white rounded`}>
                    <div className="accordian_box pl-3">
                      <p className="m-0 mb-2">Do we have the required security cert for your level of critical. If yes, then upload and mark date of issuance.</p>
                      <p className="m-0 mb-2">Certificate have been attached</p>
                      <div className="doc_req_box">
                        <p className="m-0 mb-2">Evidence</p>
                        <ul className="m-0 pl-3">
                          <li>
                            <p className="d-flex align-items-center justify-content-between">
                              <div>Cert.pdf</div>
                              <div>
                                <span className="mr-2"> <i className="fa fa-eye"></i> </span>
                                <span> <i className="fa fa-cloud-download"></i> </span>
                              </div>
                            </p>
                          </li>
                          <li>
                            <p className="d-flex align-items-center justify-content-between">
                              <div>Cert_1.pdf</div>
                              <div>
                                <span className="mr-2"> <i className="fa fa-eye"></i> </span>
                                <span> <i className="fa fa-cloud-download"></i> </span>
                              </div>
                            </p>
                          </li>
                          <li>
                            <p className="d-flex align-items-center justify-content-between">
                              <div>Cert_2.pdf</div>
                              <div>
                                <span className="mr-2"> <i className="fa fa-eye"></i> </span>
                                <span> <i className="fa fa-cloud-download"></i> </span>
                              </div>
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(() => {
        if (modalType && modalType != '' && modalType != null) {
          if (modalType == 'revert_modal') {
            return <AirVendorModal
              show={openModal}
              modalType={modalType}
              hideModal={hideModal}
              modalData={modalData}
              formSubmit={onSubmitForm} />
          }
          
        }
      })()}
      {/* Vendor questionaire page end */}



    </>
  )
}

export default ComingSoon2