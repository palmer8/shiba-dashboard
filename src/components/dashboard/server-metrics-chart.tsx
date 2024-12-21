"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Loader2 } from "lucide-react";

interface MetricsData {
  current: {
    cpu: {
      usage: string;
      cores: number;
      platform: string;
      loadAverage: string;
    };
    memory: {
      total: string;
      used: string;
      usagePercent: string;
    };
    network: {
      bytesReceived: number;
      bytesSent: number;
    };
  };
  history: {
    cpu: number[];
    memory: number[];
    network: number[];
  };
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

export function ServerMetricsChart() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/resource");
        const data = await response.json();
        if (data.success) {
          setMetrics(data.data);
        }
      } catch (error) {
        console.error("Metrics fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // 5초마다 갱신
    return () => clearInterval(interval);
  }, []);

  const formatChartData = (historyData: number[], label: string) => {
    return historyData.map((value, index) => ({
      time: `${23 - Math.floor(index / 12)}:${59 - (index % 12) * 5}`,
      [label]: value,
    }));
  };

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>서버 리소스 모니터링</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cpu" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cpu">CPU</TabsTrigger>
            <TabsTrigger value="memory">메모리</TabsTrigger>
            <TabsTrigger value="network">네트워크</TabsTrigger>
          </TabsList>

          <TabsContent value="cpu" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatChartData(metrics.history.cpu, "usage")}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  label={{
                    value: "시간",
                    position: "insideBottom",
                    offset: -10,
                  }}
                />
                <YAxis
                  label={{
                    value: "CPU 사용률 (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(2)}%`,
                    "CPU 사용률",
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="memory" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formatChartData(metrics.history.memory, "usage")}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  label={{
                    value: "시간",
                    position: "insideBottom",
                    offset: -10,
                  }}
                />
                <YAxis
                  label={{
                    value: "메모리 사용률 (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(2)}%`,
                    "메모리 사용률",
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="usage"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="network" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formatChartData(metrics.history.network, "traffic")}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  label={{
                    value: "시간",
                    position: "insideBottom",
                    offset: -10,
                  }}
                />
                <YAxis
                  label={{
                    value: "네트워크 트래픽",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatBytes(value),
                    "네트워크 트래픽",
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="traffic"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="text-sm text-blue-600 dark:text-blue-400">CPU</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {metrics.current.cpu.usage}%
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              {metrics.current.cpu.cores} Cores | Load:{" "}
              {metrics.current.cpu.loadAverage}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
            <div className="text-sm text-green-600 dark:text-green-400">
              메모리
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {metrics.current.memory.usagePercent}%
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {metrics.current.memory.used} / {metrics.current.memory.total}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950">
            <div className="text-sm text-red-600 dark:text-red-400">
              네트워크
            </div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {formatBytes(
                metrics.current.network.bytesReceived +
                  metrics.current.network.bytesSent
              )}
              /s
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              ↑ {formatBytes(metrics.current.network.bytesSent)}/s | ↓{" "}
              {formatBytes(metrics.current.network.bytesReceived)}/s
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
