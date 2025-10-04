export function getAdmin() {
  const admin = sessionStorage.getItem('admin');
  return admin ? JSON.parse(admin) : null;
}
export function getAdminToken() {
  return sessionStorage.getItem('adminToken');
} 