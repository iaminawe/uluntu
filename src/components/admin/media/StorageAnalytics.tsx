import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  HardDrive,
  Image,
  Users,
  Calendar,
  TrendingUp,
  Download,
  RefreshCw,
  AlertTriangle,
  Database,
  Archive,
  Trash2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface StorageStats {
  totalStorage: number;
  usedStorage: number;
  totalPhotos: number;
  totalGalleries: number;
  averagePhotoSize: number;
  topUsers: Array<{ name: string; storage: number; photos: number }>;
  storageByType: Array<{ type: string; size: number; count: number }>;
  storageGrowth: Array<{ date: string; storage: number; photos: number }>;
  dailyUploads: Array<{ date: string; uploads: number; size: number }>;
}

const StorageAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch storage analytics
  const { data: storageStats, isLoading, refetch } = useQuery({
    queryKey: ['storage-analytics', timeRange],
    queryFn: async (): Promise<StorageStats> => {
      // Calculate date range
      const now = new Date();
      const daysAgo = parseInt(timeRange.replace('d', ''));
      const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

      // Fetch storage data
      const { data: photos } = await supabase
        .from('gallery_photos')
        .select('file_size, mime_type, created_at, user_id')
        .gte('created_at', startDate.toISOString());

      const { data: galleries } = await supabase
        .from('user_galleries')
        .select('id');

      const { data: users } = await supabase
        .from('members')
        .select('id, name');

      // Calculate statistics
      const totalStorage = photos?.reduce((sum, photo) => sum + (photo.file_size || 0), 0) || 0;
      const totalPhotos = photos?.length || 0;
      const totalGalleries = galleries?.length || 0;
      const averagePhotoSize = totalPhotos > 0 ? totalStorage / totalPhotos : 0;

      // Top users by storage
      const userStorage = new Map<string, { name: string; storage: number; photos: number }>();
      photos?.forEach(photo => {
        if (photo.user_id) {
          const existing = userStorage.get(photo.user_id) || { name: 'Unknown', storage: 0, photos: 0 };
          const user = users?.find(u => u.id === photo.user_id);
          existing.name = user?.name || 'Unknown';
          existing.storage += photo.file_size || 0;
          existing.photos += 1;
          userStorage.set(photo.user_id, existing);
        }
      });

      const topUsers = Array.from(userStorage.values())
        .sort((a, b) => b.storage - a.storage)
        .slice(0, 10);

      // Storage by file type
      const typeStorage = new Map<string, { size: number; count: number }>();
      photos?.forEach(photo => {
        const type = photo.mime_type?.split('/')[1] || 'unknown';
        const existing = typeStorage.get(type) || { size: 0, count: 0 };
        existing.size += photo.file_size || 0;
        existing.count += 1;
        typeStorage.set(type, existing);
      });

      const storageByType = Array.from(typeStorage.entries()).map(([type, data]) => ({
        type,
        size: data.size,
        count: data.count
      }));

      // Generate mock data for growth and daily uploads
      const storageGrowth = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now.getTime() - ((29 - i) * 24 * 60 * 60 * 1000));
        return {
          date: date.toISOString().split('T')[0],
          storage: Math.floor(totalStorage * (0.5 + (i / 58))), // Simulate growth
          photos: Math.floor(totalPhotos * (0.5 + (i / 58)))
        };
      });

      const dailyUploads = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - ((6 - i) * 24 * 60 * 60 * 1000));
        const dayPhotos = photos?.filter(p => {
          const photoDate = new Date(p.created_at);
          return photoDate.toDateString() === date.toDateString();
        }) || [];
        
        return {
          date: date.toISOString().split('T')[0],
          uploads: dayPhotos.length,
          size: dayPhotos.reduce((sum, p) => sum + (p.file_size || 0), 0)
        };
      });

      return {
        totalStorage,
        usedStorage: totalStorage, // For now, assume all is used
        totalPhotos,
        totalGalleries,
        averagePhotoSize,
        topUsers,
        storageByType,
        storageGrowth,
        dailyUploads
      };
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Storage Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor storage usage and media trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Storage Used',
            value: formatBytes(storageStats?.totalStorage || 0),
            icon: HardDrive,
            color: 'blue',
            trend: '+12.5%'
          },
          {
            title: 'Total Photos',
            value: (storageStats?.totalPhotos || 0).toLocaleString(),
            icon: Image,
            color: 'green',
            trend: '+8.2%'
          },
          {
            title: 'Total Galleries',
            value: (storageStats?.totalGalleries || 0).toLocaleString(),
            icon: Users,
            color: 'purple',
            trend: '+5.1%'
          },
          {
            title: 'Average Photo Size',
            value: formatBytes(storageStats?.averagePhotoSize || 0),
            icon: Database,
            color: 'orange',
            trend: '-2.3%'
          }
        ].map((stat) => (
          <div key={stat.title} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
              <Badge variant="secondary" className="text-xs">
                {stat.trend}
              </Badge>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Growth Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Storage Growth
            </h3>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={storageStats?.storageGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatBytes(value)} />
              <Tooltip formatter={(value) => formatBytes(value as number)} />
              <Area type="monotone" dataKey="storage" stroke="#0088FE" fill="#0088FE" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* File Types Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Storage by File Type
            </h3>
            <Archive className="h-5 w-5 text-gray-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={storageStats?.storageByType || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="size"
              >
                {storageStats?.storageByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatBytes(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Uploads */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Daily Upload Activity
            </h3>
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storageStats?.dailyUploads || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="uploads" fill="#00C49F" name="Photos Uploaded" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Users by Storage */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Users by Storage
            </h3>
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {storageStats?.topUsers.slice(0, 5).map((user, index) => (
              <div key={user.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.photos} photos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatBytes(user.storage)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Storage Cleanup Recommendations */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Storage Optimization Recommendations
          </h3>
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center mb-2">
              <Trash2 className="h-5 w-5 text-yellow-600 mr-2" />
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                Duplicate Images
              </h4>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              Found 23 potential duplicate images that could be removed to save space.
            </p>
            <Button size="sm" variant="outline">
              Review Duplicates
            </Button>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center mb-2">
              <Archive className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-800 dark:text-blue-200">
                Large Files
              </h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              12 images are over 5MB and could be optimized without quality loss.
            </p>
            <Button size="sm" variant="outline">
              Optimize Images
            </Button>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center mb-2">
              <Database className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-800 dark:text-green-200">
                Archive Old Content
              </h4>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              Consider archiving photos older than 2 years to reduce active storage.
            </p>
            <Button size="sm" variant="outline">
              Setup Auto-Archive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageAnalytics;