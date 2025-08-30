export default function LeaderboardItem({ student, isCurrent }) {
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg ${isCurrent ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${student.rank === 1 ? 'bg-yellow-100 text-yellow-800' : student.rank === 2 ? 'bg-gray-200 text-gray-800' : 'bg-amber-100 text-amber-800'}`}>
        {student.rank}
      </div>
      <div className="flex-1">
        <p className={`font-medium ${isCurrent ? 'text-indigo-700' : ''}`}>{student.name}</p>
      </div>
      <div className="font-bold">{student.score}%</div>
    </div>
  );
}
