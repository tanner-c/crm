import { useState } from "react";
import { validateLoginForm, formatValidationErrors } from "../../lib/validation";

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  error?: string;
};

export default function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setFieldErrors(formatValidationErrors(validation.errors));
      return;
    }

    setFieldErrors({});
    onSubmit(email, password);
  };

  const handleEmailBlur = () => {
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFieldErrors({ ...fieldErrors, email: "Invalid email format" });
      } else {
        const { ...rest } = fieldErrors;
        delete rest.email;
        setFieldErrors(rest);
      }
    }
  };

  const handlePasswordBlur = () => {
    if (password && password.length < 8) {
      setFieldErrors({ ...fieldErrors, password: "Password must be at least 8 characters" });
    } else if (password) {
      const { ...rest } = fieldErrors;
      delete rest.password;
      setFieldErrors(rest);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg animate-pulse">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          className={`w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:border-transparent ${fieldErrors.email
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
            }`}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
          required
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          className={`w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:border-transparent ${fieldErrors.password
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
            }`}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={handlePasswordBlur}
          required
        />
        {fieldErrors.password && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full p-3 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Logging in...
          </div>
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
}
