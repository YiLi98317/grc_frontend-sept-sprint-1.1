import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
  Link,
  Svg,
  Circle,
  G,
} from "@react-pdf/renderer";
import Html from "react-pdf-html";
import ReactDOMServer from "react-dom/server";
import moment from "moment";
import PdfSummary from "../pages/pdf_html/PdfSummary";
import PdfDetailSummary from "../pages/pdf_html/PdfDetailSummary";
import { IsAuthenticated } from "../helpers/Auth";
import ApiService from "../services/ApiServices";
import PdfSummaryDomain from "../pages/pdf_html/PdfSummaryDomain";
import PdfDashboardTable from "../pages/pdf_html/PdfDashboardTable";

const DasboardPdf = (props) => {
  // let {  } = props
  // const [markDate, setMarkDate] = useState(null)
  const pdfData = props || {};
  const now = moment();
  const [calInitSettings, setCalInitSettings] = useState({});
  const getAuthUser = IsAuthenticated(true);
  const user = getAuthUser.currentUser || {};
  const [companyLogo, setCompanyLogo] = useState(
    "/assets/img/company_logo.png"
  );

  Font.register({
    family: "poppins",
    fonts: [
      {
        src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_300.ttf`,
        fontWeight: 300,
      },
      {
        src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_400.ttf`,
        fontWeight: 400,
      },
      {
        src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_500.ttf`,
        fontWeight: 500,
      },
      {
        src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_600.ttf`,
        fontWeight: 600,
      },
      {
        src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_700.ttf`,
        fontWeight: 700,
      },
      {
        src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_800.ttf`,
        fontWeight: 800,
      },
    ],
  });
  Font.registerHyphenationCallback((word) => {
    // Return entire word as unique part
    return [word];
  });

  const formatDate = (date = null, formatType = "MMM DD, YYYY") => {
    if (date == null || formatType == null) {
      return false;
    }
    let isValid = moment(date).isValid();
    if (isValid) {
      let formattedDate = moment(date).format(formatType);
      if (moment(formattedDate).isValid()) {
        return formattedDate;
      } else {
        return date;
      }
    } else {
      return date;
    }
  };

  const styles = StyleSheet.create({
    body: {
      paddingTop: 35,
      paddingBottom: 65,
      paddingHorizontal: 35,
    },
    header: {
      fontSize: 12,
      marginBottom: 20,
      textAlign: "center",
      color: "grey",
    },
    pageNumber: {
      position: "absolute",
      fontSize: 12,
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: "center",
      color: "grey",
    },
    tableBody: {
      width: "80%",
      margin: "auto",
      fontSize: "22px",
    },
    tableRow: {
      fontSize: "16px",
      flexDirection: "row",
      justifyContent: "space-between",
      margin: "5px 0",
    },
  });

  const pdfFooter = (pgNumberColor = "#fff", type = "") => (
    <View style={{ position: "absolute", bottom: "20px" }}>
      <View style={{ flexDirection: "row", padding: "0 20px" }}>
        <Text
          style={{
            width: "5%",
            color: pgNumberColor,
            padding: "5px",
            fontSize: "14px",
          }}
          render={({ pageNumber, totalPages }) => `${pageNumber}`}
          fixed
        />
        <View
          style={{
            width: "95%",
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: "#009EAA",
            color: "#fff",
            padding: "5px",
            fontSize: "12px",
          }}
        >
          <Text>Confidential | Internal Use Only</Text>
          <Link
            style={{ color: "#fff", textDecoration: "none" }}
            src="https://qa.gorico.io"
          >
            GoRICO website link
          </Link>
        </View>
      </View>
    </View>
  );

  const getUpEvCount = () => {
    let groups = pdfData.template.page || [];
    let allQuestions = [];
    groups.map((group, gKey, arr) => {
      allQuestions.push(...group.questions);
    });
    let upEvCount = 0;
    allQuestions &&
      allQuestions.map((question, qKey) => {
        if (question.is_complete == "Y") {
          upEvCount += 1;
        }
      });
    let totalPercentage = (upEvCount / allQuestions.length) * 100;
    return Math.round((totalPercentage + Number.EPSILON) * 100) / 100;
  };

  const PdfTableData = {
    tableData: pdfData.criticalTasks,
    headerText: "High Priority Open Tasks",
  };
  const PdfTableData_outOfScopeTasks = {
    tableData: pdfData.outOfScopeTasks,
    headerText: "Out of Scope Tasks",
  };
  const PdfTableData_notCompliantTasks = {
    tableData: pdfData.notCompliantTasks,
    headerText: "Not Compliant Tasks",
  };
  const PdfTableData_overdueTasks = {
    tableData: pdfData.overdueTasks,
    headerText: "Overdue Tasks",
  };
  const PdfTableData_notifiedTasks = {
    tableData: pdfData.notifiedTasks,
    headerText: "Upcoming High Priority",
  };

  const criticalTasksHTML = ReactDOMServer.renderToStaticMarkup(
    <PdfDashboardTable {...PdfTableData} />
  );
  const outOfScopeTasks = ReactDOMServer.renderToStaticMarkup(
    <PdfDashboardTable {...PdfTableData_outOfScopeTasks} />
  );
  const notCompliantTasks = ReactDOMServer.renderToStaticMarkup(
    <PdfDashboardTable {...PdfTableData_notCompliantTasks} />
  );
  const overdueTasks = ReactDOMServer.renderToStaticMarkup(
    <PdfDashboardTable {...PdfTableData_overdueTasks} />
  );
  const notifiedTasks = ReactDOMServer.renderToStaticMarkup(
    <PdfDashboardTable {...PdfTableData_notifiedTasks} />
  );

  const PdfPages = () => (
    <Document>
      {/* <Page style={{ fontFamily: "poppins" }} >
                <View style={styles.body}>
                    <Image style={{ height: "50px", width: '150px', display: "inline-block" }} src="/assets/img/pdf/logo_0.png" />
                    <Image style={{ height: '25px', width: 'auto', display: 'inline-block', marginLeft: 'auto', top: "-35px" }} src={`${process.env.REACT_APP_API_URL}orgs/getLogo/${user.org_id}`} onError={companyLogo} />
                    <View style={{ display: "flex", alignItems: "flex-end", width: "100%" }}>
                        <Text style={{ color: '#000', fontSize: '24px', margin: '60px 0px 0px', width: "50%", fontWeight: "700" }}>Vendor Risk Assessment Report Level 1  </Text>
                        <Text style={{ color: '#000', fontSize: '16px', marginTop: '20px', width: "50%",fontWeight:600 }}> {now && formatDate(now)} </Text>
                    </View>
                    <View>
                        <Image style={{ height: "400px", position: "absolute", top: "0", left: "-35px" }} src="/assets/img/pdf/First_page.png" />
                    </View>
                </View>

                <View style={{ backgroundColor: "#009EAA", color: "#fff", margin: 0, padding: "25px", position: "absolute", bottom: "100px", width: "100%", fontSize: "10px" }}>
                    <Text>CONFIDENTIAL: This document contains sensitive information about the security environment, practices, and current vulnerabilities and weaknesses as well as proprietary tools, techniques and methodologies used.</Text>
                    <Text style={{ marginTop: "15px" }}>Reproduction or distribution of this document is prohibited.</Text>
                </View>
                <View style={{ position: "absolute", bottom: "20px", width: "100%", marginRight: "40px" }}>
                    <Text style={{ textAlign: "right", fontSize: "11px", fontWeight: 700, marginRight: "120px" }}>POWERED BY:</Text>
                    <View style={{ width: "100%", alignItems: "flex-end", paddingRight: "40px", marginTop: "15px" }}>
                        <Image style={{ height: '20px', width: '150px', display: 'inline-block' }} src="/assets/img/pdf/logo_2.png" />
                    </View>

                </View>

            </Page> */}
      <Page
        size="A4"
        style={{
          paddingBottom: "80px",
          paddingTop: "20px",
          fontFamily: "poppins",
        }}
      >
        <View>
          <View
            style={{ display: "flex", alignItems: "flex-end", width: "100%" }}
          >
            <Text
              style={{
                color: "#000",
                fontSize: "24px",
                width: "80%",
                fontWeight: "700",
              }}
            >
              Sustenance Dashboard Status
            </Text>
          </View>
          <View>
            <Image
              style={{ width: "auto", display: "inline-block" }}
              src={pdfData.dashboardimg}
            />
          </View>
           {pdfData.outOfScopeTasks && pdfData.outOfScopeTasks.length > 0 && pdfData.grid_flag && (
            <View wrap break>
              <Html resetStyles>{outOfScopeTasks}</Html>
            </View>
          )}
          {pdfData.notCompliantTasks && pdfData.notCompliantTasks.length > 0 && pdfData.grid_flag && (
            <View wrap break>
              <Html resetStyles>{notCompliantTasks}</Html>
            </View>
          )}

         {pdfData.overdueTasks && pdfData.overdueTasks.length > 0 && pdfData.grid_flag && (
            <View wrap break>
              <Html resetStyles>{overdueTasks}</Html>
            </View>
          )}

          {pdfData.notifiedTasks && pdfData.notifiedTasks.length > 0 && pdfData.grid_flag && (
            <View wrap break>
              <Html resetStyles>{notifiedTasks}</Html>
            </View>
          )}
        
          
        </View>
        <View
          fixed
          style={{ position: "absolute", bottom: "10px", width: "100%" }}
        >
          {pdfFooter("black")}
        </View>
      </Page>
      {/* <Page style={{ fontFamily: "poppins" }}>
                <View style={styles.body}>
                    <Image style={{ height: "50px", width: '150px', display: "inline-block", marginLeft: 'auto'}} src="/assets/img/pdf/logo_0.png" />
                  
                    <View style={{ justifyContent: "center", width: "100%", height: "400px" }}>
                        <Text style={{ color: '#000', fontSize: '32px', fontWeight: "800", textAlign: "center" }}> Thank You  </Text>
                    </View>
                </View>
                <View style={{ position: "absolute", bottom: "0", }}>
                    <Image style={{ height: "500px", left: "-35px" }} src="/assets/img/pdf/First_page.png" />
                </View>
                <View fixed style={{ position: "absolute", bottom: "10px", width: "100%" }}>
                    {pdfFooter("black")}
                </View>
            </Page> */}
    </Document>
  );

  return <React.Fragment>{PdfPages()}</React.Fragment>;
};

export default DasboardPdf;
