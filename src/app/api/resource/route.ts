import { NextResponse } from "next/server";
import os from "os";
import { execSync } from "child_process";

let metricsHistory = {
  cpu: new Array(288).fill(0),
  memory: new Array(288).fill(0),
  network: new Array(288).fill(0),
};

// OS별 네트워크 통계 수집
async function getNetworkStats() {
  const platform = os.platform();

  try {
    switch (platform) {
      case "win32": // Windows
        const winStats = execSync("netstat -e").toString();
        const winLines = winStats.split("\n");
        if (winLines.length >= 3) {
          const stats = winLines[2].trim().split(/\s+/);
          return {
            bytesReceived: parseInt(stats[1]),
            bytesSent: parseInt(stats[2]),
          };
        }
        return { bytesReceived: 0, bytesSent: 0 };

      case "darwin": // macOS
        const macStats = execSync("netstat -ib").toString();
        const macInterface = macStats.split("\n")[1];
        const macData = macInterface.split(/\s+/);
        return {
          bytesReceived: parseInt(macData[6]),
          bytesSent: parseInt(macData[9]),
        };

      case "linux": // Linux
        const linuxStats = execSync("netstat -i").toString();
        const linuxInterface = linuxStats.split("\n")[2];
        const linuxData = linuxInterface.split(/\s+/);
        return {
          bytesReceived: parseInt(linuxData[3]),
          bytesSent: parseInt(linuxData[7]),
        };

      default:
        return { bytesReceived: 0, bytesSent: 0 };
    }
  } catch (error) {
    console.error("Network stats error:", error);
    return { bytesReceived: 0, bytesSent: 0 };
  }
}

// OS별 CPU 사용률 계산
async function getCpuUsage() {
  const platform = os.platform();

  try {
    switch (platform) {
      case "win32": // Windows
        const winCmd = "wmic cpu get loadpercentage";
        const winStdout = execSync(winCmd).toString();
        const winUsage = winStdout.split("\n")[1];
        return parseFloat(winUsage) || 0;

      case "darwin": // macOS
        const macCmd = 'top -l 1 | grep "CPU usage"';
        const macStdout = execSync(macCmd).toString();
        const macUsage = macStdout.match(/(\d+\.\d+)% user/);
        return macUsage ? parseFloat(macUsage[1]) : 0;

      case "linux": // Linux
        // Linux에서는 loadavg를 CPU 코어 수로 나누어 사용
        return (os.loadavg()[0] / os.cpus().length) * 100;

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  } catch (error) {
    console.error("CPU usage error:", error);
    return 0;
  }
}

// 메모리 사용량 계산 함수 추가
async function getMemoryUsage() {
  const platform = os.platform();

  try {
    switch (platform) {
      case "win32": // Windows
        const winCmd =
          "wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value";
        const winStdout = execSync(winCmd).toString();
        const totalMatch = winStdout.match(/TotalVisibleMemorySize=(\d+)/);
        const freeMatch = winStdout.match(/FreePhysicalMemory=(\d+)/);

        if (totalMatch && freeMatch) {
          const total = parseInt(totalMatch[1]) * 1024; // KB to Bytes
          const free = parseInt(freeMatch[1]) * 1024;
          const used = total - free;
          return {
            total,
            used,
            usagePercent: (used / total) * 100,
          };
        }
        break;

      case "darwin": // macOS
        const macCmd = "vm_stat";
        const macStdout = execSync(macCmd).toString();
        const pageSize = 4096; // 기본 페이지 크기
        const matches = {
          free: macStdout.match(/Pages free:\s+(\d+)/),
          active: macStdout.match(/Pages active:\s+(\d+)/),
          inactive: macStdout.match(/Pages inactive:\s+(\d+)/),
          wired: macStdout.match(/Pages wired down:\s+(\d+)/),
        };

        if (
          matches.free &&
          matches.active &&
          matches.inactive &&
          matches.wired
        ) {
          const free = parseInt(matches.free[1]) * pageSize;
          const active = parseInt(matches.active[1]) * pageSize;
          const inactive = parseInt(matches.inactive[1]) * pageSize;
          const wired = parseInt(matches.wired[1]) * pageSize;

          const total = os.totalmem();
          const used = active + wired;
          return {
            total,
            used,
            usagePercent: (used / total) * 100,
          };
        }
        break;

      case "linux": // Linux
        const linuxCmd = "free";
        const linuxStdout = execSync(linuxCmd).toString();
        const lines = linuxStdout.split("\n");
        const memInfo = lines[1].split(/\s+/);

        const total = parseInt(memInfo[1]) * 1024;
        const used = (parseInt(memInfo[2]) + parseInt(memInfo[5])) * 1024; // used + cached
        return {
          total,
          used,
          usagePercent: (used / total) * 100,
        };
    }

    // 기본 방식으로 폴백
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return {
      total,
      used,
      usagePercent: (used / total) * 100,
    };
  } catch (error) {
    console.error("Memory usage error:", error);
    // 에러 발생 시 기본 방식으로 폴백
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return {
      total,
      used,
      usagePercent: (used / total) * 100,
    };
  }
}

export async function GET() {
  try {
    const cpuUsage = await getCpuUsage();
    const memoryStats = await getMemoryUsage();
    const networkStats = await getNetworkStats();

    // 히스토리 업데이트
    metricsHistory.cpu = [...metricsHistory.cpu.slice(1), cpuUsage];
    metricsHistory.memory = [
      ...metricsHistory.memory.slice(1),
      memoryStats.usagePercent,
    ];
    metricsHistory.network = [
      ...metricsHistory.network.slice(1),
      networkStats.bytesReceived + networkStats.bytesSent,
    ];

    const metrics = {
      current: {
        cpu: {
          usage: cpuUsage.toFixed(2),
          cores: os.cpus().length,
          platform: os.platform(),
          loadAverage: os.loadavg()[0].toFixed(2),
        },
        memory: {
          total: (memoryStats.total / (1024 * 1024 * 1024)).toFixed(2),
          used: (memoryStats.used / (1024 * 1024 * 1024)).toFixed(2),
          usagePercent: memoryStats.usagePercent.toFixed(2),
        },
        network: networkStats,
      },
      history: metricsHistory,
    };

    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    console.error("Resource metrics error:", error);
    return NextResponse.json({
      success: false,
      error: "메트릭 수집 중 오류가 발생했습니다.",
    });
  }
}
