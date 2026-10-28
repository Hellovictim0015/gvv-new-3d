"use client";

import React, { useState, useEffect } from 'react';

// API Fetch Function
export const getFees = async () => {
  const res = await fetch("/api/fees", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch fees");
  return res.json();
};

export default function FeeTable() {
  // State to hold API data, loading status, and errors
  const [fees, setFees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data when component loads
  useEffect(() => {
    const loadFees = async () => {
      try {
        setIsLoading(true);
        const res = await getFees();
        
        // Safely extract the array from { success: true, data: [...] }
        if (res && res.data && Array.isArray(res.data)) {
          setFees(res.data);
        } else if (Array.isArray(res)) {
          setFees(res);
        } else {
          setFees([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFees();
  }, []);

  // Helper function to format numbers like "₹13,000/-"
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0/-";
    return `₹${Number(amount).toLocaleString('en-IN')}/-`;
  };

  // Render Loading State
  if (isLoading) {
    return (
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="text-xl font-medium text-[#040F44] animate-pulse">Loading Fee Structure...</div>
      </section>
    );
  }

  // Render Error State
  if (error) {
    return (
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="text-red-600 font-medium bg-red-50 px-6 py-4 rounded-lg border border-red-200">
          Error loading fees: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Phones: one card per class instead of a 900px-wide table to swipe across. */}
        <div className="md:hidden space-y-4">
          {fees.length === 0 && (
            <p className="p-8 text-center text-gray-500 font-medium">No fee structures found.</p>
          )}
          {fees.map((row) => (
            <div key={row.id} className="rounded-xl border border-blue-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="bg-[#040F44] px-4 py-3 text-white font-semibold">{row.className}</div>
              <dl className="divide-y divide-blue-50 text-sm text-gray-700">
                {[
                  ['I - Installment', row.installment1],
                  ['II - Installment', row.installment2],
                  ['III - Installment', row.installment3],
                  ['Annual Allocation', row.annualAllocation],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between px-4 py-2.5">
                    <dt>{label}</dt>
                    <dd className="font-medium">{formatCurrency(value)}</dd>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 bg-green-50/40">
                  <dt className="font-bold text-[#020B3D]">Total</dt>
                  <dd className="font-bold text-green-700 text-base">{formatCurrency(row.totalFee)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        {/* Responsive Table Wrapper */}
        <div className="hidden md:block w-full overflow-x-auto rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-blue-100">
          
          <table className="w-full min-w-[900px] border-collapse text-center">
            
            {/* Table Head */}
            <thead className="bg-[#040F44] text-white font-semibold">
              {/* First Header Row */}
              <tr>
                <th 
                  rowSpan="2" 
                  className="p-4 border-r border-b border-blue-800/50 w-[80px] text-sm tracking-wide"
                >
                  S.No.
                </th>
                <th 
                  rowSpan="2" 
                  className="p-4 border-r border-b border-blue-800/50 w-[220px] text-sm tracking-wide"
                >
                  CLASS
                </th>
                <th 
                  colSpan="3" 
                  className="p-3 border-r border-b border-blue-800/50 text-sm tracking-wide"
                >
                  <div className="flex flex-col gap-1">
                    <span>TUITION FEES</span>
                    <span className="text-xs text-gray-300 font-normal">
                      (IN INSTALLMENTS - THREE INSTALLMENTS)
                    </span>
                  </div>
                </th>
                <th 
                  rowSpan="2" 
                  className="p-4 border-r border-b border-blue-800/50 w-[150px] text-sm tracking-wide"
                >
                  ANNUAL<br />ALLOCATION
                </th>
                <th 
                  rowSpan="2" 
                  className="p-4 border-b border-blue-800/50 w-[150px] text-sm tracking-wide"
                >
                  TOTAL
                </th>
              </tr>
              
              {/* Second Header Row (For Installments) */}
              <tr>
                <th className="p-3 text-xs sm:text-sm border-r border-b border-blue-800/50 tracking-wide font-medium bg-[#061556]">
                  I - INSTALLMENT
                </th>
                <th className="p-3 text-xs sm:text-sm border-r border-b border-blue-800/50 tracking-wide font-medium bg-[#061556]">
                  II - INSTALLMENT
                </th>
                <th className="p-3 text-xs sm:text-sm border-r border-b border-blue-800/50 tracking-wide font-medium bg-[#061556]">
                  III - INSTALLMENT
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="text-[#1e293b] text-[15px]">
              {fees.length > 0 ? (
                fees.map((row, index) => (
                  <tr 
                    key={row.id} 
                    className="bg-[#FAFBFF] hover:bg-blue-50/50 transition-colors duration-200"
                  >
                    {/* S.No */}
                    <td className="p-4 border border-blue-100 font-medium">
                      {index + 1}
                    </td>
                    
                    {/* Class Name */}
                    <td className="p-4 border border-blue-100 font-medium text-left px-6">
                      {row.className}
                    </td>
                    
                    {/* Installments */}
                    <td className="p-4 border border-blue-100 text-gray-700">
                      {formatCurrency(row.installment1)}
                    </td>
                    <td className="p-4 border border-blue-100 text-gray-700">
                      {formatCurrency(row.installment2)}
                    </td>
                    <td className="p-4 border border-blue-100 text-gray-700">
                      {formatCurrency(row.installment3)}
                    </td>
                    
                    {/* Annual */}
                    <td className="p-4 border border-blue-100 text-gray-700 font-medium">
                      {formatCurrency(row.annualAllocation)}
                    </td>
                    
                    {/* Total (Bold Green) */}
                    <td className="p-4 border border-blue-100 font-bold text-green-700 text-base bg-green-50/30">
                      {formatCurrency(row.totalFee)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-500 font-medium">
                    No fee structures found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Fee notes — same wording as the old site's fee page. */}
        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/40 p-6 text-sm leading-relaxed text-gray-700">
          <h3 className="mb-3 text-base font-bold text-[#020B3D]">Note</h3>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>Above mentioned fee includes only &ldquo;Tuition Fee&rdquo; and &ldquo;Annual Allocation&rdquo;.</li>
            <li>This fee is for the session 2026-27.</li>
            <li>Tuition fee is charged for 10 months.</li>
            <li>You can pay the fees as per your convenience (in quarterly or in given installments).</li>
            <li>Bus fees is charged separately for those who wish to avail school bus facility. (It is charged for 10 months as per the distance.)</li>
            <li>Registration form fees, caution money and admission fees is charged separately which is one time payable at the time of admission. (Caution money is refundable.)</li>
          </ol>
        </div>

      </div>
    </section>
  );
}