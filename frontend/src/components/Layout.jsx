import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children, title, subtitle, actions }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 p-5">
          <div className="max-w-screen-xl mx-auto">
            {(title || actions) && (
              <div className="page-header">
                <div>
                  {title && <h1 className="page-title">{title}</h1>}
                  {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                {actions && (
                  <div className="flex items-center gap-2">{actions}</div>
                )}
              </div>
            )}
            <div>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
