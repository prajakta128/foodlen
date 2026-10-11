import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './components/auth/RequireAuth';
import {
  Home,
  Login,
  Signup,
  VerifyOTP,
  Product,
  Scanner,
  Search,
  Compare,
  Alternatives,
  Restaurants,
  RestaurantDetail,
  Saved,
  Profile,
  Admin,
} from './pages';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Product lookup requires an account — that's the whole point of the flow */}
        <Route path="/product/:id" element={<RequireAuth><Product /></RequireAuth>} />
        <Route path="/scan" element={<RequireAuth><Scanner /></RequireAuth>} />
        <Route path="/search" element={<RequireAuth><Search /></RequireAuth>} />
        <Route path="/compare" element={<RequireAuth><Compare /></RequireAuth>} />
        <Route path="/alternatives" element={<RequireAuth><Alternatives /></RequireAuth>} />

        {/* Restaurant routes */}
        <Route path="/restaurants" element={<RequireAuth><Restaurants /></RequireAuth>} />
        <Route path="/restaurants/:id" element={<RequireAuth><RestaurantDetail /></RequireAuth>} />

        {/* User routes */}
        <Route path="/saved" element={<RequireAuth><Saved /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

        {/* Admin routes */}
        <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
