export interface base_get_bind {
    id?: number,
    lang?: string
}

export interface employee_get_binds extends base_get_bind{
    department_id?: number,
    organization_id?: number,
    text?: string,
    limit?: number,
    offset?: number,
    lang_id?: number,
    without_performers?: boolean
}

export interface user_get_bind {
    user_id?: number,
    user_name?: string
}

export interface Employee_Document {
    document_type_id: number,
    document_type_name: string,
    document_number: string,
    document_serial: string,
    document_issue_date: Date,
    document_valid_date: Date,
    document_issued_by: string
};

export interface EmployeeDocument {
    lang?: string,
    employee_id: number
}

export interface Employee_Contact {
    contact_info_type_id: number,
    contact_info_type_name: string,
    contact: string
};

export interface EmployeeContactBind {
    lang?: string,
    employee_id: number
}

export interface Employee_Education {
    education_type_name: string,
    education_form_name: string,
    education_profile_name: string,
    education_document_name: string,
    education_qualification_name: string,
    education_speciality_name: string,
    education_institution_name: string,
    employee_education_enrollment_date: Date,
    employee_education_graduation_date: Date,
    employee_education_number: number,
    employee_education_document_date: Date
};

export interface EmployeeEducationBind {
    lang?: string,
    employee_id: number
}

export interface Employee {
    position_external_id: string,
    id: number,
    last_name: string,
    first_name: string,
    middle_name: string,
    identification_number: number,
    personnel_number: string,
    employment_date: Date,
    move_date: Date,
    department_name: string,
    gender_name: string,
    marital_status_name: string,
    nationality_name: string,
    employee_type_name: string,
    employement_type_name: string,
    position_name: string,
    manager_id: number,
    manager_last_name: string,
    manager_first_name: string,
    manager_middle_name: string,
    employee_birth_date: Date,
    contacts?: any,
    documents?: any
    educations?: any,
    department_id: number,
    department_external_id: string,
    department_name_rus: string,
    position_name_rus: string
    gender_id: number,
    view_priority: number,
    is_disabled_pacs: boolean,
    organization_id: number
};

export interface Entry {
    entry_name: string,
    entry_description: string,
    entry_start: Date,
    entry_end: Date,
    entry_type_name: string,
    entry_status_name: string,
    color: string,
    last_name: string,
    first_name: string,
    middle_name: string
};

export interface EntryBind {
    user_id: number,
    id?: number,
    month: number,
    year: number,
    lang?: string
}

export interface Event {
    event_id: number,
    event_title: string,
    event_body: string,
    event_display_order: number,
    event_date: Date,
    publish_date: Date,
    image_link: string,
    event_type_name: string,
    event_status_name: string,
    event_priority_type_name: string,
    last_name: string,
    first_name: string,
    middle_name: string
};

export interface EventBind {
    lang: string,
    event_type: number,
    id?: number,
    limit: number,
    offset: number
}

export interface Language {
    id: number,
    name: string,
    code: string,
    is_active: boolean,
    create_date: Date,
    create_user: string,
    update_date: Date,
    update_user: string
};

export interface LanguageBind {
    lang_code?: string,
    default?: number
}

export interface department_get_binds extends base_get_bind{};

export interface Department {
    id: number,
    parent_id: number,
    organization_id: number,
    organization_name: string,
    department_name: string,
    employee?: any,
    department?: any
}

export interface organization_get_binds extends base_get_bind{};
export interface Organization {
    id: number,
    parent_id: number,
    organization_id: number,
    organization_name: string,
    department_name: string,
    employee?: any,
    department?: any
}

export interface request_approve_get_binds {
    request_id?: number,
    lang?: string
}

export interface request_get_binds {
    id?: number,
    employee_id?: number,
    req_id?: number,
    sub_type?: number,
    lang?: string,
    date_from?: string,
    request_status?: number,
    is_application?: boolean,
    only_assigned_to_you?: boolean,
    page?: number,
    itemsperpage?: number,
    search_query?: string,
    get_full_data?: boolean,
}

export interface request_post_binds {
    employee_id?: number
}

export interface request_approve_rule_item_get_binds {
    request_id?: number,
    lang?: string,
    employee?: any
}

export interface ReferenceLog {
    service_type?: number,
    lang?: string,
    user_id?: number,
    employee_id?: number,
    req?: any,
    log_in?: string,
    iin?: string
}
export interface ReferenceLogAdd {
    id: number,
    log_out: string
}

export interface Entity {
    entity_type_id: number,
    entity_id: number
}