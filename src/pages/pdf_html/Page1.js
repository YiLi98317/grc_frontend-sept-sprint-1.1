import { PDFViewer } from "@react-pdf/renderer"
import React, { useContext, useEffect, useState } from "react"
import AirPdf from "../../elements/AirPdf"
import ApiService from "../../services/ApiServices"
const PdfWelcome = (props) => {
    // const navigate = useNavigate();
    
    const [pageBgImg, setPageBgImg] = useState(null)
    useEffect(() => {
      if(pageBgImg == null){
          getBlobImg("/assets/img/First_page.svg")
      }
    
      
    }, [])

    const pdfData = {
        "vendor_status": "reverted",
        "completion_pct": "9",
        "deadline": "May 31, 2022",
        "expire_in": -10,
        "template": {
            "page": [
                {
                    "group": "Attestation/Certification",
                    "questions": [
                        {
                            "id": 1,
                            "question": "Is your security program currently certified/attested by a 3rd party against SOC 2,HITRUST,ISO 27001",
                            "severity": "very high",
                            "files": [
                                "https://qa-api.gorico.io/vendor/readDocument/company_logo.png",
                                "https://qa-api.gorico.io/vendor/readDocument/aud-logo-5.2-1.png",
                                "https://qa-api.gorico.io/vendor/readDocument/demo.docx",
                                "https://qa-api.gorico.io/vendor/readDocument/Screenshot 2022-05-13 at 12.17.04 PM.png",
                                "https://qa-api.gorico.io/vendor/readDocument/Get_Started_With_Smallpdf.pdf",
                                "https://qa-api.gorico.io/vendor/readDocument/file_example_XLS_5000.xls"
                            ],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": "testing add comments 1.1"
                                },
                                {
                                    "type": "date",
                                    "label": "Select Date",
                                    "value": "2022-05-31"
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": "Yes",
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload ALL Certification reports",
                            "is_mandatory": "Y",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_compliant": "Y",
                            "is_complete": "Y"
                        },
                        {
                            "id": 2,
                            "question": "Does the credential (certification or, attestation) include the Technology, Business Units, Employees & Locations relevant for supplier-vendor relationship 1234",
                            "severity": "very high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": "testing add comments 1.2"
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": "Yes",
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload Copy of Certification",
                            "is_mandatory": "N",
                            "notes": "test color",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "Y",
                            "reverted_answer": "Y"
                        }
                    ]
                },
                {
                    "group": "Information Security Policy",
                    "questions": [
                        {
                            "id": 3,
                            "question": "Do you have an information security management (ISMS) program in place based on an industry standard?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": "testing add comments 2.1"
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": "Yes",
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload ISMS Document/IS Policy",
                            "is_mandatory": "Y",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "Y"
                        },
                        {
                            "id": 4,
                            "question": "Are the information security policies & procedures published & accessible to all employees?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Screenshot of Document Share/Utility/Icon",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 5,
                            "question": "Do you have a Security Officer / Security organization formally in place",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload Security Org Chart",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 6,
                            "question": "Do you have an employee background check process in place?",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": "testing add comments 2.4"
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": "No",
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload Policy or, Sample Evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "Y"
                        },
                        {
                            "id": 7,
                            "question": "Is your organization insured by a 3rd party for losses? If yes provide COI",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload Insurance Copy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 8,
                            "question": "Do you have a documented risk assessment methodology",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 9,
                            "question": "Do you conduct a risk assessment once a year?",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "date",
                                    "label": "Select Date",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": "Yes",
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload evidence",
                            "is_mandatory": "Y",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "Y"
                        }
                    ]
                },
                {
                    "group": "Device Endpoint Security (workstations, laptops, tablets, phones)",
                    "questions": [
                        {
                            "id": 10,
                            "question": "Do you have endpoint security policies, controls & tools in place to prevent, detect and quarantine/remove threats like malware, malicious code",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload Policy & Tool Evidence ",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 11,
                            "question": "Do you have a list of approved applications for end points",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload Approved Software & Application List ",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 12,
                            "question": "Do you have a mobile device management solution on all endpoints including laptops/desktops",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload Tool Evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 13,
                            "question": "Are all endpoints encrypted",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload Evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 14,
                            "question": "Do you support bring your own device (BYOD)?",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy and procedures",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": "Portable Media Security (flash drives, laptop hard drives etc.)",
                    "questions": [
                        {
                            "id": 15,
                            "question": "Do you have defined portable media policy",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "date",
                                    "label": "Select Date",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 16,
                            "question": "Do you have a defined media destruction policy/procedure",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy and procedures",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": "Device Endpoint Security (workstations, laptops, tablets, phones)",
                    "questions": [
                        {
                            "id": 17,
                            "question": "Do you have a change management policy and procedures",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy and procedures",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 18,
                            "question": "Do you have hardened images for all your common devices",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload procedure and evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 19,
                            "question": "Do you have an automated way to detect missing patches? ",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 20,
                            "question": "Do you have a formal software development lifecycle in place",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy/procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 21,
                            "question": "Do you have procedures in place to ensure production data shall not be replicated or used in non-production environments?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy/procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": "Vulnerability Management",
                    "questions": [
                        {
                            "id": 22,
                            "question": "Do you have a defined process - Policy & Procedure with SLAs for remediation based on criticality of vulnerability",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 23,
                            "question": "Does a 3rd party conduct an independent assessment in the form of external network penetration testing & internal vulnerability scans atleast once in 12 months?",
                            "severity": "high",
                            "files": [
                                "https://qa-api.gorico.io/vendor/readDocument/Screenshot 2022-05-13 at 7.11.05 PM.png"
                            ],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "date",
                                    "label": "Select Date",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": "No",
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload last test results",
                            "is_mandatory": "Y",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "Y"
                        },
                        {
                            "id": 24,
                            "question": "Do you have an encryption policy in place for data in transmission and at rest",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 25,
                            "question": "Do you utilize an automated source-code analysis tool to detect code security defects prior to production?",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload screenshot of scan result",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 26,
                            "question": "Do you utilize file integrity (host) and network intrusion detection (IDS) tools to facilitate timely detection, investigation by root cause analysis and response to incidents?",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload screenshot of console",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 27,
                            "question": "Does a 3rd party conduct an independent application penetration assessment (including external facing APIs) with test cases assessing possibility of critical information leakage - client data, IP or, covered information, privilege escalation and OWASP Top 10 etc. ",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload application penetraiton testing report with test plan illustrated in the report",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": " Network Protection",
                    "questions": [
                        {
                            "id": 28,
                            "question": "Is the network logically segregated and access control maintained based on sensitivity of applications/systems? Also, please share the policy & procedure document indicating this implementation?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 29,
                            "question": "Is there an updated network diagram?",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload document",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 30,
                            "question": "Are all outbound communications encrypted",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 31,
                            "question": "Are all network connections monitored?",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": "Password Management",
                    "questions": [
                        {
                            "id": 32,
                            "question": "Do you have a defined process - Policy & Procedure for password management? ",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 33,
                            "question": "Are passwords required to access systems transmitting, processing or storing critical data?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 34,
                            "question": "Have your implemented Multi Factor Authentication across all organization? ",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": "Access Control",
                    "questions": [
                        {
                            "id": 35,
                            "question": "Do you have & manage a RBAC (Role based access control) matrix mapping each user & their access especially critical data & covered information ",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 36,
                            "question": "Do you have a policy / procedure around new employee access, role changes etc",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": "Audit, Logging & Monitoring",
                    "questions": [
                        {
                            "id": 37,
                            "question": "Do you have a 24*7 security monitoring service or, utility which monitors threats across the organization with defined SLAs for response? ",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure / evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 38,
                            "question": "Are all elements of your organization covered under the scope? ",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload document",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 39,
                            "question": "Is privileged access monitored?",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 40,
                            "question": "Do you require at least annual certification of access for all system users and administrators (exclusive of users maintained by your customers)?",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload procedure and evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 41,
                            "question": "Are the logs stored in a central location for atleast 6 months? ",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": " Security Awareness",
                    "questions": [
                        {
                            "id": 42,
                            "question": "Do you have a security awareness program internally? ",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 43,
                            "question": "Do you have a policy for how often training is needed",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": " Third Party Risk",
                    "questions": [
                        {
                            "id": 44,
                            "question": "Do you have a vendor management program in place?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload Program Details",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 45,
                            "question": "Do you have a list of your service providers & vendors including access levels?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 46,
                            "question": "Do the agreements/controls mention clauses associated to security, confidentiality and privacy?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": "Incident Management ",
                    "questions": [
                        {
                            "id": 47,
                            "question": "Do you have an incident response plan",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 48,
                            "question": "Is there a process in place for reporting & responding to incidents? ",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 49,
                            "question": "Can you confirm if you have not been breached in the last 5 years",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload report if you have been",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 50,
                            "question": "Do you maintain an non-reportable Incident Report Log? If so, how many incidents occurred in last 12 months?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload log",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 51,
                            "question": "Do you have an incident response partner on call?",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": " Business continuity planning (BCP) & Disaster Recovery (DR)",
                    "questions": [
                        {
                            "id": 52,
                            "question": "Do you have a policy around business continuity and disaster recovery",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy / procedure",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 53,
                            "question": "Is there a process in place for reporting & responding to incidents? ",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload evidence from last test",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": " Data Governance ",
                    "questions": [
                        {
                            "id": 54,
                            "question": "Do you have a data classification & retention program?",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 55,
                            "question": "Do you have SLAs in place for retention of client data & covered information? ",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 56,
                            "question": "Will any non-domestic locations be used for storing, processing, or transmitting your customers' data.",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy, procedure and data flow diagram",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 57,
                            "question": "Do you have a DLP solution in place?",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 58,
                            "question": "Are system and network environments logically segmented to ensure protection and isolation of sensitive data?",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload architecture diagram",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 59,
                            "question": "For the Client Side Application please describe overall security, and data governance",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload client security document",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 60,
                            "question": "When a customer is exiting the service arrangement, are all computing resources of customer data sanitized?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 61,
                            "question": "Will you share user entitlement remediation and certification reports with your customers, if inappropriate access may have been allowed to customer data?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload policy",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 62,
                            "question": "Do you have a documented procedure for responding to requests for customer data from governments or third parties?",
                            "severity": "medium",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload procedure ",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                },
                {
                    "group": "Hosting",
                    "questions": [
                        {
                            "id": 63,
                            "question": "Are any of your datacenters located in places which have a high probability/occurrence of high-impact environmental risks (floods, tornadoes, earthquakes, hurricanes, etc.)? If yes please provide comments.",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 64,
                            "question": "Do you have controls in place to prevent data leakage or intentional/accidental compromise between customers in a multi-tenant environment?",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 65,
                            "question": "Are you hosted on public cloud? If yes, which one?",
                            "severity": "low",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 66,
                            "question": "Please describe the proposed service/solution and a summary of its overall architecture.",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload evidence",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        },
                        {
                            "id": 67,
                            "question": "Please describe the integration points for the solution to other systems or infrastructure provided by the customer, including what types of data are accessed (e.g. credit card numbers, PHI, PII).",
                            "severity": "high",
                            "files": [],
                            "fields": [
                                {
                                    "type": "text",
                                    "label": "Additional Comments",
                                    "value": ""
                                },
                                {
                                    "type": "radio",
                                    "label": "Select",
                                    "value": null,
                                    "radio_options": [
                                        "Yes",
                                        "No"
                                    ]
                                }
                            ],
                            "doc_upload_label": "Upload document",
                            "is_mandatory": "N",
                            "notes": "",
                            "repeat_after": "1",
                            "repeat_after_unit": "month",
                            "is_complete": "N"
                        }
                    ]
                }
            ]
        },
        "vendor": {
            "org_vendor_id": 51,
            "unique_guid": "e1def694-0844-4d52-9139-18e2eb74f066",
            "triggered_on": "May 09, 2022",
            "score": "7",
            "completion_pct": "9",
            "expires_on": "May 31, 2022",
            "vendor_status": "reverted",
            "admin_status": "failed",
            "vendor_name": "Avneesh paliya 123",
            "vendor_email": "avneesh123@mailinator.com",
            "vendor_category": "Critical (Major)"
        }
    }
    
    const getBlobImg =  async(url) => {
        let payloadUrl = `${url}`
        let method = "GET";
        let response = await ApiService.fetchFile(payloadUrl, method);
        let jsonResponse = response.clone()
        let res = await response.arrayBuffer();
        if (res) {
            let contentType = response && response.headers.get('content-type') ? response.headers.get('content-type') : 'application/pdf';
            if (contentType.indexOf('application/json') == -1) {
                var blob = new Blob([res], { type: contentType });
                let imgUrl = window.URL.createObjectURL(blob)
                setPageBgImg(imgUrl)
                return imgUrl
            }else{
                return false
            }
        }
}


    return (
        
        <React.Fragment>
            <PDFViewer width={'100%'} height={'500'}><AirPdf {...pdfData} /></PDFViewer>
            {/* <PdfDetailSummary {...pdfData} /> */}
        </React.Fragment>
        
    )
}

export default PdfWelcome