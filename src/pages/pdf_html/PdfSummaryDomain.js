import React, { useEffect, useState } from "react"

const PdfSummaryDomain = (props) => {
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

                        <div >
                            <article style={{ fontWeight: 600, backgroundColor: "#ef5922", padding: "8px", textAlign: "center", fontSize: "12px", color: "#fff", fontWeight: 800 }}> Domain Wise Scoring</article>
                            <table className="domain_scoring_table" style={{ width: "100%", textAlign: "center" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#ffe0d7",borderColor:"#ffe0d7", fontSize: "12px",color:"#000" }}>
                                        <th style={{ width: "20px", maxWidth: "30px" }}></th>
                                        <th className="" style={{ width: "90%" }}>Domain</th>
                                        <th style={{ width: "20px", maxWidth: "50px" }}>Score</th>


                                    </tr>
                                </thead>
                                <tbody>
                                    {domains && domains.length > 0 && React.Children.toArray(domains.map((domain, dKey) => {
                                        return (
                                            <tr >
                                                <td style={{ width: "20px", maxWidth: "30px" }}>{dKey + 1}</td>
                                                <td >{domain.domain_name}</td>
                                                <td style={{ width: "20px", maxWidth: "50px" }}>{domain.score}</td>
                                            </tr>
                                        )
                                    }))}
                                    <tr>
                                        <td style={{ width: "20px", maxWidth: "30px" }}></td>
                                        <td style={{fontWeight:600}}>Overall score</td>
                                        <td style={{ width: "20px", maxWidth: "50px",fontWeight:600 }}>{domains && (Math.round(((((Math.round(((domains.reduce((partialSum, domain) => partialSum + domain.score, 0)) + Number.EPSILON) * 100) / 100)/domains.length)*10) + Number.EPSILON) * 100) / 100) }</td>
                                    </tr>
                                </tbody>

                            </table>
                        </div>


                    </div>


                </div>
            </div>
        </>
    )
}

export default PdfSummaryDomain