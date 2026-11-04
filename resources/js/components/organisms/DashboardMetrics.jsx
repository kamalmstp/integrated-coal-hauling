import React from 'react';
import StatCard from '../molecules/StatCard';

export default function DashboardMetrics({ metrics = [] }) {
    if (!metrics || metrics.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((item, idx) => (
                <StatCard
                    key={idx}
                    title={item.title}
                    value={item.value}
                    change={item.change}
                    trend={item.trend}
                    description={item.description}
                    iconName={item.icon}
                    color={item.color}
                />
            ))}
        </div>
    );
}
