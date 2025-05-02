import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
}

export function StatsCard({ title, value, icon, iconColor, iconBgColor }: StatsCardProps) {
  return (
    <Card className="stats-card">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div 
            className={`flex-shrink-0 rounded-md p-3`}
            style={{ backgroundColor: iconBgColor }}
          >
            <div style={{ color: iconColor }}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
