import { AccessTokenData } from '../models/access-token-data.model';

export const apiAccessTokenRes: AccessTokenData = {
  iat: 1678349549,
  iss: 'FyleApp',
  user_id: 'usvKA4X8Ugcr',
  org_user_id: 'ouX8dwsbLCLv',
  org_id: 'orNVthTo2Zyo',
  roles: '["ADMIN","APPROVER","FYLER","HOP","HOD","OWNER"]',
  scopes: '[]',
  allowed_CIDRs: '[]',
  version: '3',
  cluster_domain: '"https://staging.fyle.tech"',
  exp: 1678353149,
};

export const apiTokenWithoutRoles: AccessTokenData = {
  iat: 1678349549,
  iss: 'FyleApp',
  user_id: 'usvKA4X8Ugcr',
  org_user_id: 'ouX8dwsbLCLv',
  org_id: 'orNVthTo2Zyo',
  scopes: '[]',
  allowed_CIDRs: '[]',
  version: '3',
  cluster_domain: '"https://staging.fyle.tech"',
  exp: 1678353149,
};
