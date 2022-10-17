import { useForm } from "react-hook-form";
import ApiService from "../services/ApiServices";
import { SetCookie, GetCookie } from "../helpers/Helper";
import { useNavigate } from "react-router-dom";
import Header from "../components/partials/Header";
const Onboarding = (props) => {
  const navigate = useNavigate()
  // const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = async (data) => {
    if (!data.email || data.email == '' || !data.password || data.password == '') {
      return false
    };
    let payload = data
    let res = await ApiService.post(payload.type, payload, Onboarding);
    if (res && res.status == true) {
      SetCookie('currentUser', JSON.stringify(res.data))
      navigate('/home')
    }
  }


  return (
    <>
      <Header />
      <div id="accordion" className="accordion pl-lg-3 pr-lg-3 accordianSec">
        <div className="card">
          <div className="card-header collapsed" data-toggle="collapse" href="#cp1">
            <a className="card-title">Framework Setup</a>
          </div>
          <div id="cp1" className="card-body collapse " data-parent="#accordion">
            <p>Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt
              aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat
              craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
            </p>
          </div>
        </div>
        <div className="card ">
          <div className="card-header" data-toggle="collapse" data-parent="#accordion" href="#cp2" aria-expanded="true">
            <a className="card-title">
              Key Member
            </a>
            <div className="ml-auto action_item">
              <a href="#" className="btn btn_1 btn-sm">Update</a>
              <a href="#" className="btn btn-primary-2 btn_03 btn-sm">Save</a>

            </div>
          </div>
          <div id="cp2" className="card-body p-0 collapse show bg_07" data-parent="#accordion">
            <div className="p-lg-3 m-lg-3 p-2 m-2 bg-white rounded">
              <div className="d-flex  align-items-center justify-content-between  flex-lg-row  ">
                <div className="mr-2 add_member">ADD MEMBER</div>
                <div className="flex-grow-1 mr-2 w-75"><input type="text" className="form-control" placeholder="Add Email Address" /></div>
                <div className="w-25 mr-2">
                  <select name="" id="" className="form-control">
                    <option value="">Select Role</option>
                  </select>
                </div>
                <div><a href="" className="info btn_03"> <img src="/assets/img/plus.svg" alt="" className="plus" /> </a></div>
              </div>
            </div>
            <div className="search_result bg-white ">
              <div className=" px-3">
                <div className="flex-grow-1 ml-lg-3 ml-md-0 ">martin_guptill598@icloud.com</div>
                <div>CISO </div>
                <div className="mr-lg-3"><a href="#"> <img src="/assets/img/times.svg" alt="" className="plus" />  </a></div>
              </div>
              <div className="px-3">
                <div className="flex-grow-1 ml-lg-3">pete_davidson_vagas@gmail.com</div>
                <div>Security Manager </div>
                <div className="mr-lg-3"><a href="#"> <img src="/assets/img/times.svg" alt="" className="plus" />  </a></div>
              </div>
              <div className=" px-3">
                <div className="flex-grow-1 ml-lg-3">sohan.parker@yahoo.com</div>
                <div>Security Analyst </div>
                <div className="mr-lg-3"><a href="#"> <img src="/assets/img/times.svg" alt="" className="plus" />  </a></div>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header collapsed" data-toggle="collapse" data-parent="#accordion" href="#cp3">
            <a className="card-title">Invite Service Partner</a>
          </div>
          <div id="cp3" className="collapse" data-parent="#accordion">
            <div className="card-body">
              <p>Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt
                aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat
                craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header collapsed" data-toggle="collapse" data-parent="#accordion" href="#cp4">
            <a className="card-title">Invite Task</a>
          </div>
          <div id="cp4" className="collapse" data-parent="#accordion">
            <div className="card-body">
              <p>Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt
                aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat
                craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header collapsed" data-toggle="collapse" data-parent="#accordion" href="#cp5">
            <a className="card-title">Third Party Services</a>
          </div>
          <div id="cp5" className="collapse" data-parent="#accordion">
            <div className="card-body">
              <p>Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt
                aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat
                craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header collapsed" data-toggle="collapse" data-parent="#accordion" href="#cp6">
            <a className="card-title">Access Token</a>
          </div>
          <div id="cp6" className="collapse" data-parent="#accordion">
            <div className="card-body">
              <p>Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt
                aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat
                craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Onboarding