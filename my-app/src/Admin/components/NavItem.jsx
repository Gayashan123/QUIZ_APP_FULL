import React from "react";

function NavItem({ icon, children, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
        active
          ? "bg-indigo-100 text-indigo-700 font-medium"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export default NavItem;