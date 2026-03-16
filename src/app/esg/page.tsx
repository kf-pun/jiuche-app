export default function EsgPage() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-6 pt-14 pb-8">
        <h1 className="text-2xl font-bold text-white">ESG 減碳</h1>
        <p className="text-green-100 text-sm mt-1">企業碳足跡儀表板</p>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center">
          <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2 2 2 0 0 1 2 2v2.945" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 3.935V5.5A2.5 2.5 0 0 0 10.5 8h.5a2 2 0 0 1 2 2 2 2 0 0 0 4 0 2 2 0 0 1 2-2h1.064" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">即將開放</p>
          <p className="text-gray-400 text-sm mt-1">ESG 儀表板開發中</p>
        </div>
      </div>
    </div>
  );
}
