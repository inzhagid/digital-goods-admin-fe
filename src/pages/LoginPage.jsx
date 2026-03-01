import { useState } from "react";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader } from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useAuth } from "../app/auth/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const { token, login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = { email: "", password: "" };
    let valid = true;

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid Email";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      login({ email, role: "admin" });
      setIsLoading(false);
      navigate("/transactions");
    }, 800);
  };

  if (token) {
    return <Navigate to="/transactions" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-lg font-semibold text-gray-900">Login</h1>
          <p className="text-sm text-gray-500">Log in to your account</p>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm text-gray-600">
                Email
              </label>
              <Input
                id="email"
                type="text"
                placeholder="Email"
                value={email}
                disabled={isLoading}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm text-gray-600">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in . . ." : "Log in"}
            </Button>

            <Button variant="secondary">Register</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
