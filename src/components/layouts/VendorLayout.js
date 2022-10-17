import { Fragment, useState } from "react";
import Asidebar from "../partials/Asidebar";
import Footer from "../partials/Footer";
import { ProjectContext } from "../../ContextProviders/ProjectContext";
import MyErrorBoundary from "../../ErrorHandler/ErrorBoundary";

const VendorLayout = (props) => {
    const [miniSideBar, setMiniSideBar] = useState(false)
    return (
        <Fragment>
            <>
            <MyErrorBoundary>
                <ProjectContext.Provider value={{miniSideBar,setMiniSideBar}}>
                    <div className="container-fluid">
                        <div className="row flex-nowrap">
                            {/* Aside bar */}
                            <Asidebar />
                            <div id="vendor_assessment_main_sec" className={`mainContent ${miniSideBar ? 'fullbar' : ''}`}>
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

export default VendorLayout