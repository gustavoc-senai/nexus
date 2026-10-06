import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DemoProvider } from './context/DemoContext'
import { AppRoutes } from './routes/AppRoutes'
export default function App() { return <BrowserRouter><AuthProvider><DemoProvider><AppRoutes /></DemoProvider></AuthProvider></BrowserRouter> }
