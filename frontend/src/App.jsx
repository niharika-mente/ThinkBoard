import { Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import CreatePage from './pages/CreatePage'
import NoteDetailPage from './pages/NoteDetailPage'
import Navbar from './components/Navbar'

const App = () => {
  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: "radial-gradient(125% 125% at 50% 10%, #000 60%, #7480ff 100%)",
      }}
    >
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/create' element={<CreatePage />} />
        <Route path='/note/:id' element={<NoteDetailPage />} />
      </Routes>
    </div>
  )
}

export default App