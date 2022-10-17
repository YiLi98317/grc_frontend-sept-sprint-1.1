import React, { useEffect, useState } from "react"
const PdfSummary = (props) => {
    // const navigate = useNavigate();
    const pdfData = props || {}
    const [criticalQuestions, setCriticalQuestions] = useState([])
    const [domains, setDomains] = useState([])

    // useEffect(() => {
    if (Object.keys(pdfData).length > 0 && (domains.length == 0 || criticalQuestions.length == 0)) {
        let templateArr = pdfData?.template?.page || [];

        let mandatoryQuestions = []
        let domains = templateArr.map((domain) => {
            let score = 0
            let totalQuestions = domain.questions.length
            domain.questions && domain.questions.map((question) => {
                if (question.is_mandatory == "Y") {
                    mandatoryQuestions.push(question)
                }
                if (question.is_complete == "Y") {
                    score += 1
                }
            })
            let scorePoint = score > 0 ? ((score / totalQuestions) * 100) / 10 : 0
            scorePoint = Math.round((scorePoint + Number.EPSILON) * 100) / 100
            return { domain_name: domain.group, score: scorePoint }
        })
        setDomains(oldVal => {
            return [...domains]
        })
        setCriticalQuestions(oldVal => {
            return [...mandatoryQuestions]
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
        th,td{
            border: 0.5pt solid black;
        }
        th{
            border-color:grey;
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
        .badge{
            border: 1pt solid black;
            padding: 5pt 3pt;
            display: inline-block;
            min-width:auto;
            max-width:40px;
            font-size: 8px;
            font-weight: 700;
            text-align: center;
            white-space: nowrap;
            border-radius: 3pt;
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
        
        `}
            </style>
            <div className="evidence_summary_section" style={{ width: "100%", backgroundColor: "#f5f5f5", border: "1px solid #eee" }}>


                <div style={{ backgroundColor: "#fff", paddingBottom: "20px" }}>
                    <div id="page-header" style={{ padding: "25px" }}>
                        <h4 style={{ fontSize: "22px", fontWeight:800, color: "#ef5922", margin: 0, padding: 0, }}>2. Critical Evidence Summary</h4>
                        <div>
                            <p style={{ fontSize: "11px", margin: "5px 0px" }}>Below table summarizes the four critical evidences, the response provided & their status.</p>
                            <table className="critical_ev_summary_table" style={{ maxWidth: "100%", minWidth: "100%", width: "100%", fontSize: "12px" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#ffe0d7", fontSize: "10px", borderColor: "#ffe0d7",color:"#000" }}>

                                        <th style={{ minWidth: "40px", maxWidth: "40px" }}>S.No.</th>
                                        <th style={{ minWidth: "150px", maxWidth: "150px" }}>Critical Evidence</th>
                                        <th style={{ minWidth: "90px", maxWidth: "90px" }}>Attachment</th>
                                        <th style={{ minWidth: "65px", maxWidth: "65px" }}>Status</th>
                                        <th>Vendor Inputs</th>
                                        <th>Auditor Remarks</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {criticalQuestions && criticalQuestions.length > 0 && React.Children.toArray(criticalQuestions.map((cQuest, dKey) => {
                                        return (
                                            <tr>
                                                <td style={{ minWidth: "40px", maxWidth: "40px" }}>{dKey + 1}</td>
                                                <td style={{ minWidth: "150px", maxWidth: "150px" }}>{cQuest.question}</td>
                                                <td style={{ minWidth: "90px", maxWidth: "90px",textAlign:"center" }} ><div style={{padding:"3pt",width:"30px"}} className={`badge ${cQuest.files.length > 0 ? 'green' : 'red'}`}>{cQuest.files.length > 0 ? 'Yes' : 'No'}</div></td>
                                                <td style={{ minWidth: "65px", maxWidth: "65px" }}>{cQuest.files.length > 0 ? 'Shared' : 'Not Shared'}</td>
                                                <td>
                                                    {cQuest.fields && cQuest.fields.length > 0 && React.Children.toArray(cQuest.fields.map((field, fKey) => {
                                                        if (field.label && field.label.toLowerCase() == "additional comments") {
                                                            return (
                                                                <>{field.value}</>
                                                            )
                                                        }
                                                    }))}
                                                </td>
                                                <td>{cQuest.auditor_notes}</td>
                                            </tr>
                                        )
                                    }))}

                                </tbody>

                            </table>
                            <p style={{ margin: "12px 0px", fontSize: "11px" }}>Not Shared - Evidence was not provided | Not Present - Evidence shared
                                but, invalid
                                Not in place - Organization does not have a 3rd party certification/attestation </p>

                        </div>

                    </div>

                    <div id="page-content" style={{ position: "relative" }}>


                    </div>

                </div>
            </div>
        </>
    )
}

export default PdfSummary