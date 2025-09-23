"use client";

import { useCallback, useMemo, useRef, useState } from "react";

type AnyRow = {
  id: string;
  getIsSelected?: () => boolean;
  toggleSelected?: (value?: boolean) => void;
};

type AnyTable = {
  getRowModel: () => { rows: AnyRow[] };
};

interface UseDragSelectOptions {
  // Custom selection source for non-react-table selections
  isRowSelectedById?: (rowId: string) => boolean;
  toggleRowById?: (rowId: string, selected: boolean) => void;
}

interface UseDragSelectResult<RowT extends AnyRow = AnyRow> {
  tableProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseOver: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    onClickCapture: (e: React.MouseEvent) => void;
  };
  getRowProps: (row: RowT) => { [key: string]: any };
}

function isInteractive(el: Element | null): boolean {
  if (!el) return false;
  const interactiveSelector =
    'a, button, input, textarea, select, label, [role="button"], [role="menuitem"], [role="checkbox"], [contenteditable="true"]';
  return !!(el.closest(interactiveSelector));
}

export function useDragSelect<RowT extends AnyRow = AnyRow>(
  table: AnyTable | null,
  options?: UseDragSelectOptions
): UseDragSelectResult<RowT> {
  const [dragging, setDragging] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const dragModeRef = useRef<"select" | "deselect" | null>(null);
  const visitedRef = useRef<Set<string>>(new Set());

  const rowsById = useMemo(() => {
    const map = new Map<string, AnyRow>();
    if (!table) return map;
    for (const r of table.getRowModel().rows) {
      map.set(r.id, r);
    }
    return map;
  }, [table, table ? table.getRowModel().rows.length : 0]);

  const isSelected = useCallback(
    (rowId: string) => {
      if (options?.isRowSelectedById) return options.isRowSelectedById(rowId);
      const row = rowsById.get(rowId);
      return row?.getIsSelected ? !!row.getIsSelected() : false;
    },
    [rowsById, options?.isRowSelectedById]
  );

  const toggleRow = useCallback(
    (rowId: string, selected: boolean) => {
      if (options?.toggleRowById) return options.toggleRowById(rowId, selected);
      const row = rowsById.get(rowId);
      if (row?.toggleSelected) row.toggleSelected(selected);
    },
    [rowsById, options?.toggleRowById]
  );

  const maybeStartDrag = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // only left button
      const target = e.target as Element;
      if (isInteractive(target)) return;
      const rowEl = target.closest("tr[data-row-id]") as HTMLElement | null;
      if (!rowEl) return;
      const rowId = rowEl.getAttribute("data-row-id");
      if (!rowId) return;

      startPosRef.current = { x: e.clientX, y: e.clientY };
      hasDraggedRef.current = false;
      dragModeRef.current = isSelected(rowId) ? "deselect" : "select";
      visitedRef.current.clear();
    },
    [isSelected]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      maybeStartDrag(e);
    },
    [maybeStartDrag]
  );

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!startPosRef.current) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    if (!hasDraggedRef.current) {
      const threshold = 3; // px
      if (dx * dx + dy * dy < threshold * threshold) return;
      hasDraggedRef.current = true;
      setDragging(true);
      // prevent text selection during drag
      if (typeof document !== "undefined") {
        document.body.style.userSelect = "none";
      }
    }
    // process current row under pointer as part of drag
    const target = e.target as Element;
    const rowEl = target.closest("tr[data-row-id]") as HTMLElement | null;
    if (!rowEl) return;
    const rowId = rowEl.getAttribute("data-row-id");
    if (!rowId || visitedRef.current.has(rowId)) return;
    visitedRef.current.add(rowId);
    const mode = dragModeRef.current ?? "select";
    toggleRow(rowId, mode === "select");
  }, [toggleRow]);

  const onMouseOver = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const target = e.target as Element;
      const rowEl = target.closest("tr[data-row-id]") as HTMLElement | null;
      if (!rowEl) return;
      const rowId = rowEl.getAttribute("data-row-id");
      if (!rowId || visitedRef.current.has(rowId)) return;
      visitedRef.current.add(rowId);
      const mode = dragModeRef.current ?? "select";
      toggleRow(rowId, mode === "select");
    },
    [dragging, toggleRow]
  );

  const endDrag = useCallback(() => {
    startPosRef.current = null;
    if (dragging) setDragging(false);
    dragModeRef.current = null;
    visitedRef.current.clear();
    if (typeof document !== "undefined") {
      document.body.style.userSelect = "";
    }
  }, [dragging]);

  const onMouseUp = useCallback(
    (_e: React.MouseEvent) => {
      endDrag();
    },
    [endDrag]
  );

  const onMouseLeave = useCallback(
    (_e: React.MouseEvent) => {
      endDrag();
    },
    [endDrag]
  );

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    // Suppress click if a drag occurred
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    }
  }, []);

  const getRowProps = useCallback((row: AnyRow) => {
    return { "data-row-id": row.id };
  }, []);

  return {
    tableProps: {
      onMouseDown,
      onMouseMove,
      onMouseOver,
      onMouseUp,
      onMouseLeave,
      onClickCapture,
    },
    getRowProps: getRowProps as (row: RowT) => { [key: string]: any },
  };
}
