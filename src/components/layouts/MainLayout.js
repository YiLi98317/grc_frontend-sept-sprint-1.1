import { Fragment, useContext, useState } from "react";
import { LayoutContext } from "../../ContextProviders/LayoutContext";
import { ProjectContext } from "../../ContextProviders/ProjectContext";
import MyErrorBoundary from "../../ErrorHandler/ErrorBoundary";
import Asidebar from "../partials/Asidebar";
import Footer from "../partials/Footer";
import Loader from "../partials/Loader";

const MainLayout = (props) => {
    const { showLoader } = useContext(LayoutContext)
    const [miniSideBar, setMiniSideBar] = useState(false)
    return (
        <Fragment>
            <>
            <MyErrorBoundary>
                <ProjectContext.Provider value={{miniSideBar,setMiniSideBar}}>
                    {showLoader && <Loader showLoader={showLoader} pos={'fixed'} />}
                    <div className="container-fluid">
                        <div className="row flex-nowrap">
                            {/* Aside bar */}
                                <Asidebar />
                            <div id="compliance_main_sec" className={`mainContent ${miniSideBar ? 'fullbar' : ''}`}>
                                {/* <Header {...props} /> */}
                                <main>{props.children}</main>
                            </div>
                        </div>
                    </div>
                    <Footer></Footer>
                </ProjectContext.Provider>
            </MyErrorBoundary>
            </>
        </Fragment>
    )
}

export default MainLayout