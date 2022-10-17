import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { LayoutContext } from './ContextProviders/LayoutContext';
import { IsAuthenticated } from './helpers/Auth';
import { SetCookie } from './helpers/Helper';

const RouterOutlet = ({ layout: Layout, ...rest }) => {
    let { isPublic = false, roles = 'admin', type: loginType = null } = rest
    const [showLoader, setShowLoader] = useState(false)
    const [projectId, setProjectId] = useState(null)
    const [reloadHeader, setReloadHeader] = useState(false)

    const location = useLocation()

    const getAuthUser = IsAuthenticated(true)
    const [user, setUser] = useState(getAuthUser)
    const isAuth = (isPublic || (!isPublic && getAuthUser.isLoggedIn)) ? true : false;
    const otpVerified = (isPublic || (!isPublic && getAuthUser.otpVerified)) ? true : false;
    const is_onboard = getAuthUser.isLoggedIn && getAuthUser?.currentUser?.is_onboard == "N" ? false : true;
    let toUrl = '';

    const updateData = (type = '') => {
        if (type == null) {
            return false
        }
        switch (type) {
            case 'user':
                let userDet = IsAuthenticated(true)
                if (userDet) {
                    setUser(userDet)
                }
                break;
            case 'clear':
                setShowLoader(false)
                setProjectId(null)
                setUser(IsAuthenticated(true))
                break
        }
    }
    let lContextObj = { showLoader, setShowLoader, projectId, setProjectId, user, setUser, updateData, reloadHeader, setReloadHeader }
    if (loginType == 'vendor') {
        lContextObj.loginType = loginType
    }
    const checkAuth = () => {
        const  {currentUser = {}} = user || {}
        const {org_modules:orgModules = []} = currentUser || {}
        let onBoardingUrl = "";
        let isOnBoard = false
        if(user?.currentUser?.org_modules.includes(1)){
            onBoardingUrl = "/onboarding";
            isOnBoard = is_onboard
        }else if(user?.currentUser?.org_modules.includes(2)){
            onBoardingUrl = "/vendors/onboarding";
            isOnBoard = getAuthUser.isLoggedIn && user?.currentUser?.is_vendor_onboard == "Y" ? true : false
        }else if(user?.currentUser?.org_modules.includes(3)){
            onBoardingUrl = "/certification/configuration";
            isOnBoard = getAuthUser.isLoggedIn && user?.currentUser?.is_certification_onboard == "Y" ? true : false
        }
        if(!isAuth && (window.location.pathname.indexOf("task-details") != -1)){
            SetCookie("redirect_url",window.location.pathname)
        }
        toUrl = !isAuth ? "/login" : (!otpVerified ? "/otp-verification" : (!isPublic && !isOnBoard && location.pathname.indexOf("/onboarding") == -1 ? onBoardingUrl : ''))
        
        if (toUrl == '' && user && user.isLoggedIn && (user?.currentUser?.access_role == "auditor" || user?.currentUser?.access_role == "service partner" || user?.currentUser?.is_management == "N")) {
            let forbiddenPaths = ['onboarding', 'configuration', 'onboarding_scope']
            if(user?.currentUser?.is_management == "N" && user?.currentUser?.access_role == "auditor"){
                forbiddenPaths.push("dashboard")
            }
            for (let fPath of forbiddenPaths) {
                let regex = new RegExp(fPath)
                if (location.pathname.search(regex) != -1) {
                    toUrl = '/task-manager'
                }
                if (toUrl != '') {
                    break;
                }
            }
        }
        if (toUrl == '' && isPublic && user && user.isLoggedIn) {
            let publicPage = ['login', 'forgotpassword', 'resetpassword', 'setpassword']
            for (let pPagePath of publicPage) {
                let regex = new RegExp(pPagePath)
                if (location.pathname.search(regex) != -1) {
                    toUrl = '/dashboard';
                }
                if (toUrl != '') {
                    break;
                }
            }
        }

        return toUrl ? (
            <Navigate to={toUrl} replace />
        ) : (
            <LayoutContext.Provider value={lContextObj}>
                <Layout showLoader>
                    <Outlet context={{ user: getAuthUser }} />
                </Layout>
            </LayoutContext.Provider>
        )
    }

    return checkAuth();
}

export default RouterOutlet