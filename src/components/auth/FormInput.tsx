import type { UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps {
  label: string;
  id: string;
  type: string;
  placeholder: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

export default function FormInput({
  label,
  id,
  type,
  placeholder,
  error,
  registration,
}: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        {...registration}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
        placeholder={placeholder}
      />
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          error ? 'max-h-10 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <p className="text-sm text-red-500">{error}</p>
      </div>
    </div>
  );
}
