import { useState, useEffect } from 'react';

interface ValidationError {
  message: string;
  line: number;
  column: number;
}

export const useJsonValidation = (jsonString: string) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    if (!jsonString.trim()) {
      setErrors([]);
      setIsValid(true);
      return;
    }

    try {
      JSON.parse(jsonString);
      setErrors([]);
      setIsValid(true);
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message;
        const lineMatch = errorMessage.match(/line (\d+)/);
        const columnMatch = errorMessage.match(/column (\d+)/);
        
        const line = lineMatch ? parseInt(lineMatch[1], 10) : 0;
        const column = columnMatch ? parseInt(columnMatch[1], 10) : 0;
        
        setErrors([{
          message: errorMessage,
          line,
          column
        }]);
        setIsValid(false);
      } else {
        setErrors([{
          message: 'Invalid JSON format',
          line: 0,
          column: 0
        }]);
        setIsValid(false);
      }
    }
  }, [jsonString]);

  return { errors, isValid };
};