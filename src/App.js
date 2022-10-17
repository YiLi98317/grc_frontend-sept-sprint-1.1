import React, {Suspense, lazy, } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import './App.css';
import Loader from './components/partials/Loader';
import AdminEnquiryForm from './pages/AdminEnquiryForm';
import AuditLogs from './pages/AuditLogs';
import Page400 from './pages/Page400';
import PdfWelcome from './pages/pdf_html/Page1';
// import ComingSoon2 from './pages/ComingSoon2';
import TestPage from './pages/TestPage';
import TestPage2 from './pages/TestPage2';
import ThankYou from './pages/ThankYou';
import VendorSettings from './pages/Vendors/VendorSettings';
import VendorsMeetings from './pages/Vendors/VendorsMeetings';
// import VendorsDashboard from './pages/Vendors/VendorsDashboard';
// import VendorsEvidenceManager from './pages/Vendors/VendorsEvidenceManager';
// import VendorsQuestionnaires from './pages/Vendors/VendorsQuestionnaires';
// import VendorsAssessment from './pages/Vendors/VendorsAssessment';
// import VendorManagement from './pages/Vendors/VendorManagement';
// import VendorConfiguration from './pages/Vendors/Configuration';
import RouterOutlet from './RouterOutlet';

const MainLayout = lazy(()=> import("./components/layouts/MainLayout"))
const VendorLayout = lazy(()=> import("./components/layouts/VendorLayout"))
const DemoLayout = lazy(()=> import("./components/layouts/DemoLayout"))
const PublicLayout = lazy(()=> import("./components/layouts/PublicLayout"))
const Home = lazy(()=> import("./pages/Home"))
const Login = lazy(()=> import("./pages/Login"))
const Login2 = lazy(()=> import("./pages/Login2"))
const Configuration = lazy(()=> import("./pages/Configuration"))
const ComplianceConfiguration = lazy(()=> import("./pages/CertificationConfiguration"))
const CertificationScope = lazy(()=> import("./pages/CertificationScope"))
const ConfigurationScope = lazy(()=> import("./pages/ConfigurationScope"))
const Dashboard = lazy(()=> import("./pages/Dashboard"))
const EvidenceManager = lazy(()=> import("./pages/EvidenceManager"))
// const Onboarding = lazy(()=> import("./pages/Onboarding"))
const MyTasks = lazy(()=> import("./pages/MyTasks"))
const TaskManager = lazy(()=> import("./pages/TaskManager"))
const TaskDetails = lazy(()=> import("./pages/TaskDetails"))
const Project = lazy(()=> import("./pages/Project"))
const ForgotPassword = lazy(()=> import("./pages/ForgotPassword"))
const ResetPassword = lazy(()=> import("./pages/ResetPassword"))
const Page404 = lazy(()=> import("./pages/Page404"))
const ComingSoon = lazy(()=> import("./pages/ComingSoon"))
const ComingSoon2 = lazy(()=> import("./pages/ComingSoon2"))
const ChangePassword = lazy(()=> import("./pages/ChangePassword"))
const ProfileSettings = lazy(()=> import("./pages/ProfileSettings"))
const Notification = lazy(()=> import("./pages/Notification"))
// const {LayoutContext} = lazy(()=> import("./ContextProviders/LayoutContext"))

/* vendor routes start */
const VendorsConfiguration = lazy(()=> import("./pages/Vendors/VendorsConfiguration"))
const VendorsManagement = lazy(()=> import("./pages/Vendors/VendorsManagement"))
const VendorsAssessment = lazy(()=> import("./pages/Vendors/VendorsAssessment"))
const VendorsDashboard = lazy(()=> import("./pages/Vendors/VendorsDashboard"))
const VendorsQuestionnaires = lazy(()=> import("./pages/Vendors/VendorsQuestionnaires"))
const VendorsEvidenceManager = lazy(()=> import("./pages/Vendors/VendorsEvidenceManager"))
/* vendor routes end */

function App() {
  return (
    
      <Router>
        <Suspense fallback={<Loader showLoader={true} pos={'absolute'} />}>
        {/* <Suspense fallback={<div>Loading....</div>}> */}
          <Routes>

                  {/* <Route exact path="/" element={<Home />}></Route> */}
                  <Route path="/" element={<RouterOutlet layout={MainLayout} />}>
                    <Route exact path="/home" element={<Home />}></Route>
                    <Route exact path="/change-password" element={<ChangePassword />}></Route>
                    <Route exact path="/add-project" element={<Project />}></Route>
                    <Route  path="/dashboard" element={<Dashboard />}></Route>
                    <Route  path="/onboarding" element={<Configuration />}></Route>
                    <Route  path="/my-tasks" element={<MyTasks /> }></Route>
                    <Route  path="/task-manager" element={<TaskManager /> }></Route>
                    {/* <Route  path="/task-details/:taskId" element={<TaskDetails /> }></Route> */}
                    <Route  path="/task-details/:taskInfo" element={<TaskDetails /> }></Route>
                    <Route  path="/evidence-manager" element={<EvidenceManager /> }></Route>
                    <Route  path="/configuration" element={<Configuration  /> }></Route>
                    <Route  path="/onboarding_scope/:token" element={<ConfigurationScope /> }></Route>
                    <Route  path="/configuration_scope/:token" element={<ConfigurationScope /> }></Route>
                    {/* <Route  path="/rnd" element={<TestPage2 /> }></Route> */}
                    <Route  path="/notification" element={<Notification /> }></Route>
                    <Route  path="/settings" element={<ProfileSettings /> }></Route>
                    <Route  path="/audit-logs" element={<AuditLogs /> }></Route>
                    <Route path="" element={<Navigate to="/dashboard" />} />
                  </Route>

                  <Route path="/certification" element={<RouterOutlet layout={VendorLayout} />}>
                  <Route  path="/certification/configuration" element={<ComplianceConfiguration  /> }></Route>
                  <Route  path="/certification/onboarding" element={<ComplianceConfiguration  /> }></Route>
                  <Route  path="/certification/configuration_scope" element={<CertificationScope />}></Route>
                  <Route  path="/certification/onboarding_scope" element={<CertificationScope />}></Route>
                  </Route>

                  <Route path="/vendors" element={<RouterOutlet layout={VendorLayout} />}>
                    <Route exact path="/vendors/dashboard" element={<VendorsDashboard />}></Route>
                    <Route exact path="/vendors/manage/review-calls" element={<VendorsMeetings />}></Route>
                    <Route exact path="/vendors/manage" element={<VendorsManagement />}></Route>
                    <Route exact path="/vendors/configuration" element={<VendorsConfiguration />}></Route>
                    <Route exact path="/vendors/onboarding" element={<VendorsConfiguration />}></Route>
                    <Route exact path="/vendors/assessment" element={<VendorsAssessment />}></Route>
                    <Route exact path="/vendors/questionnaire" element={<VendorsQuestionnaires />}></Route>
                    <Route exact path="/vendors/evidence-manager" element={<VendorsEvidenceManager />}></Route>
                    <Route exact path="/vendors/notification" element={<Notification /> }></Route>
                    <Route exact path="/vendors/settings" element={<VendorSettings /> }></Route>
                    <Route path="" element={<Navigate to="/dashboard" />} />
                  </Route>


                  <Route path="/" element={<RouterOutlet layout={PublicLayout} isPublic="true" />} >
                    <Route exact path="/login" element={<Login />}></Route>
                    <Route exact path="/otp-verification" element={<Login2 />}></Route>
                    <Route exact path="/forgotpassword" element={<ForgotPassword />}></Route>
                    <Route exact path="/resetpassword/:token" element={<ResetPassword />}></Route>
                    <Route exact path="/setpassword/:token" element={<ResetPassword />}></Route>
                    {/* <Route exact path="/enuiryform" element={<TestPage />}></Route> */}
                    <Route exact path="/enquiryform/:guid/:shareId" element={<TestPage />}></Route>
                    <Route exact path="/enquiryform/:guid" element={<TestPage />}></Route>
                    <Route exact path="/admin/enquiryform/:guid" element={<AdminEnquiryForm />}></Route>
                    <Route exact path="/about-us" element={<Dashboard />}></Route>
                    <Route exact path="/wiki" element={<Dashboard />}></Route>
                    {/* <Route exact path="/coming-soon" element={<ComingSoon />}></Route> */}
                    <Route exact path="/page400" element={<Page400 />}></Route>
                    <Route exact path="/page404" element={<Page404 />}></Route>
                    <Route exact path="/thankyou" element={<ThankYou />}></Route>
                  </Route>

                  {/* <Route exact path="/thankyou" element={<ThankYou />}></Route> */}
                  {/* <Route exact path="/pdf/page1" element={<PdfWelcome />}></Route> */}
                  {/* <Route path="/" element={<RouterOutlet layout={DemoLayout} isPublic="true" type="vendor" />} >
                    <Route exact path="/pages/coming-soon" element={<ComingSoon2 />}></Route>
                  </Route> */}
                  <Route path="*" element={<PublicLayout><Page404 /> </PublicLayout>}></Route>
          </Routes>
        </Suspense>
      </Router>
  );
}



export default App;
