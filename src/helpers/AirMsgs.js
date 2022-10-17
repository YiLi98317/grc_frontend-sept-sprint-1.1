const AIR_MSG = {
    //form succes msg type 0 = custom msg,type 1= msg layout 1
    form_success: (customMsg = '', ...params) => {
        let formMethod = params[0] ? params[0] : 'get', type = params[1] ? params[1] : 0
        let methodType = formMethod == 'get' ? 'fetched' : (formMethod == 'add' ? 'added' : (formMethod == 'update' ? 'updated' : 'deleted'))
        return type == 0 ? `${customMsg} ${methodType} successfully` : `${customMsg}`
    },
    form_err: (customMsg = '', ...params) => {
        let type = params[0] ? params[0] : 1, formMethod = params[1] ? params[1] : 'get'
        let methodType = formMethod == 'get' ? 'fetch' : (formMethod == 'add' ? 'add' : (formMethod == 'update' ? 'update' : 'delete'))
        return type == 0 ? `${customMsg} ${methodType} request failed` : `There is some technical difficulties, please try after some time`
    },
    // comon error msgs
    technical_err: "Something went wrong! Please try again later.",
    session_exp: "Your session has expired",
    no_task_assigned_msg: "No task assigned to you yet",
    //file msgs
    files_required:"Please select files",
    file_required:"Please select a file",
    select_valid_file_format:"Please select a valid file format",
    supported_file_format:"Supported Format : doc, docx, pdf, xls, xlsx, png, gif, jpg, jpeg, jfif, svg, webp",
    // Add new Project msgs
    project_name_required: "Project name is required",
    acc_name_required: "Account name is required",
    // Login,forgot password and change password Pages msgs
    email_required: "Email is required",
    password_required: "Password is required",
    password_mismatch: "* Passwords do not match",
    change_pwd_success: "Password changed successfully",

    // profile page msgs
    conf_password_required: "Confirm new password is required",
    update_profile_success: "Profile updated successfully",

    // Vendor Page Errors
    vendor_name_required: "Name is required",
    vendor_category_required: "Category is required",
    vendor_email_required: "Email is required",
    // Vendor Employee Page Errors
    vendor_emp_name_required: "Name is required",
    vendor_emp_email_required: "Email is required",
    vendor_emp_authority_required: "Authority is required",
    //vendor assessment page msgs
    
    stat_assessment_return: "Assessment returned successfully",
    stat_assessment_failed: "Assessment status has been updated as Failed",
    stat_assessment_approved: "Assessment status has been updated as Approved",
    // vendor management page msgs
    vendor_exists: "Vendor already exists",
    add_tag_success: "Tags added successfully",
    // configuration and configuration scope msgs
    fname_required: "First Name is required",
    fname_invalid: "Invalid First Name",
    lname_required: "Last Name is required",
    lname_invalid: "Invalid Last Name",
    email_invalid: "Invalid Email",
    role_required: "Role is required",
    label_required: "Label is required",
    label_invalid: "Invalid Label",
    access_token_required: "Access token is required",
    third_party_service_required: "Please select a third party service",
    service_required: "Please select a service",
    employee_required: "Employee is required",
    consultant_required: "Consultant is required!",
    endpoint_required: "End point is required",
    server_required: "Server is required",
    mobile_device_required: "Mobile Device is required!",
    vendor_required: "Vendor name is required",
    utility_required: "Utility name is required",
    designation_required: "Actual Designation is required",
    
    add_account_success: "Account added successfully",
    add_framework_success: "Framework added successfully",
    add_member_success: "Member added successfully",
    add_service_partner_success: "Service Partner added successfully",
    add_auditor_success: "Auditor added successfully",
    add_task_owner_success: "Task Owner added successfully",
    add_access_token_success: "Access token added successfully",
    add_people_success: "People added successfully",
    add_assets_success: "Assets added successfully",
    add_vendor_success: "Vendor added successfully",
    add_utility_success: "Utility added successfully",
    add_utilities_success: "Utilities added successfully",

    update_tps_token_success: "Third party serivce token updated successfully",

    // vendor questionnaire msgs
    add_template_success: "Template saved successfully",
    update_template_success: "Template updated successfully",
    del_template_success: "Template deleted successfully",

    category_required: "Category is required",
    approval_authority_required: "Approval authority is required",

    create_task_success: "Task created successfully",
    create_task_failed: "Task create request failed",

    task_details_update_success: "Details updated successfully",
    task_frequency_update_success: "Task frequency updated successfully",
    Evidence_mark_applicable_success: "Evidence has been marked as applicable",
    Evidence_mark_not_applicable_success: "Evidence has been marked as not applicable",
    task_recall_success: "Task recalled successfully",
    task_return_success: "Task returned successfully",
    task_snd_approval_success: "Task has been sent for approval",

    add__success: "",
    update__success: "",
    del__success: "",
    //sustenance Configuration Asset Register
    asset_upload: "Document uploaded successfully",



}

export default AIR_MSG