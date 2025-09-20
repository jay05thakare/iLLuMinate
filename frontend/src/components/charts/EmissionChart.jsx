import { ChartBarIcon } from '@heroicons/react/24/outline';

const EmissionChart = ({ data, type = 'line', title, height = 300 }) => {
  // Mock chart data visualization
  const chartData = data || [
    { month: 'Jan', value: 120000 },
    { month: 'Feb', value: 135000 },
    { month: 'Mar', value: 128000 },
    { month: 'Apr', value: 142000 },
    { month: 'May', value: 125000 },
    { month: 'Jun', value: 138000 },
    { month: 'Jul', value: 145000 },
    { month: 'Aug', value: 133000 },
    { month: 'Sep', value: 140000 },
    { month: 'Oct', value: 132000 },
    { month: 'Nov', value: 129000 },
    { month: 'Dec', value: 136000 },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {title && (
        <div className="flex items-center mb-4">
          <ChartBarIcon className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="relative" style={{ height: `${height}px` }}>
        {type === 'line' ? (
          <LineChart data={chartData} maxValue={maxValue} height={height} />
        ) : (
          <BarChart data={chartData} maxValue={maxValue} height={height} />
        )}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Chart visualization powered by Chart.js (Phase 3 integration)
        </p>
      </div>
    </div>
  );
};

// Simple SVG Line Chart Component
const LineChart = ({ data, maxValue, height }) => {
  const width = 600;
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  const points = data.map((item, index) => {
    const x = padding + (index * (chartWidth / (data.length - 1)));
    const y = padding + (chartHeight - ((item.value / maxValue) * chartHeight));
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
        const y = padding + (chartHeight * ratio);
        return (
          <g key={index}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={y + 4}
              fontSize="12"
              fill="#6b7280"
              textAnchor="end"
            >
              {((1 - ratio) * maxValue / 1000).toFixed(0)}k
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {data.map((item, index) => {
        const x = padding + (index * (chartWidth / (data.length - 1)));
        return (
          <text
            key={index}
            x={x}
            y={height - padding + 20}
            fontSize="12"
            fill="#6b7280"
            textAnchor="middle"
          >
            {item.month}
          </text>
        );
      })}

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {data.map((item, index) => {
        const x = padding + (index * (chartWidth / (data.length - 1)));
        const y = padding + (chartHeight - ((item.value / maxValue) * chartHeight));
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="4"
            fill="#3b82f6"
            stroke="#ffffff"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

// Simple SVG Bar Chart Component
const BarChart = ({ data, maxValue, height }) => {
  const width = 600;
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  const barWidth = chartWidth / data.length * 0.8;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
        const y = padding + (chartHeight * ratio);
        return (
          <g key={index}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={y + 4}
              fontSize="12"
              fill="#6b7280"
              textAnchor="end"
            >
              {((1 - ratio) * maxValue / 1000).toFixed(0)}k
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((item, index) => {
        const x = padding + (index * (chartWidth / data.length)) + ((chartWidth / data.length - barWidth) / 2);
        const barHeight = (item.value / maxValue) * chartHeight;
        const y = padding + chartHeight - barHeight;
        
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#3b82f6"
              rx="4"
            />
            <text
              x={x + barWidth / 2}
              y={height - padding + 20}
              fontSize="12"
              fill="#6b7280"
              textAnchor="middle"
            >
              {item.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default EmissionChart;
