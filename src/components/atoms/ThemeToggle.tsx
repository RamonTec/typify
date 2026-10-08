
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-slate-600" />
      ) : (
        <Sun className="h-5 w-5 text-slate-300" />
      )}
    </Button>
  );
};