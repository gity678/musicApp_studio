import React from "react";

export interface RadioIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export default function RadioIcon({ size = 24, className = "", ...props }: RadioIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Antenna */}
      <path d="M5 9 16 3" />
      {/* Body rect */}
      <rect width="20" height="13" x="2" y="9" rx="2" />
      {/* Dial tuning screen slot */}
      <path d="M12 13h6" />
      {/* Speaker/Knob */}
      <circle cx="7.5" cy="16" r="3" />
    </svg>
  );
}
