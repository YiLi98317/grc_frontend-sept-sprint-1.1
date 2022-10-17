import { useState, useEffect, useContext } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { LayoutContext } from "../../ContextProviders/LayoutContext"
import AirModal from "../../elements/AirModal";


const SustenanceHeader = (props) => {
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
        changeProject,
        selectedProject,
        projects,
        selectedOrg,
        spAuOrgs,
        changeOrg,
        showProjectDropDown
    } = props
    const { projectId = null, setProjectId, updateData, reloadHeader, setReloadHeader, user = {}, loginType = null } = useContext(LayoutContext)
    // const { user = {} } = useOutletContext()
    const currentUser = user?.currentUser
    // const orgId = currentUser?.org_id || 0;
    const isManagement = currentUser?.is_management
    const superUser = currentUser?.super_user
    const accessRole = currentUser?.access_role
    // const { defHeaderTitle = '' } = props
    // const [projects, setProjects] = useState([])
    // const [spAuOrgs, setSpAuOrgs] = useState([])
    // const [spAuProjects, setSpAuProjects] = useState([])
    // const [selectedProject, setSelectedProject] = useState({})
    // const [selectedOrg, setSelectedOrg] = useState({})
    const navigate = useNavigate();
    const location = useLocation()

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
                                if (isManagement == "Y" || (isManagement == "N" && accessRole != "auditor")) {
                                    return (
                                        <>
                                            <li className="nav-item">
                                                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => goToUrl("/dashboard")}>Dashboard</NavLink>
                                            </li>
                                        </>
                                    )
                                }
                            })()}
                            <li className="nav-item ">
                                <NavLink to="/task-manager" className={({ isActive }) => isActive || location.pathname.indexOf("/task-details") != -1 ? 'nav-link active' : 'nav-link'} onClick={() => goToUrl("/task-manager")}>Task Manager</NavLink>
                            </li>
                            {/* {isManagement == "Y" && superUser == "N" &&
                                <li className="nav-item ">
                                    <NavLink to="/my-tasks" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => goToUrl("/my-tasks")}>Approver View</NavLink>
                                </li>
                            } */}
                            <li className="nav-item">
                                <NavLink to="/evidence-manager" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => goToUrl("/evidence-manager")}>Evidence Manager</NavLink>
                            </li>
                            {(() => {
                                if (isManagement == "Y") {
                                    return (
                                        <>
                                            <li className="nav-item ">
                                                <NavLink to="/configuration" className={({ isActive }) => isActive || location.pathname.indexOf("/configuration_scope") != -1 ? 'nav-link active' : 'nav-link'} onClick={() => goToUrl("/configuration")}>Configuration</NavLink>
                                            </li>
                                        </>
                                    )
                                }
                            })()}
                        </ul>
                    </div>
                </nav>
                <div className="userProfile pr-2 ml-sm-auto">
                    {(() => {
                        if (showProjectDropDown()) {
                            if (accessRole == "auditor" || accessRole == "service partner") {
                                return (
                                    <>
                                        <div className="btn-group">
                                            <div className="dropdown">
                                                <button type="button" className="btn btn-primary dropdown-toggle sdrp sel_project_btn" data-toggle="dropdown">
                                                    {selectedOrg && selectedOrg?.org_id ? selectedOrg?.org_name : 'Select Org'}
                                                </button>
                                                <div className="dropdown-menu mt-1">
                                                    {spAuOrgs && spAuOrgs.length > 0 && spAuOrgs.map((org, oKey) => {
                                                        return (
                                                            <a key={oKey} className="dropdown-item link_url" onClick={() => changeOrg(org)}>{org.org_name}</a>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="btn-group">
                                            <div className="dropdown">
                                                <button type="button" className="btn btn-primary dropdown-toggle sdrp sel_project_btn" data-toggle="dropdown">
                                                    {selectedProject && selectedProject?.project_id ? `${selectedProject?.project_name.substring(0, 15)}${(selectedProject?.project_name.length>15)?'..':''}` : 'Select Project'}
                                                </button>
                                                <div className="dropdown-menu mt-1">
                                                    {projects && projects.length > 0 && projects.map((project, spKey) => {
                                                        return (
                                                            <a key={spKey} className="dropdown-item link_url" onClick={() => changeProject(project)}>{project.project_name}</a>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </>

                                )

                            } else {
                                return (
                                    <div className="btn-group">
                                        <div className="dropdown">
                                            <button type="button" className="btn btn-primary dropdown-toggle sdrp sel_project_btn" data-toggle="dropdown">
                                                {selectedProject && selectedProject?.project_id ? `${selectedProject?.project_name.substring(0, 15)}${(selectedProject?.project_name.length>15)?'..':''}` : 'Select Project'}
                                            </button>
                                            <div className="dropdown-menu mt-1">
                                                {projects && projects.length > 0 && projects.map((project, pkey) => {
                                                    return (
                                                        <a key={pkey} className="dropdown-item link_url" onClick={() => changeProject(project)}>{project.project_name}</a>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                        }
                    })()}
                    <div className="mdw notification">
                        <a onClick={() => navigate(`/notification`)} className="link_url position-relative">
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
                                        <a className="dropdown-item link_url fw-500" onClick={() => navigate(`/settings`)}><i className="fa fa-unlock-alt mr-2"></i> Settings</a>
                                        {isManagement == "Y" && <a className="dropdown-item link_url fw-500" onClick={() => navigate(`/audit-logs`)}><i className="fa fa-cogs mr-2"></i> Audit Logs</a>}
                                        {(() => {
                                            if (superUser == "Y") {
                                                return <a className="dropdown-item link_url fw-500" onClick={() => navigate(`/add-project`)}> <i className="fa fa-user-plus mr-2"></i> New Project</a>
                                            }
                                        })()}

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

export default SustenanceHeader