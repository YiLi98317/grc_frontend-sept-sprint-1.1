import React, { useEffect, useState } from "react"
const PdfDetailSummary = (props) => {
    // const navigate = useNavigate();
    const pdfData = props || {}
    const [assessmentData, setAssessmentData] = useState([])

    // useEffect(() => {
    if (Object.keys(pdfData).length > 0 && assessmentData.length == 0) {
        let templateArr = pdfData?.template?.page || [];
        for (let domain of templateArr) {
                let score = 0
                let totalQuestions = domain.questions.length
                domain.questions && domain.questions.map((question) => {
                    if (question.is_complete == "Y") {
                        score += 1
                    }
                })
                let scorePoint = score > 0 ? ((score / totalQuestions) * 100) / 10 : 0
                scorePoint = Math.round((scorePoint + Number.EPSILON) * 100) / 100
                domain.score = scorePoint;
        }

        setAssessmentData(oldVal => {
            return [...templateArr]
        })

    }



    // },[pdfData])


    // console.log(pdfData)
    // console.log(domains)
    // console.log(criticalQuestions)
    return (

        <>
            <style>
                {`
        .table_block {
          border: 1px solid #CCCDD1;
        }
        .evidence_summary_section{
           font-size:12px;
        }
        .critical_ev_summary_table{
            border-collapse: separate;
        }
        .critical_ev_summary_table th{
            padding:5px;
        }
        .critical_ev_summary_table td{
            padding:5px;
        }
        table{
            border-collapse: collapse;
        }
        th,td{
            border: 0.5pt solid black;
            border-collapse: collapse;
        }
        th{
            border-color:#fff;
            font-weight:800 
        }
        .domain_scoring_table{
            font-size:12px;
        }
        .domain_scoring_table th{
            padding:8px 5px;
        }
        .domain_scoring_table td{
            padding:5px;
        }
        .green{
            color: #65c679;
        }
        .red{
            color: #da324c;
        }
        .badge{
            border: 1pt solid black;
            padding: 5pt 3pt;
            display: inline-block;
            min-width:auto;
            max-width:50px;
            font-size: 8px;
            font-weight: 700;
            text-align: center;
            white-space: nowrap;
            border-radius: 3pt;
        }
        .fs-8{
            font-size: 8px;
        }
        .badge.dark_red{
            border-color: #872001;
            color:#872001;
            background-color: #bd27038a;
        }
        .badge.red{
            border-color: #da324c;
            color:#da324c;
            background-color: #f4646473;
        }
        .badge.green{
            border-color: #65c679;
            color: #65c679;
            background-color: #D4FCD8;
        }
        .badge.orange{
            border-color: #f68000;
            color: #f68000;
            background-color: #f9ba32c4;
        }
        .badge.yellow{
            border-color: #f9dd32;
            color: #ffffff;
            background-color: #f9dd32;
        }
        `}
            </style>
            <div className="evidence_summary_section" style={{ width: "100%", backgroundColor: "#f5f5f5", border: "1px solid #eee" }}>


                <div style={{ backgroundColor: "#fff", paddingBottom: "20px" }}>
                    <div id="page-header" style={{ padding: "25px" }}>
                        <h4 style={{ fontSize: "22px", fontWeight: "800", color: "#000", margin: "10px 0px", padding: 0, }} >3. Detailed Summary</h4>
                        <div>
                            <table className="critical_ev_summary_table" style={{fontSize: "12px",maxWidth: "100%", minWidth: "100%", width: "100%" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#ef5922", fontSize: "10px", borderColor: "ef5922", color: "#FFF" }}>

                                        <th style={{ width: "20px", maxWidth: "20px" }}>#</th>
                                        <th style={{ width: "125px", maxWidth: "125px" }}>Question</th>
                                        <th style={{ width: "62px", maxWidth: "62px" }}>Vendor Response</th>
                                        <th style={{ width: "80px", maxWidth: "80px" }}>Evidence</th>
                                        <th style={{ width: "60px", maxWidth: "60px" }}>Severity</th>
                                        <th style={{ width: "40px", maxWidth: "40px" }}>Score</th>
                                        <th style={{ width: "80px",maxWidth: "80px"}}>Status</th>
                                        <th >Vendor Inputs</th>
                                        <th style={{ width: "200px",maxWidth: "200px"}}>Auditor Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assessmentData && assessmentData.length > 0 && React.Children.toArray(assessmentData.map((group, gKey) => {
                                        return (
                                            <>
                                                <tr style={{ backgroundColor: "#ffe0d7", fontWeight: "600", fontSize: "12px",color:"#000" }}>
                                                    <td colSpan="100%" style={{ borderColor: "#fff" }}>{group.group}</td>
                                                </tr>
                                                {group && group.questions && group.questions.length > 0 && React.Children.toArray(group.questions.map((question, qKey) => {
                                                    return (
                                                        <tr>
                                                            <td style={{ minWidth: "20px", maxWidth: "20px" }}>{qKey + 1}</td>
                                                            <td style={{ minWidth: "125px", maxWidth: "125px" }}>{question.question}</td>
                                                            <td style={{ minWidth: "62px", maxWidth: "62px" }}>
                                                                
                                                                    {(()=>{
                                                                        let radioField = question.fields.find((field) => field.type == "radio")
                                                                        if(radioField.value == 'Yes'){
                                                                            return (
                                                                                <div className={`badge fs-8 green`} style={{padding:"3pt",width:"30px"}}>{radioField.value}</div>
                                                                            )
                                                                        }else if(radioField.value == 'No'){
                                                                            return (
                                                                                <div className={`badge fs-8 red`} style={{padding:"3pt",width:"30px"}}>{radioField.value}</div>
                                                                            )
                                                                            
                                                                        }else{
                                                                               return ( <div></div>)
                                                                        }
                                                                    })()}
                                                                
                                                            </td>
                                                            <td style={{ minWidth: "80px", maxWidth: "80px" }}>{question.files.length > 0 ? 'Attached' : 'Not Attached'}</td>
                                                            <td style={{ minWidth: "60px", maxWidth: "60px" }}>
                                                                <div style={{padding:"3pt",width:"auto"}} className={`badge fs-8 ${question.severity == "low" ? 'yellow' : (question.severity == "medium" ? 'orange' : (question.severity == "high" ? 'red' : 'dark_red '))}`}>{question.severity}</div>
                                                            </td>
                                                            
                                                            <td style={{ minWidth: "40px", maxWidth: "40px" }}>{(!question.is_compliant || (question.is_compliant && question.is_compliant == "Y")) ? (question.severity == "low" ? 0.75 : (question.severity == "medium" ? 1.25 : (question.severity == "high" ? 2 : question.severity == "very high" ? 5 : 0))) : 0}</td>
                                                            <td style={{ minWidth: "80px",maxWidth: "80px",fontWeight:600}}>
                                                                {
                                                                    (!question.is_compliant || (question.is_compliant && question.is_compliant == "Y"))
                                                                    ? <div className="green">Compliant</div>
                                                                    : <div className="red">Not Compliant</div>
                                                                }
                                                            </td>
                                                            <td >
                                                                {question.fields && question.fields.length > 0 && React.Children.toArray(question.fields.map((field, fKey) => {
                                                                    if (field.label && field.label.toLowerCase() == "additional comments") {
                                                                        return (
                                                                            <p>{field.value}</p>
                                                                        )
                                                                    }
                                                                }))}
                                                            </td>
                                                            <td style={{ minWidth: "200px",maxWidth: "200px"}}>{question.auditor_notes}</td>
                                                        </tr>
                                                    )

                                                }))}


                                            </>

                                        )
                                    }))}



                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default PdfDetailSummary