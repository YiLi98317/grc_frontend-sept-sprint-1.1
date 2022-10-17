

import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { GetInitials, GetRandomColor } from "../helpers/Helper";

const AIrInitials = (props) => {
    const { str = '', AiClass = '',bgClass="", showToolTip = null } = props


    return (
        <>
            {(() => {
                if (str && str.length > 0 && str != '-') {
                    return (
                        <>
                            {(() => {
                                if (showToolTip != null) {
                                    return (
                                        <OverlayTrigger
                                            key={"top"}
                                            placement={"top"}
                                            overlay={
                                                <Tooltip id={`tooltip-top`}>
                                                    {showToolTip}
                                                </Tooltip>
                                            }
                                        >
                                            <span className={`air_initials m-0 ${AiClass}`} >
                                                <span className={`rounded-circle w-100 h-100 d-flex align-items-center justify-content-center ${bgClass}`} style={bgClass == "" ? { background: GetRandomColor() } : {}}>{GetInitials(str)}</span>
                                            </span>
                                        </OverlayTrigger>
                                    )
                                } else {
                                    return (
                                        <span className={`air_initials m-0 ${AiClass}`} >
                                            <span className="rounded-circle w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: GetRandomColor() }}>{GetInitials(str)}</span>
                                        </span>
                                    )
                                }
                            })()}
                        </>

                    )
                } else {
                    return (
                        <OverlayTrigger
                            key={"top"}
                            placement={"top"}
                            overlay={
                                <Tooltip id={`tooltip-top`}>
                                    Not Assigned
                                </Tooltip>
                            }
                        >
                            <a  className="user_invalid"><img src="/assets/img/user_invalid64.png" alt="" /></a>
                        </OverlayTrigger>
                    )
                }
            })()}
        </>

    )
}





export default AIrInitials