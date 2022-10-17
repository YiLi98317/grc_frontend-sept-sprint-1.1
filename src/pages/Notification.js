import Header from "../components/partials/Header";
import Footer from "../components/partials/Footer";
import React, { useContext, useEffect, useState } from "react";
import { LayoutContext } from "../ContextProviders/LayoutContext";
import { useLocation } from "react-router-dom";
import { Button, Dropdown, DropdownButton, Overlay, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import ApiService from "../services/ApiServices";
import SweetAlert from "react-bootstrap-sweetalert";
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import { mentionStrToHtml } from "../helpers/Helper";

const Notification = (props) => {
  const { projectId = null, user = {}, setReloadHeader } = useContext(LayoutContext)
  const [notifications, setNotifications] = useState([])
  const [showFullNotificans, setShowFullNotificans] = useState([])
  const [allChecked, setAllChecked] = useState(false);
  const [singlecheck, setsinglecheck] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: 'success', message: '' })
  const location = useLocation()
  const notificationsData = [
    {
      id: 1,
      title:
        "Lorem ipsum dolor sit amet. Id cumque quis qui incidunt soluta sed quaerat neque est quos Quis ea autem veniam 33 voluptas quae. Quo culpa nesciunt qui fugiat neque",
      date: "Apr 21, 2016",
    },
    {
      id: 2,
      title:
        "quos Quis ea autem veniam 33 voluptas quae. Quo culpa nesciunt qui fugiat neque ",
      date: "May 25, 2015",
    },
    {
      id: 3,
      title:
        "non dicta perspiciatis et necessitatibus veritatis aut molestiae nostrum",
      date: "Jun 15, 2020",
    },
    {
      id: 4,
      title: "Quis ea autem veniam",
      date: "Jul 05, 2022",
    },
    {
      id: 5,
      title:
        "Lorem ipsum dolor sit amet. Id cumque quis qui incidunt soluta sed quaerat neque est quos Quis ea autem veniam 33 voluptas quae. Quo culpa nesciunt qui fugiat neque",
      date: "Apr 21, 2016",
    },
    {
      id: 6,
      title:
        "quos Quis ea autem veniam 33 voluptas quae. Quo culpa nesciunt qui fugiat neque ",
      date: "May 25, 2015",
    },
    {
      id: 7,
      title:
        "non dicta perspiciatis et necessitatibus veritatis aut molestiae nostrum",
      date: "Jun 15, 2020",
    },
    {
      id: 8,
      title: "Quis ea autem veniam",
      date: "Jul 05, 2022",
    },
  ];

  useEffect(() => {
    if (notifications.length == 0 && projectId != null) {
      getNotifications()
    }
  }, [projectId])


  const getNotifications = async (tskId = null) => {
    let moduleId = 1

    if (location.pathname.indexOf("/vendor") != -1) {
      moduleId = 2
    }
    let payloadUrl = `reference/getNotifications/${moduleId}/${projectId}`
    let method = "GET";
    let res = await ApiService.fetchData(payloadUrl, method);

    if (res && res.message == "Success") {
      // console.log(res.results);
      let notifications = res.results;
      // let notifications  = res.results.map((item) => {
      //   const parser = new DOMParser();
      //   item.notification_msg = parser.parseFromString(item.notification_msg, "text/html")
      //   return item
      // })
      // console.log(notifications);
      setNotifications(oldVal => {
        // for (let item of res.results) {
        //     item.is_read = "N"
        // }
        return [...notifications]
      })

    }

  }

  const toggleFullNotification = (index = null, showFullText = false) => {
    if (index == null) {
      return false
    }
    let objArr = [...showFullNotificans]
    objArr[index] = showFullText;
    setShowFullNotificans(oldVal => {
      return [...objArr]
    })
  }
  const handleChange = (e) => {
    const { name, checked } = e.target;
    if (name === "allSelect") {
      let tempArr = notifications.map((data) => {
        return { ...data, isChecked: checked };
      });
      setNotifications(tempArr);
    } else {
      let tempArr = notifications.map((data) =>
        (name == data.id) ? { ...data, isChecked: checked } : data
      );
      setNotifications(tempArr);
    }

  };

  const mark_read_unread = async (ids, val, multiple = false) => {
    let newSelectedData = [];
    if (multiple) {
      notifications.forEach((chk_item) =>
        (chk_item.isChecked) ?
          newSelectedData.push(chk_item.id) : ""
      );
    }
    else {
      newSelectedData.push(ids);
    }

    let payloadUrl = "reference/markNotification"
    let method = "POST";
    let formData = { notification_ids: newSelectedData, is_read: val }
    let res = await ApiService.fetchData(payloadUrl, method, formData);

    if (res && res.message == "Success") {
      //OnSuccess Logic Here  
      getNotifications();
      setReloadHeader(true);
      setShowAlert({ show: true, type: "success", message: `${multiple ? 'Messages' : 'Message'} marked as ${(val == "Y") ? "read" : "unread"} successfully` })

    }
    else {
      setShowAlert({ show: true, type: "danger", message: res.message })
    }

  }
  const toggleAlert = (val) => {
    setShowAlert(val)
  }

  const filterStr = (parseHtmlStr = null,returnHtml = true) =>  {
    if(parseHtmlStr == null){
      return {string: "",html:[]}
    }
    parseHtmlStr = parseHtmlStr.replace(/\<br\>/g,"")
    let parseHtmlArr = ReactHtmlParser(parseHtmlStr)
    let tmpStr = "";
    let tmpArr = []
    for (let  key in  parseHtmlArr) {
        let item = parseHtmlArr[key]
        if(item != null && typeof item != 'object'){
          tmpArr.push(item)
        }else{
          // console.log(item);
          tmpArr.push(item.props.children ? item.props.children[0] : "")
        }
    }
    return {string: tmpArr.join(" "),html:parseHtmlArr}
}

  return (
    <>
      <Header />
      <div id="task_manager_sec" className="container-fluid">
        <div className="row">
          <div className="col-md-12 col-12 pl-0 pr-0 pl-lg-3 pr-lg-3 pl-xl-3 pr-xl-3">
            <div className="mainSearchbar">
              <div className="flex-grow-1">
                <div className="input-group">
                  <div className="input-group-checkbox">
                    <input type="checkbox" className="form-check-input" name="allSelect"
                      checked={
                        !notifications.some((user) => user?.isChecked !== true)
                      }
                      onChange={handleChange}
                    />

                  </div>


                  <DropdownButton
                    key={"primary"}
                    id={`dropdown-variants-${"primary"}`}
                    variant="primary-2 btn_05 max_w_auto fs-10 p-1 w60"
                    title={"Mark"}
                    drop={"down"}
                    align="end"
                    className="dropdown_toggle_custom2"
                  >
                    <Dropdown.Item onClick={() => mark_read_unread(null, 'Y', true)}> <i className="fa fa-envelope-open-o mr-2" aria-hidden="true" ></i>Read</Dropdown.Item>
                    <Dropdown.Item onClick={() => mark_read_unread(null, 'N', true)}><i className="fa fa-envelope-o mr-2" aria-hidden="true"></i>Unread</Dropdown.Item>



                  </DropdownButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grc_table_section p-3">
        <div className={`grc_table_block fs-16`}>
          <div className="table-responsive">
            <table className="table notifications_table table-sm table-borderless mb-0">
              <tbody>
                {notifications && notifications.length > 0 && React.Children.toArray(notifications.map((item, nIndex) => (
                  <>
                    <tr className={`${item.is_read == "Y" ? "bg-transparent" : "bg_14"}`}>
                      <td className="px-3">
                        <div className="ml-2 mt-2">
                          <input
                            type="checkbox"
                            name={item.id}
                            checked={item?.isChecked || false}
                            onChange={handleChange}
                          />
                        </div>
                      </td>
                      <td className="px-3">
                        <h6 className={`fw-400 fs-15 m-0 ${showFullNotificans[nIndex] ? "d-inline-block word_break overflow-hidden" : ""}`}>
                          {/* <span className="line_clamp_1">{ReactHtmlParser(item.notification_msg)}</span> */}
                          {(() => {
                            if (
                              item.notification_msg &&
                              filterStr(item.notification_msg).string.length > 160
                            ) {
                              if (showFullNotificans[nIndex]) {
                                return (
                                  <>
                                    {filterStr(item.notification_msg).html}{" "}
                                    <span
                                      className="link_url fs-12 fw-600 text_color_7"
                                      onClick={() =>
                                        toggleFullNotification(nIndex, false)
                                      }
                                    >
                                      ..Show Less
                                    </span>
                                  </>
                                );
                              } else {
                                return (
                                  <>
                                    <div className="d-flex align-items-center">
                                      <span className="line_clamp_1">{filterStr(item.notification_msg).html}{" "}</span>
                                      
                                      <span
                                        className="link_url fs-12 fw-600 text_color_7 pt-1 min_w_150"
                                        onClick={() =>
                                          toggleFullNotification(nIndex, true)
                                        }
                                      >
                                        Show More
                                      </span>
                                    </div>
                                    
                                  </>
                                );
                              }
                            } else {
                              return <>{filterStr(item.notification_msg).html}</>;
                            }
                          })()}
                        </h6>
                      </td>
                      <td className="px-3">
                        <p className="text-muted fs-12 w85 mb-0">{item.notified_on}</p>
                      </td>
                      <td className="px-3">
                        {
                          (item.is_read == "Y")
                            ? <>
                              <OverlayTrigger
                                key={"bottom"}
                                placement={"bottom"}
                                overlay={
                                  <Tooltip id={`tooltip-right`}>
                                    Mark As Unread
                                  </Tooltip>
                                }
                              >
                                <span className="link_url d-inline-block mb-2" onClick={() => mark_read_unread(item.id, "N")}><i className="fa fa-envelope-o" aria-hidden="true"></i></span>
                              </OverlayTrigger>
                            </>
                            : <>
                              <OverlayTrigger
                                key={"bottom"}
                                placement={"bottom"}
                                overlay={
                                  <Tooltip id={`tooltip-right`}>
                                    Mark As Read
                                  </Tooltip>
                                }
                              >
                                <span className="link_url d-inline-block mb-2" onClick={() => mark_read_unread(item.id, "Y")}><i className="fa fa-envelope-open-o" aria-hidden="true"></i></span>
                              </OverlayTrigger>
                            </>
                        }
                      </td>
                    </tr>
                  </>
                )))}

              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* <section className="notification_wrapper p-3">
        <div className="fc-scroller container-fluid notification_box">
          {notifications &&
            notifications.length > 0 &&
            React.Children.toArray(
              notifications.map((item, nIndex) => (
                <div className="list-group-item row d-flex px-0" key={item.id}>
                  <div className="col-auto pr-0">
                    <div className="ml-2 mt-2">
                      <input
                        type="checkbox"
                        name={item.id}
                        checked={item?.isChecked || false}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="notification_icon position-relative m-auto">
                      {item.is_read == "N" && (
                        <span className="badge badge-success bg_color_4 unread_icon"></span>
                      )}
                      <img
                        src="/assets/img/gbl.svg"
                        alt="notification"
                        className="img-fluid position-absolute"
                      />
                    </div>
                  </div>
                  <div className="col">
                    <h6
                      className={`fw-400 fs-15 line_clamp_2 ${showFullNotificans[nIndex] ? "showFullText" : ""
                        }`}
                    >
                      {(() => {
                        if (
                          item.notification_msg &&
                          item.notification_msg.length > 160
                        ) {
                          if (showFullNotificans[nIndex]) {
                            return (
                              <>
                                {item.notification_msg}{" "}
                                <span
                                  className="link_url fs-12 fw-600 text_color_7"
                                  onClick={() =>
                                    toggleFullNotification(nIndex, false)
                                  }
                                >
                                  ..Show Less
                                </span>
                              </>
                            );
                          } else {
                            return (
                              <>
                                {item.notification_msg.substring(0, 160)}{" "}
                                <span
                                  className="link_url fs-12 fw-600 text_color_7"
                                  onClick={() =>
                                    toggleFullNotification(nIndex, true)
                                  }
                                >
                                  ..Show More
                                </span>
                              </>
                            );
                          }
                        } else {
                          return <>{item.notification_msg}</>;
                        }
                      })()}
                    </h6>
                  </div>
                  <div className="col-auto">
                    <p className="text-muted fs-12">{item.notified_on}</p>

                  </div>
                  <div className="col-auto">
                    {
                      (item.is_read == "Y")
                        ? <>
                          <OverlayTrigger
                            key={"bottom"}
                            placement={"bottom"}
                            overlay={
                              <Tooltip id={`tooltip-right`}>
                                Mark As Unread
                              </Tooltip>
                            }
                          >
                            <span className="link_url" onClick={() => mark_read_unread(item.id, "N")}><i className="fa fa-envelope-o" aria-hidden="true"></i></span>
                          </OverlayTrigger>
                        </>
                        : <>
                          <OverlayTrigger
                            key={"bottom"}
                            placement={"bottom"}
                            overlay={
                              <Tooltip id={`tooltip-right`}>
                                Mark As Read
                              </Tooltip>
                            }
                          >
                            <span className="link_url" onClick={() => mark_read_unread(item.id, "Y")}><i className="fa fa-envelope-open-o" aria-hidden="true"></i></span>
                          </OverlayTrigger>
                        </>
                    }

                  </div>
                </div>
              ))
            )}
        </div>
      </section> */}
      <Footer />
      {(() => {
        if (showAlert && showAlert.show && showAlert.type == "success") {
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
    </>
  );
};

export default Notification;
