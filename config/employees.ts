export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
}

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Yared Kidus',
    email: 'yared.kidus@ahadu.com',
    department: 'Design',
    position: 'Lead Architect',
  },
  {
    id: '2',
    name: 'Kidus T',
    email: 'kidus.t@ahadu.com',
    department: 'Design',
    position: 'Architect',
  },
  {
    id: '3',
    name: 'John D',
    email: 'john.d@ahadu.com',
    department: 'Design',
    position: 'Senior Architect',
  },
  {
    id: '4',
    name: 'Sarah M',
    email: 'sarah.m@ahadu.com',
    department: 'Design',
    position: 'Designer',
  },
  {
    id: '5',
    name: 'Bisrat S',
    email: 'bisrat.s@ahadu.com',
    department: 'Design',
    position: 'Design Manager',
  },
  {
    id: '6',
    name: 'Martha G',
    email: 'martha.g@ahadu.com',
    department: 'Design',
    position: 'Junior Architect',
  },
  {
    id: '7',
    name: 'Eng. Tesfaye Bekele',
    email: 'tesfaye.bekele@ahadu.com',
    department: 'Construction',
    position: 'Resident Engineer',
  },
  {
    id: '8',
    name: 'Eng. Meron Hailu',
    email: 'meron.hailu@ahadu.com',
    department: 'Construction',
    position: 'Resident Engineer',
  },
  {
    id: '9',
    name: 'Eng. Samuel Desta',
    email: 'samuel.desta@ahadu.com',
    department: 'Construction',
    position: 'Resident Engineer',
  },
  {
    id: '10',
    name: 'Eng. Helen Tadesse',
    email: 'helen.tadesse@ahadu.com',
    department: 'Construction',
    position: 'Resident Engineer',
  },
  {
    id: '11',
    name: 'Eng. Dawit Mulugeta',
    email: 'dawit.mulugeta@ahadu.com',
    department: 'Construction',
    position: 'Resident Engineer',
  },
  {
    id: '12',
    name: 'Eng. Biruk Alemayehu',
    email: 'biruk.alemayehu@ahadu.com',
    department: 'Construction',
    position: 'Resident Engineer',
  },
];

export async function getAllEmployees(): Promise<Employee[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return MOCK_EMPLOYEES;
}

export function getEmployeeById(id: string): Employee | undefined {
  return MOCK_EMPLOYEES.find((emp) => emp.id === id);
}

export function getEmployeesByIds(ids: string[]): Employee[] {
  return MOCK_EMPLOYEES.filter((emp) => ids.includes(emp.id));
}











