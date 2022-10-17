import { Fragment } from "react";
import Asidebar from "../partials/Asidebar";
import Footer from "../partials/Footer";

const DemoLayout = (props) => {
    return (
        <Fragment>
            <>
                <div className="container-fluid">
                    <div className="row flex-nowrap">
                        {/* Aside bar */}
                        <Asidebar />
                        <div id="vendor_assessment_main_sec" className="mainContent">
                            {/* <Header {...props} /> */}
                            <main>{props.children}</main>
                        </div>
                    </div>
                </div>
                <Footer></Footer>
            </>
        </Fragment>
    )
}

export default DemoLayout