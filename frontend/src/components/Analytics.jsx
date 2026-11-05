
import {
  Link,
  MousePointerClick,
  CheckCircle,
  Clock
} from 'lucide-react'

function Analytics({ urls }) {

  const totalUrls = urls.length

  const totalClicks = urls.reduce(
    (total, url) => total + (url.clicks || 0),
    0
  )

  const expiredUrls = urls.filter(
    (url) =>
      url.expiryDate &&
      new Date(url.expiryDate) <= new Date()
  ).length

  const activeUrls = totalUrls - expiredUrls

  const stats = [
    {
      title: 'Total URLs',
      value: totalUrls,
      icon: Link
    },
    {
      title: 'Total Clicks',
      value: totalClicks,
      icon: MousePointerClick
    },
    {
      title: 'Active URLs',
      value: activeUrls,
      icon: CheckCircle
    },
    {
      title: 'Expired URLs',
      value: expiredUrls,
      icon: Clock
    }
  ]

  return (
    <section className="analytics">

      <h2>URL Analytics</h2>

      <div className="analytics-grid">

        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div className="analytics-card" key={stat.title}>

              <Icon size={25} />

              <h3>{stat.title}</h3>

              <p>{stat.value}</p>

            </div>
          )
        })}

      </div>

    </section>
  )
}

export default Analytics
