// components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { checkSession } from '../utils/sessionManager';

const PrivateRoute = ({ children }) => {
  if (!checkSession()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;