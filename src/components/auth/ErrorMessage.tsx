interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        message ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{message}</p>
      </div>
    </div>
  );
}
