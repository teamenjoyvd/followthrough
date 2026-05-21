// TODO: render inbox items list, mark read, navigate to contact
interface InboxItem {
  id: string
  type: string
  contact_id: string | null
  payload: Record<string, unknown>
  read: boolean
  created_at: string
}

interface Props {
  items: InboxItem[]
}

export default function InboxDesktop({ items }: Props) {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Inbox</h1>
      {/* TODO: implement */}
      <p className="text-gray-500">No items</p>
    </div>
  )
}
