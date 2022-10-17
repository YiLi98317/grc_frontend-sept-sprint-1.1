import { Fragment } from "react";
// import "../../assets/css/style.css"
import MyErrorBoundary from "../../ErrorHandler/ErrorBoundary";

const PublicLayout = (props) => {
    return (
        <Fragment>
            <>
            <MyErrorBoundary>
                <main>{props.children}</main>
            </MyErrorBoundary>
            </>
            
        </Fragment>
    )
}

export default PublicLayout