export default function ResultCard({ result }) {
  const scoreColor = result.score >= 90 ? 'text-green-600' :
                     result.score >= 75 ? 'text-blue-600' : 'text-orange-600';

  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">{result.title}</h3>
        <span className={`text-lg font-bold ${scoreColor}`}>{result.score}%</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">{result.subject}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{result.date}</span>
        <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          View details
        </button>
      </div>
    </div>
  );
}
