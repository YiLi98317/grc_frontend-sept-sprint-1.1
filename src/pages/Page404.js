import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie } from "../helpers/Helper";
import { Link, useNavigate } from "react-router-dom";
import crypto from 'crypto'
const Page404 = (props) => {
  
  return (
    <>
      <div className=" container-fluid">
        <div className="I_header">
          <div className="logo mt-3">
          {/* <img src="/assets/img/logo_2.svg" alt="logo" className="img-fluid w200" /> */}
          </div>
          {/* <div className="userProfile">
            <h6>Welcome Back!</h6>
            <img src="/assets/img/userProfile.png" alt="profile" className="img-fluid" />
          </div> */}
        </div>
        <section className="w-100">
          <div className="page404block d-flex align-items-center justify-content-center">
            <img alt="404 img" src="/assets/img/404.png" className="img-fluid page404_img" />
          </div>
        </section>
      </div>
      <div className="I_header I_footer container-fluid">
        <div className="copy">
          <p className="mb-0">© 2022 GoRICO - All Rights Reserved</p>
        </div>
        <div className="logo d-none d-lg-block d-xl-block d-md-block">
          <img src="/assets/img/logo_2.svg" alt="logo" className="img-fluid" />
        </div>
      </div> 
    </> 
  )
}

export default Page404