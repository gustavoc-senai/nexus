import { PageErrorBoundary } from './components/ui/PageErrorBoundary'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DemoProvider } from './context/DemoContext'
import { AppRoutes } from './routes/AppRoutes'
export default function App() { return <BrowserRouter><AuthProvider><DemoProvider><PageErrorBoundary><AppRoutes /></PageErrorBoundary></DemoProvider></AuthProvider></BrowserRouter> }
