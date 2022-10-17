import { useState, useEffect, useContext } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { LayoutContext } from "../../ContextProviders/LayoutContext"
import AirModal from "../../elements/AirModal";


const VendorHeader = (props) => {
    const {
        goToUrl,
        logOut,
        hideModal,
        uploadLogo,
        headerTitle = "",
        openModal = false,
        modalType = null,
        logo = null,
        notificationCount = null,
        
    } = props
    const { projectId = null, setProjectId, updateData, reloadHeader, setReloadHeader, user = {}, loginType = null } = useContext(LayoutContext)
    // const { user = {} } = useOutletContext()
    const currentUser = user?.currentUser
    // const orgId = currentUser?.org_id || 0;
    const isManagement = currentUser?.is_management
    const superUser = currentUser?.super_user
    // const accessRole = currentUser?.access_role
    // const { defHeaderTitle = '' } = props
    // const [headerTitle, setHeaderTitle] = useState('')
    
    const navigate = useNavigate();
    // const [openModal, setShowModal] = useState(false);
    // const [modalType, setModalType] = useState(null)
    // const [logo, setLogo] = useState(null)
    // const [notificationCount, setNotificationCount] = useState(null)


    return (
        <header>
            <div className="align-items-center d-flex justify-content-between aDm_navigation">
                <nav className="navbar navbar-expand-md bg-transparent navbar-light pl-0 p-0">
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapsibleNavbar">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="collapsibleNavbar">
                        <ul className="navbar nav pl-lg-0 pl-0">
                            {(() => {
                                if (isManagement == "Y") {
                                    return (
                                        <>
                                            <li className="nav-item">
                                                <NavLink to="/vendors/dashboard" className={({ isActive }) => isActive ? 'nav-link active  px-lg-2 px-xl-3' : 'nav-link  px-lg-2 px-xl-3'} onClick={() => goToUrl("/vendors/dashboard")}>Dashboard</NavLink>
                                                {/* <a onClick={() => goToUrl('/dashboard')} className="nav-link">Dashboard</a> */}
                                            </li>
                                        </>
                                    )
                                }
                            })()}
                            <li className="nav-item "><NavLink to="/vendors/manage" className={({ isActive }) => isActive ? 'nav-link  px-lg-2 px-xl-3 active' : 'nav-link  px-lg-2 px-xl-3'} onClick={() => goToUrl("/vendors/manage")}>Vendor Management</NavLink></li>
                            {/* <li className="nav-item"><NavLink to="/vendors/assessment" className={({ isActive }) => isActive ? 'nav-link active  px-lg-2 px-xl-3' : 'nav-link px-lg-2 px-xl-3'}>Assessment</NavLink></li> */}
                            <li className="nav-item"><NavLink to="/vendors/assessment" className={({ isActive }) => isActive ? 'nav-link active  px-lg-2 px-xl-3' : 'nav-link px-lg-2 px-xl-3'} onClick={() => goToUrl("/vendors/assessment")}>Assessment</NavLink></li>
                            <li className="nav-item"><NavLink to="/vendors/questionnaire" className={({ isActive }) => isActive ? 'nav-link active px-lg-2 px-xl-3' : 'nav-link px-lg-2 px-xl-3'} onClick={() => goToUrl("/vendors/questionnaire")}>Questionnaire</NavLink></li>
                            <li className="nav-item"><NavLink to="/vendors/evidence-manager" className={({ isActive }) => isActive ? 'nav-link active px-lg-2 px-xl-3' : 'nav-link px-lg-2 px-xl-3'} onClick={() => goToUrl("/vendors/evidence-manager")}>Evidence Manager</NavLink></li>
                            {(() => {
                                if (isManagement == "Y") {
                                    return (
                                        <li className="nav-item ">
                                            <NavLink to="/vendors/configuration" className={({ isActive }) => isActive ? 'nav-link active px-lg-2 px-xl-3' : 'nav-link px-lg-2 px-xl-3'} onClick={() => goToUrl("/vendors/configuration")}>Configuration</NavLink>
                                        </li>
                                    )
                                }
                            })()}
                        </ul>
                    </div>
                </nav>
                <div className="userProfile pr-2 ml-sm-auto">
                    <div className="mdw notification">
                        <a onClick={() => navigate(`/vendors/notification`)} className="link_url position-relative">
                            <img src="/assets/img/notification.png" alt="notification" className="img-fluid" />
                            {notificationCount && notificationCount != 0 && <span className="badge badge-danger w18 header_notification_icn">{notificationCount}</span>}
                        </a>
                    </div>
                    <div className="mdw bg-transparent p-0 shadow-none ml-0">

                        <div className="dropdown">
                            <div className="mdw user_logo p-0 position-relative profileSet m-0" data-toggle="dropdown">
                                <img src={logo || "/assets/img/demo_user.svg"} alt="user" className="img-fluid" />
                            </div>

                            <div className="dropdown-menu headers_profile_card">
                                <div className="profile_card_box text-light">
                                    <div className="profile_img_box m-auto">
                                        <img src={logo || "/assets/img/demo_user.svg"} alt="user" className="img-fluid w-100 h-100" />
                                    </div>
                                    <div className="profile_info_box text-center mt-2">
                                        {currentUser?.name && <span className="d-block fs-14 fw-600">{currentUser?.name}</span>}
                                        <span className="d-block fs-14 fw-400">{currentUser?.org_name}</span>
                                        <span className="d-block fs-14 fw-400">{currentUser?.email}</span>
                                    </div>
                                    <div className="profile_menu_box mt-3">
                                        <a className="dropdown-item link_url fw-500" onClick={() => navigate(`/vendors/settings`)}><i className="fa fa-unlock-alt mr-2"></i> Settings</a>
                                        <a className="dropdown-item link_url fw-500" onClick={() => logOut()}> <i className="fa fa-sign-out mr-2"></i> Logout</a>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div className="align-items-center d-flex justify-content-between aDm_navigation pl-lg-3 border-0 mb-3">
                <div className="userProfile">
                    {headerTitle ? <h6 className="mr-0 pt-3">{headerTitle}</h6> : ''}
                </div>
                <div>
                    <ul className="breadcrumb mb-0 bg-transparent invisible d-none">
                        <li className="breadcrumb-item"><a href="#">Configuration</a></li>
                        <li className="breadcrumb-item"><a href="#">Home</a></li>

                    </ul>
                </div>
            </div>

            {(() => {
                if (modalType && modalType != '' && modalType != null) {
                    if (modalType == 'upload_logo') {
                        return <AirModal
                            show={openModal}
                            modalType={modalType}
                            hideModal={hideModal}
                            modalData={{}}
                            formSubmit={uploadLogo} />
                    }
                }
            })()}
        </header>
    )

}

export default VendorHeader