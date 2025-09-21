export function VertivalSeparator() {
  return (
    <div className="w-px bg-gray-200 mx-1"></div>
  )
}

export function ActionBar({ children }: React.PropsWithChildren) {
    return (
    <div className="flex gap-6">
        <div className="bg-white rounded-lg shadow-lg p-3">
          <div className="flex gap-2">
            { children }
          </div>
        </div>
      </div>
    )
}

export default ActionBar;