import { useState, useEffect, React } from 'react';
import Header from '../components/partials/Header';
import { GetCookie } from "../helpers/Helper";

const Home = (props) => {
  const [user, setUser] = useState({})
  useEffect(() => {
    let loggedInUser = GetCookie("currentUser")
    loggedInUser = loggedInUser ? JSON.parse(loggedInUser) : false
    if (Object.keys(user).length == 0 && loggedInUser) {
      setUser(oldVal => {
        return { ...oldVal, ...loggedInUser.user }
      })
    }
  }, [])
  return (
    <>
      <Header />
      <div className="container">
        <div className="row">
          <div className="col-md-7 ">

            <div className="panel panel-default">
              <div className="panel-heading">
                <h4>User Profile</h4>
              </div>
              <div className="panel-body">

                <div className="box box-info">

                  <div className="box-body">
                    <div className="col-sm-6">
                      <div align="center">
                        <img alt="User Pic" src="/assets/img/userProfile.png" id="profile-image1" className="img-circle img-responsive" />
                      </div>

                      <br />
                    </div>


                    <div className="col-sm-5 col-xs-6 tital ">First Name:</div><div className="col-sm-7 col-xs-6 ">{user.name}</div>
                    <div className="clearfix"></div>
                    <div className="bot-border"></div>
                    <div className="col-sm-5 col-xs-6 tital ">Last Name:</div><div className="col-sm-7"></div>
                    <div className="clearfix"></div>
                    <div className="bot-border"></div>

                    <div className="col-sm-5 col-xs-6 tital ">Email:</div><div className="col-sm-7">{user.email}</div>

                    <div className="clearfix"></div>
                    <div className="bot-border"></div>

                    <div className="col-sm-5 col-xs-6 tital ">Contact:</div><div className="col-sm-7">{user.phone}</div>

                    <div className="clearfix"></div>
                    <div className="bot-border"></div>

                    <div className="col-sm-5 col-xs-6 tital ">Organization:</div><div className="col-sm-7">{user.org_name}</div>

                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home