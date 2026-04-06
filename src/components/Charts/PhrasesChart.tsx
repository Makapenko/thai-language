import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '../../app/hooks';
import { getPhrasesChartData, formatMinutes } from '../../utils/chartUtils';
import styles from './Charts.module.css';

interface PhrasesChartProps {
  height?: number;
  daysCount?: number;
}

export const PhrasesChart: React.FC<PhrasesChartProps> = ({ height = 300, daysCount = 30 }) => {
  const dailyProgress = useAppSelector((state) => state.phrases.dailyProgress);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(600);
  
  const chartData = useMemo(() => getPhrasesChartData(dailyProgress, daysCount), [dailyProgress, daysCount]);
  
  // Calculate chart width based on data points (min 40px per day)
  useEffect(() => {
    if (chartRef.current) {
      const containerWidth = chartRef.current.offsetWidth;
      const minWidth = daysCount * 40;
      setChartWidth(Math.max(minWidth, containerWidth));
    }
  }, [daysCount]);
  
  // Auto-scroll to the end (most recent data) on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.scrollLeft = chartRef.current.scrollWidth;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [chartData]);
  
  const hasData = chartData.some(d => d.timeSpent > 0 || d.correctPhrases > 0);
  
  if (!hasData) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📊</div>
        <p>Нет данных. Начните практиковать фразы, чтобы увидеть прогресс.</p>
      </div>
    );
  }
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipDate}>{data.name}</p>
        <p className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ backgroundColor: '#4A90D9' }}></span>
          Время: {formatMinutes(data.timeSpent)}
        </p>
        <p className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ backgroundColor: '#FF9800' }}></span>
          Успешных фраз: {data.correctPhrases}
        </p>
      </div>
    );
  };
  
  return (
    <div className={styles.chartWrapper}>
      <div ref={chartRef} className={styles.chartScrollContainer}>
        <ResponsiveContainer width={chartWidth} height={height}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="name"
              stroke="#666"
              style={{ fontSize: '0.75rem' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#4A90D9"
              style={{ fontSize: '0.75rem' }}
              tickFormatter={(value) => formatMinutes(value)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#FF9800"
              style={{ fontSize: '0.75rem' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '0.75rem' }}
              formatter={(value) => {
                if (value === 'timeSpent') return 'Время';
                if (value === 'correctPhrases') return 'Успешных фраз';
                return value;
              }}
            />
            
            <Bar
              yAxisId="left"
              dataKey="timeSpent"
              fill="#4A90D9"
              opacity={0.3}
              name="timeSpent"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="correctPhrases"
              stroke="#FF9800"
              strokeWidth={3}
              dot={{ fill: '#FF9800', r: 5 }}
              activeDot={{ r: 7 }}
              name="correctPhrases"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.scrollHint}>← Прокрутите для просмотра всех данных →</div>
    </div>
  );
};
