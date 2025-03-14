import { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

function transformStockData(jsonData) {
  const institutions = Object.keys(jsonData);
  const dates = jsonData[institutions[0]].map(item => item.date);
  
  const datasets = institutions.map((inst, index) => ({
    label: `${inst} Price`,
    data: jsonData[inst].map(item => item.price),
    borderColor: [`#8884d8`, `#82ca9d`, `#ffc658`][index % 3],
    backgroundColor: [`#8884d8`, `#82ca9d`, `#ffc658`][index % 3],
    borderWidth: 2,
    tension: 0.1,
    fill: false
  }));

  return { dates, datasets };
}

function App() {
  const [chartData, setChartData] = useState({ dates: [], datasets: [] });
  const [sliderValue, setSliderValue] = useState(0);
  const chartRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/stocks')
      .then(res => res.json())
      .then(jsonData => {
        setChartData(transformStockData(jsonData));
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      zoom: {
        pan: {
          enabled: false
        },
        zoom: {
          wheel: {
            enabled: false
          },
          pinch: {
            enabled: false
          },
          drag: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderColor: 'rgba(0,0,0,0.3)',
            borderWidth: 1,
            threshold: 10
          },
          mode: 'x',
        },
        limits: {
          x: {
            minRange: 7 // Minimum 7 days visible
          }
        }
      }
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 4
      },
      line: {
        borderWidth: 1
      }
    },
    scales: {
      x: {
        border: {
          display: true,
          color: '#666'
        },
        grid: {
          display: true,
          color: '#ddd'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        },
        min: sliderValue,
        max: Math.min(sliderValue + 365, chartData.dates?.length - 1)
      },
      y: {
        border: {
          display: true,
          color: '#666'
        },
        grid: {
          display: true,
          color: '#ddd'
        }
      }
    }
  };

  const data = {
    labels: chartData.dates,
    datasets: chartData.datasets
  };

  return (
    <div className="App">
      <h1>Stock Price Chart</h1>
      <div style={{ 
        height: '400px',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: 'white'
      }}>
        <Line ref={chartRef} options={options} data={data} />
      </div>
      <div style={{
        marginTop: '10px',
        padding: '0 20px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <input
          type="range"
          min={0}
          max={Math.max(0, (chartData.dates?.length || 0) - 365)}
          value={sliderValue}
          onChange={(e) => {
            setSliderValue(parseInt(e.target.value));
          }}
          style={{
            width: '100%',
            margin: '10px 0'
          }}
        />
        <button
          onClick={() => chartRef.current?.resetZoom()}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            background: 'white',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Reset Zoom
        </button>
      </div>
    </div>
  );
}

export default App;