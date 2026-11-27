
import { useState, type FormEvent } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Eye, EyeOff, Film } from "lucide-react";

import { useAuth } from "../context/AuthContext";

interface AuthPageProps {
  mode: "login" | "register";
}

function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === "register";

  const { user, login, register } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectPath =
    location.state?.from?.pathname || "/";

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (isRegister && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    try {
      setSubmitting(true);

      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }

      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-5 py-24 text-white">
      <div className="w-full max-w-md bg-[#151515] border border-gray-800 rounded-2xl p-8 shadow-2xl">

        <Link to="/" className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Film className="text-red-500" size={32} />
            <span className="text-3xl font-bold tracking-wide">
              CINE<span className="text-red-500">VERSE</span>
            </span>
          </div>
        </Link>

        <h1 className="text-3xl font-bold text-center mb-2">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h1>

        <p className="text-gray-400 text-center mb-8">
          {isRegister
            ? "Join CineVerse and discover amazing movies."
            : "Sign in to continue your movie experience."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {isRegister && (
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                maxLength={80}
                required
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-red-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
              className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-red-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                minLength={8}
                maxLength={72}
                required
                className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-3 pr-12 outline-none focus:border-red-500 transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition"
          >
            {submitting
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Sign In"}
          </button>

        </form>

        <p className="text-gray-400 text-center mt-7 text-sm">
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          {" "}

          <Link
            to={isRegister ? "/login" : "/register"}
            className="text-red-500 hover:text-red-400 font-semibold"
          >
            {isRegister ? "Sign In" : "Sign Up"}
          </Link>
        </p>

        <Link
          to="/"
          className="block text-center text-gray-500 hover:text-white text-sm mt-5"
        >
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}

export default AuthPage;
