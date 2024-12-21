"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  removeUserVehicleAction,
  removeUserWeaponAction,
  updateUserItemAction,
} from "@/actions/realtime/realtime-user-item-action";
import { toast } from "@/hooks/use-toast";
import {
  RemoveUserVehicleDto,
  RemoveUserWeaponDto,
  UpdateUserInventoryDto,
} from "@/types/realtime";

interface RealtimeUserItemProps {
  data: {
    weapons: Record<string, string>;
    inventory: Record<string, { name: string; amount: number }>;
    vehicles: Record<string, string>;
  };
  userId: number;
}

export default function RealtimeUserItem({
  data,
  userId,
}: RealtimeUserItemProps) {
  const { data: session } = useSession();
  const isStaff = session?.user?.role === UserRole.STAFF;

  const [filters, setFilters] = useState({
    inventory: "",
    weapons: "",
    vehicles: "",
  });

  async function handleUpdateInventory(data: UpdateUserInventoryDto) {
    const result = await updateUserItemAction(data);
    if (result.success) {
      toast({
        title: "아이템 업데이트 성공",
      });
    } else {
      toast({
        title: "아이템 업데이트 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  }

  const handleAmountBlur = (
    itemId: string,
    newAmount: number,
    originalAmount: number
  ) => {
    if (newAmount === originalAmount) return;

    handleUpdateInventory({
      user_id: userId.toString(),
      itemcode: itemId,
      amount: Math.abs(newAmount - originalAmount),
      type: newAmount < originalAmount ? "remove" : "add",
    });
  };

  async function handleRemoveUserWeapon(data: RemoveUserWeaponDto) {
    const result = await removeUserWeaponAction(data);
    if (result.success) {
      toast({
        title: "무기 제거 성공",
      });
    } else {
      toast({
        title: "무기 제거 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  }

  async function handleRemoveUserVehicle(data: RemoveUserVehicleDto) {
    const result = await removeUserVehicleAction(data);
    if (result.success) {
      toast({
        title: "차량 제거 성공",
      });
    } else {
      toast({
        title: "차량 제거 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  }

  const items = useMemo(
    () => ({
      weapons: Object.entries(data.weapons)
        .map(([key, value]) => ({
          id: key,
          name: value,
        }))
        .filter(
          (weapon) =>
            weapon.id.toLowerCase().includes(filters.weapons.toLowerCase()) ||
            weapon.name.toLowerCase().includes(filters.weapons.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
      inventory: Object.entries(data.inventory)
        .map(([key, value]) => ({
          id: key,
          name: value.name,
          amount: value.amount,
        }))
        .filter(
          (item) =>
            item.id.toLowerCase().includes(filters.inventory.toLowerCase()) ||
            item.name.toLowerCase().includes(filters.inventory.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
      vehicles: Object.entries(data.vehicles)
        .map(([key, value]) => ({ id: key, name: value }))
        .filter(
          (vehicle) =>
            vehicle.id.toLowerCase().includes(filters.vehicles.toLowerCase()) ||
            vehicle.name.toLowerCase().includes(filters.vehicles.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    }),
    [data, filters]
  );

  const renderSearchInput = (
    category: "inventory" | "weapons" | "vehicles"
  ) => (
    <Input
      placeholder="아이디 또는 이름으로 검색..."
      value={filters[category]}
      onChange={(e) =>
        setFilters((prev) => ({
          ...prev,
          [category]: e.target.value,
        }))
      }
      className="mb-4"
    />
  );

  const renderInventoryTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>아이디</TableHead>
          <TableHead>이름</TableHead>
          <TableHead>수량</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.inventory.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.id}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              {isStaff ? (
                <span>{item.amount}개</span>
              ) : (
                <Input
                  type="number"
                  defaultValue={item.amount}
                  className="w-[100px]"
                  onBlur={(e) => {
                    const newValue = parseInt(e.target.value);
                    handleAmountBlur(item.id, newValue, item.amount);
                  }}
                />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderWeaponsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>아이디</TableHead>
          <TableHead>이름</TableHead>
          {!isStaff && <TableHead>회수</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.weapons.map((weapon) => (
          <TableRow key={weapon.id}>
            <TableCell>{weapon.id}</TableCell>
            <TableCell>{weapon.name}</TableCell>
            {!isStaff && (
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemoveUserWeapon({
                      user_id: userId,
                      weapon: weapon.id,
                    });
                  }}
                >
                  회수
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderVehiclesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>아이디</TableHead>
          <TableHead>이름</TableHead>
          {!isStaff && <TableHead>회수</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.vehicles.map((vehicle) => (
          <TableRow key={vehicle.id}>
            <TableCell>{vehicle.id}</TableCell>
            <TableCell>{vehicle.name}</TableCell>
            {!isStaff && (
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemoveUserVehicle({
                      user_id: userId,
                      vehicle: vehicle.id,
                    });
                  }}
                >
                  회수
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <div className="md:hidden">
        <Tabs defaultValue="inventory">
          <TabsList className="h-10 w-full md:max-w-[400px]">
            <TabsTrigger className="h-full w-full" value="inventory">
              유저 인벤토리
            </TabsTrigger>
            <TabsTrigger className="h-full w-full" value="weapons">
              장착중인 무기
            </TabsTrigger>
            <TabsTrigger className="h-full w-full" value="vehicles">
              보유 중인 차량
            </TabsTrigger>
          </TabsList>
          <TabsContent value="inventory">
            {renderSearchInput("inventory")}
            <div className="grid gap-4">{renderInventoryTable()}</div>
          </TabsContent>
          <TabsContent value="weapons">
            {renderSearchInput("weapons")}
            <div className="grid gap-4">{renderWeaponsTable()}</div>
          </TabsContent>
          <TabsContent value="vehicles">
            {renderSearchInput("vehicles")}
            <div className="grid gap-4">{renderVehiclesTable()}</div>
          </TabsContent>
        </Tabs>
      </div>
      <div className="hidden md:grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>유저 인벤토리</CardTitle>
          </CardHeader>
          <CardContent>
            {renderSearchInput("inventory")}
            {renderInventoryTable()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>장착중인 무기</CardTitle>
          </CardHeader>
          <CardContent>
            {renderSearchInput("weapons")}
            {renderWeaponsTable()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>보유 중인 차량</CardTitle>
          </CardHeader>
          <CardContent>
            {renderSearchInput("vehicles")}
            {renderVehiclesTable()}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
