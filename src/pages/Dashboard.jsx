import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import StatsCard from '../components/StatsCard'
import { 
  MessageSquare, 
  Users, 
  Briefcase, 
  TrendingUp,
  Calendar,
  Eye,
  Star,
  FileText
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalUsers: 0,
    totalServices: 0,
    totalTestimonials: 0,
    monthlyContacts: 0,
    weeklyContacts: 0
  })
  const [chartData, setChartData] = useState([])
  const [recentContacts, setRecentContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const [contactsRes, usersRes, servicesRes, testimonialsRes] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact' }),
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('services').select('*', { count: 'exact' }),
        supabase.from('testimonials').select('*', { count: 'exact' })
      ])

      // Get monthly contacts
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: monthlyCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Get weekly contacts
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: weeklyCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .gte('created_at', sevenDaysAgo.toISOString())

      setStats({
        totalContacts: contactsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalServices: servicesRes.count || 0,
        totalTestimonials: testimonialsRes.count || 0,
        monthlyContacts: monthlyCount || 0,
        weeklyContacts: weeklyCount || 0
      })

      // Fetch recent contacts
      const { data: recentContactsData } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentContacts(recentContactsData || [])

      // Generate chart data (last 7 days)
      const chartData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const { count } = await supabase
          .from('contacts')
          .select('*', { count: 'exact' })
          .gte('created_at', `${dateStr}T00:00:00`)
          .lt('created_at', `${dateStr}T23:59:59`)

        chartData.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          contacts: count || 0
        })
      }
      
      setChartData(chartData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
        <p className="text-blue-100">Here's what's happening with Ajay Online – Digital Mitra today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Contacts"
          value={stats.totalContacts}
          change="+12%"
          changeType="increase"
          icon={MessageSquare}
          color="blue"
        />
        <StatsCard
          title="Active Users"
          value={stats.totalUsers}
          change="+8%"
          changeType="increase"
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Services"
          value={stats.totalServices}
          change="+2%"
          changeType="increase"
          icon={Briefcase}
          color="purple"
        />
        <StatsCard
          title="Testimonials"
          value={stats.totalTestimonials}
          change="+15%"
          changeType="increase"
          icon={Star}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Submissions Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Submissions</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Last 7 days</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="contacts" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">This Month</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.monthlyContacts}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">This Week</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.weeklyContacts}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">Page Views</span>
              </div>
              <span className="text-lg font-bold text-purple-600">2,847</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Contact Submissions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentContacts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No recent contact submissions
            </div>
          ) : (
            recentContacts.map((contact) => (
              <div key={contact.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.full_name}</p>
                      <p className="text-sm text-gray-500">{contact.service_needed}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{contact.phone}</p>
                    <p className="text-xs text-gray-500">{formatDate(contact.created_at)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {recentContacts.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <a
              href="/admin/contacts"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all contact submissions →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard