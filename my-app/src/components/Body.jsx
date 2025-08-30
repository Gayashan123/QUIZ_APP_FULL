import Hero from "./Hero";
import Navbar from "./Navbar";

const Header = () => {
  return (
    <div className="min-h-screen p-4 bg-gray-100 flex flex-col lg:grid lg:grid-cols-[80px_1fr_350px] gap-4">
      {/* Left Sidebar on large screens */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="bg-white rounded-xl shadow-md p-4 sm:p-6 overflow-y-auto">
       <Hero />
     
      </main>

      {/* Right Sidebar */}
      <aside className="bg-white rounded-xl shadow-md p-4 sm:p-6 space-y-4 hidden lg:block">
        <p className="text-gray-500">Right sidebar content (visible on large screens)</p>
      </aside>

      {/* Bottom Navbar for mobile */}
      <div className="lg:hidden mt-auto">
        <Navbar />
      </div>
    </div>
  );
};

export default Header;
