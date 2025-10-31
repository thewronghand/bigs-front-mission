import { useState, useEffect } from 'react';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  showRequirements: boolean;
}

export default function PasswordRequirements({
  password,
  showRequirements,
}: PasswordRequirementsProps) {
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    { label: '8자 이상', test: (pwd) => pwd.length >= 8, met: false },
    { label: '숫자 1개 이상', test: (pwd) => /\d/.test(pwd), met: false },
    { label: '영문자 1개 이상', test: (pwd) => /[a-zA-Z]/.test(pwd), met: false },
    { label: '특수문자(!%*#?&) 1개 이상', test: (pwd) => /[!%*#?&]/.test(pwd), met: false },
  ]);

  useEffect(() => {
    setRequirements((prev) =>
      prev.map((req) => ({
        ...req,
        met: req.test(password),
      }))
    );
  }, [password]);

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        showRequirements ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
      }`}
    >
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p
          className={`text-sm font-medium text-gray-700 mb-2 transition-all duration-200 ${
            showRequirements ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          비밀번호 조건:
        </p>
        <ul className="space-y-1.5">
          {requirements.map((req, index) => (
            <li
              key={index}
              className={`text-sm flex items-center transition-all duration-300 ${
                req.met ? 'text-green-600' : 'text-gray-500'
              } ${
                showRequirements
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-4'
              }`}
              style={{
                transitionDelay: showRequirements ? `${(index + 1) * 50}ms` : '0ms',
              }}
            >
              <span className="mr-2 font-bold">{req.met ? '✓' : '○'}</span>
              {req.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
