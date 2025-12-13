import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { ProtectedRoute } from "./components/protected-route";
import { AdminRoute } from "./components/admin-route";
import { Login } from "./pages/login";
import { Register } from "./pages/register";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <AdminRoute exact path="/admin" component={AdminDashboard} />
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;