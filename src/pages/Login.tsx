import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { setCredentials } from "../store/slices/authSlice";
import { authAPI } from "../services/api";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../assets/logo.png";

// Reusable Password Field with Show/Hide Toggle
const PasswordField = ({
  id,
  label,
  value,
  onChange,
  name,
  required = false,
  placeholder = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  required?: boolean;
  placeholder?: string;
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isPasswordVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-700"
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
        >
          {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Signing in...");

    try {
      const response = await authAPI.login({ email, password });

      // Dispatch the action to save user and token to Redux store
      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.token,
        })
      );

      toast.success("Login successful! Redirecting...", { id: loadingToastId });

      // Redirect to the intended page or dashboard
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          "Login failed. Please check your credentials.",
        { id: loadingToastId }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white overflow-hidden lg:grid lg:grid-cols-2">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Left Content Panel */}
      <div className="relative hidden w-full h-full flex-col justify-between bg-gradient-to-br from-slate-900 to-blue-900 p-8 text-white lg:flex">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Mediimate company logo" className="h-8 w-8" />
            <span className="text-2xl font-bold">MediiMate</span>
          </Link>
          <h1 className="mt-12 text-4xl font-bold tracking-tight">
            Welcome Back to Your Health Hub.
          </h1>
          <p className="mt-4 text-lg text-blue-200">
            Sign in to continue managing your health, appointments, and
            prescriptions seamlessly.
          </p>
        </div>

        <div className="relative z-10 mt-auto">
          <div className="rounded-xl bg-black/20 p-6 backdrop-blur-sm">
            <blockquote>
              "Having all my medical information in one place has been
              incredibly reassuring. The platform is secure and so easy to
              navigate."
            </blockquote>
            <footer className="mt-4 flex items-center gap-4">
              <img
                className="h-12 w-12 rounded-full object-cover"
                src="https://i.pravatar.cc/150?img=11"
                alt="John D."
              />
              <div>
                <p className="font-semibold text-white">John D.</p>
                <p className="text-sm text-blue-200">Verified User</p>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full h-full flex-col justify-center p-8 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <PasswordField
              id="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Sign in"
                )}
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div>
              <Link
                to="/otp-login"
                className="w-full h-12 flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Sign in with Phone (OTP)
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
