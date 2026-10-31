import React from 'react';

export default function TermsOfUse() {
  const sections = [
    { id: '1', title: '1. Using the board', content: 'Anyone can search the board and ask for help. Posting resources requires an account. This is a community tool and does not replace emergency services; in danger, call 119 first.' },
    { id: '2', title: '2. Posting accurate information', content: 'You must post only resources you can provide, keep quantities current and remove listings when they are no longer available. False or misleading posts may be removed.' },
    { id: '3', title: '3. Verification', content: 'A verified badge means a moderator checked registration documents. It is not a guarantee of quality, and users should still use judgment.' },
    { id: '4', title: '4. Acceptable behavior', content: 'No harassment, fraud, selling aid, or requests for payment from people in need. Report problems using the Report button on any listing.' },
    { id: '5', title: '5. Volunteers and safety', content: 'Volunteers act on their own responsibility, follow the code of conduct and local authority instructions, and must not enter unsafe areas.' },
    { id: '6', title: '6. Limits of liability', content: 'We work to keep information current but cannot guarantee it. We are not responsible for losses from relying on a listing.' },
    { id: '7', title: '7. Changes and contact', content: 'We may update these terms and will announce major changes on the site. Questions can be sent through the Contact page.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      {/* Top Banner */}
      <div className="bg-red-700 text-white text-xs text-center py-1.5 font-medium">
        Life in danger? Call 119 now | Disaster hotline 117
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-1">Terms of Use</h1>
        <p className="text-sm text-gray-500 mb-8">
          Last updated 1 October 2026 · Plain-language summary first, full text below
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">On this page</h2>
              <ul className="space-y-2.5 text-sm">
                {sections.map((sec, idx) => (
                  <li key={sec.id} className={idx === 0 ? "border-l-2 border-red-600 pl-2 font-medium text-slate-900" : "pl-2 text-gray-600 hover:text-slate-900"}>
                    <a href={`#sec-${sec.id}`}>{sec.title}</a>
                  </li>
                ))}
              </ul>
            </div>
            <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
              Download PDF
            </button>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3 space-y-6">
            {/* Key Points Box */}
            <div className="bg-blue-50/60 p-6 rounded-xl border border-blue-100/50 space-y-2">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Key points</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">✓ This is a community tool, not an emergency service</li>
                <li className="flex items-center gap-2">✓ Post only accurate, current information</li>
                <li className="flex items-center gap-2">✓ No one may charge people in need for aid listed here</li>
                <li className="flex items-center gap-2">✓ We can remove content that breaks these rules</li>
              </ul>
            </div>

            {/* Terms Sections */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
              {sections.map((sec) => (
                <div key={sec.id} id={`sec-${sec.id}`} className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">{sec.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{sec.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}