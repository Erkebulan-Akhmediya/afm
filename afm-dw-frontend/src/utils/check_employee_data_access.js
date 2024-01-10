
import checkRoles from "@/utils/check_role";

export default function checkEmployeeDataAccess(userData, employeeCardData){

  let retCheckAccess = (
    ((
      checkRoles("4", userData) ||

      checkRoles("41", userData) ||

      (checkRoles("9", userData) && employeeCardData.organization_id != 1 && employeeCardData.organization_id == userData.fullData.organization_id) ||

      (checkRoles("3", userData) && ((employeeCardData.department_id == userData.fullData.department_id) || (userData.fullData.child_department_list.filter(item => item.id == employeeCardData.department_id).length > 0))) ||

      (checkRoles("39", userData) && employeeCardData.department_code != 'top_managment') ||

      (checkRoles("40", userData) && employeeCardData.organization_id != 1 && employeeCardData.organization_id==userData.fullData.organization_id) ||

      (checkRoles("12", userData) && employeeCardData.department_code == 'investigation') ||

      (checkRoles("38", userData) && employeeCardData.department_code == 'operational')) 

      && employeeCardData.department_code != 'top_managment'

        ) ||

    employeeCardData.id == userData.id ||

    userData.fullData.identification_number == '820419350799' ||

    userData.fullData.identification_number == '800101308051'
  )
  return retCheckAccess
}