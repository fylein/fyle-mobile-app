import { FileObject } from '../models/file-obj.model';

export const fileObjectData: FileObject = {
  id: 'fiHPZUiichAS',
  org_user_id: 'ouX8dwsbLCLv',
  created_at: new Date('2023-02-01T12:27:28.522Z'),
  name: '000.jpeg',
  s3url: '2023-02-01/orNVthTo2Zyo/receipts/fiHPZUiichAS.000.jpeg',
  transaction_id: 'txdzGV1TZEg3',
  invoice_id: null,
  advance_request_id: null,
  purpose: 'ORIGINAL',
  password: null,
  receipt_coordinates: null,
  email_meta_data: null,
  fyle_sub_url: '/api/files/fiHPZUiichAS/download',
};

export const fileObjectData1: FileObject[] = [
  {
    id: 'fi6PQ6z4w6ET',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-02-08T06:47:44.340Z'),
    name: '000.jpeg',
    s3url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg',
    transaction_id: 'txNVtsqF8Siq',
    invoice_id: null,
    advance_request_id: null,
    purpose: 'ORIGINAL',
    password: null,
    receipt_coordinates: null,
    email_meta_data: null,
    fyle_sub_url: '/api/files/fi6PQ6z4w6ET/download',
  },
];

export const fileObjectData2: FileObject = {
  id: 'fi6PQ6z4w6ET',
  org_user_id: 'ouX8dwsbLCLv',
  created_at: new Date('2023-02-08T06:47:44.340Z'),
  name: '000.jpeg',
  s3url: '2023-02-08/orNVthTo2Zyo/receipts/fi6PQ6z4w6ET.000.jpeg',
  transaction_id: 'txNVtsqF8Siq',
  invoice_id: null,
  advance_request_id: null,
  purpose: 'ORIGINAL',
  password: null,
  receipt_coordinates: null,
  email_meta_data: null,
  fyle_sub_url: '/api/files/fi6PQ6z4w6ET/download',
};

export const fileObjectData3: FileObject = {
  id: 'finwabtsAZRy',
  org_user_id: 'ouX8dwsbLCLv',
  created_at: new Date('2023-02-23T13:16:15.227Z'),
  name: '000.jpeg',
  s3url: '2023-02-23/orNVthTo2Zyo/receipts/finwabtsAZRy.000.jpeg',
  transaction_id: null,
  invoice_id: null,
  advance_request_id: 'areqGzKF1Tne23',
  purpose: 'ORIGINAL',
  password: null,
  receipt_coordinates: null,
  email_meta_data: null,
  fyle_sub_url: '/api/files/finwabtsAZRy/download',
};
export const thumbnailUrlMockData: FileObject[] = [
  {
    id: 'fiwJ0nQTBpYH',
    purpose: 'THUMBNAILx200x200',
    url: 'mock-url-1',
  },
];

export const fileObjectAdv: FileObject[] = [
  {
    id: 'fiSSsy2Bf4Se',
    org_user_id: 'ouCI4UQ2G0K1',
    created_at: new Date('2023-02-23T09:45:34.026Z'),
    name: '000.jpeg',
    s3url: '2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.jpeg',
    transaction_id: null,
    invoice_id: null,
    advance_request_id: 'areqspMJTHN4Yk',
    purpose: 'ORIGINAL',
    password: null,
    receipt_coordinates: null,
    email_meta_data: null,
    fyle_sub_url: '/api/files/fiSSsy2Bf4Se/download',
    file_type: 'image',
    url: 'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee',
    type: 'image',
    thumbnail:
      'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee',
  },
];

export const fileObjectAdv1: FileObject = {
  ...fileObjectAdv[0],
  name: '000.pdf',
  file_type: 'pdf',
  url: 'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee',
  type: 'pdf',
  thumbnail:
    'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee',
};

export const fileObjectData4: FileObject = {
  id: 'fiXpfkKFhf6w',
  org_user_id: 'ouCI4UQ2G0K1',
  created_at: new Date('2023-02-23T16:22:03.264Z'),
  name: '000.jpeg',
  s3url: '2023-02-23/orrjqbDbeP9p/receipts/fiXpfkKFhf6w.000.jpeg',
  transaction_id: null,
  invoice_id: null,
  advance_request_id: null,
  purpose: 'ORIGINAL',
  password: null,
  receipt_coordinates: null,
  email_meta_data: null,
  fyle_sub_url: '/api/files/fiXpfkKFhf6w/download',
};

export const splitExpFileObj: FileObject[] = [
  {
    id: 'fijCeF0G0jTl',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-03-02T14:00:36.639Z'),
    name: '000.jpeg',
    s3url: '2023-03-02/orNVthTo2Zyo/receipts/fijCeF0G0jTl.000.jpeg',
    transaction_id: 'tx5QJJy2ogTJ',
    invoice_id: null,
    advance_request_id: null,
    purpose: 'ORIGINAL',
    password: null,
    receipt_coordinates: null,
    email_meta_data: null,
    fyle_sub_url: '/api/files/fijCeF0G0jTl/download',
  },
];

export const splitExpFile2: FileObject = {
  id: 'fiebA5W5GLhr',
  org_user_id: 'ouX8dwsbLCLv',
  created_at: new Date('2023-03-02T14:13:19.604Z'),
  name: '000.jpeg',
  s3url: '2023-03-02/orNVthTo2Zyo/receipts/fiebA5W5GLhr.000.jpeg',
  transaction_id: 'txnumQykfO9h',
  invoice_id: null,
  advance_request_id: null,
  purpose: 'ORIGINAL',
  password: null,
  receipt_coordinates: null,
  email_meta_data: null,
  fyle_sub_url: '/api/files/fiebA5W5GLhr/download',
};

export const splitExpFile3: FileObject = {
  id: 'figgpRkIApZE',
  org_user_id: 'ouX8dwsbLCLv',
  created_at: new Date('2023-03-02T14:13:19.587Z'),
  name: '000.jpeg',
  s3url: '2023-03-02/orNVthTo2Zyo/receipts/figgpRkIApZE.000.jpeg',
  transaction_id: 'txB9uUczgwgO',
  invoice_id: null,
  advance_request_id: null,
  purpose: 'ORIGINAL',
  password: null,
  receipt_coordinates: null,
  email_meta_data: null,
  fyle_sub_url: '/api/files/figgpRkIApZE/download',
};

export const fileObject4: FileObject[] = [
  {
    id: 'fiV1gXpyCcbU',
    org_user_id: 'ouX8dwsbLCLv',
    created_at: new Date('2023-03-06T07:51:05.614Z'),
    name: '000.jpeg',
    s3url: '2023-03-06/orNVthTo2Zyo/receipts/fiV1gXpyCcbU.000.jpeg',
    transaction_id: 'tx1vdITUXIzf',
    invoice_id: null,
    advance_request_id: null,
    purpose: 'ORIGINAL',
    password: null,
    receipt_coordinates: null,
    email_meta_data: null,
    fyle_sub_url: '/api/files/fiV1gXpyCcbU/download',
  },
];
