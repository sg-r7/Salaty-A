import React, {
  createContext,
  useContext,
  useState,
} from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => undefined,
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();

  const [theme, setTheme] = useState<Theme>(
    systemColorScheme === "dark" ? "dark" : "light"
  );

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
