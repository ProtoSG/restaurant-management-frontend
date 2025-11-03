import { Navigate, Route, Routes } from "react-router-dom"
import { Tables } from "./pages"
import { Layout } from "./layouts"

function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* <Route index element={<Dashboard />}/> */}
        <Route index element={<Tables />}/>
        <Route path="*" element={<Navigate to="/" replace />}/>
      </Route>
    </Routes>
  )
}

export default App
