import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';

const MainLayout = () => {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
