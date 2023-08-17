import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { TxnCustomProperties } from '../models/txn-custom-properties.model';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root',
})
export class TimezoneService {
  timezones = [
    {
      timezone: 'America/Louisville',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Nome',
      abbreviation: 'AKDT',
      offset: '-08:00:00',
    },
    {
      timezone: 'America/Moncton',
      abbreviation: 'ADT',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Dawson',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Cambridge_Bay',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Yakutat',
      abbreviation: 'AKDT',
      offset: '-08:00:00',
    },
    {
      timezone: 'America/St_Vincent',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Blanc-Sablon',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Chicago',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Manaus',
      abbreviation: '-04',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Atikokan',
      abbreviation: 'EST',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Whitehorse',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Edmonton',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Santiago',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/St_Johns',
      abbreviation: 'NDT',
      offset: '-02:30:00',
    },
    {
      timezone: 'America/Porto_Acre',
      abbreviation: '-05',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Mexico_City',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Antigua',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Caracas',
      abbreviation: '-04',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/St_Thomas',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Curacao',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/North_Dakota/New_Salem',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/North_Dakota/Center',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/North_Dakota/Beulah',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Bahia_Banderas',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Marigot',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Matamoros',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Rio_Branco',
      abbreviation: '-05',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Los_Angeles',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Lower_Princes',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Regina',
      abbreviation: 'CST',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/St_Kitts',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Guyana',
      abbreviation: '-04',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/St_Barthelemy',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Monterrey',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Cayman',
      abbreviation: 'EST',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Glace_Bay',
      abbreviation: 'ADT',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Thule',
      abbreviation: 'ADT',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Coral_Harbour',
      abbreviation: 'EST',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Montevideo',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Maceio',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Anguilla',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Montreal',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Hermosillo',
      abbreviation: 'MST',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Halifax',
      abbreviation: 'ADT',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Guadeloupe',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Kentucky/Louisville',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Kentucky/Monticello',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Winnipeg',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Noronha',
      abbreviation: '-02',
      offset: '-02:00:00',
    },
    {
      timezone: 'America/Nipigon',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Vancouver',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Eirunepe',
      abbreviation: '-05',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Campo_Grande',
      abbreviation: '-04',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Dawson_Creek',
      abbreviation: 'MST',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Argentina/San_Luis',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/Rio_Gallegos',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/Salta',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/ComodRivadavia',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/Mendoza',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/Buenos_Aires',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/Catamarca',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/Tucuman',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/Ushuaia',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/Jujuy',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/San_Juan',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/La_Rioja',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Argentina/Cordoba',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Fortaleza',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Atka',
      abbreviation: 'HDT',
      offset: '-09:00:00',
    },
    {
      timezone: 'America/Belize',
      abbreviation: 'CST',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Santarem',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Detroit',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Belem',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Boise',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Dominica',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Port_of_Spain',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Fort_Nelson',
      abbreviation: 'MST',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Cayenne',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Nassau',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Cuiaba',
      abbreviation: '-04',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Havana',
      abbreviation: 'CDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Jamaica',
      abbreviation: 'EST',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Shiprock',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Sitka',
      abbreviation: 'AKDT',
      offset: '-08:00:00',
    },
    {
      timezone: 'America/Godthab',
      abbreviation: '-02',
      offset: '-02:00:00',
    },
    {
      timezone: 'America/Guatemala',
      abbreviation: 'CST',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Danmarkshavn',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'America/Menominee',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Aruba',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Creston',
      abbreviation: 'MST',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Rankin_Inlet',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Thunder_Bay',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Mendoza',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Pangnirtung',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Porto_Velho',
      abbreviation: '-04',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Montserrat',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Boa_Vista',
      abbreviation: '-04',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Bahia',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Ojinaga',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Santa_Isabel',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Juneau',
      abbreviation: 'AKDT',
      offset: '-08:00:00',
    },
    {
      timezone: 'America/Resolute',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Toronto',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Scoresbysund',
      abbreviation: '+00',
      offset: '00:00:00',
    },
    {
      timezone: 'America/Buenos_Aires',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Adak',
      abbreviation: 'HDT',
      offset: '-09:00:00',
    },
    {
      timezone: 'America/Asuncion',
      abbreviation: '-04',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Chihuahua',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Guayaquil',
      abbreviation: '-05',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Catamarca',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Bogota',
      abbreviation: '-05',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Panama',
      abbreviation: 'EST',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Ensenada',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Martinique',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Barbados',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Araguaina',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/St_Lucia',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Yellowknife',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/El_Salvador',
      abbreviation: 'CST',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Puerto_Rico',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Tijuana',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Virgin',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/La_Paz',
      abbreviation: '-04',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/New_York',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Kralendijk',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Managua',
      abbreviation: 'CST',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Tegucigalpa',
      abbreviation: 'CST',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Fort_Wayne',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Grand_Turk',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Mazatlan',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Iqaluit',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Merida',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Phoenix',
      abbreviation: 'MST',
      offset: '-07:00:00',
    },
    {
      timezone: 'America/Costa_Rica',
      abbreviation: 'CST',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Indianapolis',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Lima',
      abbreviation: '-05',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Jujuy',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Indiana/Tell_City',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Indiana/Knox',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Indiana/Vevay',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Indiana/Petersburg',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Indiana/Marengo',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Indiana/Indianapolis',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Indiana/Vincennes',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Indiana/Winamac',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Recife',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Punta_Arenas',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Cancun',
      abbreviation: 'EST',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Sao_Paulo',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Paramaribo',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Anchorage',
      abbreviation: 'AKDT',
      offset: '-08:00:00',
    },
    {
      timezone: 'America/Santo_Domingo',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Miquelon',
      abbreviation: '-02',
      offset: '-02:00:00',
    },
    {
      timezone: 'America/Cordoba',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Rosario',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Goose_Bay',
      abbreviation: 'ADT',
      offset: '-03:00:00',
    },
    {
      timezone: 'America/Tortola',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Denver',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Rainy_River',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Grenada',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Port-au-Prince',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'America/Inuvik',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Knox_IN',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'America/Swift_Current',
      abbreviation: 'CST',
      offset: '-06:00:00',
    },
    {
      timezone: 'America/Metlakatla',
      abbreviation: 'AKDT',
      offset: '-08:00:00',
    },
    {
      timezone: 'Singapore',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Universal',
      abbreviation: 'UTC',
      offset: '00:00:00',
    },
    {
      timezone: 'HST',
      abbreviation: 'HST',
      offset: '-10:00:00',
    },
    {
      timezone: 'Pacific/Galapagos',
      abbreviation: '-06',
      offset: '-06:00:00',
    },
    {
      timezone: 'Pacific/Auckland',
      abbreviation: 'NZDT',
      offset: '13:00:00',
    },
    {
      timezone: 'Pacific/Pago_Pago',
      abbreviation: 'SST',
      offset: '-11:00:00',
    },
    {
      timezone: 'Pacific/Marquesas',
      abbreviation: '-0930',
      offset: '-09:30:00',
    },
    {
      timezone: 'Pacific/Kosrae',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Pacific/Ponape',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Pacific/Honolulu',
      abbreviation: 'HST',
      offset: '-10:00:00',
    },
    {
      timezone: 'Pacific/Midway',
      abbreviation: 'SST',
      offset: '-11:00:00',
    },
    {
      timezone: 'Pacific/Guam',
      abbreviation: 'ChST',
      offset: '10:00:00',
    },
    {
      timezone: 'Pacific/Chuuk',
      abbreviation: '+10',
      offset: '10:00:00',
    },
    {
      timezone: 'Pacific/Guadalcanal',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Pacific/Rarotonga',
      abbreviation: -10,
      offset: '-10:00:00',
    },
    {
      timezone: 'Pacific/Gambier',
      abbreviation: '-09',
      offset: '-09:00:00',
    },
    {
      timezone: 'Pacific/Norfolk',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Pacific/Yap',
      abbreviation: '+10',
      offset: '10:00:00',
    },
    {
      timezone: 'Pacific/Palau',
      abbreviation: '+09',
      offset: '09:00:00',
    },
    {
      timezone: 'Pacific/Niue',
      abbreviation: -11,
      offset: '-11:00:00',
    },
    {
      timezone: 'Pacific/Bougainville',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Pacific/Pohnpei',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Pacific/Port_Moresby',
      abbreviation: '+10',
      offset: '10:00:00',
    },
    {
      timezone: 'Pacific/Efate',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Pacific/Johnston',
      abbreviation: 'HST',
      offset: '-10:00:00',
    },
    {
      timezone: 'Pacific/Tahiti',
      abbreviation: -10,
      offset: '-10:00:00',
    },
    {
      timezone: 'Pacific/Truk',
      abbreviation: '+10',
      offset: '10:00:00',
    },
    {
      timezone: 'Pacific/Noumea',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Pacific/Easter',
      abbreviation: '-05',
      offset: '-05:00:00',
    },
    {
      timezone: 'Pacific/Pitcairn',
      abbreviation: '-08',
      offset: '-08:00:00',
    },
    {
      timezone: 'Pacific/Samoa',
      abbreviation: 'SST',
      offset: '-11:00:00',
    },
    {
      timezone: 'Eire',
      abbreviation: 'IST',
      offset: '01:00:00',
    },
    {
      timezone: 'Iceland',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'CST6CDT',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'Portugal',
      abbreviation: 'WEST',
      offset: '01:00:00',
    },
    {
      timezone: 'NZ',
      abbreviation: 'NZDT',
      offset: '13:00:00',
    },
    {
      timezone: 'posixrules',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'Poland',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Arctic/Longyearbyen',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Zulu',
      abbreviation: 'UTC',
      offset: '00:00:00',
    },
    {
      timezone: 'UCT',
      abbreviation: 'UCT',
      offset: '00:00:00',
    },
    {
      timezone: 'PRC',
      abbreviation: 'CST',
      offset: '08:00:00',
    },
    {
      timezone: 'localtime',
      abbreviation: 'UTC',
      offset: '00:00:00',
    },
    {
      timezone: 'Hongkong',
      abbreviation: 'HKT',
      offset: '08:00:00',
    },
    {
      timezone: 'Brazil/DeNoronha',
      abbreviation: '-02',
      offset: '-02:00:00',
    },
    {
      timezone: 'Brazil/Acre',
      abbreviation: '-05',
      offset: '-05:00:00',
    },
    {
      timezone: 'Brazil/East',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'Brazil/West',
      abbreviation: '-04',
      offset: '-04:00:00',
    },
    {
      timezone: 'MST',
      abbreviation: 'MST',
      offset: '-07:00:00',
    },
    {
      timezone: 'Japan',
      abbreviation: 'JST',
      offset: '09:00:00',
    },
    {
      timezone: 'W-SU',
      abbreviation: 'MSK',
      offset: '03:00:00',
    },
    {
      timezone: 'Africa/Djibouti',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Africa/Libreville',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Nouakchott',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Kampala',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Africa/Mbabane',
      abbreviation: 'SAST',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Ndjamena',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Brazzaville',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Lome',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Kigali',
      abbreviation: 'CAT',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Kinshasa',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Johannesburg',
      abbreviation: 'SAST',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Monrovia',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Douala',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Maseru',
      abbreviation: 'SAST',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Mogadishu',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Africa/Harare',
      abbreviation: 'CAT',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Sao_Tome',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Freetown',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Asmera',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Africa/Gaborone',
      abbreviation: 'CAT',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Dakar',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Cairo',
      abbreviation: 'EET',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Bujumbura',
      abbreviation: 'CAT',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/El_Aaiun',
      abbreviation: 'WEST',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Conakry',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Dar_es_Salaam',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Africa/Tunis',
      abbreviation: 'CET',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Accra',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Bamako',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Ouagadougou',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Timbuktu',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Lagos',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Lubumbashi',
      abbreviation: 'CAT',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Banjul',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Abidjan',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Africa/Asmara',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Africa/Ceuta',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Khartoum',
      abbreviation: 'CAT',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Malabo',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Porto-Novo',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Nairobi',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Africa/Juba',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Africa/Lusaka',
      abbreviation: 'CAT',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Blantyre',
      abbreviation: 'CAT',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Niamey',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Maputo',
      abbreviation: 'CAT',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Tripoli',
      abbreviation: 'EET',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Bangui',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Luanda',
      abbreviation: 'WAT',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Algiers',
      abbreviation: 'CET',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Casablanca',
      abbreviation: 'WEST',
      offset: '01:00:00',
    },
    {
      timezone: 'Africa/Windhoek',
      abbreviation: 'CAT',
      offset: '02:00:00',
    },
    {
      timezone: 'Africa/Addis_Ababa',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Africa/Bissau',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'SystemV/AST4',
      abbreviation: 'AST',
      offset: '-04:00:00',
    },
    {
      timezone: 'SystemV/CST6CDT',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'SystemV/MST7',
      abbreviation: 'MST',
      offset: '-07:00:00',
    },
    {
      timezone: 'SystemV/EST5',
      abbreviation: 'EST',
      offset: '-05:00:00',
    },
    {
      timezone: 'SystemV/HST10',
      abbreviation: 'HST',
      offset: '-10:00:00',
    },
    {
      timezone: 'SystemV/AST4ADT',
      abbreviation: 'ADT',
      offset: '-03:00:00',
    },
    {
      timezone: 'SystemV/EST5EDT',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'SystemV/PST8PDT',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'SystemV/CST6',
      abbreviation: 'CST',
      offset: '-06:00:00',
    },
    {
      timezone: 'SystemV/YST9YDT',
      abbreviation: 'AKDT',
      offset: '-08:00:00',
    },
    {
      timezone: 'SystemV/YST9',
      abbreviation: '-09',
      offset: '-09:00:00',
    },
    {
      timezone: 'SystemV/MST7MDT',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'SystemV/PST8',
      abbreviation: '-08',
      offset: '-08:00:00',
    },
    {
      timezone: 'Egypt',
      abbreviation: 'EET',
      offset: '02:00:00',
    },
    {
      timezone: 'GMT',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Turkey',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'EST5EDT',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'Australia/Canberra',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/NSW',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/Adelaide',
      abbreviation: 'ACST',
      offset: '09:30:00',
    },
    {
      timezone: 'Australia/Melbourne',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/Victoria',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/Perth',
      abbreviation: 'AWST',
      offset: '08:00:00',
    },
    {
      timezone: 'Australia/Brisbane',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/Tasmania',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/ACT',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/Queensland',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/South',
      abbreviation: 'ACST',
      offset: '09:30:00',
    },
    {
      timezone: 'Australia/Lord_Howe',
      abbreviation: '+1030',
      offset: '10:30:00',
    },
    {
      timezone: 'Australia/Yancowinna',
      abbreviation: 'ACST',
      offset: '09:30:00',
    },
    {
      timezone: 'Australia/Lindeman',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/LHI',
      abbreviation: '+1030',
      offset: '10:30:00',
    },
    {
      timezone: 'Australia/Broken_Hill',
      abbreviation: 'ACST',
      offset: '09:30:00',
    },
    {
      timezone: 'Australia/Eucla',
      abbreviation: '+0845',
      offset: '08:45:00',
    },
    {
      timezone: 'Australia/Darwin',
      abbreviation: 'ACST',
      offset: '09:30:00',
    },
    {
      timezone: 'Australia/Sydney',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/West',
      abbreviation: 'AWST',
      offset: '08:00:00',
    },
    {
      timezone: 'Australia/Currie',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/Hobart',
      abbreviation: 'AEST',
      offset: '10:00:00',
    },
    {
      timezone: 'Australia/North',
      abbreviation: 'ACST',
      offset: '09:30:00',
    },
    {
      timezone: 'Jamaica',
      abbreviation: 'EST',
      offset: '-05:00:00',
    },
    {
      timezone: 'GB',
      abbreviation: 'BST',
      offset: '01:00:00',
    },
    {
      timezone: 'PST8PDT',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'Asia/Taipei',
      abbreviation: 'CST',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Thimbu',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Asia/Singapore',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Kuwait',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Yekaterinburg',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Asia/Dili',
      abbreviation: '+09',
      offset: '09:00:00',
    },
    {
      timezone: 'Asia/Manila',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Bahrain',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Yangon',
      abbreviation: '+0630',
      offset: '06:30:00',
    },
    {
      timezone: 'Asia/Dhaka',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Asia/Yakutsk',
      abbreviation: '+09',
      offset: '09:00:00',
    },
    {
      timezone: 'Asia/Omsk',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Asia/Ujung_Pandang',
      abbreviation: 'WITA',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Srednekolymsk',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Asia/Vladivostok',
      abbreviation: '+10',
      offset: '10:00:00',
    },
    {
      timezone: 'Asia/Tashkent',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Asia/Shanghai',
      abbreviation: 'CST',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Sakhalin',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Asia/Tehran',
      abbreviation: '+0330',
      offset: '03:30:00',
    },
    {
      timezone: 'Asia/Katmandu',
      abbreviation: '+0545',
      offset: '05:45:00',
    },
    {
      timezone: 'Asia/Istanbul',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Pontianak',
      abbreviation: 'WIB',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Yerevan',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Asia/Krasnoyarsk',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Aden',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Jayapura',
      abbreviation: 'WIT',
      offset: '09:00:00',
    },
    {
      timezone: 'Asia/Qyzylorda',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Asia/Ulan_Bator',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Nicosia',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Urumqi',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Asia/Kolkata',
      abbreviation: 'IST',
      offset: '05:30:00',
    },
    {
      timezone: 'Asia/Samarkand',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Asia/Hovd',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Makassar',
      abbreviation: 'WITA',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Gaza',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Kuala_Lumpur',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Aqtobe',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Asia/Magadan',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Asia/Karachi',
      abbreviation: 'PKT',
      offset: '05:00:00',
    },
    {
      timezone: 'Asia/Ho_Chi_Minh',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Kabul',
      abbreviation: '+0430',
      offset: '04:30:00',
    },
    {
      timezone: 'Asia/Damascus',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Vientiane',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Dubai',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Asia/Macao',
      abbreviation: 'CST',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Saigon',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Qatar',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Brunei',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Choibalsan',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Kuching',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Irkutsk',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Novokuznetsk',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Ust-Nera',
      abbreviation: '+10',
      offset: '10:00:00',
    },
    {
      timezone: 'Asia/Almaty',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Asia/Harbin',
      abbreviation: 'CST',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Bangkok',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Jerusalem',
      abbreviation: 'IDT',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Atyrau',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Asia/Riyadh',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Thimphu',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Asia/Muscat',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Asia/Chita',
      abbreviation: '+09',
      offset: '09:00:00',
    },
    {
      timezone: 'Asia/Chongqing',
      abbreviation: 'CST',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Ashkhabad',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Asia/Oral',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Asia/Pyongyang',
      abbreviation: 'KST',
      offset: '09:00:00',
    },
    {
      timezone: 'Asia/Colombo',
      abbreviation: '+0530',
      offset: '05:30:00',
    },
    {
      timezone: 'Asia/Amman',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Tomsk',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Macau',
      abbreviation: 'CST',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Barnaul',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Beirut',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Famagusta',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Tbilisi',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Asia/Jakarta',
      abbreviation: 'WIB',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Kathmandu',
      abbreviation: '+0545',
      offset: '05:45:00',
    },
    {
      timezone: 'Asia/Ulaanbaatar',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Bishkek',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Asia/Tokyo',
      abbreviation: 'JST',
      offset: '09:00:00',
    },
    {
      timezone: 'Asia/Phnom_Penh',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Ashgabat',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Asia/Hong_Kong',
      abbreviation: 'HKT',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Dacca',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Asia/Baghdad',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Kashgar',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Asia/Rangoon',
      abbreviation: '+0630',
      offset: '06:30:00',
    },
    {
      timezone: 'Asia/Tel_Aviv',
      abbreviation: 'IDT',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Aqtau',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Asia/Baku',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Asia/Novosibirsk',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Asia/Seoul',
      abbreviation: 'KST',
      offset: '09:00:00',
    },
    {
      timezone: 'Asia/Hebron',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Asia/Dushanbe',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Asia/Khandyga',
      abbreviation: '+09',
      offset: '09:00:00',
    },
    {
      timezone: 'Asia/Chungking',
      abbreviation: 'CST',
      offset: '08:00:00',
    },
    {
      timezone: 'Asia/Calcutta',
      abbreviation: 'IST',
      offset: '05:30:00',
    },
    {
      timezone: 'Chile/Continental',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'Chile/EasterIsland',
      abbreviation: '-05',
      offset: '-05:00:00',
    },
    {
      timezone: 'MET',
      abbreviation: 'MEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Libya',
      abbreviation: 'EET',
      offset: '02:00:00',
    },
    {
      timezone: 'MST7MDT',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'US/Central',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'US/Pacific',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'US/East-Indiana',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'US/Mountain',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'US/Eastern',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'US/Arizona',
      abbreviation: 'MST',
      offset: '-07:00:00',
    },
    {
      timezone: 'US/Aleutian',
      abbreviation: 'HDT',
      offset: '-09:00:00',
    },
    {
      timezone: 'US/Hawaii',
      abbreviation: 'HST',
      offset: '-10:00:00',
    },
    {
      timezone: 'US/Samoa',
      abbreviation: 'SST',
      offset: '-11:00:00',
    },
    {
      timezone: 'US/Indiana-Starke',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'US/Alaska',
      abbreviation: 'AKDT',
      offset: '-08:00:00',
    },
    {
      timezone: 'US/Pacific-New',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'US/Michigan',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'UTC',
      abbreviation: 'UTC',
      offset: '00:00:00',
    },
    {
      timezone: 'ROC',
      abbreviation: 'CST',
      offset: '08:00:00',
    },
    {
      timezone: 'Mexico/BajaNorte',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'Mexico/BajaSur',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'Mexico/General',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'EET',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'ROK',
      abbreviation: 'KST',
      offset: '09:00:00',
    },
    {
      timezone: 'GMT0',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Navajo',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'Greenwich',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Indian/Mayotte',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Indian/Mauritius',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Indian/Cocos',
      abbreviation: '+0630',
      offset: '06:30:00',
    },
    {
      timezone: 'Indian/Reunion',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Indian/Antananarivo',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Indian/Mahe',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Indian/Kerguelen',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Indian/Maldives',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Indian/Christmas',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Indian/Comoro',
      abbreviation: 'EAT',
      offset: '03:00:00',
    },
    {
      timezone: 'Indian/Chagos',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Cuba',
      abbreviation: 'CDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'GMT-0',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Etc/Universal',
      abbreviation: 'UTC',
      offset: '00:00:00',
    },
    {
      timezone: 'Etc/GMT+10',
      abbreviation: -10,
      offset: '-10:00:00',
    },
    {
      timezone: 'Etc/Zulu',
      abbreviation: 'UTC',
      offset: '00:00:00',
    },
    {
      timezone: 'Etc/UCT',
      abbreviation: 'UCT',
      offset: '00:00:00',
    },
    {
      timezone: 'Etc/GMT+4',
      abbreviation: '-04',
      offset: '-04:00:00',
    },
    {
      timezone: 'Etc/GMT+2',
      abbreviation: '-02',
      offset: '-02:00:00',
    },
    {
      timezone: 'Etc/GMT-8',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Etc/GMT+8',
      abbreviation: '-08',
      offset: '-08:00:00',
    },
    {
      timezone: 'Etc/GMT',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Etc/GMT-3',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Etc/GMT+6',
      abbreviation: '-06',
      offset: '-06:00:00',
    },
    {
      timezone: 'Etc/GMT+9',
      abbreviation: '-09',
      offset: '-09:00:00',
    },
    {
      timezone: 'Etc/UTC',
      abbreviation: 'UTC',
      offset: '00:00:00',
    },
    {
      timezone: 'Etc/GMT-10',
      abbreviation: '+10',
      offset: '10:00:00',
    },
    {
      timezone: 'Etc/GMT-4',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Etc/GMT-7',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Etc/GMT-1',
      abbreviation: '+01',
      offset: '01:00:00',
    },
    {
      timezone: 'Etc/GMT-6',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Etc/GMT+1',
      abbreviation: '-01',
      offset: '-01:00:00',
    },
    {
      timezone: 'Etc/GMT0',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Etc/Greenwich',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Etc/GMT-0',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Etc/GMT-11',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Etc/GMT+11',
      abbreviation: -11,
      offset: '-11:00:00',
    },
    {
      timezone: 'Etc/GMT+7',
      abbreviation: '-07',
      offset: '-07:00:00',
    },
    {
      timezone: 'Etc/GMT-9',
      abbreviation: '+09',
      offset: '09:00:00',
    },
    {
      timezone: 'Etc/GMT-5',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Etc/GMT+5',
      abbreviation: '-05',
      offset: '-05:00:00',
    },
    {
      timezone: 'Etc/GMT+0',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Etc/GMT+3',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'Etc/GMT-2',
      abbreviation: '+02',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Stockholm',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Riga',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Mariehamn',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Kiev',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Monaco',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Warsaw',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Helsinki',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Podgorica',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Samara',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Europe/Zurich',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Belfast',
      abbreviation: 'BST',
      offset: '01:00:00',
    },
    {
      timezone: 'Europe/Tallinn',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Athens',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Belgrade',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Ulyanovsk',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Europe/Dublin',
      abbreviation: 'IST',
      offset: '01:00:00',
    },
    {
      timezone: 'Europe/Istanbul',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Vaduz',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Amsterdam',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Madrid',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Nicosia',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Vilnius',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Sofia',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Kirov',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Zaporozhye',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Moscow',
      abbreviation: 'MSK',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Copenhagen',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/San_Marino',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Minsk',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Malta',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Simferopol',
      abbreviation: 'MSK',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Tiraspol',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Busingen',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Luxembourg',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Isle_of_Man',
      abbreviation: 'BST',
      offset: '01:00:00',
    },
    {
      timezone: 'Europe/Chisinau',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Skopje',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Saratov',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Europe/Oslo',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Ljubljana',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Tirane',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Volgograd',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Berlin',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Uzhgorod',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Zagreb',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Bucharest',
      abbreviation: 'EEST',
      offset: '03:00:00',
    },
    {
      timezone: 'Europe/Vatican',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Astrakhan',
      abbreviation: '+04',
      offset: '04:00:00',
    },
    {
      timezone: 'Europe/Sarajevo',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Kaliningrad',
      abbreviation: 'EET',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Guernsey',
      abbreviation: 'BST',
      offset: '01:00:00',
    },
    {
      timezone: 'Europe/Andorra',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Rome',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Jersey',
      abbreviation: 'BST',
      offset: '01:00:00',
    },
    {
      timezone: 'Europe/Vienna',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Bratislava',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/London',
      abbreviation: 'BST',
      offset: '01:00:00',
    },
    {
      timezone: 'Europe/Lisbon',
      abbreviation: 'WEST',
      offset: '01:00:00',
    },
    {
      timezone: 'Europe/Gibraltar',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Paris',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Brussels',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Prague',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Europe/Budapest',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Iran',
      abbreviation: '+0330',
      offset: '03:30:00',
    },
    {
      timezone: 'GB-Eire',
      abbreviation: 'BST',
      offset: '01:00:00',
    },
    {
      timezone: 'Atlantic/Bermuda',
      abbreviation: 'ADT',
      offset: '-03:00:00',
    },
    {
      timezone: 'Atlantic/St_Helena',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Atlantic/Cape_Verde',
      abbreviation: '-01',
      offset: '-01:00:00',
    },
    {
      timezone: 'Atlantic/Reykjavik',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Atlantic/Azores',
      abbreviation: '+00',
      offset: '00:00:00',
    },
    {
      timezone: 'Atlantic/Faeroe',
      abbreviation: 'WEST',
      offset: '01:00:00',
    },
    {
      timezone: 'Atlantic/Madeira',
      abbreviation: 'WEST',
      offset: '01:00:00',
    },
    {
      timezone: 'Atlantic/Stanley',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'Atlantic/South_Georgia',
      abbreviation: '-02',
      offset: '-02:00:00',
    },
    {
      timezone: 'Atlantic/Faroe',
      abbreviation: 'WEST',
      offset: '01:00:00',
    },
    {
      timezone: 'Atlantic/Canary',
      abbreviation: 'WEST',
      offset: '01:00:00',
    },
    {
      timezone: 'Atlantic/Jan_Mayen',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Antarctica/McMurdo',
      abbreviation: 'NZDT',
      offset: '13:00:00',
    },
    {
      timezone: 'Antarctica/Casey',
      abbreviation: '+08',
      offset: '08:00:00',
    },
    {
      timezone: 'Antarctica/DumontDUrville',
      abbreviation: '+10',
      offset: '10:00:00',
    },
    {
      timezone: 'Antarctica/Mawson',
      abbreviation: '+05',
      offset: '05:00:00',
    },
    {
      timezone: 'Antarctica/Vostok',
      abbreviation: '+06',
      offset: '06:00:00',
    },
    {
      timezone: 'Antarctica/Syowa',
      abbreviation: '+03',
      offset: '03:00:00',
    },
    {
      timezone: 'Antarctica/Troll',
      abbreviation: '+02',
      offset: '02:00:00',
    },
    {
      timezone: 'Antarctica/Palmer',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'Antarctica/Rothera',
      abbreviation: '-03',
      offset: '-03:00:00',
    },
    {
      timezone: 'Antarctica/Davis',
      abbreviation: '+07',
      offset: '07:00:00',
    },
    {
      timezone: 'Antarctica/Macquarie',
      abbreviation: '+11',
      offset: '11:00:00',
    },
    {
      timezone: 'Antarctica/South_Pole',
      abbreviation: 'NZDT',
      offset: '13:00:00',
    },
    {
      timezone: 'CET',
      abbreviation: 'CEST',
      offset: '02:00:00',
    },
    {
      timezone: 'Israel',
      abbreviation: 'IDT',
      offset: '03:00:00',
    },
    {
      timezone: 'EST',
      abbreviation: 'EST',
      offset: '-05:00:00',
    },
    {
      timezone: 'WET',
      abbreviation: 'WEST',
      offset: '01:00:00',
    },
    {
      timezone: 'GMT+0',
      abbreviation: 'GMT',
      offset: '00:00:00',
    },
    {
      timezone: 'Canada/Central',
      abbreviation: 'CDT',
      offset: '-05:00:00',
    },
    {
      timezone: 'Canada/Pacific',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'Canada/Mountain',
      abbreviation: 'MDT',
      offset: '-06:00:00',
    },
    {
      timezone: 'Canada/Eastern',
      abbreviation: 'EDT',
      offset: '-04:00:00',
    },
    {
      timezone: 'Canada/Yukon',
      abbreviation: 'PDT',
      offset: '-07:00:00',
    },
    {
      timezone: 'Canada/Newfoundland',
      abbreviation: 'NDT',
      offset: '-02:30:00',
    },
    {
      timezone: 'Canada/Atlantic',
      abbreviation: 'ADT',
      offset: '-03:00:00',
    },
    {
      timezone: 'Canada/Saskatchewan',
      abbreviation: 'CST',
      offset: '-06:00:00',
    },
  ];

  constructor(private utilityService: UtilityService) {}

  //TODO: Add proper types after utility service has been fixed
  convertAllDatesToProperLocale(object: TxnCustomProperties[], offset: string): TxnCustomProperties[] | Date {
    const that = this;
    const copiedObject: TxnCustomProperties[] = cloneDeep(object);
    return <Date>that.utilityService.traverse(copiedObject, function (prop: Date) {
      if (prop instanceof Date) {
        prop.setHours(12);
        prop.setMinutes(0);
        prop.setSeconds(0);
        prop.setMilliseconds(0);
        return that.convertToUtc(prop, offset);
      } else {
        return prop;
      }
    });
  }

  convertToTimezone(date: Date, offset: string, toUtc: boolean): Date {
    const correctedDate = cloneDeep(date);

    let hourOffset = +offset.split(':')[0];
    const minOffset = +offset.split(':')[1];
    const offsetDirection = Math.sign(hourOffset);
    hourOffset = Math.abs(hourOffset);

    let hours: number;
    let mins: number;

    if (toUtc) {
      hours = date.getHours() - offsetDirection * hourOffset;
      mins = date.getMinutes() - offsetDirection * minOffset;
    } else {
      hours = date.getHours() + offsetDirection * hourOffset;
      mins = date.getMinutes() + offsetDirection * minOffset;
    }

    correctedDate.setUTCHours(hours);
    correctedDate.setUTCMinutes(mins);
    // Hack here. This only works because date dosnt change due to offset. Should be removed when we stop considering the
    // 1200 hour assumption we make is also removed
    correctedDate.setDate(date.getDate());
    // Adding this for month changing when date is 1
    correctedDate.setMonth(date.getMonth());
    // Adding this for year changing when date is Jan 1
    correctedDate.setFullYear(date.getFullYear());
    return correctedDate;
  }

  convertToUtc(date: Date, offset: string): Date {
    return this.convertToTimezone(date, offset, true);
  }
}
