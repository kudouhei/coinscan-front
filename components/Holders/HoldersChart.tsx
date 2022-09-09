import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import type { DailyHodlersStatesQuery } from '../../generated/graphql';
import BasicTooltip from '../Charts/BasicTooltip';
import {
  CHART_TIME_TOOLTIP_LABEL_FORMATTERS,
  CHART_TIME_XAXIS_TICK_FORMATTERS,
  ChartTimeGroupings,
  LINE_CHART_GROUPS,
  BAR_CHART_GROUPS,
  groupDataMaxByWeeks,
  groupDataMaxByMonths,
  formatMin,
  formatMax,
} from '../../utils/charts';

type FormattedChartData =
  | {
      name: string;
      count: number;
    }[]
  | null;

type HoldersChartProps = {
  groupBy: ChartTimeGroupings;
  data: DailyHodlersStatesQuery | undefined;
  loading?: boolean;
};

const HodlersChart = ({ data, groupBy, loading }: HoldersChartProps) => {
  const theme = useTheme();

  let currentLabelFormatter = CHART_TIME_TOOLTIP_LABEL_FORMATTERS[groupBy];
  let currentXAxisTickFormatter = CHART_TIME_XAXIS_TICK_FORMATTERS[groupBy];

  let formattedData: FormattedChartData = null;

  if (data) {
    let rawData = data.dailyHoldersStates;
    switch (groupBy) {
      case ChartTimeGroupings.BY_MONTH:
        rawData = groupDataMaxByMonths(rawData);
        break;
      case ChartTimeGroupings.BY_WEEK:
        rawData = groupDataMaxByWeeks(rawData);
        break;
      default:
        rawData = rawData.slice(0, 89); // by day
    }
    formattedData = rawData
      .map((dayData) => {
        return {
          count: dayData.count,
          display: dayData.count,
          name: dayData.id,
        };
      })
      .reverse();
  }

  if (loading)
    return (
      <Skeleton
        component="div"
        sx={{ transform: 'none', width: '100%', height: 300 }}
      />
    );

  return formattedData ? (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        {LINE_CHART_GROUPS.includes(groupBy) ? (
          <AreaChart
            width={500}
            height={200}
            data={formattedData}
            margin={{
              top: 5,
              right: 30,
              left: 80,
              bottom: 50,
            }}
          >
            <CartesianGrid strokeDasharray="1 3" />
            <XAxis
              fontSize="0.875rem"
              dataKey="name"
              angle={-45}
              tick={{ dy: 30 }}
              tickFormatter={currentXAxisTickFormatter}
            />
            <YAxis
              fontSize="0.875rem"
              scale="linear"
              interval="preserveEnd"
              domain={[
                (dataMin: number) => formatMin(dataMin, 50),
                (dataMax: number) => formatMax(dataMax, 50),
              ]}
            />
            <Tooltip
              content={<BasicTooltip labelFormatter={currentLabelFormatter} />}
            />
            <Area
              type="linear"
              dataKey="count"
              activeDot={{ r: 1 }}
              fill={theme.palette.primary.main}
              fillOpacity={0.7}
            />
          </AreaChart>
        ) : BAR_CHART_GROUPS.includes(groupBy) ? (
          <BarChart
            width={500}
            height={200}
            data={formattedData}
            margin={{
              top: 5,
              right: 30,
              left: 80,
              bottom: 50,
            }}
          >
            <CartesianGrid strokeDasharray="1 3" />
            <XAxis
              fontSize="0.875rem"
              dataKey="name"
              angle={-45}
              tick={{ dy: 30 }}
              tickFormatter={currentXAxisTickFormatter}
            />
            <YAxis fontSize="0.875rem" />
            <Tooltip
              content={<BasicTooltip labelFormatter={currentLabelFormatter} />}
            />

            <Bar dataKey="count" fill={theme.palette.primary.main} />
          </BarChart>
        ) : (
          <></>
        )}
      </ResponsiveContainer>
    </Box>
  ) : null;
};

type HodlersChartGroupingsProps = {
  loading?: boolean;
  data?: DailyHodlersStatesQuery;
};

const HoldersChartWithGroupings = ({
  data,
  loading,
}: HodlersChartGroupingsProps) => {
  const [chartGrouping, setChartGrouping] = useState<ChartTimeGroupings>(
    ChartTimeGroupings.BY_DAY
  );
  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography>Total holders</Typography>
        <ButtonGroup
          sx={{
            button: {
              fontSize: {
                xs: '0.8rem',
                sm: 'button.fontSize',
              },
            },
          }}
          variant="contained"
          aria-label="outlined primary button group"
        >
          <Button
            disabled={chartGrouping === ChartTimeGroupings.BY_DAY}
            onClick={() => setChartGrouping(ChartTimeGroupings.BY_DAY)}
          >
            By Day
          </Button>
          <Button
            disabled={chartGrouping === ChartTimeGroupings.BY_WEEK}
            onClick={() => setChartGrouping(ChartTimeGroupings.BY_WEEK)}
          >
            By Week
          </Button>
          <Button
            disabled={chartGrouping === ChartTimeGroupings.BY_MONTH}
            onClick={() => setChartGrouping(ChartTimeGroupings.BY_MONTH)}
          >
            By Month
          </Button>
        </ButtonGroup>
      </Box>

      <HodlersChart data={data} groupBy={chartGrouping} loading={loading} />
    </>
  );
};

export default HoldersChartWithGroupings;