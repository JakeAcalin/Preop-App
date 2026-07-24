import { HashRouter, Routes, Route } from 'react-router-dom';
import CaseList from './pages/CaseList';
import CaseEditor from './pages/CaseEditor';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CaseList />} />
        <Route path="/case/:id" element={<CaseEditor />} />
      </Routes>
    </HashRouter>
  );
}
