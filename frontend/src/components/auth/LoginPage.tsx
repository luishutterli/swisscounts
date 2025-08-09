import { useState } from "react";
import { useAuth } from "@luishutterli/auth-kit-react";
import Button from "../ui/Button";
import SwissCountsLogo from "../../assets/swisscounts-square.svg";

const LoginPage = () => {
  const { login, signup, isLoading, error } = useAuth();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    surname: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignupMode) {
        await signup(formData.email, formData.password, formData.name, formData.surname);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      console.error("Authentication error:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    setFormData({ email: "", password: "", name: "", surname: "" });
  };

  return (
    <div className="flex justify-center items-center bg-background p-4 min-h-screen">
      <div className="space-y-8 w-full max-w-md">
        <div className="text-center">
          <div className="flex justify-center items-center mx-auto mb-6 w-20 h-20">
            <img
              src={SwissCountsLogo}
              alt="SwissCounts Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="mb-2 font-bold text-text text-3xl">
            Willkommen bei SwissCounts
          </h2>
          <p className="text-text/70">
            {isSignupMode ? "Erstellen Sie Ihr Konto" : "Melden Sie sich in Ihr Konto an"}
          </p>
        </div>

        <div className="bg-white shadow-lg px-8 py-8 border border-gray-200 rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignupMode && (
              <div className="gap-4 grid grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-1 font-medium text-text text-sm">
                    Vorname
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 w-full transition-colors placeholder-gray-400"
                    placeholder="Max"
                  />
                </div>
                <div>
                  <label
                    htmlFor="surname"
                    className="block mb-1 font-medium text-text text-sm">
                    Nachname
                  </label>
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    required
                    value={formData.surname}
                    onChange={handleInputChange}
                    className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 w-full transition-colors placeholder-gray-400"
                    placeholder="Mustermann"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block mb-1 font-medium text-text text-sm">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 w-full transition-colors placeholder-gray-400"
                placeholder="max@beispiel.ch"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-1 font-medium text-text text-sm">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignupMode ? "new-password" : "current-password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="block shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 w-full transition-colors placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 px-4 py-3 border border-red-200 rounded-md text-red-800">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-label="Fehler-Symbol">
                      <title>Fehler-Symbol</title>
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <Button variant="primary" size="lg" isLoading={isLoading} className="w-full">
              {isSignupMode ? "Konto erstellen" : "Anmelden"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-primary hover:text-primary/80 text-sm hover:underline transition-colors hover:cursor-pointer">
                {isSignupMode
                  ? "Haben Sie bereits ein Konto? Hier anmelden"
                  : "Noch kein Konto? Hier registrieren"}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-xs">
            Secured by{" "}
            <a className="underline" href="https://github.com/luishutterli/auth-kit">
              AuthKit
            </a>
            {""}, the modern authentication suite.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
