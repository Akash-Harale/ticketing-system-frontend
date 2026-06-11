export interface Institute {
  id: string;
  name: string;
  type: 'College' | 'University' | 'Institution';
}

export interface DistrictEntry {
  id: string;
  name: string;
  institutes: Institute[];
}

export interface StateEntry {
  id: string;
  name: string;
  districts: DistrictEntry[];
}

export interface RolloutItem {
  id: string;
  title: string;
  templateName: string;
  sentDate: string;
  status: 'Active' | 'Completed' | 'Draft';
  totalStates: number;
  totalInstitutes: number;
  states: StateEntry[];
}

export interface TemplateTask {
  id: string;
  text: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  tasks: TemplateTask[];
  createdDate: string;
}

export const ROLLOUTS: RolloutItem[] = [
  {
    id: 'ro-001',
    title: 'Rollout - 1',
    templateName: 'Annual NSS Camp Template',
    sentDate: '10 Jan 2024',
    status: 'Completed',
    totalStates: 2,
    totalInstitutes: 5,
    states: [
      {
        id: 'mh',
        name: 'Maharashtra',
        districts: [
          {
            id: 'mh-pune',
            name: 'Pune',
            institutes: [
              { id: 'i1', name: 'COEP Technological University', type: 'University' },
              { id: 'i2', name: 'Symbiosis Institute of Technology', type: 'Institution' },
              { id: 'i3', name: 'Fergusson College', type: 'College' },
            ],
          },
          {
            id: 'mh-nagpur',
            name: 'Nagpur',
            institutes: [{ id: 'i4', name: 'VNIT Nagpur', type: 'Institution' }],
          },
        ],
      },
      {
        id: 'rj',
        name: 'Rajasthan',
        districts: [
          {
            id: 'rj-jaipur',
            name: 'Jaipur',
            institutes: [{ id: 'i5', name: 'University of Rajasthan', type: 'University' }],
          },
        ],
      },
    ],
  },
  {
    id: 'ro-002',
    title: 'Rollout - 2',
    templateName: 'Blood Donation Drive',
    sentDate: '05 Mar 2024',
    status: 'Active',
    totalStates: 2,
    totalInstitutes: 4,
    states: [
      {
        id: 'gj',
        name: 'Gujarat',
        districts: [
          {
            id: 'gj-ahm',
            name: 'Ahmedabad',
            institutes: [
              { id: 'i6', name: 'Gujarat University', type: 'University' },
              { id: 'i7', name: 'IIM Ahmedabad', type: 'Institution' },
            ],
          },
        ],
      },
      {
        id: 'ka',
        name: 'Karnataka',
        districts: [
          {
            id: 'ka-ben',
            name: 'Bengaluru Urban',
            institutes: [
              { id: 'i8', name: 'Indian Institute of Science', type: 'Institution' },
              { id: 'i9', name: 'Christ University', type: 'University' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ro-003',
    title: 'Rollout - 3',
    templateName: 'Swachh Bharat Activity',
    sentDate: '22 Apr 2024',
    status: 'Active',
    totalStates: 2,
    totalInstitutes: 4,
    states: [
      {
        id: 'up',
        name: 'Uttar Pradesh',
        districts: [
          {
            id: 'up-lko',
            name: 'Lucknow',
            institutes: [
              { id: 'i10', name: 'University of Lucknow', type: 'University' },
              { id: 'i11', name: 'Lucknow Polytechnic', type: 'Institution' },
            ],
          },
        ],
      },
      {
        id: 'tn',
        name: 'Tamil Nadu',
        districts: [
          {
            id: 'tn-che',
            name: 'Chennai',
            institutes: [
              { id: 'i12', name: 'Anna University', type: 'University' },
              { id: 'i13', name: 'Madras Christian College', type: 'College' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ro-004',
    title: 'Rollout - 4',
    templateName: 'Digital Literacy Camp',
    sentDate: '18 Jun 2024',
    status: 'Draft',
    totalStates: 1,
    totalInstitutes: 2,
    states: [
      {
        id: 'wb',
        name: 'West Bengal',
        districts: [
          {
            id: 'wb-kol',
            name: 'Kolkata',
            institutes: [
              { id: 'i14', name: 'Jadavpur University', type: 'University' },
              { id: 'i15', name: 'Presidency University', type: 'University' },
            ],
          },
        ],
      },
    ],
  },
];

export const TEMPLATES: TemplateItem[] = [
  {
    id: 'tpl-001',
    name: 'Annual NSS Camp Template',
    createdDate: '01 Jan 2024',
    tasks: [
      { id: 't1', text: 'Submit unit registration form' },
      { id: 't2', text: 'Confirm volunteer count' },
      { id: 't3', text: 'Arrange accommodation' },
      { id: 't4', text: 'Submit attendance report' },
    ],
  },
  {
    id: 'tpl-002',
    name: 'Blood Donation Drive',
    createdDate: '01 Mar 2024',
    tasks: [
      { id: 't5', text: 'Register with local blood bank' },
      { id: 't6', text: 'Collect donor consent forms' },
      { id: 't7', text: 'Submit post-event report' },
    ],
  },
];
