import { useForm } from "react-hook-form";
import ApiService from "../../services/ApiServices";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import Header from "../../components/partials/Header";
import Styles from "../../styles/VendorSettings.module.css"
import React, { useContext, useEffect, useState } from "react";
import crypto from 'crypto'
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import AirModal from "../../elements/AirModal";
import { LayoutContext } from "../../ContextProviders/LayoutContext";
import AIR_MSG from "../../helpers/AirMsgs";
import Multiselect from "multiselect-react-dropdown";
import AirCalender from "../../elements/AirCalender";
import moment from "moment";
// import { MultiSelect } from "react-multi-select-component";

const VendorSettings = (props) => {
  const { user = {} } = useContext(LayoutContext)
  const orgId = user?.currentUser?.org_id || 0;
  const superUser = user?.currentUser?.super_user
  // const projectId = 1;
  const navigate = useNavigate()

  // const { register, handleSubmit, watch, formState: { errors } } = useForm(); // initialize the hook
  const [formSubmitted, setFormSbmt] = useState(false)
  const [formRes, setFormRes] = useState({ status: false, err_status: false, error: {} })
  const [errorMsg, setErrorMsg] = useState(false);
  const { register, handleSubmit, watch, trigger, setValue, clearErrors, formState: { errors } } = useForm();

  // const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const [viewType, setViewType] = useState(1)

  const [openModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [settings, setSettings] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [sheduledDateTimeSlots, setSheduledDateTimeSlots] = useState({});
  const todayDate = moment().toDate();
  const multiselectRef = React.createRef();
  const form = watch();

  const TimeSlots = [
    { label: "08AM - 09AM", value: { From: "08AM", To: "09AM" } },
    { label: "09AM - 10AM", value: { From: "09AM", To: "10AM" } },
    { label: "10AM - 11AM", value: { From: "10AM", To: "11AM" } },
    { label: "11AM - 12PM", value: { From: "11AM", To: "12PM" } },
    { label: "12PM - 01PM", value: { From: "12PM", To: "01PM" } },
    { label: "01PM - 02PM", value: { From: "01PM", To: "02PM" } },
    { label: "02PM - 03PM", value: { From: "02PM", To: "03PM" } },
    { label: "03PM - 04PM", value: { From: "03PM", To: "04PM" } },
    { label: "04PM - 05PM", value: { From: "04PM", To: "05PM" } },
    { label: "05PM - 06PM", value: { From: "05PM", To: "06PM" } },
    { label: "06PM - 07PM", value: { From: "06PM", To: "07PM" } },
    { label: "07PM - 08PM", value: { From: "07PM", To: "08PM" } },
    { label: "08PM - 09PM", value: { From: "08PM", To: "09PM" } },
    { label: "09PM - 10PM", value: { From: "09PM", To: "10PM" } },
    { label: "10PM - 11PM", value: { From: "10PM", To: "11PM" } },
    { label: "11PM - 12AM", value: { From: "11PM", To: "12AM" } },

  ];

  useEffect(() => {

    if (!settings) {
      getUserSettings()
    }

  }, [])


  const getUserSettings = async () => {
    let payloadUrl = "employees/getProfile"
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);
    if (res && res.message == "Success" && res.results.length > 0) {
      let data = res.results[0]
      let tempTimeSlots = {}
      let timeSlots = data.available_timeslot
      for (const tdate of Object.keys(timeSlots)) {
        let dtSlots = timeSlots[tdate]
        let origSlots = []
        dtSlots.map((dtslot,dtskey) => {
          let val = TimeSlots.find((tSlot,tkey) => tSlot.value.From == dtslot.From)
          if(val){
            origSlots.push(val)
          }
        })
        tempTimeSlots[tdate] = origSlots
      }
      setSelectedSlots(oldVal => {
        return {...tempTimeSlots}
      })
      setSettings(oldVal => {
        return { ...data }
      })

      // setValue("updateProfileForm.first_name", data.first_name)
    }
  }
  const showModal = async (modalName = null, data = null) => {
    if (modalName == null) {
      return false
    }
    setModalType(modalName)
    setShowModal(true)
  }
  const hideModal = (tskId = null, data = null) => {

    setModalType(null)
    setShowModal(false)
  }


  const updateProfile = async () => {
    // console.log(updateProfileForm);
    clearErrors()
    let isValid = await trigger()
    if (!isValid) {
      return false
    }
    let formRes = { status: false, err_status: false, error: {} }
    setFormRes(formRes)
    let data = {available_timeslot:JSON.stringify(sheduledDateTimeSlots)}

    let payloadUrl = "employees/updateProfile"
    let method = "POST";
    let formData = { ...data }
    let res = await ApiService.fetchData(payloadUrl, method, formData);
    if (res && res.message == "Success") {
      setValue("review_call_date", "")
      setSelectedSlots(oldVal => {
        return {...{}}
      })
      setSheduledDateTimeSlots(oldVal => {
        return {...{}}
      })
      formRes = { status: true, err_status: false, type: "updateProfile", error: {}, msg: AIR_MSG.update_profile_success }
      setFormRes(formRes)
    } else {
      formRes['err_status'] = true
      formRes['error']['type'] = "updateProfile"
      formRes['error']['msg'] = AIR_MSG.technical_err
      setFormRes(formRes)
    }
    setTimeout(() => {
      formRes = { status: false, err_status: false, error: {} }
      setFormRes(formRes)
    }, 3000);

  }

  const switchView = (type = null) => {
    if (type == null) {
      return false
    }
    setViewType(type)
  }

  const examplefn = async (data) => {
    setSelectedSlots([...data]);
    let newSelectedData = [];

    data.map(item => newSelectedData.push(item.value));
    let payloadUrl = "employees/updateDashboardWidgets"
    let method = "POST";
    let formData = { widgets: newSelectedData }
    // let res = await ApiService.fetchData(payloadUrl, method, formData);
    // if (res && res.message == "Success") {
    //   //OnSuccess Logic Here  
    // }

  }

  const toggleSelection = (slots = []) => {
    
    let rev_call_date = moment(form.review_call_date, "MM-DD-YYYY").format("YYYY-MM-DD");
    let secheduledSlots = {...sheduledDateTimeSlots}
    let availableSlots = { ...selectedSlots }
    let selSlots = slots.map((item, key) => item.value)
    availableSlots[rev_call_date] = slots
    secheduledSlots[rev_call_date] = selSlots
    if (availableSlots[rev_call_date] && availableSlots[rev_call_date].length == 0) {
      delete availableSlots[rev_call_date]
    }
    setSelectedSlots(oldVal => {
      return { ...availableSlots }
    })
    setSheduledDateTimeSlots(oldVal => {
      return { ...secheduledSlots }
    })
  }

  const onChangeDate = (startDate = null, endDate = null) => {
    multiselectRef.current.resetSelectedValues()
    setValue('review_call_date', startDate, { shouldValidate: true })
    //updateTaskDetails("due_date", startDate)
  }

  const addToTimeSlotsList = () => {

  }


  return (
    <>
      <Header />
      {/* <div id="accordion" className="profileSec pl-lg-3 pr-lg-3 accordianSec  mt-3"> */}
      <div id="vendors_settings_section">
        <div id="accordion" className="pl-lg-3 pr-lg-3 mt-3">
          <div className="card card_shadow_none p-2">
            <div className="card-header justify-content-between py-2 bg_color_2 border-0">
              <div className={`${Styles.config_tabs_box}`}>
                <a className={`link_url border text_color_2 ${viewType == 1 ? Styles.active : ''}`} onClick={() => switchView(1)}>Time Slots</a>
                {/* <a className={`link_url border text_color_2 ${viewType == 2 ? Styles.active : ''}`} onClick={() => switchView(2)}>Notification setting</a> */}
              </div>
            </div>
            <div className="card-body">
              {(() => {
                if (viewType == 1) {
                  return (
                    <>
                      <div className="row">
                        <div className="col-6 order-md-2">
                          <fieldset className="border rounded p-3">
                            <legend className="w-auto m-0 fs-14 fw-600">Avaliable Time Slots</legend>
                            <div className="row">
                              <div className="col-12">
                                {/* <div>Available Slots Details</div> */}
                                {selectedSlots && Object.keys(selectedSlots).length > 0 && React.Children.toArray(Object.keys(selectedSlots).map((date, key) => {
                                  return (
                                    <>
                                      <div className="fs-12 fw-600 my-1">{date}</div>
                                      {selectedSlots[date].length > 0 && React.Children.toArray(selectedSlots[date].map((item, ikey) => {
                                        return (
                                          <>
                                            {ikey != 0 ? ", ": ""}<span className="badge badge-info btn_03 fs-10">{item?.value?.From} - {item?.value?.To}</span>
                                          </>
                                        )
                                      }))}
                                    </>
                                  )
                                }))}
                              </div>
                            </div>
                          </fieldset>
                        </div>
                        <div className="col-6 order-md-1">

                          <fieldset className="border rounded p-3 mt-3">
                            <legend className="w-auto m-0 fs-14 fw-600">Add Time Slots</legend>
                            <form action="#">
                              <div className="row">
                                <div className="col-md-6 mb-3">
                                  <div className="form-group">
                                    <AirCalender type="custom" dateFormat="MM-DD-YYYY" changeFn={onChangeDate} defaultSettings={{ singleDatePicker: true, autoUpdateInput: true, autoApply: true, minDate: todayDate }}
                                    >
                                      <div className="date_box w-100 mr-2 d-flex align-items-center triggerDate">
                                        <input type="text" className="form-control link_url bg-transparent" disabled={true} {...register('review_call_date', { required: true, pattern: /^(1[0-2]|0[1-9])-(3[01]|[12][0-9]|0[1-9])-[0-9]{4}$/ })} placeholder="Date" autoComplete="off" />
                                      </div>
                                    </AirCalender>
                                    <span className="form_err text-danger d-block"> {errors.review_call_date?.type === 'required' && 'Date is required.'}</span>
                                    <span className="form_err text-danger d-block"> {errors.review_call_date?.type === 'pattern' && 'Invalid Date.'}</span>
                                  </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                  <div className="form-group">
                                    {/* custom_air_filter */}
                                    <Multiselect
                                      id="air_multi_sel"
                                      ref={multiselectRef}
                                      selectedValues={selectedSlots[moment(form.review_call_date,"MM-DD-YYYY").format("YYYY-MM-DD")]}
                                      displayValue="label"
                                      onKeyPressFn={function noRefCheck() { }}
                                      onRemove={(item) => toggleSelection(item)}
                                      onSearch={function noRefCheck() { }}
                                      onSelect={(item) => toggleSelection(item)}
                                      className="air_multi_select"
                                      options={TimeSlots}
                                      showCheckbox
                                      placeholder="Available Time Slots"
                                    />
                                  </div>
                                </div>

                                <div className="col-md-12 mt-3">
                                  <button type="button" className="btn btn-primary-2 btn_04" onClick={() => updateProfile()}>Update</button>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col">
                                  {/* {errors.newPass?.type === 'pattern' && <div className="form_err text-danger">*Password should be alphanumeric, must contain atleast 1 uppercase and 1 special character and should have atleast 10 characters </div>} */}
                                  {
                                    !formRes.status && formRes.err_status && formRes.error?.type == "updateProfile" && formRes.error?.msg
                                      ? <div className="form_err text-danger"><div>{formRes.error?.msg}</div> </div>
                                      : ''
                                  }
                                  {
                                    formRes.status && formRes?.type == "updateProfile" && formRes.msg
                                      ? <div className="form_success text-success"><div>{formRes?.msg}</div> </div>
                                      : ''
                                  }
                                </div>

                              </div>
                            </form>
                          </fieldset>
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
    </>
  )
}

export default VendorSettings