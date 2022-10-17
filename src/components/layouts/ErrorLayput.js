import { Fragment, useState } from "react";
import { ProjectContext } from "../../ContextProviders/ProjectContext";
import MyErrorBoundary from "../../ErrorHandler/ErrorBoundary";
import Asidebar from "../partials/Asidebar";
import Footer from "../partials/Footer";

const ErrorLayout = (props) => {
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

export default ErrorLayout