import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Key, Globe, Database, TrendingUp, MessageSquare, Heart, Fish, BarChart3, Users, HelpCircle } from 'lucide-react';
import type { ProviderSpec, ProvidersBundle, ProviderCategory } from '../services/ProviderRegistry';

interface ProvidersViewProps {
  className?: string;
}

// Category icons mapping
const categoryIcons: Record<ProviderCategory, React.ComponentType<{ className?: string }>> = {
  MarketData: TrendingUp,
  News: MessageSquare,
  Sentiment: Heart,
  FearGreed: BarChart3,
  Whales: Fish,
  OnChain: Database,
  Explorers: Globe,
  Community: Users,
  Other: HelpCircle,
};

// Category translations (Persian/Farsi for RTL support)
const categoryTranslations: Record<ProviderCategory, string> = {
  MarketData: 'داده‌های بازار',
  News: 'اخبار',
  Sentiment: 'احساسات',
  FearGreed: 'ترس و طمع',
  Whales: 'نهنگ‌ها',
  OnChain: 'درون زنجیره‌ای',
  Explorers: 'اکسپلورر',
  Community: 'جامعه',
  Other: 'سایر',
};

export const ProvidersView: React.FC<ProvidersViewProps> = ({ className = '' }) => {
  const [bundle, setBundle] = useState<ProvidersBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProviderCategory | 'all'>('all');
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/providers');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: ProvidersBundle = await response.json();
      setBundle(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
      console.error('Failed to fetch providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProviders = (): ProviderSpec[] => {
    if (!bundle) return [];

    let providers: ProviderSpec[] = [];
    
    if (selectedCategory === 'all') {
      providers = Object.values(bundle.categories).flat();
    } else {
      providers = bundle.categories[selectedCategory] || [];
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      providers = providers.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.notes && p.notes.toLowerCase().includes(query)) ||
        p.url.toLowerCase().includes(query)
      );
    }

    return providers;
  };

  const getAuthBadgeColor = (auth?: string) => {
    switch (auth) {
      case 'apiKey': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'oauth': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'none': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAuthBadgeText = (auth?: string) => {
    switch (auth) {
      case 'apiKey': return 'کلید API';
      case 'oauth': return 'OAuth';
      case 'none': return 'آزاد';
      default: return 'نامشخص';
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`} dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">در حال بارگذاری ارائه‌دهندگان داده...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`} dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-2">خطا در بارگذاری داده‌ها</div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchProviders}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredProviders = getFilteredProviders();
  const categoriesWithProviders = Object.entries(bundle?.categories || {})
    .filter(([_, providers]) => providers.length > 0)
    .map(([category, providers]) => ({ category: category as ProviderCategory, count: providers.length }));

  return (
    <div className={`p-6 ${className}`} dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            رجیستری ارائه‌دهندگان داده
          </h1>
          <p className="text-gray-600">
            {bundle ? `${bundle.count} ارائه‌دهنده داده از ${bundle.source === '(missing)' ? 'پیکربندی پیش‌فرض' : 'مانیفست HTML'}` : ''}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="جستجوی ارائه‌دهندگان..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                همه ({bundle?.count || 0})
              </button>
              {categoriesWithProviders.map(({ category, count }) => {
                const IconComponent = categoryIcons[category];
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <IconComponent className="h-3 w-3" />
                    {categoryTranslations[category]} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredProviders.length} ارائه‌دهنده یافت شد
            {searchQuery && ` برای "${searchQuery}"`}
            {selectedCategory !== 'all' && ` در دسته‌بندی "${categoryTranslations[selectedCategory]}"`}
          </p>
        </div>

        {/* Providers Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider) => {
            const IconComponent = categoryIcons[provider.category];
            const isExpanded = expandedProvider === provider.id;
            
            return (
              <div
                key={provider.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 truncate">
                        {provider.name}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAuthBadgeColor(provider.auth)}`}>
                        {provider.auth === 'apiKey' && <Key className="h-3 w-3 mr-1" />}
                        {getAuthBadgeText(provider.auth)}
                      </span>
                    </div>
                  </div>

                  {/* URL */}
                  <div className="mb-3">
                    <a
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate font-mono text-xs">
                        {provider.url.replace(/^https?:\/\//, '')}
                      </span>
                    </a>
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {categoryTranslations[provider.category]}
                    </span>
                  </div>

                  {/* Notes/Description */}
                  {provider.notes && (
                    <div className="mb-3">
                      <p className={`text-sm text-gray-600 ${!isExpanded && 'line-clamp-2'}`}>
                        {provider.notes}
                      </p>
                      {provider.notes.length > 100 && (
                        <button
                          onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                        >
                          {isExpanded ? 'کمتر' : 'بیشتر'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* API Base (if different from URL) */}
                  {provider.apiBase && provider.apiBase !== provider.url && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">API Base:</span>
                        <span className="font-mono ml-1">{provider.apiBase}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              هیچ ارائه‌دهنده‌ای یافت نشد
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== 'all'
                ? 'لطفاً جستجو یا فیلترهای خود را تغییر دهید'
                : 'هنوز هیچ ارائه‌دهنده‌ای پیکربندی نشده است'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};