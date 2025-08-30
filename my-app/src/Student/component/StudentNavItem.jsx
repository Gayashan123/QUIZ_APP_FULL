export default function StudentNavItem({ icon, children, active = false }) {
  return (
    <button className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </button>
  );
}
