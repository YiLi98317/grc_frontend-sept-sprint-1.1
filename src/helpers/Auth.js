import {DelCookie, GetCookie} from "./Helper"

export const IsAuthenticated = (fetchUser = false) => {
    //fetch Data
    let userData = GetCookie('currentUser')
    userData  = userData ? JSON.parse(userData) : false;
    let result = {isLoggedIn : false,currentUser: null,token: ''}
    if(userData){
        let otpVerified = userData.otpVerified  ? userData.otpVerified : false
        result.isLoggedIn = true;
        result.currentUser = fetchUser ? userData.user : null;
        result.token = fetchUser ? userData.accessToken : '';
        result.otpVerified = otpVerified;
    }
    
    return result
}

export const RedirectToLogin = (errCode = 200) =>{
    let loggedInUser = IsAuthenticated(true);
    // let navigate = useNavigate()
    if (loggedInUser.isLoggedIn) {
        let del = DelCookie('currentUser')
        let delProject = DelCookie('selectedProject')
        let delOrg = DelCookie('selectedOrg')
        let taskDetails = DelCookie('task_details')
        // updateData('clear')
        if (del) {
            let url = `/login`
            
            if(errCode == 440){
                url += `?error=sess_exp`
            }
            document.location.href=url
            // navigate("/login")
        }
    }
}

// export const AuthenticationCheck = (firstLogin = false) => {
//     let navigate = useNavigate()
//     let userData = IsAuthenticated(true)
//     let user = userData.currentUser ? userData.currentUser : {}
//     if (Object.keys(user).length > 0) {
//         if (user.role === 'ROLE_PROFESSIONAL') {
//             let job = GetCookie('clickCurrentApplyJob')
//             job = job ? JSON.parse(job) : undefined
//             if (job) {
//                 navigate(`/dashboard`)
//             }else if (firstLogin) {
//                 navigate(`/profile/${user.slug}?event=true`)
//             } else {
//                 navigate(`/jobs-home`)
//             }
//         }
//         else if (user.role === 'ROLE_ORGANIZATIONAL') {
//             if (firstLogin) {
//                 window.location.href = (`${process.env.serverurl}inst/institute-home-dashboard?event=true`);
//             }else{
//                 window.location.href = (`${process.env.serverurl}inst/institute-home-dashboard`);
//             }
          
//         }
//     }else{
//     }
//   }