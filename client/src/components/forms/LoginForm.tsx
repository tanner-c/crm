import { useState } from "react";

type LoginFormProps = {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
  error?: string;
};

export default function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form
      onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {error && <div>{error}</div>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
