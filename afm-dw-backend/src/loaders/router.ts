import express from 'express';
import {auth} from '../middleware/authorization';
import {userLogin, userTokenRefresh, appConfig} from '../controllers/auth';
import {unCript} from '../utils/unCript';
import {department_get,department_put} from '../controllers/department';
import {organization_get} from '../controllers/organization';
import {entity_type_get, entity_table_word_get, declination_get, language_get, gender_get, inflected_word_put, inflected_word_post, inflected_word_get} from '../controllers/inflected_word';
import {employee_get, employee_salarylist, employee_invoclist, employee_put, employee_opvlist, employee_acsdata, employee_get_positions, employee_scud, employee_get_lates, employee_work_list, employee_get_access_department_list, employee_get_birthday, employee_get_lates_create_xls} from '../controllers/employee';
import {search} from '../controllers/search';
import {request_get, request_get_subordinates, request_get_status, request_characteristic_get, request_send_post, request_generate_post, request_submit_for_revision, request_edit_put, request_details_get_list, request_details_get_catalog, generateApproveRank, generateApproveTimesheet, externalDocumentProcessing, employee_affordable_vacation, request_deactivate, request_delete} from '../controllers/request';

import {request_approve_get, request_approve_post} from '../controllers/request_approve';
import {request_approve_rule_get, request_approve_refs, request_approve_rule_post, request_approve_rule_put, request_approve_rule_del, request_approve_rule_item_get, request_approve_rule_item_post, request_approve_rule_item_put, request_approve_rule_item_del} from '../controllers/request_approve_rules';
import {language_user_put} from '../controllers/language';
import {lov_get, lov_post, lov_put} from '../controllers/lov';
import {add_view_event, event_get, event_get_files, event_post, event_put} from '../controllers/event';
import {entry_get,entry_post,entry_put,entry_delete} from '../controllers/entry';
import {create_user, change_user} from '../controllers/user';
import { file_disable, file_get, file_get_download, file_post, file_put, get_file_name, get_file_api, file_link_get } from '../controllers/file';
import {media_get} from '../controllers/media';
import {doc_get, doc_getJbk, doc_getPen, doc_getExp, doc_getHoliday, get_holidays, pdf_workplace} from '../controllers/doc';
import {know_base_get, know_base_post, know_base_delete, know_base_put} from '../controllers/know_base';
import {test_get, test_question_get, test_answer_get, test_post, createTestQuestion, test_answer_post, test_put, putTestQuestion, test_answer_put, createTestSession, putTestSession, getTestList, test_question_rel_post, test_question_rel_put, getTestSession, getTestSessionAnswer} from '../controllers/test_question';
import {get_reference, get_reference_pdf} from '../controllers/reference';
import {call_history} from '../middleware/call_history';
import {getRatingTest, getKnowLevel, getRatingActive} from '../controllers/rating';
import {get_order_types, get_order} from '../controllers/order';
import {kpi_tab_get, kpi_tab_post, kpi_slide_get, kpi_slide_post} from '../controllers/kpi_tab';
import {application_get, application_post} from '../controllers/application';
import {create_comment, get_comment, edit_comment, add_file_to_comment} from '../controllers/comment';
import {get_chats, post_chats, get_messages, post_message, get_chat_users, get_mess_users, edit_chat_users, get_unreaded_message, read_message, post_message_file, message_delete, last_messages, hide_chat, show_hidden_chat} from '../controllers/messenger'
import {get_report, get_ind_report, get_ind_report_detail} from '../controllers/report';

import { create_approve_pass_request, create_pass_request, create_pass_request_visitor, delete_pass_request_visitor, edit_pass_request, edit_pass_request_visitor, get_buildings, get_document_type, get_pass_request, get_pass_request_visitor, get_pass_request_visitor_history, pass_request_visitor_get_by_days, post_pass_request_file, prv_next_status_post } from '../controllers/pass_request';
import { create_notification, get_notification, put_notification } from '../controllers/notification';
import { get_age_limit, get_count_rank, get_erdr } from '../controllers/remote_erdr';

import { post_email, get_email_boxes, get_email_in_boxes_base, get_email_in_boxe_and_add_flag, get_email_in_boxe_and_del_flag, get_email_in_boxe_and_move_to_trash, get_email_in_boxe_and_move_to, get_important_email, get_personal_address_list, read_email, email_servers, email_accounts, email_server_post, email_server_put, email_account_post, email_account_put, email_account_check} from '../controllers/email';
import { approve_get, approve_item_get, approve_redirect, approve_request_create, approve_request_final, approve_request_item_create, approve_request_item_delete, approve_request_item_orders_put, approve_request_item_put, create_report_last_approver } from '../controllers/approve';
import { employee_file_get, employee_file_post, employee_file_put, get_candidate_department, get_candidate_dictionary, post_candidate, put_candidate, check_for_create_candidate } from '../controllers/candidate';
import { get_relation, get_relation_types, post_relation, put_relation } from '../controllers/relation';
import { chapter_get, chapter_put, detail_get, detail_put, report_form_full_get, report_form_get, report_full_form_post, report_form_put, chapter_post, details_post, report_form_post, period_get, rf_detail_delete, rf_chapter_delete, rf_item_delete, report_details_get_list, report_details_list_add, report_details_list_delete } from '../controllers/reports/report_form';
import { report_post, report_get, report_full_get, report_generate, report_put, detail_delete, detail_create, detail_edit, report_form_get_exist, report_form_by_department, report_get_xls } from '../controllers/reports/report';
import { add_report_form_access_list, delete_report_form_access_list, get_report_form_access_list } from '../controllers/report_form_access';

import { create_feedback, get_feedback, get_feedback_contacts, put_feedback } from '../controllers/feedback';
import { add_expert, add_expert_adviser, change_status_appeal, create_appeal, create_expert_group, delete_expert_group, del_expert, edit_appeal, get_appeal, get_appeal_history, get_appeal_types, get_appeal_votes, get_expert_adviser, get_one_appeal, get_public_appeal, post_appeal_vote, get_appeal_rating, add_expert_ref, del_expert_ref, appeals_create_xlsx } from '../controllers/appeal';
import { change_status_servicerequest, create_servicerequest, edit_servicerequest, get_one_servicerequest, get_servicerequests, get_servicerequest_types, get_servicerequest_history, get_servicerequest_characteristic_list, post_servicerequest_characteristic_list, delete_servicerequest_characteristic_list, getServicerequestsCount } from '../controllers/servicerequest';
import { add_performer, add_performer_group, add_service_category, add_service_subcategory, delete_performer, delete_performer_group, delete_service_category, delete_service_subcategory, edit_performer, edit_performer_group, edit_service_category, edit_service_subcategory, get_performer, get_performer_group, get_service_category, get_service_subcategory } from '../controllers/service_admin';
import { create_another_user, get_performer_user, update_another_user } from '../controllers/another_user';
import { servicerequest_characteristic_list_create_db } from '../db_apis/servicerequest';



export const routes = (app: express.Application) => {
    const api: string = "/api/1.0";
    const router: express.Router = express.Router();

    router.post('/user', create_user);
    router.put('/user/:id', unCript, change_user);

    router.post('/auth/login', userLogin);
    router.get('/auth/refresh', userTokenRefresh);

    router.get('/app/config', appConfig);

    router.post('/external/generate_approve_rank', generateApproveRank);
    router.post('/external/generate_approve_timesheet', generateApproveTimesheet);
    router.post('/external/document_processing', externalDocumentProcessing);
    router.get('/department/:id?', unCript, department_get);
    router.get('/department/:id/employee', unCript, department_get); 
    router.put('/department/:id', unCript, department_put);

    router.get('/organization/:id?', unCript, organization_get);
    router.get('/organization/:id/employee', unCript, organization_get);
    router.get('/positions', employee_get_positions)

    router.get('/employee/:id?', unCript, employee_get); 
    router.get('/employee/:iin/salarylist', unCript, employee_salarylist) 
    router.get('/employee/:iin/invoclist', unCript, employee_invoclist); 
    router.put('/employee/:id', unCript, employee_put);  
    router.get('/employee/:iin/opvlist', unCript, employee_opvlist)  
    router.get('/employee/:iin/acsdata', unCript, employee_acsdata)  
    router.get('/employee/:iin/employee_scud', unCript, employee_scud)  
    router.get('/employee/:none/latecomes', unCript, employee_get_lates) 
    router.get('/employee/:none/birthday', unCript, employee_get_birthday)  
    router.get('/employee/:none/latecomes/xls', unCript, employee_get_lates_create_xls)  

    router.get('/employeeworklist/:iin/:bin', unCript, employee_work_list) 
    router.get('/employee/:none/access_department_list', unCript, employee_get_access_department_list) 

    router.get('/search', search); 

    router.get('/request-subordinates/:id?', unCript, request_get_subordinates);
    router.get('/request/:id?', unCript, request_get);
    router.put('/request-deactivate/:approve_request_id', unCript, request_deactivate)
    router.get('/employee-affordable-vacation/:identification_number', unCript, employee_affordable_vacation)
    router.put('/request-delete/:id', unCript, request_delete)
    router.put('/request/:requestId?', unCript, request_send_post)
    router.put('/request-edit/:id', unCript, request_edit_put)
    router.put('/submit-for-revision/request/:approve_request_id', unCript, request_submit_for_revision)
    router.post('/request', unCript, request_generate_post);
    router.get('/request-characteristic/:sub_type_id', unCript, request_characteristic_get)
    router.get('/characteristic/list/:characteristic_id', unCript, request_details_get_list)
    router.get('/characteristic/catalog/:catalog_name', unCript, request_details_get_catalog)

    router.post('/Soap_Approve_Request', request_get_status); 

    router.get('/request-approve', request_approve_get);
    router.post('/request-approve', request_approve_post);
    router.get('/request-approve-rule', request_approve_rule_get); 
    router.post('/request-approve-rule', request_approve_rule_post); 
    router.put('/request-approve-rule', request_approve_rule_put);  
    router.delete('/request-approve-rule/:id', unCript, request_approve_rule_del); 
    router.get('/request-approve-refs', request_approve_refs); 

    router.get('/request-approve-rule-item/:id', unCript, request_approve_rule_item_get);
    router.post('/request-approve-rule-item', request_approve_rule_item_post);
    router.put('/request-approve-rule-item', request_approve_rule_item_put);
    router.delete('/request-approve-rule-item/:id', unCript, request_approve_rule_item_del);
    router.put('/lang/:lang_code', language_user_put); 

    router.put('/views-count/event/:event_id', unCript, add_view_event);
    router.get('/event/:id?', unCript, event_get);
    router.post('/event', event_post);
    router.put('/event/:id', unCript, event_put);
    router.get('/event/files/:id', unCript, event_get_files);

    router.get('/entry/:id?', unCript, entry_get); 
    router.post('/entry', entry_post); 
    router.put('/entry/:id', unCript, entry_put); 
    router.delete('/entry/:id', unCript, entry_delete) 

     router.get('/lov/:table_name', lov_get);
     router.post('/lov', unCript, lov_post);
     router.put('/lov/:id', unCript, lov_put);

    router.get('/file-link/:id?', file_link_get);
    router.get('/file/:id?', file_get);
    router.get('/fileDownload/:id?', file_get_download);
    router.get('/media', media_get);
    router.post('/file', file_post);
    router.put('/file/:id', file_put);
    router.put('/file-disable/:id', file_disable);  
    router.get('/file/name/:id', get_file_name);  


    router.get('/entity_type', entity_type_get); 
    router.get('/declination', declination_get); 
    router.get('/language', language_get); 
    router.get('/gender', gender_get); 
    router.get('/inflected_word/:id', unCript, inflected_word_get); 
    router.get('/entity_table/:id', unCript, entity_table_word_get); 
    router.put('/inflected_word/:id', unCript, inflected_word_put); 
    router.post('/inflected_word', inflected_word_post); 

    router.post('/reference/doc_workplace', doc_get); 
    router.post('/reference/pdf_workplace', pdf_workplace); 
    router.post('/reference/doc_jbk', doc_getJbk); 
    router.post('/reference/doc_getHoliday', doc_getHoliday);  
    router.post('/reference/doc_Pen', doc_getPen); 
    router.post('/reference/doc_Exp', doc_getExp); 
    router.get('/reference/get_object', get_reference); 
    router.get('/reference/get_worklist', get_reference); 
    router.get('/reference/pdf_object', get_reference_pdf); 
    router.get('/reference/pdf_worklist', get_reference_pdf); 
    router.get('/reference/pdf_candidate', get_reference_pdf); 

    router.get('/know_base/:id?', unCript, know_base_get); 
    router.put('/know_base/:id', unCript, know_base_put); 
    router.post('/know_base', know_base_post); 
    router.delete('/know_base/:id', unCript, know_base_delete); 

    router.get('/test/:id?', unCript, test_get); 
    router.get('/test_question/:id?', unCript, test_question_get); 
    router.get('/test_answer/:id?', unCript, test_answer_get); 
    router.post('/test', test_post); 
    router.post('/test_question_rel', test_question_rel_post); 
    router.put('/test_question_rel', test_question_rel_put); 
    router.post('/test_answer', test_answer_post); 
    router.put('/test', test_put); 
    router.put('/test_answer', test_answer_put); 


    router.post('/test/:testId/employee/:employeeId', unCript, createTestSession); 
    router.put('/test/:testId/employee/:employeeId/testSession/:testSessionId', unCript, putTestSession); 
    router.post('/testQuestion', createTestQuestion); 
    router.put('/testQuestion', putTestQuestion); 
    router.get('/test-lists', getTestList) 
    router.get('/test-session', getTestSession) 
    router.get('/test-session-answer', getTestSessionAnswer) 

    router.get('/test-rating', getRatingTest) 
    router.get('/know-level', getKnowLevel) 
    router.get('/rating-active', getRatingActive) 

        router.get('/order-types', get_order_types) 
    router.get('/order/:iin', unCript, get_order) 

    router.get('/kpi/tab', kpi_tab_get) 
    router.post('/kpi/tab/:tab_id?', unCript, kpi_tab_post) 
    router.get('/kpi/slide/:tab_id?', unCript, kpi_slide_get) 
    router.post('/kpi/slide/:id?', unCript, kpi_slide_post) 

    router.get('/application', application_get) 
    router.post('/application/:id?', unCript, application_post) 

    router.get('/discussion/:id?', get_comment) 
    router.post('/discussion', unCript, create_comment) 
    router.post('/discussion-file', unCript, add_file_to_comment) 
    router.put('/discussion/:id', unCript, edit_comment) 

    router.get('/notification/:id?', get_notification) 
    router.post('/notification', unCript, create_notification) 
    router.put('/notification/:id', unCript, put_notification) 

    router.get('/messenger/chats', unCript, get_chats);
    router.post('/messenger/chats', unCript, post_chats)
    router.get('/messenger/messages/:chat_id', unCript, get_messages);
    router.post('/messenger/messages', post_message);
    router.post('/messenger/messages/file', post_message_file);
    router.get('/messenger/chatusers/:chat_id', unCript, get_chat_users);
    router.put('/messenger/chatusers/:chat_id', unCript, edit_chat_users);
    router.get('/messenger/users', unCript, get_mess_users);
    router.post('/messenger/messages/status', unCript, get_unreaded_message);
    router.post('/messenger/messages/status/:chat_id', unCript, read_message);
    router.put('/messenger/messages/delete', unCript, message_delete)
    router.post('/messanger/last', last_messages)
    router.post('/messager/chat_hide', hide_chat)
    router.post('/messager/hidden_chat_show', show_hidden_chat)
    router.post('/messager/messages/read', read_message)

    router.get('/pass-request-visitors-by-days/', unCript, pass_request_visitor_get_by_days)
    router.post('/pass-request-file/', post_pass_request_file)
    router.get('/pass-request/:id?', unCript, get_pass_request)
    router.get('/pass-request-visitor/:id?', unCript, get_pass_request_visitor)
    router.post('/pass-request', unCript, create_pass_request);
    router.put('/pass-request/:id', unCript, edit_pass_request);
    router.put('/pass-request-visitor/:id', unCript, edit_pass_request_visitor);
    router.post('/pass-request-visitor', unCript, create_pass_request_visitor);
    router.delete('/pass-request-visitor/:id', delete_pass_request_visitor);
    router.get('/pass-request-document-types', unCript, get_document_type);
    router.post('/pass-request-visitor-next-status/:pass_request_visitor', unCript, prv_next_status_post)
    router.get('/pass-request-visitor-history', unCript, get_pass_request_visitor_history)
    router.post('/pass-approve-request', unCript, create_approve_pass_request)
    router.get('/buildings/:organization_id', unCript, get_buildings)
    router.get('/approve/item', unCript, approve_item_get)
    router.get('/approve', unCript, approve_get)
    router.post('/approve/item/project', unCript, approve_request_item_create)
    router.post('/approve/request/project', unCript, approve_request_create)
    router.post('/approve/item', unCript, approve_request_item_put)
    router.post('/approve/item/redirect', unCript, approve_redirect)
    router.put('/approve/request/:id?', unCript, approve_request_final)
    router.put('/approve/item-delete/:ar_item_id', unCript, approve_request_item_delete)
    router.put('/approve/item/:id?', unCript, approve_request_item_orders_put)
    router.get('/remote-erdr', unCript, get_erdr); 
    router.get('/age-limit', unCript, get_age_limit) 
    router.get('/count-rank', unCript, get_count_rank) 
    router.get('/report', unCript, get_report); 
    router.get('/ind_report', unCript, get_ind_report); 
    router.get('/ind_report/detail', unCript, get_ind_report_detail); 

    router.get('/report_access_list/:report_form_id', unCript, get_report_form_access_list);
    router.post('/report_access_list', unCript, add_report_form_access_list);
    router.delete('/report_access_list/:id', unCript, delete_report_form_access_list);
    router.post('/email', unCript, post_email)
    router.get('/emailinbox_base',  unCript, get_email_in_boxes_base);
    router.get('/emailbox',  unCript, get_email_boxes)
    router.post('/email/addflag', unCript, get_email_in_boxe_and_add_flag)
    router.get('/file-api', unCript, get_file_api); 

    router.get('/relationTypes',  unCript, get_relation_types);
    router.get('/relation',  unCript, get_relation);
    router.post('/relation',  unCript, post_relation);
    router.put('/relation',  unCript, put_relation);
    router.get('/candidate/department',  unCript, get_candidate_department);
    router.get('/candidate/check-for-create',  unCript, check_for_create_candidate);
    router.post('/candidate/',  unCript, post_candidate);
    router.put('/candidate/:id',  unCript, put_candidate);
    router.get('/candidate/dictionary',  unCript, get_candidate_dictionary);
    router.post('/candidate/file',  unCript, employee_file_post);
    router.get('/candidate/file',  unCript, employee_file_get);
    router.put('/candidate/file/:id',  unCript, employee_file_put);
    router.post('/email/delflag', unCript, get_email_in_boxe_and_del_flag)
    router.post('/email/totrash', get_email_in_boxe_and_move_to_trash)
    router.post('/email/moveto', get_email_in_boxe_and_move_to)
    router.get('/email/important',  unCript, get_important_email);
    router.get('/email/personal_address_list',  unCript, get_personal_address_list);
    router.post('/email/read',  unCript,  read_email);

    router.get('/email/servers',  unCript, email_servers);
    router.post('/email/servers',  unCript, email_server_post);
    router.put('/email/servers/:id',  unCript, email_server_put);

    router.get('/email/accounts',  unCript, email_accounts);
    router.get('/email/account',  unCript, email_account_check);
    router.post('/email/accounts',  unCript, email_account_post);
    router.put('/email/accounts/:id',  unCript, email_account_put);
    router.post('/feedback', unCript, create_feedback)
    router.post('/feedback/quest', unCript, create_feedback)
    router.get('/feedback', unCript, get_feedback)
    router.put('/feedback/:id', unCript, put_feedback)
    router.get('/feedback/contacts', unCript, get_feedback_contacts)
    router.get('/report-form/report', unCript, report_form_get)
    router.get('/report-form/chapter/:report_id', unCript, chapter_get)
    router.get('/report-form/detail/:chapter_id', unCript, detail_get)
    router.post('/report-form/report', unCript, report_form_post)
    router.post('/report-form/chapter', unCript, chapter_post)
    router.post('/report-form/detail', unCript, details_post)
    router.get('/report-form-full/:id?', unCript, report_form_full_get)
    router.post('/report-form', unCript, report_full_form_post)
    router.put('/report-form/report/:id', unCript, report_form_put)
    router.put('/report-form/chapter/:id', unCript, chapter_put)
    router.put('/report-form/detail/:id', unCript, detail_put)
    router.put('/report-form-delete/:id', unCript, rf_detail_delete)
    router.put('/report-form-chapter-delete/:id', unCript, rf_chapter_delete)
    router.put('/report-form-item-delete/:id', unCript, rf_item_delete)

    router.post('/report-fill', unCript, report_post)
    router.get('/report-form-by-department', unCript, report_form_by_department)
    router.get('/report-form-exist', unCript, report_form_get_exist)
    router.get('/report-fill', unCript, report_get)
    router.get('/report-full/:id', unCript, report_full_get)
    router.post('/report-generate/:id', unCript, report_generate)
    router.put('/report', unCript, report_put)
    router.put('/report/detail-delete', unCript, detail_delete)
    router.put('/report/detail', unCript, detail_edit)
    router.post('/report/detail', unCript, detail_create)
    router.get('/report-full/download/:period_id/:report_form_id', unCript, report_get_xls)

    router.get('/report-item-characteristic/:report_item_id', unCript, report_details_get_list)
    router.post('/report-item-characteristic', unCript, report_details_list_add)
    router.put('/report-item-characteristic-delete/:id', unCript, report_details_list_delete)
    
    router.get('/report/period', unCript, period_get)
    router.post('/report/add-last-approver', unCript, create_report_last_approver)
    router.get('/appeal/types', unCript, get_appeal_types)
    router.get('/appeal', unCript, get_appeal)
    router.get('/appeal/rating', unCript, get_appeal_rating)
    router.get('/appeal/one/:id', unCript, get_one_appeal)
    router.post('/appeal', unCript, create_appeal)
    router.put('/appeal/:id', unCript, edit_appeal)
    router.put('/appeal/status/:id', unCript, change_status_appeal)
    router.get('/appeal/status/history/:id', unCript, get_appeal_history)
    router.post('/appeal/:id/votes', unCript, post_appeal_vote)
    router.get('/appeal/:id/votes', unCript, get_appeal_votes)
    router.post('/appeal/expert_group', unCript, create_expert_group)
    router.post('/appeal/expert_group/delete', unCript, delete_expert_group)
    router.post('/appeal/expert_group/expert', unCript, add_expert)
    router.post('/appeal/expert_group/expert/delete', unCript, del_expert)
    router.get('/appeal/public', unCript, get_public_appeal)
    router.post('/appeal/expert/advisers', unCript, add_expert_adviser)
    router.get('/appeal/expert/advisers', unCript, get_expert_adviser)
    router.post('/appeal/expert_group/expert/ref', unCript, add_expert_ref)
    router.put('/appeal/expert_group/expert/ref/:id', unCript, del_expert_ref)
    router.get('/appeal/xlsx', unCript, appeals_create_xlsx)

    router.get('/servicerequests/types', unCript, get_servicerequest_types)
    router.get('/servicerequests', unCript, get_servicerequests)
    router.get('/servicerequests/count', unCript, getServicerequestsCount)
    router.get('/servicerequests/one/:id', unCript, get_one_servicerequest)
    router.post('/servicerequests', unCript, create_servicerequest)
    router.put('/servicerequests/:id', unCript, edit_servicerequest)
    router.put('/servicerequests/status/:id', unCript, change_status_servicerequest)
    router.get('/servicerequests/status/history/:id', unCript, get_servicerequest_history)
    router.get('/servicerequests/characteristic/:subcategory_id/:sr_id', unCript, get_servicerequest_characteristic_list)
    router.post('/servicerequests/characteristic/:subcategory_id', unCript, post_servicerequest_characteristic_list)
    router.put('/servicerequests/characteristic/:id', unCript, delete_servicerequest_characteristic_list)

    router.get('/service-admin/performer_group', unCript, get_performer_group)
    router.post('/service-admin/performer_group', unCript, add_performer_group)
    router.put('/service-admin/performer_group', unCript, edit_performer_group)
    router.put('/service-admin/performer_group/:id', unCript, delete_performer_group)
    router.get('/service-admin/performer/:performer_group_id', unCript, get_performer)
    router.post('/service-admin/performer', unCript, add_performer)
    router.put('/service-admin/performer', unCript, edit_performer)
    router.put('/service-admin/performer/:id', unCript, delete_performer)

    router.get('/service-admin/category', unCript, get_service_category)
    router.post('/service-admin/category', unCript, add_service_category)
    router.put('/service-admin/category', unCript, edit_service_category)
    router.put('/service-admin/category/:id', unCript, delete_service_category)
    router.get('/service-admin/subcategory', unCript, get_service_subcategory)
    router.get('/service-admin/subcategory/:category_id', unCript, get_service_subcategory)
    router.post('/service-admin/subcategory', unCript, add_service_subcategory)
    router.put('/service-admin/subcategory', unCript, edit_service_subcategory)
    router.put('/service-admin/subcategory/:id', unCript, delete_service_subcategory)


    router.post('/service-admin/another_user', unCript, create_another_user)
    router.put('/service-admin/another_user/:id', unCript, update_another_user)
    router.get('/service-admin/another_user/performers', unCript, get_performer_user)


    router.get('/get-holidays', unCript, get_holidays) 

        app.use(auth);

    app.use(api, router);

    app.use(call_history)

}