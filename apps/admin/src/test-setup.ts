import '@testing-library/jest-dom';

// Mock @fintech/analytics
vi.mock('@fintech/analytics', () => ({
  SIDEBAR_TOGGLE: 'sidebar_toggle',
  PAGE_VIEW: 'page_view',
  SEARCH: 'search',
}));

vi.mock('@fintech/analytics/react', () => ({
  useAnalytics: () => ({
    track: vi.fn(),
  }),
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  LineChart: ({ children }: { children: React.ReactNode }) => children,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  AreaChart: ({ children }: { children: React.ReactNode }) => children,
  Area: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => children,
  Pie: () => null,
  Cell: () => null,
}));

// Mock ag-grid-react
vi.mock('ag-grid-react', () => ({
  AgGridReact: () => null,
  AgGridProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ag-grid-community
vi.mock('ag-grid-community', () => ({
  AllCommunityModule: [],
  themeQuartz: {
    withParams: () => ({
      accentColor: '#00C805',
    }),
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  NavLink: ({ children }: { children: React.ReactNode }) => children,
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children }: { children: React.ReactNode }) => children,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: () => null,
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
}));

// Mock CSS imports
vi.mock('ag-grid-community/styles/ag-grid.css', () => ({}));
vi.mock('ag-grid-community/styles/ag-theme-quartz.css', () => ({}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((_query: string) => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserverMock;

// Mock fetch
global.fetch = vi.fn();
