import React from 'react';
import { BarChart3, Users, Package, TrendingUp, AlertTriangle, Flag } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Card, SectionHeader } from '../components/ui';

const Admin: React.FC = () => {
  const metrics = [
    { label: 'Total Consumers', value: '2,345,821', icon: Users, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Active Consumers', value: '892,341', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { label: 'Total Scans', value: '18,523,456', icon: BarChart3, color: 'bg-orange-100 text-orange-600' },
    { label: 'Products Analyzed', value: '245,632', icon: Package, color: 'bg-purple-100 text-purple-600' },
  ];

  const reports = [
    { id: 1, type: 'Inaccurate Nutrition', product: 'Greek Yogurt Plain', status: 'pending' },
    { id: 2, type: 'Missing Allergen', product: 'Almond Butter', status: 'under-review' },
    { id: 3, type: 'Wrong Product', product: 'Wheat Bread', status: 'resolved' },
  ];

  const topProducts = [
    { name: 'Organic Greek Yogurt', scans: 18234, score: 92 },
    { name: 'Almond Butter', scans: 15821, score: 88 },
    { name: 'Whole Wheat Bread', scans: 12453, score: 85 },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader
          title="Admin Dashboard"
          description="Platform metrics and moderation"
        />

        {/* Disclaimer */}
        <Card className="bg-yellow-50 border-2 border-yellow-200 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Demo Data</p>
              <p className="text-sm text-yellow-800">
                All numbers shown are placeholder demo data for UI demonstration purposes
                only. Real admin panel will be built in Task 2.
              </p>
            </div>
          </div>
        </Card>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-2">
                      {metric.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <div>
            <SectionHeader title="Recent Reports" />
            <Card>
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-200 last:border-b-0">
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-flex items-center gap-1">
                          <Flag className="w-4 h-4 text-red-600" />
                          {report.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {report.product}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            report.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-900'
                              : report.status === 'under-review'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-green-100 text-green-900'
                          }`}
                        >
                          {report.status === 'pending'
                            ? 'Pending'
                            : report.status === 'under-review'
                              ? 'Review'
                              : 'Resolved'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Top Products */}
          <div>
            <SectionHeader title="Top Products" />
            <Card>
              <div className="space-y-4">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {idx + 1}. {product.name}
                      </h4>
                      <span className="text-sm font-semibold text-emerald-600">
                        Score: {product.score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {product.scans.toLocaleString()} scans
                      </p>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{
                            width: `${(product.scans / 18234) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Feature Usage */}
        <div className="mt-8">
          <SectionHeader title="Feature Usage" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600 mb-2">
                  18.5M
                </p>
                <p className="text-gray-600 font-medium">Scans</p>
                <p className="text-xs text-gray-500 mt-1">(Demo Data)</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 mb-2">
                  12.3M
                </p>
                <p className="text-gray-600 font-medium">Searches</p>
                <p className="text-xs text-gray-500 mt-1">(Demo Data)</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600 mb-2">
                  4.2M
                </p>
                <p className="text-gray-600 font-medium">Comparisons</p>
                <p className="text-xs text-gray-500 mt-1">(Demo Data)</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Admin;
