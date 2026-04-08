export default function SummaryCard({ title, value, icon, color = 'green', subtitle }) {
  const colorMap = {
    green: 'bg-primary-50 border-primary-200 text-primary-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  const iconColorMap = {
    green: 'bg-primary-100 text-primary-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {subtitle && <p className="mt-1 text-xs opacity-60">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg text-xl ${iconColorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
