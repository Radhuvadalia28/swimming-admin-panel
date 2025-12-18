# Authentication System

This document explains how the authentication system works in the Swimming Academy Admin Panel.

## Overview

The application now includes a complete authentication system with:
- Login page for unauthenticated users
- Protected routes for authenticated users
- Automatic redirects based on authentication state
- User session management with localStorage

## Features

### 🔐 Authentication Context
- **File**: `src/context/AuthContext.jsx`
- Manages user authentication state globally
- Provides login/logout functions
- Handles user session persistence

### 🚪 Route Protection
- **Protected Routes**: All admin pages (Dashboard, Students, Classes)
- **Public Routes**: Login page only
- **Automatic Redirects**: Users are redirected based on their auth status

### 👤 User Management
- User information display in sidebar and header
- Logout functionality
- User profile menu in the top-right corner

## How It Works

### 1. Authentication Flow
1. User visits any protected route
2. If not authenticated, redirected to `/login`
3. After successful login, redirected back to intended page
4. User session persists across browser refreshes

### 2. Route Structure
```
/login (Public) - Login page for unauthenticated users
/ (Protected) - Dashboard (requires authentication)
/students (Protected) - Students page (requires authentication)
/classes (Protected) - Classes page (requires authentication)
```

### 3. Component Hierarchy
```
App
├── AuthProvider (Context)
├── Router
    ├── /login (PublicRoute + Login)
    └── /* (ProtectedRoute + Layout + Protected Pages)
```

## Demo Credentials

For testing purposes, use these credentials:
- **Email**: `admin@swimmingacademy.com`
- **Password**: `admin123`

## Files Created/Modified

### New Files
- `src/context/AuthContext.jsx` - Authentication context
- `src/pages/Login.jsx` - Login page
- `src/components/ProtectedRoute.jsx` - Route protection for authenticated users
- `src/components/PublicRoute.jsx` - Route protection for unauthenticated users
- `src/components/LoadingSpinner.jsx` - Loading component
- `src/hooks/useAuthRedirect.js` - Authentication redirect hook

### Modified Files
- `src/App.jsx` - Updated routing with authentication
- `src/components/Layout.jsx` - Added user info and logout functionality

## Usage Examples

### Using Authentication in Components
```jsx
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      Welcome, {user.name}!
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Creating Protected Routes
```jsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route 
  path="/admin" 
  element={
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

### Creating Public Routes
```jsx
import PublicRoute from '../components/PublicRoute';

<Route 
  path="/login" 
  element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  } 
/>
```

## Security Notes

- **Current Implementation**: Uses localStorage for session persistence (demo purposes)
- **Production**: Should be replaced with secure HTTP-only cookies and JWT tokens
- **Password Storage**: Never store passwords in localStorage in production
- **API Integration**: Replace mock authentication with real API calls

## Customization

### Changing Authentication Logic
Modify the `login` function in `AuthContext.jsx` to integrate with your backend API:

```jsx
const login = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};
```

### Adding More Protected Routes
Simply wrap any new page component with `ProtectedRoute`:

```jsx
<Route 
  path="/new-page" 
  element={
    <ProtectedRoute>
      <Layout>
        <NewPage />
      </Layout>
    </ProtectedRoute>
  } 
/>
```

## Troubleshooting

### Common Issues
1. **Infinite Redirect Loop**: Check that `PublicRoute` and `ProtectedRoute` are properly configured
2. **User Not Staying Logged In**: Verify localStorage is working in your browser
3. **Routes Not Working**: Ensure all imports are correct and components are exported

### Debug Mode
Add console logs to the authentication context to debug issues:

```jsx
useEffect(() => {
  console.log('Auth state changed:', { user, isAuthenticated, loading });
}, [user, isAuthenticated, loading]);
```

## Future Enhancements

- [ ] Add password reset functionality
- [ ] Implement role-based access control
- [ ] Add remember me functionality
- [ ] Implement session timeout
- [ ] Add multi-factor authentication
- [ ] Create user registration page
- [ ] Add password strength validation







