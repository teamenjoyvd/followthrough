interface Props {
  userId: string
}

export default function DashboardDesktop({ userId }: Props) {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <p className="text-gray-500">Desktop layout — {userId}</p>
      {/* Build out desktop layout here */}
    </div>
  )
}
