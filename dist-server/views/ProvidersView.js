import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Search, ExternalLink, Key, Globe, Database, TrendingUp, MessageSquare, Heart, Fish, BarChart3, Users, HelpCircle } from 'lucide-react';
// Category icons mapping
const categoryIcons = {
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
const categoryTranslations = {
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
export const ProvidersView = ({ className = '' }) => {
    const [bundle, setBundle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedProvider, setExpandedProvider] = useState(null);
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
            const data = await response.json();
            setBundle(data);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch providers');
            console.error('Failed to fetch providers:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const getFilteredProviders = () => {
        if (!bundle)
            return [];
        let providers = [];
        if (selectedCategory === 'all') {
            providers = Object.values(bundle.categories).flat();
        }
        else {
            providers = bundle.categories[selectedCategory] || [];
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            providers = providers.filter(p => p.name.toLowerCase().includes(query) ||
                (p.notes && p.notes.toLowerCase().includes(query)) ||
                p.url.toLowerCase().includes(query));
        }
        return providers;
    };
    const getAuthBadgeColor = (auth) => {
        switch (auth) {
            case 'apiKey': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'oauth': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'none': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const getAuthBadgeText = (auth) => {
        switch (auth) {
            case 'apiKey': return 'کلید API';
            case 'oauth': return 'OAuth';
            case 'none': return 'آزاد';
            default: return 'نامشخص';
        }
    };
    if (loading) {
        return (_jsx("div", { className: `p-6 ${className}`, dir: "rtl", children: _jsx("div", { className: "max-w-6xl mx-auto", children: _jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0627\u0631\u0627\u0626\u0647\u200C\u062F\u0647\u0646\u062F\u06AF\u0627\u0646 \u062F\u0627\u062F\u0647..." })] }) }) }));
    }
    if (error) {
        return (_jsx("div", { className: `p-6 ${className}`, dir: "rtl", children: _jsx("div", { className: "max-w-6xl mx-auto", children: _jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-center", children: [_jsx("div", { className: "text-red-600 mb-2", children: "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u062F\u0627\u062F\u0647\u200C\u0647\u0627" }), _jsx("p", { className: "text-red-700 mb-4", children: error }), _jsx("button", { onClick: fetchProviders, className: "bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors", children: "\u062A\u0644\u0627\u0634 \u0645\u062C\u062F\u062F" })] }) }) }));
    }
    const filteredProviders = getFilteredProviders();
    const categoriesWithProviders = Object.entries(bundle?.categories || {})
        .filter(([_, providers]) => providers.length > 0)
        .map(([category, providers]) => ({ category: category, count: providers.length }));
    return (_jsx("div", { className: `p-6 ${className}`, dir: "rtl", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "\u0631\u062C\u06CC\u0633\u062A\u0631\u06CC \u0627\u0631\u0627\u0626\u0647\u200C\u062F\u0647\u0646\u062F\u06AF\u0627\u0646 \u062F\u0627\u062F\u0647" }), _jsx("p", { className: "text-gray-600", children: bundle ? `${bundle.count} ارائه‌دهنده داده از ${bundle.source === '(missing)' ? 'پیکربندی پیش‌فرض' : 'مانیفست HTML'}` : '' })] }), _jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6", children: _jsxs("div", { className: "flex flex-col lg:flex-row gap-4 items-center", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" }), _jsx("input", { type: "text", placeholder: "\u062C\u0633\u062A\u062C\u0648\u06CC \u0627\u0631\u0627\u0626\u0647\u200C\u062F\u0647\u0646\u062F\u06AF\u0627\u0646...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("button", { onClick: () => setSelectedCategory('all'), className: `px-3 py-1 rounded-full text-sm border transition-colors ${selectedCategory === 'all'
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'}`, children: ["\u0647\u0645\u0647 (", bundle?.count || 0, ")"] }), categoriesWithProviders.map(({ category, count }) => {
                                        const IconComponent = categoryIcons[category];
                                        return (_jsxs("button", { onClick: () => setSelectedCategory(category), className: `flex items-center gap-1 px-3 py-1 rounded-full text-sm border transition-colors ${selectedCategory === category
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'}`, children: [_jsx(IconComponent, { className: "h-3 w-3" }), categoryTranslations[category], " (", count, ")"] }, category));
                                    })] })] }) }), _jsx("div", { className: "mb-4", children: _jsxs("p", { className: "text-gray-600", children: [filteredProviders.length, " \u0627\u0631\u0627\u0626\u0647\u200C\u062F\u0647\u0646\u062F\u0647 \u06CC\u0627\u0641\u062A \u0634\u062F", searchQuery && ` برای "${searchQuery}"`, selectedCategory !== 'all' && ` در دسته‌بندی "${categoryTranslations[selectedCategory]}"`] }) }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: filteredProviders.map((provider) => {
                        const IconComponent = categoryIcons[provider.category];
                        const isExpanded = expandedProvider === provider.id;
                        return (_jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(IconComponent, { className: "h-5 w-5 text-blue-600" }), _jsx("h3", { className: "font-semibold text-gray-900 truncate", children: provider.name })] }), _jsx("div", { className: "flex gap-1", children: _jsxs("span", { className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAuthBadgeColor(provider.auth)}`, children: [provider.auth === 'apiKey' && _jsx(Key, { className: "h-3 w-3 mr-1" }), getAuthBadgeText(provider.auth)] }) })] }), _jsx("div", { className: "mb-3", children: _jsxs("a", { href: provider.url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline", children: [_jsx(ExternalLink, { className: "h-3 w-3" }), _jsx("span", { className: "truncate font-mono text-xs", children: provider.url.replace(/^https?:\/\//, '') })] }) }), _jsx("div", { className: "mb-3", children: _jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800", children: categoryTranslations[provider.category] }) }), provider.notes && (_jsxs("div", { className: "mb-3", children: [_jsx("p", { className: `text-sm text-gray-600 ${!isExpanded && 'line-clamp-2'}`, children: provider.notes }), provider.notes.length > 100 && (_jsx("button", { onClick: () => setExpandedProvider(isExpanded ? null : provider.id), className: "text-blue-600 hover:text-blue-800 text-xs mt-1", children: isExpanded ? 'کمتر' : 'بیشتر' }))] })), provider.apiBase && provider.apiBase !== provider.url && (_jsx("div", { className: "pt-2 border-t border-gray-100", children: _jsxs("p", { className: "text-xs text-gray-500", children: [_jsx("span", { className: "font-medium", children: "API Base:" }), _jsx("span", { className: "font-mono ml-1", children: provider.apiBase })] }) }))] }) }, provider.id));
                    }) }), filteredProviders.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-gray-400 mb-4", children: _jsx(Search, { className: "h-12 w-12 mx-auto" }) }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "\u0647\u06CC\u0686 \u0627\u0631\u0627\u0626\u0647\u200C\u062F\u0647\u0646\u062F\u0647\u200C\u0627\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" }), _jsx("p", { className: "text-gray-600", children: searchQuery || selectedCategory !== 'all'
                                ? 'لطفاً جستجو یا فیلترهای خود را تغییر دهید'
                                : 'هنوز هیچ ارائه‌دهنده‌ای پیکربندی نشده است' })] }))] }) }));
};
