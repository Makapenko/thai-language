import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LessonPage } from './pages/LessonPage';
import { TheoryPage } from './pages/TheoryPage';
import { WordsPage } from './pages/WordsPage';
import { PhrasesPage } from './pages/PhrasesPage';
import { useStorageSync } from './hooks/useStorageSync';
import './styles/global.css';

function AppContent() {
  useStorageSync();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/lesson/:lessonId/theory" element={<TheoryPage />} />
        <Route path="/lesson/:lessonId/words" element={<WordsPage />} />
        <Route path="/lesson/:lessonId/phrases" element={<PhrasesPage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
