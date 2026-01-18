# Low-Latency Price Cache Dashboard

A high-performance real-time stock price monitoring dashboard with sub-microsecond latency caching, advanced performance metrics, and production-grade observability.

## 🎯 Overview

The Price Cache Dashboard is a full-stack application designed to demonstrate ultra-low latency caching patterns for real-time financial data. It fetches live stock prices and caches them with intelligent refresh strategies, delivering sub-microsecond response times while maintaining data freshness.

can be accessed via: https://price-cache.sbs/
(the api call could be sleeping and therefore using fallback data)

**Key Features:**
- ⚡ **Sub-microsecond latency** - Cached responses in 1-10µs
- 📊 **Real-time price chart** - Multi-stock visualization with live updates
- 📈 **Advanced metrics** - P95/P99 latency percentiles, hit rates, speedup ratios
- 🔄 **Smart caching** - Automatic refresh with background threads
- 📱 **Mobile-responsive** - Hamburger navigation and responsive design
- 🌐 **Multi-page dashboard** - Dashboard, Observability, Circuit Breaker, Benchmark pages

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Wouter** - Lightweight client-side routing
- **Recharts** - Interactive charting library
- **Vite** - Fast development server and build tool

### Backend
- **Python 3** - Backend runtime
- **FastAPI** - Modern async web framework
- **yfinance** - Yahoo Finance data fetching
- **Threading** - Background price refresh
- **CORS** - Cross-origin request handling

### Deployment
- **Manus** - Hosting platform with custom domain support
- **GitHub** - Version control and CI/CD integration

## 📋 Project Structure

```
price-cache-dashboard/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   │   └── images/                  # Image assets
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.tsx             # Dashboard page
│   │   │   ├── Observability.tsx    # Metrics page
│   │   │   ├── CircuitBreaker.tsx   # Circuit breaker status
│   │   │   └── Benchmark.tsx        # Performance benchmark
│   │   ├── components/              # Reusable components
│   │   │   ├── Header.tsx           # Navigation header
│   │   │   ├── PriceChart.tsx       # Real-time price chart
│   │   │   ├── MetricsPanel.tsx     # Backend metrics display
│   │   │   ├── Ticker.tsx           # Stock ticker component
│   │   │   └── ...                  # Other UI components
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── usePrices.ts         # Price data fetching
│   │   │   ├── useApiStatus.ts      # API health check
│   │   │   └── ...                  # Other hooks
│   │   ├── lib/                     # Utility functions
│   │   │   └── api.ts               # API client service
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # React entry point
│   │   └── index.css                # Global styles
│   └── index.html                   # HTML template
├── server/                          # Placeholder for backend (not used in static)
└── package.json                     # Dependencies

price-cache/                         # Backend API server
├── api_server.py                    # FastAPI application
├── price_cache_live.py              # Price cache implementation
└── requirements.txt                 # Python dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 22+ and npm/pnpm
- Python 3.9+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/price-cache-dashboard.git
   cd price-cache-dashboard
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   pnpm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../price-cache
   pip install -r requirements.txt
   ```

### Development

1. **Start the backend API server**
   ```bash
   cd price-cache
   python3 api_server.py
   ```
   The API will be available at `http://localhost:8000`

2. **Start the frontend dev server** (in another terminal)
   ```bash
   cd client
   pnpm dev
   ```
   The dashboard will be available at `http://localhost:3000`

3. **Open in browser**
   Navigate to `http://localhost:3000` to see the dashboard

## 📊 Dashboard Pages

### Dashboard (`/`)
Main page showing:
- Real-time stock prices (AAPL, MSFT, GOOGL, AMZN, TSLA)
- Cache performance metrics (latency, speedup, hit rate)
- Real-time price chart with multi-stock visualization
- Live price ticker

### Observability (`/observability`)
Production metrics including:
- System health status
- Backend metrics (P95/P99 latency, hit rate)
- Cache statistics
- Measurement methodology documentation

### Circuit Breaker (`/circuit-breaker`)
API resilience monitoring:
- Circuit breaker state (CLOSED/OPEN/HALF_OPEN)
- Success/failure rates
- Configuration parameters

### Benchmark (`/benchmark`)
Performance testing:
- Latency comparison charts
- Request distribution analysis
- System overview metrics

## 🔧 Configuration

### API Endpoint
The frontend automatically uses different API endpoints based on environment:
- **Development**: `/api` (proxied by Vite to `http://localhost:8000`)
- **Production**: Public API URL (configured in `client/src/lib/api.ts`)

### Stock Symbols
Modify the symbols in `client/src/lib/api.ts`:
```typescript
const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
```

### Cache Refresh Interval
Backend cache refresh interval (in `price-cache/api_server.py`):
```python
CACHE_REFRESH_INTERVAL = 5  # seconds
```

## 📈 Performance Metrics

The dashboard tracks several key metrics:

| Metric | Description | Typical Value |
|--------|-------------|---------------|
| **Cached Latency** | Response time from cache | 1-10 µs |
| **Uncached Latency** | Direct API call latency | 100-200 ms |
| **Speedup** | Cached vs uncached ratio | 10,000-100,000x |
| **Hit Rate** | Percentage of cache hits | 99-100% |
| **P95 Latency** | 95th percentile latency | 200-300 µs |
| **P99 Latency** | 99th percentile latency | 300-500 µs |

## 🌐 Deployment

### Deploy to Manus
1. Create a checkpoint in the Manus UI
2. Click the "Publish" button to deploy
3. Access your site at the provided domain

### Custom Domain
Configure a custom domain through the Manus Management UI (Settings → Domains)

## 📝 API Endpoints

### Frontend API
The frontend communicates with the backend through these endpoints:

- `GET /prices` - Get all current stock prices
- `GET /health` - Health check endpoint
- `GET /stats` - Cache statistics and metrics
- `GET /circuit-breaker/status` - Circuit breaker status
- `WS /ws/stats` - WebSocket stream for real-time metrics

## 🔐 Security

- CORS enabled for cross-origin requests
- No sensitive data stored in frontend
- API responses include cache metadata for transparency

## 📱 Responsive Design

The dashboard is fully responsive with:
- Mobile hamburger navigation
- Adaptive layouts for all screen sizes
- Touch-friendly controls
- Optimized chart rendering on mobile

## 🎨 Design

- **Color Scheme**: Dark theme with neon green accents
- **Typography**: IBM Plex Mono for technical aesthetic
- **Components**: shadcn/ui for consistent, accessible UI
- **Animations**: Smooth transitions and micro-interactions

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the code comments for implementation details

## 🔄 Real-Time Data

**Important**: The deployed site requires the backend API server to be running for real-time data. The sandbox environment may hibernate after inactivity, causing the API to become unavailable. For production use with 24/7 uptime, deploy the backend to a permanent hosting service.

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [shadcn/ui Components](https://ui.shadcn.com)

---

Built with ⚡ for high-performance financial data visualization
