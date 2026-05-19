interface Props {
  userId: string
}

export default function DashboardMobile({ userId }: Props) {
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-500">Mobile layout — {userId}</p>
      {/* Build out mobile layout here — 390px minimum */}
    </div>
  )
}
