declare module 'next/font/mono' {
  export interface FontProps {
    subsets?: string[];
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    variable?: string;
  }

  export function JetBrains_Mono(props: FontProps): {
    className: string;
    variable: string;
    style: { fontFamily: string };
  };
} 