export default function checkRoles(role, userData){
  let roleList
  if (typeof userData.role === "object") {
    roleList = userData.role
  } else {
    roleList = userData.role.split(";")
  }
  if (roleList.includes(role)) return true
  return false
}