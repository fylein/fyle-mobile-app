import { StatsDResponse } from '../models/stats-dimension-response.model';

export const apiTransactionUnreportedStatsRes: StatsDResponse[] = [
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 6,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 16748.73,
      },
    ],
    dimensions: [],
    name: 'scalar_stat',
  },
];

export const apiTransactionIncompleteStatsRes: StatsDResponse[] = [
  {
    aggregates: [
      {
        function_name: 'count(tx_id)',
        function_value: 1130,
      },
      {
        function_name: 'sum(tx_amount)',
        function_value: 1148487.57555147,
      },
    ],
    dimensions: [],
    name: 'scalar_stat',
  },
];
