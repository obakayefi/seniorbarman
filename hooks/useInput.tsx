import { useState } from 'react';

const useInput = (initialValue: string | Date) => {
  const [value, setValue] = useState<string>(
    typeof initialValue === 'string' ? initialValue : initialValue.toISOString()
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value); // always a string
  };

  const reset = () => {
    setValue(typeof initialValue === 'string' ? initialValue : initialValue.toISOString());
  };

  return { value, onChange: handleChange, reset };
};

export default useInput;
