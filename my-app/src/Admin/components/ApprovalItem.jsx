// components/admin/ApprovalItem.jsx
import React from "react";

export default function ApprovalItem({ approval }) {
  return (
    <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-300 transition">
      <div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${approval.type === 'Teacher' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
            {approval.type}
          </span>
          <h3 className="font-medium">{approval.name}</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">Requested {approval.requested}</p>
      </div>
      <div className="flex gap-2">
        <button className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200">
          Approve
        </button>
        <button className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200">
          Reject
        </button>
      </div>
    </div>
  );
}
