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

function formatBytes(bytes: number | string | null | undefined) {
  if (bytes === null || bytes === undefined || isNaN(Number(bytes))) {
    return "0 B";
  }

  const numBytes = Number(bytes);
  const units = ["B", "KB", "MB", "GB"];
  let value = numBytes;
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
  const [error, setError] = useState<string | null>(null);

  const processMetricsData = (rawData: any): MetricsData => {
    return {
      current: {
        cpu: {
          usage: String(rawData.current.cpu.usage || 0),
          cores: Number(rawData.current.cpu.cores || 1),
          platform: String(rawData.current.cpu.platform || "unknown"),
          loadAverage: String(rawData.current.cpu.loadAverage || 0),
        },
        memory: {
          total: String(rawData.current.memory.total || 0),
          used: String(rawData.current.memory.used || 0),
          usagePercent: String(rawData.current.memory.usagePercent || 0),
        },
        network: {
          bytesReceived: Number(rawData.current.network.bytesReceived || 0),
          bytesSent: Number(rawData.current.network.bytesSent || 0),
        },
      },
      history: {
        cpu: Array.isArray(rawData.history.cpu) ? rawData.history.cpu : [],
        memory: Array.isArray(rawData.history.memory)
          ? rawData.history.memory
          : [],
        network: Array.isArray(rawData.history.network)
          ? rawData.history.network
          : [],
      },
    };
  };

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/resource", {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) throw new Error("서버 응답 오류");

        const result = await response.json();

        if (result.success && isMounted) {
          const processedData = processMetricsData(result.data);
          setMetrics(processedData);
          setError(null);
        } else {
          throw new Error(result.error || "데이터 형식 오류");
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "AbortError" &&
          isMounted
        ) {
          console.error("Metrics fetch error:", error);
          setError("메트릭 데이터를 가져오는데 실패했습니다.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
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

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center h-[400px] text-red-500">
          {error}
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
            {/* <TabsTrigger value="network">네트워크</TabsTrigger> */}
          </TabsList>

          <TabsContent value="cpu" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatChartData(metrics.history.cpu, "usage")}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="time"
                  label={{
                    value: "시간",
                    position: "insideBottom",
                    offset: -10,
                    className: "fill-foreground",
                  }}
                  tick={{ fill: "var(--foreground)" }}
                />
                <YAxis
                  label={{
                    value: "CPU 사용률 (%)",
                    angle: -90,
                    position: "insideLeft",
                    className: "fill-foreground",
                  }}
                  tick={{ fill: "var(--foreground)" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(2)}%`,
                    "CPU 사용률",
                  ]}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="time"
                  label={{
                    value: "시간",
                    position: "insideBottom",
                    offset: -10,
                    className: "fill-foreground",
                  }}
                  tick={{ fill: "var(--foreground)" }}
                />
                <YAxis
                  label={{
                    value: "메모리 사용률 (%)",
                    angle: -90,
                    position: "insideLeft",
                    className: "fill-foreground",
                  }}
                  tick={{ fill: "var(--foreground)" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(2)}%`,
                    "메모리 사용률",
                  ]}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
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

          {/* <TabsContent value="network" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formatChartData(metrics.history.network, "traffic")}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="time"
                  label={{
                    value: "시간",
                    position: "insideBottom",
                    offset: -10,
                    className: "fill-foreground",
                  }}
                  tick={{ fill: "var(--foreground)" }}
                />
                <YAxis
                  label={{
                    value: "네트워크 트래픽",
                    angle: -90,
                    position: "insideLeft",
                    className: "fill-foreground",
                  }}
                  tick={{ fill: "var(--foreground)" }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatBytes(value),
                    "네트워크 트래픽",
                  ]}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{
                    backgroundColor: "var(--muted-background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
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
          </TabsContent> */}
        </Tabs>

        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

          {/* <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950">
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
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
