import NotificationsPage from '../shared/NotificationsPage'
import EmployeeNavbar from '../../components/employee/EmployeeNavbar'

export default function EmployeeNotifications() {
  return <NotificationsPage role="employee" Sidebar={EmployeeNavbar} layout="top" />
}
