/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

export interface UserItem {
  id: string;
  name: string;
  email: string;
  designation: string;
  phone: string;
  department: string;
  role: string;
  state?: string;
  district?: string;
  gender: 'Male' | 'Female' | 'Other';
  joinedDate: string;
  status: 'Active' | 'Inactive';
  avatarInitials: string;
  avatarColor: string;
}

/* ─────────────────────────────────────────────
   NSS USERS
───────────────────────────────────────────── */

export const NSS_USERS: UserItem[] = [
  {
    id: 'nss-001',
    name: 'Dr. Anjali Verma',
    email: 'anjali.verma@nss.gov.in',
    designation: 'National Programme Director',
    phone: '+91 98100 11001',
    department: 'NSS Headquarters',
    role: 'NSS Admin',
    gender: 'Female',
    joinedDate: '15 Mar 2019',
    status: 'Active',
    avatarInitials: 'AV',
    avatarColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'nss-002',
    name: 'Mr. Rajendra Nair',
    email: 'rajendra.nair@nss.gov.in',
    designation: 'Deputy Director (Operations)',
    phone: '+91 97120 22002',
    department: 'NSS Operations',
    role: 'NSS Manager',
    gender: 'Male',
    joinedDate: '02 Jun 2020',
    status: 'Active',
    avatarInitials: 'RN',
    avatarColor: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'nss-003',
    name: 'Ms. Pooja Iyer',
    email: 'pooja.iyer@nss.gov.in',
    designation: 'Finance Officer',
    phone: '+91 93100 33003',
    department: 'NSS Finance',
    role: 'Finance Officer',
    gender: 'Female',
    joinedDate: '10 Jan 2021',
    status: 'Active',
    avatarInitials: 'PI',
    avatarColor: 'from-pink-500 to-rose-600',
  },
  {
    id: 'nss-004',
    name: 'Mr. Suresh Pandey',
    email: 'suresh.pandey@nss.gov.in',
    designation: 'Training & Monitoring Officer',
    phone: '+91 88010 44004',
    department: 'NSS Training',
    role: 'Training Officer',
    gender: 'Male',
    joinedDate: '05 Aug 2018',
    status: 'Active',
    avatarInitials: 'SP',
    avatarColor: 'from-orange-500 to-amber-600',
  },
  {
    id: 'nss-005',
    name: 'Dr. Kavitha Reddy',
    email: 'kavitha.reddy@nss.gov.in',
    designation: 'Research & Documentation Head',
    phone: '+91 90900 55005',
    department: 'NSS Research',
    role: 'Research Head',
    gender: 'Female',
    joinedDate: '20 Nov 2017',
    status: 'Inactive',
    avatarInitials: 'KR',
    avatarColor: 'from-teal-500 to-emerald-600',
  },
];

/* ─────────────────────────────────────────────
   PMU USERS
───────────────────────────────────────────── */

export const PMU_USERS: UserItem[] = [
  {
    id: 'pmu-001',
    name: 'Mr. Vinod Sharma',
    email: 'vinod.sharma@pmu.nss.in',
    designation: 'PMU Head',
    phone: '+91 99800 10001',
    department: 'Programme Management Unit',
    role: 'PMU Admin',
    gender: 'Male',
    joinedDate: '01 Apr 2020',
    status: 'Active',
    avatarInitials: 'VS',
    avatarColor: 'from-indigo-500 to-violet-600',
  },
  {
    id: 'pmu-002',
    name: 'Ms. Deepa Menon',
    email: 'deepa.menon@pmu.nss.in',
    designation: 'Programme Analyst',
    phone: '+91 98450 20002',
    department: 'Programme Management Unit',
    role: 'Analyst',
    gender: 'Female',
    joinedDate: '15 Sep 2021',
    status: 'Active',
    avatarInitials: 'DM',
    avatarColor: 'from-fuchsia-500 to-purple-600',
  },
  {
    id: 'pmu-003',
    name: 'Mr. Arun Bose',
    email: 'arun.bose@pmu.nss.in',
    designation: 'MIS Officer',
    phone: '+91 96540 30003',
    department: 'MIS & Data',
    role: 'MIS Officer',
    gender: 'Male',
    joinedDate: '10 Mar 2019',
    status: 'Active',
    avatarInitials: 'AB',
    avatarColor: 'from-sky-500 to-blue-600',
  },
  {
    id: 'pmu-004',
    name: 'Ms. Rekha Singh',
    email: 'rekha.singh@pmu.nss.in',
    designation: 'Communications Officer',
    phone: '+91 94560 40004',
    department: 'Communications',
    role: 'Comms Officer',
    gender: 'Female',
    joinedDate: '08 Jul 2022',
    status: 'Active',
    avatarInitials: 'RS',
    avatarColor: 'from-rose-500 to-pink-600',
  },
  {
    id: 'pmu-005',
    name: 'Mr. Nikhil Joshi',
    email: 'nikhil.joshi@pmu.nss.in',
    designation: 'Field Coordinator',
    phone: '+91 93210 50005',
    department: 'Field Operations',
    role: 'Field Coordinator',
    gender: 'Male',
    joinedDate: '22 Feb 2023',
    status: 'Active',
    avatarInitials: 'NJ',
    avatarColor: 'from-lime-500 to-green-600',
  },
  {
    id: 'pmu-006',
    name: 'Ms. Smita Kulkarni',
    email: 'smita.kulkarni@pmu.nss.in',
    designation: 'Finance Executive',
    phone: '+91 91200 60006',
    department: 'Finance',
    role: 'Finance Executive',
    gender: 'Female',
    joinedDate: '14 Dec 2020',
    status: 'Inactive',
    avatarInitials: 'SK',
    avatarColor: 'from-amber-500 to-orange-600',
  },
];

/* ─────────────────────────────────────────────
   PROGRAM UNIT USERS (State → District → Users)
───────────────────────────────────────────── */

export interface ProgramUnitUser extends UserItem {
  state: string;
  district: string;
  unitName: string;
}

export const PROGRAM_UNIT_USERS: ProgramUnitUser[] = [
  // Maharashtra – Pune
  {
    id: 'pu-usr-001',
    name: 'Dr. Rajesh Kulkarni',
    email: 'rajesh.kulkarni@coep.ac.in',
    designation: 'Programme Officer',
    phone: '+91 94220 11234',
    department: 'NSS Unit – COEP',
    role: 'Programme Officer',
    state: 'Maharashtra',
    district: 'Pune',
    unitName: 'NSS Unit - COEP Technological University',
    gender: 'Male',
    joinedDate: '01 Jun 2015',
    status: 'Active',
    avatarInitials: 'RK',
    avatarColor: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'pu-usr-002',
    name: 'Prof. Anita Deshmukh',
    email: 'anita.deshmukh@sitpune.edu.in',
    designation: 'Programme Officer',
    phone: '+91 98220 34567',
    department: 'NSS Unit – SIT',
    role: 'Programme Officer',
    state: 'Maharashtra',
    district: 'Pune',
    unitName: 'NSS Unit - Symbiosis Institute of Technology',
    gender: 'Female',
    joinedDate: '12 Aug 2017',
    status: 'Active',
    avatarInitials: 'AD',
    avatarColor: 'from-pink-500 to-rose-600',
  },
  {
    id: 'pu-usr-003',
    name: 'Dr. Sunita Joshi',
    email: 'sunita.joshi@fergusson.edu',
    designation: 'NSS Coordinator',
    phone: '+91 96570 89012',
    department: 'NSS Unit – Fergusson',
    role: 'NSS Coordinator',
    state: 'Maharashtra',
    district: 'Pune',
    unitName: 'NSS Unit - Fergusson College',
    gender: 'Female',
    joinedDate: '20 Jan 2010',
    status: 'Active',
    avatarInitials: 'SJ',
    avatarColor: 'from-teal-500 to-emerald-600',
  },
  // Maharashtra – Nagpur
  {
    id: 'pu-usr-004',
    name: 'Prof. Prakash Thakre',
    email: 'prakash.thakre@vnit.ac.in',
    designation: 'Programme Officer',
    phone: '+91 94200 45678',
    department: 'NSS Unit – VNIT',
    role: 'Programme Officer',
    state: 'Maharashtra',
    district: 'Nagpur',
    unitName: 'NSS Unit - VNIT Nagpur',
    gender: 'Male',
    joinedDate: '05 Mar 2012',
    status: 'Active',
    avatarInitials: 'PT',
    avatarColor: 'from-orange-500 to-amber-600',
  },
  {
    id: 'pu-usr-005',
    name: 'Dr. Meera Bhagat',
    email: 'meera.bhagat@nagpuruniversity.ac.in',
    designation: 'NSS State Liaison Officer',
    phone: '+91 98230 56789',
    department: 'NSS Unit – RTM',
    role: 'State Liaison Officer',
    state: 'Maharashtra',
    district: 'Nagpur',
    unitName: 'NSS Unit - RTM Nagpur University',
    gender: 'Female',
    joinedDate: '18 Sep 2008',
    status: 'Active',
    avatarInitials: 'MB',
    avatarColor: 'from-purple-500 to-violet-600',
  },
  // Maharashtra – Mumbai Suburban
  {
    id: 'pu-usr-006',
    name: 'Prof. Amit Shah',
    email: 'amit.shah@iitb.ac.in',
    designation: 'Programme Officer',
    phone: '+91 97690 12345',
    department: 'NSS Unit – IIT Bombay',
    role: 'Programme Officer',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    unitName: 'NSS Unit - IIT Bombay',
    gender: 'Male',
    joinedDate: '11 Nov 2014',
    status: 'Active',
    avatarInitials: 'AS',
    avatarColor: 'from-sky-500 to-blue-600',
  },
  // Rajasthan – Jaipur
  {
    id: 'pu-usr-007',
    name: 'Dr. Ramesh Sharma',
    email: 'ramesh.sharma@uniraj.ac.in',
    designation: 'NSS Coordinator',
    phone: '+91 94140 23456',
    department: 'NSS Unit – Univ. of Rajasthan',
    role: 'NSS Coordinator',
    state: 'Rajasthan',
    district: 'Jaipur',
    unitName: 'NSS Unit - University of Rajasthan',
    gender: 'Male',
    joinedDate: '22 Apr 2011',
    status: 'Active',
    avatarInitials: 'RS',
    avatarColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'pu-usr-008',
    name: 'Prof. Kavita Gupta',
    email: 'kavita.gupta@mnit.ac.in',
    designation: 'Programme Officer',
    phone: '+91 98290 67890',
    department: 'NSS Unit – MNIT',
    role: 'Programme Officer',
    state: 'Rajasthan',
    district: 'Jaipur',
    unitName: 'NSS Unit - MNIT Jaipur',
    gender: 'Female',
    joinedDate: '07 Feb 2016',
    status: 'Active',
    avatarInitials: 'KG',
    avatarColor: 'from-fuchsia-500 to-pink-600',
  },
  // Gujarat – Ahmedabad
  {
    id: 'pu-usr-009',
    name: 'Dr. Bhavesh Patel',
    email: 'bhavesh.patel@gujaratuniversity.ac.in',
    designation: 'NSS Programme Coordinator',
    phone: '+91 98254 34567',
    department: 'NSS Unit – Gujarat Univ.',
    role: 'NSS Programme Coordinator',
    state: 'Gujarat',
    district: 'Ahmedabad',
    unitName: 'NSS Unit - Gujarat University',
    gender: 'Male',
    joinedDate: '14 Jul 2013',
    status: 'Active',
    avatarInitials: 'BP',
    avatarColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'pu-usr-010',
    name: 'Prof. Sonal Mehta',
    email: 'sonal.mehta@iima.ac.in',
    designation: 'NSS Officer',
    phone: '+91 96016 78901',
    department: 'NSS Unit – IIM Ahmedabad',
    role: 'NSS Officer',
    state: 'Gujarat',
    district: 'Ahmedabad',
    unitName: 'NSS Unit - IIM Ahmedabad',
    gender: 'Female',
    joinedDate: '01 Oct 2018',
    status: 'Active',
    avatarInitials: 'SM',
    avatarColor: 'from-cyan-500 to-sky-600',
  },
  // Karnataka – Bengaluru Urban
  {
    id: 'pu-usr-011',
    name: 'Dr. Suresh Nair',
    email: 'suresh.nair@iisc.ac.in',
    designation: 'Programme Officer',
    phone: '+91 98441 89012',
    department: 'NSS Unit – IISc',
    role: 'Programme Officer',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    unitName: 'NSS Unit - IISc Bangalore',
    gender: 'Male',
    joinedDate: '30 Jun 2009',
    status: 'Active',
    avatarInitials: 'SN',
    avatarColor: 'from-lime-500 to-green-600',
  },
  // Uttar Pradesh – Lucknow
  {
    id: 'pu-usr-012',
    name: 'Prof. Priya Singh',
    email: 'priya.singh@lkouniv.ac.in',
    designation: 'NSS Programme Officer',
    phone: '+91 94151 90123',
    department: 'NSS Unit – Lucknow Univ.',
    role: 'NSS Programme Officer',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    unitName: 'NSS Unit - Lucknow University',
    gender: 'Female',
    joinedDate: '03 Jan 2016',
    status: 'Active',
    avatarInitials: 'PS',
    avatarColor: 'from-violet-500 to-purple-600',
  },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/** All states that have at least one Program Unit User */
export const getProgramUnitStates = (): string[] => {
  const states = new Set(PROGRAM_UNIT_USERS.map((u) => u.state));
  return [...states].sort();
};

/** Districts for a given state */
export const getProgramUnitDistricts = (state: string): string[] => {
  const districts = new Set(
    PROGRAM_UNIT_USERS.filter((u) => u.state === state).map((u) => u.district),
  );
  return [...districts].sort();
};

/** Users for given state + selected districts */
export const getProgramUnitUsers = (state: string, districts: string[]): ProgramUnitUser[] => {
  return PROGRAM_UNIT_USERS.filter((u) => u.state === state && districts.includes(u.district));
};
