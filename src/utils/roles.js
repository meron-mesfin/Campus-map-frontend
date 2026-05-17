/** Maps internal snake_case role values to human-readable labels. */
export function displayRole(role) {
  switch (role) {
    case 'system_admin': return 'System Admin';
    case 'campus_admin': return 'Campus Admin';
    default:             return 'User';
  }
}
