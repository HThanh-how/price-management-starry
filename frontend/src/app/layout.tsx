import type { Metadata } from "next";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import Providers from '@/components/Providers';
import "./globals.css";

export const metadata: Metadata = {
  title: "Price Management Tool - Starry VietNam",
  description: "Enterprise-grade tool for managing items, suppliers, and pricing data.",
};

/**
 * Root layout wrapping the entire application.
 * Layers: React Query Provider → Ant Design Registry → Ant Design ConfigProvider.
 * Ant Design theme tokens are aligned with the Figma design system.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts: Inter (body text) + Material Symbols Outlined (icons) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-sans antialiased">
        <Providers>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  /* Primary colors aligned with Figma Design Tokens */
                  colorPrimary: '#0057c2',
                  colorBgContainer: '#ffffff',
                  colorBgLayout: '#faf9f9',
                  colorBorder: '#c1c6d7',
                  colorBorderSecondary: '#e9e8e8',
                  colorText: '#1b1c1c',
                  colorTextSecondary: '#414755',
                  borderRadius: 2,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  colorSuccess: '#266d00',
                  colorError: '#ba1a1a',
                  colorWarning: '#7d5400',
                },
              }}
            >
              {children}
            </ConfigProvider>
          </AntdRegistry>
        </Providers>
      </body>
    </html>
  );
}
