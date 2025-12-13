
import React from 'react';

interface FooterLogoProps {
  className?: string;
}

const FooterLogo: React.FC<FooterLogoProps> = ({ className = "" }) => {
  return (
    <svg 
      width="78" 
      height="56" 
      viewBox="0 0 78 56" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_5481_4877)">
        <path d="M39.1751 19.3047L34.1742 27.6285C27.3346 38.9886 17.7689 47.6953 6.69665 52.634L0.508789 55.3948C0.508789 55.3948 30.6861 5.4288 30.9518 5.04956L39.1751 19.3047Z" fill="#00C4FB"/>
        <path d="M52.0241 41.5372L52.1821 41.5811L52.1545 41.5372L49.3657 36.7339L30.95 5.04221C32.8489 2.36313 35.5186 0.119385 39.4479 0.119385C43.7381 0.119385 46.5745 2.79847 48.5849 6.21774L77.4988 55.3887H28.6702C34.101 46.6234 42.7931 41.4604 52.0241 41.5372Z" fill="white"/>
        <path d="M39.1726 19.3047L35.5341 25.3615L30.948 5.04712L39.1726 19.3047Z" fill="#009CC8"/>
        <path d="M69.3464 41.5371H52.1553L48.7737 35.7131L69.3464 41.5371Z" fill="#CBCBCB"/>
      </g>
      <defs>
        <clipPath id="clip0_5481_4877">
          <rect width="78" height="56" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default FooterLogo;
