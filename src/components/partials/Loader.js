import { useForm } from "react-hook-form";
import ApiService from "../../services/ApiServices";
import { SetCookie, GetCookie } from "../../helpers/Helper";
import { Link, useNavigate } from "react-router-dom";
import crypto from 'crypto'
const Loader = (props) => {
  const {showLoader = false,pos="absolute",heightClass="vh-100",lClass =""} = props
  return (
    <>
      {(()=>{
        if(showLoader){
          return(
          
            <div className={`loader_sec container-fluid position-${pos} ${heightClass} ${lClass}`}>
                <section className=" h-100 d-flex align-items-center justify-content-center">
                  <div className="loader_block">
                    <img alt="loader" src="/assets/img/loader.svg" className="img-fluid" />
                  </div>
                </section>
            </div>
          
          )
        }
      })()}
    </> 
  )
}

export default Loader