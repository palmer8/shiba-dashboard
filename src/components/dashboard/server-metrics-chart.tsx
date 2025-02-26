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

// API URL 설정
const METRICS_API_URL = "/api/metrics";

interface MetricsData {
  current: {
    cpu: {
      usage: number;
      cores: number;
      platform: string;
      loadAverage: number;
    };
    memory: {
      total: number;
      used: number;
      usagePercent: number;
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
    timestamp: number[];
  };
}

type TimeRange = "day" | "week" | "month";

function formatBytes(
  bytes: number | string | null | undefined,
  toMbps = false
) {
  if (bytes === null || bytes === undefined || isNaN(Number(bytes))) {
    return "0 B";
  }

  const numBytes = Number(bytes);

  if (toMbps) {
    // bytes/s를 Mbps로 변환 (bytes -> bits (* 8) -> Mb (/ 1024 / 1024))
    const mbps = (numBytes * 8) / (1024 * 1024);
    return `${mbps.toFixed(2)} Mbps`;
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = numBytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

function formatTime(date: Date, timeRange: TimeRange) {
  const options: Intl.DateTimeFormatOptions = {
    day: { hour: "2-digit" as const, minute: "2-digit" as const },
    week: { weekday: "short" as const, hour: "2-digit" as const },
    month: { month: "short" as const, day: "numeric" as const },
  }[timeRange];

  return new Intl.DateTimeFormat("ko-KR", options).format(date);
}

function prepareChartData(
  history: MetricsData["history"],
  selectedMetric: "cpu" | "memory" | "network"
) {
  return history.timestamp.map((time, index) => ({
    time: new Date(time),
    value: history[selectedMetric][index],
  }));
}

export function ServerMetricsChart() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("day");
  const [selectedMetric, setSelectedMetric] = useState<
    "cpu" | "memory" | "network"
  >("cpu");

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `${METRICS_API_URL}?timeRange=${timeRange}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("서버 응답 오류");

        const result = await response.json();

        if (result.success && isMounted) {
          setMetrics(result.data);
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
    const interval = setInterval(fetchMetrics, 5000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [timeRange]);

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

  const chartData = metrics.history
    ? prepareChartData(metrics.history, selectedMetric)
    : [];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>서버 리소스 모니터링</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Tabs
            defaultValue="day"
            className="space-y-4"
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <TabsList>
              <TabsTrigger value="day">일간</TabsTrigger>
              <TabsTrigger value="week">주간</TabsTrigger>
              <TabsTrigger value="month">월간</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs
            defaultValue="cpu"
            className="space-y-4"
            value={selectedMetric}
            onValueChange={(value) =>
              setSelectedMetric(value as "cpu" | "memory" | "network")
            }
          >
            <TabsList>
              <TabsTrigger value="cpu">CPU</TabsTrigger>
              <TabsTrigger value="memory">메모리</TabsTrigger>
              <TabsTrigger value="network">네트워크</TabsTrigger>
            </TabsList>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(time) => formatTime(time, timeRange)}
                    tick={{ fill: "currentColor" }}
                    stroke="currentColor"
                  />
                  <YAxis
                    label={{
                      value:
                        selectedMetric === "network"
                          ? "트래픽 (Mbps)"
                          : "사용률 (%)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "currentColor",
                    }}
                    tick={{ fill: "currentColor" }}
                    stroke="currentColor"
                    domain={
                      selectedMetric === "network" ? ["auto", "auto"] : [0, 100]
                    }
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      selectedMetric === "network"
                        ? [formatBytes(value, true), "네트워크 트래픽"]
                        : [
                            `${value.toFixed(2)}%`,
                            `${
                              selectedMetric === "cpu" ? "CPU" : "메모리"
                            } 사용률`,
                          ]
                    }
                    labelFormatter={(label: Date) =>
                      formatTime(label, timeRange)
                    }
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "currentColor",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={
                      selectedMetric === "cpu"
                        ? "#2563eb"
                        : selectedMetric === "memory"
                        ? "#16a34a"
                        : "#dc2626"
                    }
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="text-sm text-blue-600 dark:text-blue-400">
                CPU
              </div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {metrics.current.cpu.usage.toFixed(1)}%
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {metrics.current.cpu.cores} Cores | Load:{" "}
                {metrics.current.cpu.loadAverage.toFixed(2)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="text-sm text-green-600 dark:text-green-400">
                메모리
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {metrics.current.memory.usagePercent.toFixed(1)}%
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {formatBytes(metrics.current.memory.used)} /{" "}
                {formatBytes(metrics.current.memory.total)}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="text-sm text-red-600 dark:text-red-400">
                네트워크
              </div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatBytes(
                  metrics.current.network.bytesReceived +
                    metrics.current.network.bytesSent,
                  true
                )}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">
                ↑ {formatBytes(metrics.current.network.bytesSent, true)} | ↓{" "}
                {formatBytes(metrics.current.network.bytesReceived, true)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
