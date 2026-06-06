import { Card, CardContent } from "@/components/ui/card"

interface Props {
  title: string
  value: number
  bg: string
}

export function SummaryCard({ title, value, bg }: Props) {
  return (
    <Card className={`${bg} border-none`}>
      <CardContent className="p-6">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
