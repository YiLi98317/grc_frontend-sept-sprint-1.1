import React, { useEffect, useState } from "react"
const PdfDashboardTable = (props) => {
    // const navigate = useNavigate();
    const pdfData = props || {}
    const [assessmentData, setAssessmentData] = useState([])

    // useEffect(() => {
    if (Object.keys(pdfData.tableData).length > 0 && assessmentData.length == 0) {
        let templateArr = pdfData.tableData?.template?.page || [];
       
        setAssessmentData(pdfData.tableData);

    }
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
                        <h4 style={{ fontSize: "22px", fontWeight: "800", color: "#000", margin: "10px 0px", padding: 0, }} >{pdfData.headerText}</h4>
                        <div>
                            <table className="critical_ev_summary_table" style={{fontSize: "12px",maxWidth: "100%", minWidth: "100%", width: "100%" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#009EAA", fontSize: "10px", borderColor: "009EAA", color: "#fff" }}>

                                        <th style={{ width: "40px", maxWidth: "40px" }}>#</th>
                                        <th style={{ width: "125px",maxWidth: "125px" }}>Task Id</th>
                                        <th style={{ width: "300px", maxWidth: "300px" }}>Title</th>
                                        <th style={{ width: "80px", maxWidth: "80px" }}>Status</th>
                        

                                    </tr>
                                </thead>
                                <tbody>
                                    {assessmentData && assessmentData.length > 0 && React.Children.toArray(assessmentData.map((group, gKey) => {
                                        return (
                                            <>
                                                <tr style={{ fontSize: "12px",color:"#000" }}>
                                                    <td style={{ minWidth: "40px", maxWidth: "40px" }}>{gKey + 1}</td>
                                                    <td style={{ minWidth: "125px", maxWidth: "125px" }}>{group.project_task_id}</td>
                                                    <td style={{ minWidth: "300px", maxWidth: "300px" }}>{group.title}</td>
                                                    <td style={{ minWidth: "78px", maxWidth: "78px" }}>
                                                        {group.task_status == "pending" ? 'Open' : (group.task_status == "in_progress" ? 'In Progress' : (group.task_status == "review" ? 'Under Review' : (group.task_status == "completed" ? 'Completed' : '')))}
                                                    </td>
                                                </tr>
                                     
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

export default PdfDashboardTable