import { MergeExpensesOptionsData } from '../models/merge-expenses-options-data.model';
import { Destination } from '../models/destination.model';

export const optionsData2: MergeExpensesOptionsData<boolean> = {
  options: [
    {
      label: 'No',
      value: false,
    },
  ],
  areSameValues: false,
};

export const optionsData3: MergeExpensesOptionsData<string> = {
  options: [
    {
      label: 'INR 1',
      value: 'txKJAJ1flx7n',
    },
    {
      label: 'INR 1',
      value: 'txz2vohKxBXu',
    },
  ],
  areSameValues: true,
};

export const optionsData4: MergeExpensesOptionsData<string> = {
  options: [
    {
      label: 'USD 1  (INR 1)',
      value: 'txKJAJ1flx7n',
    },
    {
      label: 'USD 1  (INR 1)',
      value: 'txz2vohKxBXu',
    },
  ],
  areSameValues: true,
};

export const optionsData5: MergeExpensesOptionsData<string> = {
  options: [
    {
      label: '0',
      value: 'txKJAJ1flx7n',
    },
    {
      label: '0',
      value: 'txz2vohKxBXu',
    },
  ],
  areSameValues: true,
};

export const optionsData6: MergeExpensesOptionsData<Date> = {
  options: [
    {
      label: 'Mar 13, 2023',
      value: new Date('2023-03-13T11:30:00.000Z'),
    },
    {
      label: 'Mar 08, 2023',
      value: new Date('2023-03-08T11:30:00.000Z'),
    },
  ],
  areSameValues: false,
};

export const optionsData7: MergeExpensesOptionsData<string> = {
  options: [
    {
      label: 'Corporate Card',
      value: 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT',
    },
    {
      label: 'Advance',
      value: 'PERSONAL_ADVANCE_ACCOUNT',
    },
  ],
  areSameValues: false,
};

export const optionsData8: MergeExpensesOptionsData<string> = {
  options: [
    {
      label: 'Nilesh As Vendor',
      value: 'Nilesh As Vendor',
    },
    {
      label: 'Nilesh As Vendor',
      value: 'Nilesh As Vendor',
    },
  ],
  areSameValues: true,
};

export const optionsData9: MergeExpensesOptionsData<number> = {
  options: [
    {
      label: 'Staging Project',
      value: 3943,
    },
    {
      label: 'Staging Project',
      value: 3943,
    },
  ],
  areSameValues: true,
};

export const optionsData10: MergeExpensesOptionsData<number> = {
  options: [
    {
      label: 'Food',
      value: 201952,
    },
    {
      label: 'Hotel',
      value: 16582,
    },
  ],
  areSameValues: false,
};

export const optionsData11: MergeExpensesOptionsData<string> = {
  options: [
    {
      label: 'GST',
      value: 'tgXEJA6YUoZ1',
    },
    {
      label: 'GST',
      value: 'tgXEJA6YUoZ1',
    },
  ],
  areSameValues: true,
};

export const optionsData12: MergeExpensesOptionsData<number> = {
  options: [
    {
      label: '0.01',
      value: 0.01,
    },
    {
      label: '0.01',
      value: 0.01,
    },
  ],
  areSameValues: true,
};

export const optionsData13: MergeExpensesOptionsData<number> = {
  options: [
    {
      label: 'Cost Center 1',
      value: 13788,
    },
    {
      label: 'Cost Center 2',
      value: 13795,
    },
  ],
  areSameValues: false,
};

export const optionsData14: MergeExpensesOptionsData<string> = {
  options: [
    {
      label: 'Outing',
      value: 'Outing',
    },
    {
      label: 'Offsite',
      value: 'Offsite',
    },
  ],
  areSameValues: false,
};

export const optionsData15: MergeExpensesOptionsData<Destination> = {
  options: [
    {
      label: 'Kalyan Station Rd, Bhanunagar KalyanWest, Bhoiwada, Kalyan, Maharashtra 421301, India',
      value: {
        actual: 'null',
        city: 'Kalyan',
        country: 'India',
        display: 'Kalyan Station Road, Bhanunagar KalyanWest, Bhoiwada, Kalyan, Maharashtra, India',
        formatted_address: 'Kalyan Station Rd, Bhanunagar KalyanWest, Bhoiwada, Kalyan, Maharashtra 421301, India',
        latitude: 19.238037,
        longitude: 73.1296469,
        state: 'Maharashtra',
      },
    },
  ],
  areSameValues: false,
};

export const optionsData16: MergeExpensesOptionsData<Date> = {
  options: [
    {
      label: 'Mar 13, 2023',
      value: new Date('2023-03-13T05:31:00.000Z'),
    },
    {
      label: 'Mar 10, 2023',
      value: new Date('2023-03-10T05:31:00.000Z'),
    },
  ],
  areSameValues: false,
};

export const optionsData17: MergeExpensesOptionsData<string> = {
  options: [
    {
      label: 'ECONOMY',
      value: 'ECONOMY',
    },
    {
      label: 'BUSINESS',
      value: 'BUSINESS',
    },
  ],
  areSameValues: false,
};

export const optionsData18: MergeExpensesOptionsData<string> = {
  options: [
    {
      label: 'SLEEPER',
      value: 'SLEEPER',
    },
    {
      label: 'SLEEPER',
      value: 'SLEEPER',
    },
  ],
  areSameValues: true,
};

export const optionsData19: MergeExpensesOptionsData<string> = {
  options: [
    {
      label: 'AC',
      value: 'AC',
    },
    {
      label: 'AC',
      value: 'AC',
    },
  ],
  areSameValues: true,
};

export const optionsData20: MergeExpensesOptionsData<number> = {
  options: [
    {
      label: '25',
      value: 25,
    },
    {
      label: '30',
      value: 30,
    },
  ],
  areSameValues: false,
};

export const optionsData21: MergeExpensesOptionsData<string> = {
  options: [
    {
      label: 'KM',
      value: 'KM',
    },
    {
      label: 'MILES',
      value: 'MILES',
    },
  ],
  areSameValues: false,
};

export const optionsData22: MergeExpensesOptionsData<string[] | Date>[] = [
  {
    options: [
      {
        label: 'userlist',
        value: ['ajain+12+12+1@fyle.in', 'aaaaasdjskjd@sdsd.com'],
      },
    ],
    areSameValues: false,
    value: ['ajain+12+12+1@fyle.in', 'aaaaasdjskjd@sdsd.com'],
    id: 200227,
    name: 'userlist',
  },
  {
    options: [],
    areSameValues: false,
    value: new Date('2021-03-10T05:31:00.000Z'),
    id: 200229,
    name: 'date field',
  },
];

export const optionsData23: MergeExpensesOptionsData<string[] | Date>[] = [
  {
    options: [
      {
        label: 'ajain+12+12+1@fyle.in,aaaaasdjskjd@sdsd.com',
        value: ['ajain+12+12+1@fyle.in', 'aaaaasdjskjd@sdsd.com'],
      },
    ],
    areSameValues: false,
    value: ['ajain+12+12+1@fyle.in', 'aaaaasdjskjd@sdsd.com'],
    id: 200227,
    name: 'userlist',
  },
  {
    areSameValues: false,
    value: new Date('2021-03-10T05:31:00.000Z'),
    id: 200229,
    name: 'date field',
    options: [
      {
        label: 'Mar 10, 2021',
        value: new Date('2021-03-10T05:31:00.000Z'),
      },
    ],
  },
];

export const optionsData24: MergeExpensesOptionsData<string[] | string>[] = [
  {
    options: [
      {
        label: 'ajain+12+12+1@fyle.in,aaaaasdjskjd@sdsd.com',
        value: ['ajain+12+12+1@fyle.in', 'aaaaasdjskjd@sdsd.com'],
      },
    ],
    areSameValues: false,
    value: ['ajain+12+12+1@fyle.in', 'aaaaasdjskjd@sdsd.com'],
    id: 200227,
    name: 'userlist',
  },
  {
    options: [],
    areSameValues: false,
    value: 'some value',
    id: 200211,
    name: 'text field',
  },
];

export const optionsData25: MergeExpensesOptionsData<string[] | string>[] = [
  {
    options: [
      {
        label: 'ajain+12+12+1@fyle.in,aaaaasdjskjd@sdsd.com',
        value: ['ajain+12+12+1@fyle.in', 'aaaaasdjskjd@sdsd.com'],
      },
    ],
    areSameValues: false,
    value: ['ajain+12+12+1@fyle.in', 'aaaaasdjskjd@sdsd.com'],
    id: 200227,
    name: 'userlist',
  },
  {
    options: [
      {
        label: 'some value',
        value: 'some value',
      },
    ],
    areSameValues: false,
    value: 'some value',
    id: 200211,
    name: 'text field',
  },
];

export const optionsData26: MergeExpensesOptionsData<number>[] = [
  {
    options: null,
    areSameValues: false,
    value: 12,
    id: 200212,
    name: 'numberfield',
  },
];

export const optionsData27: MergeExpensesOptionsData<string>[] = [
  {
    options: [],
    areSameValues: false,
    value: 'Food',
    id: 200213,
    name: 'customcategory',
  },
  {
    options: [],
    areSameValues: false,
    value: 'Food',
    id: 200213,
    name: 'customcategory',
  },
];

export const optionsData28: MergeExpensesOptionsData<string>[] = [
  {
    options: [
      {
        label: 'Food',
        value: 'Food',
      },
      {
        label: 'Food',
        value: 'Food',
      },
    ],
    areSameValues: false,
    value: 'Food',
    id: 200213,
    name: 'customcategory',
  },
];

export const optionsData29: MergeExpensesOptionsData<number>[] = [
  {
    options: [],
    areSameValues: false,
    value: 16,
    id: 200215,
    name: 'customNumber',
  },
  {
    options: [],
    areSameValues: false,
    value: 16,
    id: 200215,
    name: 'customNumber',
  },
];

export const optionsData30: MergeExpensesOptionsData<number>[] = [
  {
    options: [
      {
        label: '16',
        value: 16,
      },
      {
        label: '16',
        value: 16,
      },
    ],
    areSameValues: false,
    value: 16,
    id: 200215,
    name: 'customNumber',
  },
];

export const optionsData31: MergeExpensesOptionsData<boolean> = {
  options: [
    {
      label: 'No',
      value: false,
    },
    {
      label: 'No',
      value: false,
    },
  ],
  areSameValues: true,
};

export const optionsData32: MergeExpensesOptionsData<string[] | string>[] = [
  {
    id: 200227,
    name: 'userlist',
    options: [],
    value: [],
  },
  {
    id: 210649,
    name: 'User List',
    options: [],
    value: [],
  },
  {
    id: 210281,
    name: 'test',
    options: [],
    value: '',
  },
  {
    id: 212819,
    name: 'category2',
    options: [],
    value: '',
  },
  {
    id: 206206,
    name: 'pub create hola 1',
    options: [],
    value: null,
  },
  {
    id: 211321,
    name: 'test 112',
    options: [],
    value: null,
  },
  {
    id: 206198,
    name: '2232323',
    options: [],
    value: null,
  },
  {
    id: 211326,
    name: 'select all 2',
    options: [
      {
        label: '2023-02-13T17:00:00.000Z',
        value: '2023-02-13T17:00:00.000Z',
      },
    ],
    value: '2023-02-13T17:00:00.000Z',
  },
];

export const optionsData33: MergeExpensesOptionsData<Destination> = {
  options: [
    {
      label: 'Kalyan Station Rd, Bhanunagar KalyanWest, Bhoiwada, Kalyan, Maharashtra 421301, India',
      value: {
        actual: 'null',
        city: 'Bhiwandi',
        country: 'India',
        display: 'Bhiwandi Railway Station Road, Brahmanand Nagar, Kamatghar, Bhiwandi, Maharashtra, India',
        formatted_address:
          'Bhiwandi Railway Station Rd, Brahmanand Nagar, Kamatghar, Bhiwandi, Maharashtra 421302, India',
        latitude: 19.2687341,
        longitude: 73.0484305,
        state: 'Maharashtra',
      },
    },
  ],
  areSameValues: false,
};
