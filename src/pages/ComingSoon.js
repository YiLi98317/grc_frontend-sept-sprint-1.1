import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie } from "../helpers/Helper";
import { Link, useNavigate } from "react-router-dom";
import crypto from 'crypto'
const ComingSoon = (props) => {
  
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
            <img alt="coming_soon" src="/assets/img/coming_soon.jpg" className="img-fluid page404_img" />
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
      <iframe src="https://qa.gorico.io/enquiryform/e1def694-0844-4d52-9139-18e2eb74f066" width="500" height="500"></iframe>
    </> 
  )
}

export default ComingSoon