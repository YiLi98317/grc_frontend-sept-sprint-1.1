import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutContext } from "../../ContextProviders/LayoutContext";
import ApiService from "../../services/ApiServices";
import SweetAlert from 'react-bootstrap-sweetalert';
import { ProjectContext } from "../../ContextProviders/ProjectContext";

const Asidebar = (props) => {
    let navigate = useNavigate()
    const { user = null } = useContext(LayoutContext)
    const { miniSideBar, setMiniSideBar } = useContext(ProjectContext)
    const currentUser = (user != null && user?.currentUser) || null;
    const OrgModules = currentUser && currentUser?.org_modules.length > 0 ? currentUser?.org_modules : 0;
    // const AccountId = currentUser && currentUser?.account_id || 0;
    // const orgId = currentUser && currentUser?.org_id || 0;
    // const isManagement = currentUser && currentUser?.is_management
    // const superUser = currentUser && currentUser?.super_user
    // const accessRole = currentUser && currentUser?.access_role
    const [modules, setModules] = useState([])
    const [showAlert, setShowAlert] = useState(false)
    const location = useLocation();

    

    useEffect(() => {
        if (modules.length === 0) {
            getModules()
        }
    },[])
    const getModules = async () => {
        let payloadUrl = `reference/getModules`
        let method = "GET";

        let res = await ApiService.fetchData(payloadUrl, method);
        if (res && res.message == "Success") {
            setModules(oldVal => {
                return [...res.results]
            })
        }
    }

    const goToUrl = (index) => {
        // mIndex > 0 && (OrgModules > 1 && mIndex > 0) ? navigate('/coming-soon') : toggleAlert(true)
        let module = modules[index]
        let url = ''
        if (OrgModules && OrgModules.indexOf(module.module_id) != -1) {
            if (module.module_id == 2) {
                url = currentUser.is_vendor_onboard == "Y" ? '/vendors/dashboard' : '/vendors/configuration'
            } else if (module.module_id == 1) {
                url = currentUser.is_onboard == "Y" ? '/dashboard' : '/configuration'
            }else if (module.module_id == 3) {
                url = currentUser.is_certification_onboard == "Y" ? '/dashboard' : '/certification/configuration'
            }
            navigate(url)
        } else {
            toggleAlert(true)
        }
    }
    const toggleAlert = (val) => {
        setShowAlert(val)
    }
    const toggleMiniSideBar = () => {
        let val = !miniSideBar;
        setMiniSideBar(val)
    }
    return (
        <>
            <div className={`sideWidth ${miniSideBar ? 'minibar' : ''}`}>
                <aside className="sidebar bg_06">
                    <div className="tooglebar link_url" onClick={() => toggleMiniSideBar()}>
                        <a onClick={null}>
                            <img src="/assets/img/gbl.svg" alt="" className="tglIcon" height="0" width="0" />
                        </a>
                    </div>
                    <div className="flex-grow-1">
                        <div className="d-flex flex-column h-100">
                            <div className="logoDash mt-3 text-center">
                                {
                                    miniSideBar
                                        ? <a onClick={null}><img src="/assets/img/logo_10.png" className="img-fluid w-75" /></a>
                                        : <a onClick={null}><img src="/assets/img/logo_1.svg" className="img-fluid w-75" /></a>
                                }
                                {miniSideBar && <hr className="w-100 border-white mt-3 mb-0" />}
                            </div>
                            <div className="sidebarNav flex-fill">
                                <ul className="navbar-nav">
                                    <li className="navHeader text-center mb-2">Modules</li>
                                    {modules && modules.length > 0 && modules.map((module, mIndex) => {
                                        let imgIcon = "/assets/img/gbl.svg"
                                        let altText = "wiki"
                                        let customClass = ""
                                        if (module.module_name.toLowerCase() == "sustenance") {
                                            imgIcon = "/assets/img/sustenance_ico.png"
                                            altText = ""

                                        }else if (module.module_name.toLowerCase() == "vendor assessment") {
                                            imgIcon = "/assets/img/vendor_mgmt_ico.png"
                                            altText = ""
                                        }else if (module.module_name.toLowerCase() == "certification") {
                                            imgIcon = "/assets/img/certificate.png"
                                            altText = ""
                                            customClass = "bg-white"
                                        }
                                        return (
                                            <li key={mIndex}><a onClick={() => goToUrl(mIndex)}><img src={imgIcon} alt={altText} className={`img-fluid ${customClass}`} /><span className="fs-14">{module.module_name}</span></a></li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            {
                showAlert && <SweetAlert
                    warning
                    title="Your account doesn’t have an active subscription to this module. Please contact your customer success manager for more information."
                    onConfirm={() => toggleAlert(false)}
                    confirmBtnCssClass={'btn_05'}
                    onCancel={() => toggleAlert(false)}
                    showConfirm={true}
                    focusCancelBtn={false}
                    customClass={'air_alert'}
                />
            }
        </>
    )
}

export default Asidebar