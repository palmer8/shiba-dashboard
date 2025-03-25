"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  removeUserVehicleAction,
  removeUserWeaponAction,
  updateUserItemAction,
} from "@/actions/realtime/realtime-user-item-action";
import {
  RemoveUserVehicleDto,
  RemoveUserWeaponDto,
  UpdateUserInventoryDto,
} from "@/types/realtime";
import { formatKoreanNumber } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Session } from "next-auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RealtimeUserItemProps {
  data: {
    weapons: Record<string, string>;
    inventory: Record<string, { name: string; amount: number }>;
    vehicles: Record<string, string>;
    weaponAmmo: Record<string, number>;
  };
  userId: number;
  isAdmin: boolean;
  session: Session;
  mutate: () => Promise<any>;
}

export default function RealtimeUserItem({
  data,
  userId,
  isAdmin,
  session,
  mutate,
}: RealtimeUserItemProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    originalAmount: number;
    newAmount: number;
  } | null>(null);
  const [filters, setFilters] = useState({
    inventory: "",
    weapons: "",
    vehicles: "",
  });
  const [showWeaponDialog, setShowWeaponDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<{
    id: string;
    name: string;
  } | null>(null);

  async function handleUpdateInventory(data: UpdateUserInventoryDto) {
    const result = await updateUserItemAction(data);
    if (result.success) {
      toast({
        title: "아이템 업데이트 성공",
      });
      await mutate();
    } else {
      toast({
        title: "아이템 업데이트 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  }

  const handleAmountChange = (
    itemId: string,
    newAmount: number,
    originalAmount: number
  ) => {
    setSelectedItem({
      id: itemId,
      originalAmount,
      newAmount,
    });
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    if (!selectedItem) return;

    const { id, originalAmount, newAmount } = selectedItem;
    await handleUpdateInventory({
      user_id: userId.toString(),
      itemcode: id,
      amount: Math.abs(newAmount - originalAmount),
      type: newAmount < originalAmount ? "remove" : "add",
    });
    await mutate();
    setShowConfirmDialog(false);
    setEditingItem(null);
    setSelectedItem(null);
  };

  const handleCancelUpdate = () => {
    setShowConfirmDialog(false);
    setEditingItem(null);
    setSelectedItem(null);
  };

  async function handleRemoveUserWeapon(data: RemoveUserWeaponDto) {
    const result = await removeUserWeaponAction(data);
    if (result.success) {
      toast({
        title: "무기 회수 성공",
      });
      await mutate();
    } else {
      toast({
        title: "무기 회수 실패",
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
      await mutate();
    } else {
      toast({
        title: "차량 제거 실패",
        description: result.error || "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  }

  const handleWeaponRemove = async () => {
    if (!selectedWeapon) return;

    await handleRemoveUserWeapon({
      user_id: userId,
      weapon: selectedWeapon.id,
    });
    await mutate();
    setShowWeaponDialog(false);
    setSelectedWeapon(null);
  };

  const handleVehicleRemove = async () => {
    if (!selectedVehicle) return;

    await handleRemoveUserVehicle({
      user_id: userId,
      vehicle: selectedVehicle.id,
    });
    await mutate();
    setShowVehicleDialog(false);
    setSelectedVehicle(null);
  };

  const items = useMemo(
    () => ({
      inventory: Object.entries(data.inventory || {})
        .map(([id, item]) => ({
          id,
          name: item.name,
          amount: item.amount,
        }))
        .filter(
          (item) =>
            item.name.toLowerCase().includes(filters.inventory.toLowerCase()) ||
            item.id.toLowerCase().includes(filters.inventory.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
      weapons: Object.entries(data.weapons || {})
        .map(([id, name]) => ({
          id,
          name,
        }))
        .filter(
          (weapon) =>
            weapon.name.toLowerCase().includes(filters.weapons.toLowerCase()) ||
            weapon.id.toLowerCase().includes(filters.weapons.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
      vehicles: Object.entries(data.vehicles || {})
        .map(([id, name]) => ({
          id,
          name,
        }))
        .filter(
          (vehicle) =>
            vehicle.name
              .toLowerCase()
              .includes(filters.vehicles.toLowerCase()) ||
            vehicle.id.toLowerCase().includes(filters.vehicles.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    }),
    [data, filters]
  );

  const renderSearchInput = (type: keyof typeof filters) => (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={`${
          type === "inventory" ? "아이템" : type === "weapons" ? "무기" : "차량"
        } 검색...`}
        value={filters[type]}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, [type]: e.target.value }))
        }
        className="pl-8"
      />
    </div>
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "복사 완료",
        description: "ID가 클립보드에 복사되었습니다.",
      });
    } catch (err) {
      toast({
        title: "복사 실패",
        description: "ID 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const ItemNameCell = ({
    name,
    id,
    ammo,
  }: {
    name: string;
    id: string;
    ammo?: number;
  }) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-primary"
              onClick={() => copyToClipboard(id)}
            >
              <span className="truncate max-w-[200px]">{name}</span>
              {typeof ammo === "number" && id.startsWith("WEAPON_") && (
                <span className="text-xs text-muted-foreground">
                  ({formatKoreanNumber(ammo)}발)
                </span>
              )}
              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="font-mono text-xs">{id}</p>
            <p className="text-xs text-muted-foreground">클릭하여 ID 복사</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="w-full flex justify-between items-center">
              <CardTitle>인벤토리</CardTitle>
              <Badge variant="secondary">{items.inventory.length}개</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderSearchInput("inventory")}
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>아이템</TableHead>
                  <TableHead className="text-right">수량</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.inventory.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell>
                      <ItemNameCell name={item.name} id={item.id} />
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin ? (
                        editingItem === item.id ? (
                          <Input
                            type="number"
                            defaultValue={item.amount}
                            className="w-20 text-right"
                            autoFocus
                            onBlur={(e) => {
                              const newAmount = Number(e.target.value);
                              if (newAmount !== item.amount) {
                                handleAmountChange(
                                  item.id,
                                  newAmount,
                                  item.amount
                                );
                              } else {
                                setEditingItem(null);
                              }
                            }}
                          />
                        ) : (
                          <span
                            className="px-2 py-1 border rounded cursor-pointer hover:bg-muted whitespace-nowrap"
                            onClick={() => setEditingItem(item.id)}
                          >
                            {formatKoreanNumber(item.amount)}개
                          </span>
                        )
                      ) : (
                        <span>{formatKoreanNumber(item.amount)}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="w-full flex justify-between items-center">
              <CardTitle>무기</CardTitle>
              <Badge variant="secondary">{items.weapons.length}개</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderSearchInput("weapons")}
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>무기</TableHead>
                  {isAdmin && <TableHead className="w-[60px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.weapons.map((weapon) => (
                  <TableRow key={weapon.id} className="group">
                    <TableCell>
                      {data?.weaponAmmo && weapon.id in data.weaponAmmo ? (
                        <ItemNameCell
                          name={weapon.name}
                          id={weapon.id}
                          ammo={data.weaponAmmo[weapon.id]}
                        />
                      ) : (
                        <ItemNameCell name={weapon.name} id={weapon.id} />
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedWeapon({
                              id: weapon.id,
                              name: weapon.name,
                            });
                            setShowWeaponDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="w-full flex justify-between items-center">
              <CardTitle>차량</CardTitle>
              <Badge variant="secondary">{items.vehicles.length}개</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {renderSearchInput("vehicles")}
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>차량</TableHead>
                  {isAdmin && <TableHead className="w-[60px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} className="group">
                    <TableCell>
                      <ItemNameCell name={vehicle.name} id={vehicle.id} />
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVehicle({
                              id: vehicle.id,
                              name: vehicle.name,
                            });
                            setShowVehicleDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>수량 변경 확인</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem && (
                <>
                  현재 수량: {formatKoreanNumber(selectedItem.originalAmount)}개
                  <br />
                  변경 수량: {formatKoreanNumber(selectedItem.newAmount)}개
                  <br />
                  {selectedItem.newAmount > selectedItem.originalAmount ? (
                    <span className="text-blue-500">
                      {formatKoreanNumber(
                        selectedItem.newAmount - selectedItem.originalAmount
                      )}
                      개 증가
                    </span>
                  ) : (
                    <span className="text-red-500">
                      {formatKoreanNumber(
                        selectedItem.originalAmount - selectedItem.newAmount
                      )}
                      개 감소
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelUpdate}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpdate}>
              적용
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showWeaponDialog} onOpenChange={setShowWeaponDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>무기 회수 확인</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedWeapon && (
                <>
                  다음 무기를 회수하시겠습니까?
                  <br />
                  <br />
                  무기 ID:{" "}
                  <span className="font-medium">{selectedWeapon.id}</span>
                  <br />
                  무기명:{" "}
                  <span className="font-medium">{selectedWeapon.name}</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowWeaponDialog(false)}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWeaponRemove}
              className="bg-destructive hover:bg-destructive/90"
            >
              회수
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>차량 제거 확인</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedVehicle && (
                <>
                  다음 차량을 제거하시겠습니까?
                  <br />
                  <br />
                  차량 ID:{" "}
                  <span className="font-medium">{selectedVehicle.id}</span>
                  <br />
                  차량명:{" "}
                  <span className="font-medium">{selectedVehicle.name}</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowVehicleDialog(false)}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVehicleRemove}
              className="bg-destructive hover:bg-destructive/90"
            >
              제거
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
