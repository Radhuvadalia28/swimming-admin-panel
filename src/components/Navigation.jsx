import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/students', label: 'Students' },
    { path: '/classes', label: 'Classes' },
    { path: '/instructors', label: 'Instructors' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/reports', label: 'Reports' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>Swimming Academy</h1>
      </div>
      <ul className="nav-menu">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link 
              to={item.path} 
              className={location.pathname === item.path ? 'nav-link active' : 'nav-link'}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
