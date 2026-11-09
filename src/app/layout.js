// src/app/layout.js
import './globals.css';

export const metadata = {
  title: 'Del dato a una decisión — IES N.º 9',
  description: 'Analizá un registro de días, entendé una probabilidad de lluvia y decidí qué hacer con el pronóstico.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
