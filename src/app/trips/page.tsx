export default function TripsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-gradient-to-br from-green-600 to-emerald-500 px-6 pt-14 pb-8">
        <h1 className="text-2xl font-bold text-white">我的行程</h1>
        <p className="text-green-100 text-sm mt-1">查看即將出發與歷史行程</p>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="text-center">
          <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">即將開放</p>
          <p className="text-gray-400 text-sm mt-1">行程管理功能開發中</p>
        </div>
      </div>
    </div>
  );
}
