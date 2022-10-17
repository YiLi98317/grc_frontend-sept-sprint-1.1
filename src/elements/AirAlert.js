
import { useContext, useEffect, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";

const AirAlert = (props) => {
    const { show=false,type="primary",message="",timeOut=null } = props
    const [showAlert, setShowAlert] = useState({show:show,type:type,message:message})
    
    const toggleAlert = (val) =>{
        setShowAlert(val)
    }

    const _ = (el) => {
        return document.getElementById(el);
    }



    if (type == 'primary') {
        return (
            showAlert && showAlert.show && showAlert.type == "danger"  && <SweetAlert
                warning={showAlert.type == "warning"}
                success={showAlert.type == "success"}
                danger={showAlert.type == "danger"}
                title={showAlert.message}
                onConfirm={() =>toggleAlert({show:false,type:'success',message:''})}
                confirmBtnCssClass={'btn_05'}
                onCancel={()=>toggleAlert({show:false,type:'success',message:''})}
                showConfirm={true}
                focusCancelBtn={false}
                customClass={'air_alert'}
                timeout={3000}
                />
        )
    } 
}





export default AirAlert