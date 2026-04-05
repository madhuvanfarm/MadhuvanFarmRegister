import './globals.css';
import { AuthProvider } from '../lib/AuthContext';

export const metadata = {
  title: 'MADHUVAN FARM | Sugarcane Entry Register',
  description: 'Premium Sugarcane Business Management Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
