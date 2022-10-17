
import React, { useContext, useEffect, useRef, useState } from "react";
import { Page, Text, View, Document, StyleSheet, Font, Image, Link, Svg, Circle, G } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import ReactDOMServer from 'react-dom/server';
import moment from "moment";
import PdfSummary from "../pages/pdf_html/PdfSummary";
import PdfDetailSummary from "../pages/pdf_html/PdfDetailSummary";
import { IsAuthenticated } from "../helpers/Auth";
import ApiService from "../services/ApiServices";
import PdfSummaryDomain from "../pages/pdf_html/PdfSummaryDomain";
import { LayoutContext } from "../ContextProviders/LayoutContext";
const AirPdf = (props) => {
    // let {  } = props
    // const [markDate, setMarkDate] = useState(null)
    // const {user = {}} = useContext(LayoutContext)
    const pdfData = props || {}
    const now = moment()
    const [calInitSettings, setCalInitSettings] = useState({})
    const getAuthUser = IsAuthenticated(true)
    const user = getAuthUser.currentUser || {}
    const [companyLogo, setCompanyLogo] = useState("/assets/img/company_logo.png")
    Font.register({
        family: 'poppins',
        fonts: [
            { src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_300.ttf`, fontWeight: 300 },
            { src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_400.ttf`, fontWeight: 400 },
            { src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_500.ttf`, fontWeight: 500 },
            { src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_600.ttf`, fontWeight: 600 },
            { src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_700.ttf`, fontWeight: 700 },
            { src: `${process.env.REACT_APP_DOMAIN}assets/fonts/poppins_800.ttf`, fontWeight: 800 },
        ]
    });
    Font.registerHyphenationCallback(word => {
        // Return entire word as unique part
        return [word];
    });

    const formatDate = (date = null, formatType = 'MMM DD, YYYY') => {
        if (date == null || formatType == null) {
            return false
        }
        let isValid = moment(date).isValid()
        if (isValid) {
            let formattedDate = moment(date).format(formatType)
            if (moment(formattedDate).isValid()) {
                return formattedDate
            } else {
                return date
            }
        } else {
            return date
        }

    }

    const styles = StyleSheet.create({
        body: {
            paddingTop: 35,
            paddingBottom: 65,
            paddingHorizontal: 35,
        },
        header: {
            fontSize: 12,
            marginBottom: 20,
            textAlign: 'center',
            color: 'grey',
        },
        pageNumber: {
            position: 'absolute',
            fontSize: 12,
            bottom: 30,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'grey',
        },
        tableBody: {
            width: "80%",
            margin: "auto",
            fontSize: "22px"
        },
        tableRow: {
            fontSize: "16px",
            flexDirection: "row",
            justifyContent: "space-between",
            margin: "5px 0",
        }
    });
    const summary = ReactDOMServer.renderToStaticMarkup(<PdfSummary {...pdfData} />);
    const summaryDomain = ReactDOMServer.renderToStaticMarkup(<PdfSummaryDomain {...pdfData} />);
    const detailSummary = ReactDOMServer.renderToStaticMarkup(<PdfDetailSummary {...pdfData} />);
    const pdfFooter = (pgNumberColor = "#fff", type = "") => (
        <View style={{ position: "absolute", bottom: "20px" }}>
            <View style={{ flexDirection: "row", padding: "0 20px" }}>

                <Text style={{ width: "5%", color: pgNumberColor, padding: "5px", fontSize: "14px" }} render={({ pageNumber, totalPages }) => (
                    `${pageNumber}`
                )} fixed />
                {/* <View style={{ width: "95%", flexDirection: "row", justifyContent: "space-between", backgroundColor: "#009EAA", color: "#fff", padding: "5px", fontSize: "12px" }}> */}
                <View style={{ width: "95%", flexDirection: "row", justifyContent: "space-between", backgroundColor: "#ef5922", color: "#fff", padding: "5px", fontSize: "12px" }}>
                    <Text>Confidential | Internal Use Only</Text>
                    <Link style={{ color: "#fff", textDecoration: "none",textDecoration:"underline" }} src={process.env.REACT_APP_DOMAIN}>{process.env.REACT_APP_DOMAIN}</Link>
                </View>

            </View>

        </View>
    )

    const getUpEvCount = () => {
        let groups = pdfData.template.page || []
        let allQuestions = []
        groups.map((group, gKey, arr) => {
            allQuestions.push(...group.questions)
        })
        let upEvCount = 0;
        allQuestions && allQuestions.map((question, qKey) => {
            if (question.is_complete == "Y") {
                upEvCount += 1
            }
        })
        let totalPercentage = (upEvCount / allQuestions.length) * 100
        return Math.round((totalPercentage + Number.EPSILON) * 100) / 100
    }
    const PdfPages = () => (
        <Document>
            <Page style={{ fontFamily: "poppins" }} >
                <View style={styles.body}>
                    {/* <Image style={{ height: "50px", width: '150px', display: "inline-block" }} src="/assets/img/pdf/logo_0.png" /> */}
                    <Image style={{ height: '60px', width: '100px',objectFit:"contain", display: 'inline-block',marginRight: 'auto' }} src={`${process.env.REACT_APP_API_URL}orgs/getLogo/${user.org_id}`} onError={companyLogo} />
                    <Text  style={{ maxWidth: '200px', display: 'inline-block', marginLeft: '120px',top: "-55px",color:"#ef5922",fontWeight:600,fontSize:"20px"}}>{user?.org_name}</Text>
                    {/* <Image style={{ height: '25px', width: 'auto', display: 'inline-block', marginLeft: 'auto', top: "-35px" }} src={`${process.env.REACT_APP_API_URL}orgs/getLogo/${user.org_id}`} onError={companyLogo} /> */}
                    <View style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <Text style={{ color: '#000', fontSize: '24px', margin: '0px 0px', fontWeight: "700" }}>Vendor Risk Assessment Report Level 1  </Text>
                        <Text style={{ color: '#000', fontSize: '16px', marginTop: '0px',  fontWeight: 700,color:"#ef5922"}}> {pdfData?.vendor?.vendor_name} </Text>
                        <Text style={{ color: '#000', fontSize: '16px', marginTop: '10px', fontWeight: 600 }}> {now && formatDate(now)} </Text>
                    </View>
                    <View style={{position: "absolute", top: "230px", left: "0px",}}>
                        <Image style={{ height: "500px", width:"450px" }} src="/assets/img/pdf/First_page.png" />
                    </View>
                </View>

                {/* <View style={{ backgroundColor: "#009EAA", color: "#fff", margin: 0, padding: "25px", position: "absolute", bottom: "100px", width: "100%", fontSize: "10px" }}> */}
                <View style={{ backgroundColor: "#ef5922", color: "#fff", margin: 0, padding: "25px", position: "absolute", bottom: "100px", width: "100%", fontSize: "10px" }}>
                    <Text>CONFIDENTIAL: This document contains sensitive information about the security environment, practices, and current vulnerabilities and weaknesses as well as proprietary tools, techniques and methodologies used.</Text>
                    <Text style={{ marginTop: "15px" }}>Reproduction or distribution of this document is prohibited.</Text>
                </View>
                <View style={{ position: "absolute", bottom: "20px", width: "100%", marginRight: "40px" }}>
                    <Text style={{ textAlign: "right", fontSize: "11px", fontWeight: 700, marginRight: "120px" }}>POWERED BY:</Text>
                    <View style={{ width: "100%", alignItems: "flex-end", paddingRight: "40px", marginTop: "15px" }}>
                        <Image style={{ height: '20px', width: '150px', display: 'inline-block' }} src="/assets/img/pdf/logo_2.png" />
                    </View>

                </View>

            </Page>

            <Page style={{ fontFamily: "poppins" }}>
                <View style={{ backgroundColor: "#5A5857", flex: "1 0 auto", height: "100%", width: "100%", justifyContent: "center" }}>
                    {/* <View style={{ padding: "15px 0px", width: "100%", color: "#fff", backgroundColor: "#14C7DE", fontSize: "22px", fontFamily: "poppins", lineHeight: "1.5", fontWeight: "400" }}> */}
                    <View style={{ padding: "15px 0px", width: "100%", color: "#fff", backgroundColor: "#ef5922", fontSize: "22px", fontFamily: "poppins", lineHeight: "1.5", fontWeight: "400" }}>
                        <View style={styles.tableBody}>
                            <View style={{ marginBottom: "10px" }}>
                                <Text style={{ fontWeight: 600 }}>Table of Contents </Text>
                            </View>

                            <View style={styles.tableRow}>
                                <Text>Security Assessment - Overall Summary </Text>
                                <Text>3</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text>Critical Evidence Summary</Text>
                                <Text>4</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text>Detailed Summary</Text>
                                <Text>6</Text>
                            </View>
                        </View>


                    </View>
                </View>
                {pdfFooter()}
            </Page>

            <Page size="A4" style={{ fontFamily: "poppins", fontSize: "14px" }}>
                <View style={styles.body}>
                    <View>
                        <View style={{ width: "100%" }}>
                            {/* <Text style={{ color: "#009EAA", fontSize: "20px", fontWeight: "700" }}>1. Security Assessment : Overall Summary</Text> */}
                            <Text style={{ color: "#ef5922", fontSize: "20px", fontWeight: "700" }}>1. Security Assessment : Overall Summary</Text>
                        </View>
                        <View style={{ width: "100%", flexDirection: "row", minHeight: "40px", alignItems: "baseline" }}>
                            <Text style={{ fontSize: "14px", fontWeight: "500",marginTop:"5px" }}>Vendor Name:</Text>
                            {
                                pdfData?.vendor?.vendor_name
                                    ? <Text style={{ flex: "1 1 auto", fontWeight: "700", marginLeft: "10px" }}>{pdfData?.vendor?.vendor_name}</Text>
                                    : <Text style={{ borderBottom: "1pt solid black", flex: "1 1 auto" }}>{pdfData?.vendor?.vendor_name}</Text>
                            }

                        </View>

                        <View style={{ width: "100%", flexDirection: "row", height: "250px" }}>
                            {/* <View style={{ paddingRight: "5px", textAlign: "center", flex: "1 1 auto", alignItems: "center" }}>
                                <View style={{ width: "100%", backgroundColor: "#d0f4f9", height: "100%", alignItems: "center",padding:"10px" }}>
                                    <Text>Assessment Score : <Text style={{fontWeight:700}}>{pdfData?.vendor?.score}%</Text></Text>
                                    <View style={{ marginTop: "20px" }}>
                                        <Svg style={{ width: "120px", height: "120px" }} viewBox="0 0 35.83098862 35.83098862" >
                                            <Circle stroke="#EDF0F4" strokeWidth="4" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                            <Circle stroke="#1974D3" strokeWidth="4" strokeDasharray={`${pdfData?.vendor?.score},100`} strokeLinecap="none" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                            <G>
                                                <Text x="18" y="20" alignmentBaseline="central" textAnchor="middle" style={{ fontSize: "5px" }}>{`${pdfData?.vendor?.score}%`}</Text>
                                            </G>
                                        </Svg>
                                    </View>
                                    <Text style={{ marginTop: "20px",fontSize:"12px" }}>The above score represents the response % in the Assessment portal.</Text>
                                </View>
                            </View> */}
                            <View style={{ paddingRight: "5px", textAlign: "center", flex: "1 1 auto", alignItems: "center" }}>
                                {/* <View style={{ width: "100%", backgroundColor: "#d0f4f9", height: "100%", alignItems: "center", padding: "10px" }}> */}
                                <View style={{ width: "100%", backgroundColor: "#FFF", height: "100%", alignItems: "center", padding: "10px" }}>
                                    <Text style={{ width: "100%",textAlign:"center"}}>Overall Posture Rating</Text>
                                    <View style={{ width: "100%", flexDirection: "column" }}>
                                        <View style={{ textAlign: "center", alignItems: "center" }}>
                                            <View style={{ margin: "20px 0 30px" }}>
                                                <Svg style={{ width: "150px", height: "150px" }} viewBox="0 0 35.83098862 35.83098862" >
                                                    <Circle stroke="#EDF0F4" strokeWidth="2" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                                    <Circle stroke="#1974D3" strokeWidth="2" strokeDasharray={`${pdfData?.vendor?.score},100`} strokeLinecap="none" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                                    <G>
                                                        <Text x="19" y="21.5" alignmentBaseline="central" textAnchor="middle" style={{ fontSize: "5px", fontWeight: 700 }}>{`${pdfData?.vendor?.score}%`}</Text>
                                                        <Text fill={pdfData?.vendor?.score > 75 ? "#008000" : (pdfData?.vendor?.score < 75 && pdfData?.vendor?.score > 60 ? "#ffa500" : "#ff0000")} x="19" y="16.5" alignmentBaseline="central" textAnchor="middle" style={{ fontSize: "4px", fontWeight: 700 }}>{pdfData?.vendor?.score > 75 ? "Good" : (pdfData?.vendor?.score < 75 && pdfData?.vendor?.score > 60 ? "Average" : "Poor")}</Text>
                                                    </G>
                                                </Svg>
                                            </View>
                                        </View>
                                        <View style={{ textAlign: "left", alignItems: "start", justifyContent: "center",marginTop:"-20px"}}>
                                            <View style={{minHeight:"10px",width: "100%", padding: "5px", justifyContent: "center",flexDirection: "row" }}>
                                                <View style={{minWidth:"12px", flexDirection: "row", alignItems: "center",flex: "1 1 auto" }}>
                                                    <Text style={{ color: "#008000", fontSize: "9px", fontWeight: "600", margin: "0",paddingRight:"5px" }}>Good</Text>
                                                    <Text style={{ flex: "1 1 auto", fontWeight: 600, fontSize: "8px" }}> {`>75%`}, </Text>
                                                </View>
                                                <View style={{minWidth:"55px",flexDirection: "row", alignItems: "center",flex: "1 1 auto" }}>
                                                    <Text style={{ color: "#ffa500", fontSize: "9px", fontWeight: "600", margin: "0",paddingRight:"5px" }}>Average</Text>
                                                    <Text style={{ flex: "1 1 auto", fontWeight: 600, fontSize: "8px" }}> {`>60%-74.9%`}, </Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center",flex: "1 1 auto" }}>
                                                    <Text style={{ color: "#ff0000", fontSize: "9px", fontWeight: "600", margin: "0",paddingRight:"5px" }}>Poor</Text>
                                                    <Text style={{ flex: "1 1 auto", fontWeight: 600, fontSize: "8px" }}> {`<60%`} </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={{ paddingLeft: "5px", flex: "1 1 auto" }}>

                                <View style={{ backgroundColor: "#FFF", height: "100%", alignItems: "center", padding: "10px" }}>
                                    <View style={{ width: "100%", flexDirection: "row", alignSelf: "flex-start" }}>
                                        <Text style={{textAlign:"center",width:"100%"}}>Assessment Status</Text>
                                        {/* <Text style={{ borderBottom: "1pt solid black", flex: "1 1 auto", margin: "0 auto",maxWidth:"120px" }}></Text> */}
                                    </View>
                                    {
                                        pdfData.vendor.admin_status == "approved"
                                            ? <Image style={{ height: "130px", width: "100px", marginTop: "20px" }} src="/assets/img/pdf/Status_1.png" />
                                            : <Image style={{ height: "130px", width: "100px", marginTop: "20px" }} src="/assets/img/pdf/Status_2.png" />
                                    }

                                    <Text style={{ marginTop: "30px", alignSelf: "flex-start", textAlign:"center",width:"100%"}}>Overall Result: &nbsp;&nbsp;<Text style={{ fontWeight: 700, marginLeft: "20px", textTransform: "capitalize", color: pdfData?.vendor?.admin_status == "approved" ? 'green' : 'red' }}>{pdfData?.vendor?.admin_status}</Text></Text>
                                </View>
                            </View>

                        </View>
                        {/* <View style={{ width: "100%", backgroundColor: "#d0f4f9", marginTop: "10px",padding:"10px" }}>
                            <Text style={{ marginTop: "10px" }}>Overall Posture Rating Manual Input</Text>
                            <View style={{ width: "100%", flexDirection: "row" }}>
                                <View style={{ textAlign: "center", flex: "1 1 auto", alignItems: "center" }}>
                                    <View style={{ margin: "20px 0 30px" }}>
                                        <Svg style={{ width: "150px", height: "150px" }} viewBox="0 0 35.83098862 35.83098862" >
                                            <Circle stroke="#EDF0F4" strokeWidth="2" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                            <Circle stroke="#1974D3" strokeWidth="2" strokeDasharray={`${pdfData.completion_pct},100`} strokeLinecap="none" fill="none" cx="17.91549431" cy="17.91549431" r="15.91549431" />
                                            <G>
                                                <Text x="19" y="21.5" alignmentBaseline="central" textAnchor="middle" style={{ fontSize: "5px",fontWeight:700 }}>{`${pdfData.completion_pct}%`}</Text>
                                                <Text fill={pdfData.completion_pct > 75 ? "#008000" : (pdfData.completion_pct < 75 && pdfData.completion_pct > 60 ? "#ffa500" : "#ff0000")} x="19" y="16.5" alignmentBaseline="central" textAnchor="middle" style={{ fontSize: "4px",fontWeight:700 }}>{pdfData.completion_pct > 75 ? "Good" : (pdfData.completion_pct < 75 && pdfData.completion_pct > 60 ? "Average" : "Poor")}</Text>
                                            </G>
                                        </Svg>
                                    </View>
                                </View>
                                <View style={{ textAlign: "left", flex: "1 1 auto", alignItems: "center", justifyContent: "center" }}>
                                    <View style={{ height: "200px", width: "100%", padding: "10px", justifyContent: "center" }}>
                                        <View style={{ width: "100%", flexDirection: "row", alignItems: "center" }}>
                                            <Text style={{ color: "#008000", fontSize: "18px", fontWeight: "600", flex: "1 1 auto", borderRight: "1pt", margin: "10pt 0" }}>Good</Text>
                                            <Text style={{ flex: "1 1 auto",fontWeight:600, fontSize: "16px" }}> {`>75%`} </Text>
                                        </View>
                                        <View style={{ width: "100%", flexDirection: "row", alignItems: "center" }}>
                                            <Text style={{ color: "#ffa500", fontSize: "18px", fontWeight: "600", flex: "1 1 auto", borderRight: "1pt", margin: "10pt 0" }}>Average</Text>
                                            <Text style={{ flex: "1 1 auto",fontWeight:600, fontSize: "16px" }}> {`>60%-74.9%`} </Text>
                                        </View>
                                        <View style={{ width: "100%", flexDirection: "row", alignItems: "center" }}>
                                            <Text style={{ color: "#ff0000", fontSize: "18px", fontWeight: "600", flex: "1 1 auto", borderRight: "1pt", margin: "10pt 0" }}>Poor</Text>
                                            <Text style={{ flex: "1 1 auto",fontWeight:600, fontSize: "16px" }}> {`>60%`} </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View> */}
                        <View>
                            {/* <Text style={{ fontSize: "10px", margin: "15px 0" }}>This rating scale shows overall posture rating of Current Health. The ratings also serve as a comparison to similarly sized companies. These ratings are based on evidence provided. No independent testing/sampling was done.</Text> */}
                            <Text style={{ fontSize: "10px", margin: "15px 0" }}>This rating scale shows overall posture rating of {pdfData?.vendor?.vendor_name}. The ratings also serve as a comparison to similarly sized companies. These ratings are based on evidence provided. </Text>
                        </View>
                        <View style={{ width: "100%", flexDirection: "row", textAlign: "center", border: "1pt solid #99d8dd", borderBottom: "0pt" }}>
                            {/* <Text style={{ width: "30%", backgroundColor: "#99d8dd", padding: "4px", borderRight: "1pt solid #99d8dd" }}>Current Rating</Text> */}
                            <Text style={{ width: "30%", backgroundColor: "#ffe0d7", padding: "4px", borderRight: "1pt solid #ffe0d7" }}>Current Rating</Text>
                            <Text style={{ flex: "1 1 auto", backgroundColor: "#ffe0d7", padding: "4px" }}>Evidence Status</Text>
                        </View>
                        <View style={{ width: "100%", flexDirection: "row", textAlign: "center", border: "1pt solid #CCCDD1", borderTop: 0, color: "green" }}>
                            <Text style={{ width: "30%", padding: "4px", borderRight: "1pt solid #CCCDD1", color: pdfData?.vendor?.score > 75 ? 'green' : (pdfData?.vendor?.score < 75 && pdfData?.vendor?.score > 60 ? 'orange' : 'red') }}>{pdfData?.vendor?.score > 75 ? "Good" : (pdfData?.vendor?.score < 75 && pdfData?.vendor?.score > 60 ? "Average" : "Poor")}</Text>
                            <Text style={{ flex: "1 1 auto", padding: "4px", color: getUpEvCount() > 90 ? 'green' : (getUpEvCount() < 90 && getUpEvCount() > 0 ? 'orange' : 'red') }}>{getUpEvCount() > 90 ? 'All Evidences are provided' : (getUpEvCount() < 90 && getUpEvCount() > 0 ? 'Partial Evidences are provided' : 'No Evidence provided')}</Text>

                        </View>


                    </View>
                </View>
                <View fixed style={{ position: "absolute", bottom: "10px", width: "100%" }}>
                    {pdfFooter("black")}
                </View>
            </Page>

            <Page orientation={"landscape"} style={{ paddingBottom: "60px", paddingTop: "20px", fontFamily: "poppins" }}>
                <View >
                    <View wrap>
                        <Html resetStyles>{summary}</Html>
                    </View>
                    <View wrap break>
                        <Html resetStyles>{summaryDomain}</Html>
                    </View>
                </View>
                <View fixed style={{ position: "absolute", bottom: "10px", width: "100%" }}>
                    {pdfFooter("black")}
                </View>
            </Page>
            <Page orientation={"landscape"} style={{ paddingBottom: "60px", paddingTop: "20px", fontFamily: "poppins" }}>
                <View >
                    <View wrap>
                        <Html resetStyles>{detailSummary}</Html>
                    </View>
                </View>
                <View fixed style={{ position: "absolute", bottom: "10px", width: "100%" }}>
                    {pdfFooter("black")}
                </View>
            </Page>



            <Page style={{ fontFamily: "poppins" }}>
                <View style={styles.body}>
                    <Image style={{ height: '20px', width: '150px', display: 'inline-block', marginLeft: 'auto' }} src="/assets/img/pdf/logo_2.png" />
                    <View style={{ justifyContent: "center", width: "100%", height: "400px",textAlign:"center" }}>
                        <Image style={{ height: '60px', width: '100px',objectFit:"contain", display: 'inline-block',marginLeft: 'auto',marginRight:"auto" }} src={`${process.env.REACT_APP_API_URL}orgs/getLogo/${user.org_id}`} onError={companyLogo} />
                        <Text style={{ color: '#000', fontSize: '32px', fontWeight: "800", textAlign: "center" }}> Thank You  </Text>
                    </View>
                </View>
                <View style={{ position: "absolute", bottom: "0", }}>
                    <Image style={{ height: "500px", left: "-35px" }} src="/assets/img/pdf/First_page.png" />
                </View>
            </Page>
        </Document>
    )
    // console.log(user);
    // console.log(pdfData);
    return (
        <React.Fragment>
            {PdfPages()}
        </React.Fragment>
    )
}





export default AirPdf