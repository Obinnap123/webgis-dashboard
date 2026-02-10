// app/admin/users/user-table-skeleton.tsx
import React from 'react';

export function UserTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Tickets</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
            <th className="text-left py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              </td>
              <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </td>
              <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </td>
              <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
              </td>
              <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </td>
              <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </td>
              <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
