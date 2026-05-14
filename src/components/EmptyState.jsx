export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && <Icon size={40} className="text-gray-300 mb-4" />}
      <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}
