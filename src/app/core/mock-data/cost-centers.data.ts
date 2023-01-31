export const apiCostCenterSingleResponse = {
  count: 1,
  data: [
    {
      code: 'code',
      created_at: '2018-02-01T07:23:14.321866+00:00',
      description: null,
      id: 37,
      is_enabled: true,
      name: 'Marketing',
      org_id: 'orNVthTo2Zyo',
      updated_at: '2019-01-08T10:51:37.721398+00:00',
    },
  ],
  offset: 0,
};

export const transformedCostCenterData = [
  {
    active: true,
    code: 'code',
    created_at: '2018-02-01T07:23:14.321866+00:00',
    description: null,
    id: 37,
    name: 'Marketing',
    org_id: 'orNVthTo2Zyo',
    updated_at: '2019-01-08T10:51:37.721398+00:00',
  },
];

export const apiCostServiceGroupData = {
  count: 2,
  data: [
    {
      code: 'code',
      created_at: '2018-02-01T07:23:14.321866+00:00',
      description: null,
      id: 37,
      is_enabled: true,
      name: 'Marketing',
      org_id: 'orNVthTo2Zyo',
      updated_at: '2019-01-08T10:51:37.721398+00:00',
    },
    {
      code: 'Administrion',
      created_at: '2019-02-01T06:42:26.089771+00:00',
      description: 'Administar4rtion',
      id: 85,
      is_enabled: true,
      name: 'Administration',
      org_id: 'orNVthTo2Zyo',
      updated_at: '2019-02-01T06:58:37.247798+00:00',
    },
  ],
  offset: 0,
};

export const TransformedActiveCostCenter = [
  {
    active: true,
    code: 'code',
    created_at: '2018-02-01T07:23:14.321866+00:00',
    description: null,
    id: 37,
    name: 'Marketing',
    org_id: 'orNVthTo2Zyo',
    updated_at: '2019-01-08T10:51:37.721398+00:00',
  },
  {
    active: true,
    code: 'Administrion',
    created_at: '2019-02-01T06:42:26.089771+00:00',
    description: 'Administar4rtion',
    id: 85,
    name: 'Administration',
    org_id: 'orNVthTo2Zyo',
    updated_at: '2019-02-01T06:58:37.247798+00:00',
  },
];
