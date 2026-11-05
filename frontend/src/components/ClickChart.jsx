
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'

function ClickChart({ urls }) {

  const chartData = urls.map((url) => ({
    name: url.customAlias || url.shortUrl.split('/').pop(),
    clicks: url.clicks || 0
  }))

  return (
    <section className="click-chart">

      <h2>Click Analytics</h2>

      {urls.length === 0 ? (
        <p>No analytics data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="name" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Bar dataKey="clicks" fill="#6366f1" />

          </BarChart>
        </ResponsiveContainer>
      )}

    </section>
  )
}

export default ClickChart
