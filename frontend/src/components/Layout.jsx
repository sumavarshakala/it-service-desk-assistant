import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children, title, actions }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header section with page title & custom actions */}
            {(title || actions) && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {title && (
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-850 tracking-tight leading-none text-slate-900">{title}</h2>
                  </div>
                )}
                {actions && <div className="flex items-center gap-2.5 self-end">{actions}</div>}
              </div>
            )}
            
            {/* Main Content */}
            <div>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
