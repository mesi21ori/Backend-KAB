import type { Employee as DetailedEmployee } from '@/app/dashboard/employees/types/employee';
import type { Employee as SimpleEmployee } from '@/config/employees';

/**
 * Maps detailed Employee type (from GM employee management system) to simple Employee type
 * (used by TeamMemberSelector and other components)
 */
export function mapToSimpleEmployee(detailedEmployee: DetailedEmployee): SimpleEmployee {
  return {
    id: detailedEmployee.id,
    name: detailedEmployee.fullName,
    email: detailedEmployee.email,
    department: detailedEmployee.department,
    position: detailedEmployee.jobTitle,
  };
}

/**
 * Maps array of detailed employees to simple employees
 */
export function mapToSimpleEmployees(detailedEmployees: DetailedEmployee[]): SimpleEmployee[] {
  return detailedEmployees.map(mapToSimpleEmployee);
}

