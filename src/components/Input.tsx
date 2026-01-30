interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
}: InputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-neutral-700 mb-2">
        {label}
        {required && <span className="text-danger-600 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 rounded-input border
          ${error ? 'border-danger-500' : 'border-neutral-300'}
          focus:outline-none focus:ring-2 focus:ring-primary-500
        `}
      />
      {error && (
        <p className="text-sm text-danger-600 mt-1">{error}</p>
      )}
    </div>
  );
}