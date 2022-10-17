import { useState, useEffect, useContext } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { LayoutContext } from "../../ContextProviders/LayoutContext"
import { IsAuthenticated } from "../../helpers/Auth"
import { DelCookie, GetCookie, SetCookie } from "../../helpers/Helper"
import ApiService from "../../services/ApiServices"
import AirModal from "../../elements/AirModal";
import CertificationHeader from "./CertificationHeader"
import SustenanceHeader from "./SustenanceHeader"
import VendorHeader from "./VendorHeader"


const Header = (props) => {
    const { projectId = null, setProjectId, updateData, reloadHeader, setReloadHeader, user = {}, loginType = null,showLoader, setShowLoader } = useContext(LayoutContext)
    // const { user = {} } = useOutletContext()
    const currentUser = user?.currentUser;
    const AccountId = currentUser?.account_id || 0;
    const orgId = currentUser?.org_id || 0;
    const isManagement = currentUser?.is_management
    const superUser = currentUser?.super_user
    const accessRole = currentUser?.access_role
    const { defHeaderTitle = '', updatedLogo = null } = props
    const [headerTitle, setHeaderTitle] = useState('')
    const [projects, setProjects] = useState([])
    const [spAuOrgs, setSpAuOrgs] = useState([])
    const [spAuProjects, setSpAuProjects] = useState([])
    const [selectedProject, setSelectedProject] = useState({})
    const [selectedOrg, setSelectedOrg] = useState({})
    const navigate = useNavigate();
    const location = useLocation()
    const [openModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null)
    const [logo, setLogo] = useState(null)
    const [notificationCount, setNotificationCount] = useState(null)
    useEffect(() => {
        setPageHeader()
        if (logo == null) {
            fetchLogo()
        }
    }, [])
    useEffect(() => {
        if (projectId != null && notificationCount == null) {
            getNotificationCount()
        }
    }, [projectId])

    useEffect(() => {
        if (reloadHeader) {
            fetchLogo()
            getNotificationCount()
            initializeHeaderData()
            setReloadHeader(false)
        }
    }, [reloadHeader])

    useEffect(() => {
        if(user != null){
            if (projects.length == 0) {
                initializeHeaderData()
            }
        }
        
    }, [user])

    const initializeHeaderData = () => {
        if (accessRole == 'auditor' || accessRole == 'service partner') {
            getSPAUData()
        } else {
            getProjects()
        }
    }

    const goToUrl = (url = '') => {
        if (url == '') {
            return false
        }
        if (location.pathname == url) {
            navigate(0)
        } else {
            navigate(url)
        }

    }
    const setPageHeader = () => {
        switch (true) {
            case location.pathname == "/home":
                setHeaderTitle("Home")
                break;
            case location.pathname == "/dashboard":
                // setHeaderTitle("Dashboard")
                break;
            case location.pathname == "/task-manager":
                // setHeaderTitle("Task Manager")
                break;
            case location.pathname.indexOf("/task-details") != -1:
                setHeaderTitle(defHeaderTitle || "")
                break;
            case location.pathname == "/evidence-manager":
                // setHeaderTitle("Evidence Manager")
                break;
            case location.pathname == "/onboarding":
                setHeaderTitle("On Boarding")
                break;
            case location.pathname == "/configuration":
                // setHeaderTitle("Configuration")
                break;
            case location.pathname.indexOf("/onboarding_scope") != -1:
                setHeaderTitle("On Boarding Scope")
                break;
            case location.pathname.indexOf("/configuration_scope") != -1:
                // setHeaderTitle("Configuration Scope")
                break;
            case location.pathname == "/pages/coming-soon":
                setHeaderTitle(defHeaderTitle || "")
                break;
            default:
                break;
        }
    }

    const getProjects = async () => {
        let payloadUrl = `configuration/getProjectsByAccountId/${AccountId}`
        let method = "GET";
        let formData = {}
        let res = await ApiService.fetchData(payloadUrl, method, formData);
        if (res && res.message == "Success") {
            let projectsArr = res.results
            setProjects(projectsArr)
            if(projectsArr.length > 0){
                if (!GetCookie('selectedProject')) {
                    let project = projectsArr.find(project  => project.status === "A")
                    if (project) {
                        changeProject(project)
                    }
                }else{
                    let project = GetCookie('selectedProject') ? JSON.parse(GetCookie('selectedProject')) : null;
                    if (project) {
                        setProjectId(Number(project.project_id))
                        setSelectedProject(project)
                    }
                }
            }
        }
    }
    const getSPAUData = async () => {
        let payloadUrl = `configuration/getOrgsForSPAU/${orgId}`
        let method = "GET";
        let formData = {}
        let res = await ApiService.fetchData(payloadUrl, method, formData);
        if (res && res.message == "Success") {
            let orgs = res.results
            setSpAuOrgs(orgs)
            orgs && orgs.length > 0 && orgs.map((org, oKey) => {
                if (oKey == 0 && !GetCookie('selectedOrg')) {
                    let setcookie = SetCookie('selectedOrg', JSON.stringify(org))
                    setSelectedOrg(org)
                    getSPAUProjects(org.org_id)
                } else if (GetCookie('selectedOrg')) {
                    if (Object.keys(selectedOrg).length == 0) {
                        let selOrg = JSON.parse(GetCookie('selectedOrg'))
                        setSelectedOrg(selOrg)
                        getSPAUProjects(selOrg.org_id)
                    }
                }

            })

        }
    }
    const getSPAUProjects = async (sp_org_id = null) => {
        if (sp_org_id != null) {
            let payloadUrl = `configuration/getProjectForSPAU/${sp_org_id}/${orgId}`
            let method = "GET";
            let formData = {}
            let res = await ApiService.fetchData(payloadUrl, method, formData);
            if (res && res.message == "Success") {
                let projectsArr = res.results
                setProjects(projectsArr)
                if(projectsArr.length > 0){
                    if (!GetCookie('selectedProject')) {
                        let project = projectsArr.find(project  => project.status === "A")
                        changeProject(project)
                    }else{
                        let project = GetCookie('selectedProject') ? JSON.parse(GetCookie('selectedProject')) : null;
                        if (project) {
                            setProjectId(Number(project.project_id))
                            setSelectedProject(project)
                        }
                    }
                }
            }
        }

    }

    const changeOrg = (org = null) => {
        if (org == null) {
            return false
        }
        let setcookie = SetCookie('selectedOrg', JSON.stringify(org))
        let delOrg = DelCookie('selectedProject')
        setSelectedOrg(org)
        window.location.reload()
    }
    const changeProject = async(project = null) => {
        if (project == null) {
            return false
        }
        setShowLoader(true)
        let payloadUrl = `configuration/getAuthDetailsByProject/${project.project_id }`
        let method = "GET";
        let formData = {}
        let res = await ApiService.fetchData(payloadUrl, method, formData);
        // let res = {message:"Success"};
        if (res && res.message == "Success") {
            let userInfo = res.results
            userInfo.otpVerified = true
            let userCookie = GetCookie('currentUser')
            if (userCookie) {
                userInfo.user.org_id = Number(userInfo.user.org_id)
                let setUserCookie = SetCookie('currentUser', JSON.stringify(userInfo))
                let setcookie = SetCookie('selectedProject', JSON.stringify(project))
                setProjectId(Number(project.project_id))
                setSelectedProject(project)
                setShowLoader(false)
                window.location.reload()
            }
        }
    }

    const showProjectDropDown = () => {
        let result = false
        let showDrpArr = ['/dashboard', "/task-manager","/my-tasks", "/configuration", "/evidence-manager", "/add-project", "/notification", "/audit-logs","/settings"]
        if (showDrpArr.indexOf(location.pathname) != -1) {
            result = true
        }
        return result
    }

    let logOut = () => {
        let loggedInUser = IsAuthenticated(true);
        if (loggedInUser.isLoggedIn) {
            let del = DelCookie('currentUser')
            let delProject = DelCookie('selectedProject')
            let delOrg = DelCookie('selectedOrg')
            let delTskDet = DelCookie('task_details')
            let delRedirectUrl = DelCookie('redirect_url')
            updateData('clear')
            if (del) {
                navigate("/login")
            }
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
        if (modalType == "upload_logo") {
            fetchLogo()
        }
        setModalType(null)
        setShowModal(false)
    }

    const uploadLogo = async (files = null) => {
        if (files == null) {
            return false
        }
        let file = files[0]
        let payloadUrl = `orgs/uploadLogo/${orgId}`
        let method = "POST";
        let formData = new FormData();
        formData.append("file", file)
        let res = await ApiService.fetchData(payloadUrl, method, formData, "form");
        if (res && res.message == "Success") {
            hideModal()
        }
    }

    const fetchLogo = async () => {
        let payloadUrl = `${process.env.REACT_APP_API_URL}orgs/getLogo/${orgId}`
        if (superUser == "N") {
            payloadUrl = `${process.env.REACT_APP_API_URL}employees/getLogo`
        }
        let method = "GET";
        let response = await ApiService.fetchFile(payloadUrl, method);
        if (response) {
            let jsonResponse = response.clone()
            let res = await response.arrayBuffer();
            if (res) {
                let contentType = response && response.headers.get('content-type') ? response.headers.get('content-type') : 'image/png';
                if (contentType.indexOf('application/json') == -1) {
                    var blob = new Blob([res], { type: contentType });
                    let fileUrl = window.URL.createObjectURL(blob);
                    setLogo(fileUrl)
                } else {
                    setLogo("/assets/img/demo_user.svg")
                }
            } else {
                setLogo("/assets/img/demo_user.svg")
            }
        }
    }
    const getNotificationCount = async () => {
        let moduleId = 1
        if (location.pathname.indexOf("/vendor") != -1) {
            moduleId = 2
        }
        let payloadUrl = `reference/getUnReadNotificationCount/${moduleId}/${projectId}`
        let method = "GET";

        let res = await ApiService.fetchData(payloadUrl, method);
        if (res && res.message == "Success") {
            setNotificationCount(res.results[0].unread_count)
        }


    }
    // console.log(user)

    if (location.pathname.indexOf("/certification") != -1) {
        return (
            <CertificationHeader {...{ goToUrl, logOut, hideModal, uploadLogo, headerTitle, openModal, modalType, logo: updatedLogo || logo, notificationCount }} />
        )

    } else if (location.pathname.indexOf("/vendor") != -1) {

        return (
            <VendorHeader {...{ goToUrl, logOut, hideModal, uploadLogo, headerTitle, openModal, modalType, logo: updatedLogo || logo, notificationCount, selectedOrg }} />
        )
    } else {
        return (
            <SustenanceHeader {...{ goToUrl, logOut, hideModal, uploadLogo, headerTitle, openModal, modalType, logo: updatedLogo || logo, notificationCount, changeProject, selectedProject, projects, selectedOrg, spAuOrgs, changeOrg, showProjectDropDown }} />
        )
    }

}

export default Header