"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useSpring } from "motion/react";
import { toPng } from "html-to-image";
import { buildPrompt } from "@/lib/prompt";
import {
  Axis,
  BEZEL,
  Doc,
  FRAME_GAP,
  FRAME_LABEL_H,
  Frame,
  FrameMode,
  GAP,
  Group,
  Item,
  KIND_ORDER,
  Kind,
  MEASURED,
  PALETTES,
  PHONE_H,
  PHONE_R,
  PHONE_W,
  PULL_EXP,
  Radii,
  SETTLE_MS,
  SNAP_CROSS,
  SNAP_MAIN,
  TRANSITIONS,
  Transition,
  baseRadii,
  canJoin,
  clamp,
  connectSpecOf,
  frameOfGroup,
  frameRect,
  groupBounds,
  lerp,
  makeItem,
  paletteOf,
  sizeOf,
  uid,
} from "@/lib/tokens";
import { Icon, M3Node, MeasuredContent } from "@/components/M3Node";
import { FrameInspector, Inspector } from "@/components/Inspector";
import { Preview } from "@/components/Preview";
import { Logo } from "@/components/Logo";
import { PartsPalette } from "@/components/PartsPalette";
import { PromptPanel } from "@/components/PromptPanel";
import { Mode, Toolbar } from "@/components/Toolbar";
import { BottomSheet, MobileActionBar, MobileInspector, MobileSettings } from "@/components/Mobile";
import { IconBtn, Segmented } from "@/components/ui";
import { Lang, LangContext, setGlobalLang, t } from "@/lib/i18n";

/** the dragged part's own travel: a little lag reads as weight */
const CARRY = {
  type: "spring" as const,
  stiffness: 620,
  damping: 38,
  mass: 0.7,
};
/** the gap opening and the run's counter-shift; identical configs so they cancel */
const OPEN = {
  type: "spring" as const,
  stiffness: 700,
  damping: 42,
  mass: 0.55,
};
const INSTANT = { duration: 0 };

const MIN_Z = 0.25;
const MAX_Z = 3;
const HISTORY_MAX = 100;
const DOC_KEY = "m3e:doc";
const UI_KEY = "m3e:ui";

type View = { x: number; y: number; z: number };
type Snap = { groupId: string; index: number; pull: number };

/** alignment guide: the snapped position plus the line to draw */
type Guide = { x?: number; y?: number; gx?: number; gy?: number };
const GUIDE_PX = 7;
const FRAME_MARGIN = 16;

type DragState = {
  item: Item;
  guide: Guide | null;
  offX: number;
  offY: number;
  startX: number;
  startY: number;
  px: number;
  py: number;
  active: boolean;
  fromPalette: boolean;
  overBin: boolean;
  snap: Snap | null;
  settling: boolean;
};

type Gesture =
  | { kind: "pan"; sx: number; sy: number; vx: number; vy: number }
  | {
      kind: "marquee";
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      moved: boolean;
    }
  | {
      kind: "frame";
      id: string;
      sx: number;
      sy: number;
      fx: number;
      fy: number;
      groups: { id: string; x: number; y: number }[];
      moved: boolean;
    };

type Snapshot = { groups: Group[]; frames: Frame[] };

const SEED_FRAMES: Frame[] = [{ id: "seedF1", name: "Home", x: 0, y: 0 }];

/** Seed ids are deterministic so server and client render the same markup. */
const seed = (): Group[] => {
  let n = 0;
  const sid = () => `seed${++n}`;
  const mk = (k: Kind) => ({ ...makeItem(k), id: sid() });
  const bar = mk("topAppBar");
  const a = mk("button");
  const b = mk("button");
  a.label = "お気に入り";
  a.icon = "star";
  b.label = "共有";
  b.icon = "share";
  b.variant = "tonal";
  const rows = ["受信トレイ", "スター付き", "アーカイブ"].map((t, i) => {
    const it = mk("listItem");
    it.label = t;
    it.icon = ["inbox", "star", "archive"][i];
    it.supporting = "サブテキスト";
    return it;
  });
  const nav = mk("bottomNav");
  const fab = mk("fab");
  return [
    { id: sid(), x: 0, y: 0, axis: "x", items: [bar] },
    { id: sid(), x: 36, y: 96, axis: "x", items: [a, b] },
    { id: sid(), x: 36, y: 184, axis: "y", items: rows },
    {
      id: sid(),
      x: PHONE_W - 56 - 24,
      y: PHONE_H - 80 - 56 - 24,
      axis: "x",
      items: [fab],
    },
    { id: sid(), x: 0, y: PHONE_H - 80, axis: "x", items: [nav] },
  ];
};

/** The phone version starts with buttons only: that is all it edits. */
const mobileSeed = (): Group[] => {
  const mk = (k: Kind) => makeItem(k);
  const a = mk("button");
  const b = mk("button");
  const c = mk("button");
  a.label = "お気に入り";
  a.icon = "star";
  b.label = "共有";
  b.icon = "share";
  b.variant = "tonal";
  c.label = "はじめる";
  c.icon = "arrow_forward";
  return [
    { id: uid(), x: 36, y: 120, axis: "x", items: [a, b] },
    { id: uid(), x: 36, y: 200, axis: "x", items: [c] },
  ];
};

export default function Page() {
  /* ---------- document ---------- */
  const [groups, setGroups] = useState<Group[]>(seed);
  const [frames, setFrames] = useState<Frame[]>(SEED_FRAMES);
  const [paletteKey, setPaletteKey] = useState("purple");
  const [frame, setFrame] = useState<FrameMode>("phone");
  const [lang, setLang] = useState<Lang>("ja");
  const [isMobile, setIsMobile] = useState(false);
  const [sheet, setSheet] = useState<"edit" | "settings" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");

  /* ---------- editor ui ---------- */
  const [view, setView] = useState<View>({ x: 0, y: 0, z: 1 });
  const [mode, setMode] = useState<Mode>("select");
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftW, setLeftW] = useState(232);
  const [rightW, setRightW] = useState(320);
  const [rightTab, setRightTab] = useState<"edit" | "prompt">("edit");
  const [favorites, setFavorites] = useState<Kind[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [gesture, setGesture] = useState<Gesture | null>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [resizing, setResizing] = useState<"left" | "right" | null>(null);
  const [, bumpHistory] = useState(0);

  const p = paletteOf(paletteKey);

  const canvasRef = useRef<HTMLDivElement>(null);
  const measureEls = useRef<Map<string, HTMLElement>>(new Map());
  const dragRef = useRef<DragState | null>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const pendingRef = useRef<{ timer: number; commit: () => void } | null>(null);
  const groupsRef = useRef(groups);
  groupsRef.current = groups;
  const framesRef = useRef(frames);
  framesRef.current = frames;
  const widthsRef = useRef(widths);
  widthsRef.current = widths;
  const viewRef = useRef(view);
  viewRef.current = view;
  const leftOpenRef = useRef(leftOpen);
  leftOpenRef.current = leftOpen;
  const leftWRef = useRef(leftW);
  leftWRef.current = leftW;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const spaceRef = useRef(spaceHeld);
  spaceRef.current = spaceHeld;
  const frameRef = useRef(frame);
  frameRef.current = frame;
  const mobileRef = useRef(isMobile);
  mobileRef.current = isMobile;
  /** active touch points, for pinch zoom */
  const touchesRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{
    d0: number;
    z0: number;
    mx: number;
    my: number;
    vx: number;
    vy: number;
  } | null>(null);
  /** groups that must reposition without animating on the next render */
  const instantRef = useRef<Set<string>>(new Set());
  const loadedRef = useRef(false);
  /** whether a saved document existed, so the phone seed only applies to a fresh start */
  const hadDocRef = useRef(false);

  /* ---------- history ---------- */
  const pastRef = useRef<Snapshot[]>([]);
  const futureRef = useRef<Snapshot[]>([]);
  const lastPatchRef = useRef<{ key: string; at: number }>({ key: "", at: 0 });

  const snapshot = useCallback(() => {
    pastRef.current.push({
      groups: groupsRef.current,
      frames: framesRef.current,
    });
    if (pastRef.current.length > HISTORY_MAX) pastRef.current.shift();
    futureRef.current = [];
    bumpHistory((v) => v + 1);
  }, []);

  /** consecutive edits of the same field collapse into one undo step */
  const snapshotFor = useCallback(
    (key: string) => {
      const now = Date.now();
      const last = lastPatchRef.current;
      if (last.key !== key || now - last.at > 800) snapshot();
      lastPatchRef.current = { key, at: now };
    },
    [snapshot],
  );

  const restore = (snap: Snapshot) => {
    for (const g of snap.groups) instantRef.current.add(g.id);
    setGroups(snap.groups);
    setFrames(snap.frames);
    bumpHistory((v) => v + 1);
  };

  const undo = useCallback(() => {
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current.push({
      groups: groupsRef.current,
      frames: framesRef.current,
    });
    restore(prev);
  }, []);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push({
      groups: groupsRef.current,
      frames: framesRef.current,
    });
    restore(next);
  }, []);

  useEffect(() => {
    instantRef.current.clear();
  });

  /* ---------- persistence ---------- */
  useEffect(() => {
    // React's development double-run would otherwise read back its own first save
    if (loadedRef.current) return;
    try {
      const d = localStorage.getItem(DOC_KEY);
      if (d) {
        hadDocRef.current = true;
        const doc = JSON.parse(d) as Partial<Doc>;
        if (Array.isArray(doc.groups)) setGroups(doc.groups);
        if (Array.isArray(doc.frames)) setFrames(doc.frames);
        if (doc.paletteKey) setPaletteKey(doc.paletteKey);
        // frame mode is decided by the device (media-query effect), not restored
        if (typeof doc.title === "string") setTitle(doc.title);
        if (typeof doc.brief === "string") setBrief(doc.brief);
      }
      const u = localStorage.getItem(UI_KEY);
      if (u) {
        const ui = JSON.parse(u);
        if (ui.view) setView(ui.view);
        if (typeof ui.leftOpen === "boolean") setLeftOpen(ui.leftOpen);
        if (typeof ui.rightOpen === "boolean") setRightOpen(ui.rightOpen);
        if (ui.leftW) setLeftW(ui.leftW);
        if (ui.rightW) setRightW(ui.rightW);
        if (Array.isArray(ui.favorites)) setFavorites(ui.favorites);
        if (ui.mode) setMode(ui.mode);
        if (ui.lang === "ja" || ui.lang === "en") setLang(ui.lang);
      } else {
        if (
          navigator.language &&
          !navigator.language.toLowerCase().startsWith("ja")
        )
          setLang("en");
        queueMicrotask(() => fitRef.current());
      }
    } catch {}
    loadedRef.current = true;
  }, []);

  useEffect(() => {
    setGlobalLang(lang);
    document.documentElement.lang = lang;
  }, [lang]);

  /* in-app browsers size the page behind their own toolbars and may ignore dvh,
     so the measured inner height wins over the CSS height (innerHeight, not the
     visual viewport, so pinch-zoom and the keyboard leave the layout alone) */
  useEffect(() => {
    const apply = () => {
      const h = Math.round(window.innerHeight);
      if (h > 0) document.documentElement.style.setProperty("--app-h", `${h}px`);
    };
    /* X, Instagram, Facebook and LINE keep their own action bar over the page
       bottom, so the controls sit one button higher there */
    if (/Twitter|X-Client|Instagram|FBAN|FBAV|Line\//i.test(navigator.userAgent)) {
      document.documentElement.style.setProperty("--bottom-ui", "64px");
    }
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);

  /* everyone works on phone screens; a phone gets one fixed screen and the select tool only */
  useEffect(() => {
    const mq = window.matchMedia(
      "(max-width: 840px), (pointer: coarse) and (max-width: 1024px)",
    );
    const apply = () => {
      const m = mq.matches;
      setIsMobile(m);
      mobileRef.current = m;
      if (m) {
        setMode("select");
        setSheet(null);
        if (!hadDocRef.current) {
          hadDocRef.current = true;
          setGroups(mobileSeed());
          setFrames([{ id: uid(), name: t("home"), x: 0, y: 0 }]);
        }
      }
      if (frameRef.current !== "phone") {
        setFrame("phone");
        frameRef.current = "phone";
      }
      ensureFrameRef.current();
      queueMicrotask(() => fitRef.current());
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(
        DOC_KEY,
        JSON.stringify({ groups, frames, paletteKey, frame, title, brief }),
      );
    } catch {}
  }, [groups, frames, paletteKey, frame, title, brief]);

  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(
        UI_KEY,
        JSON.stringify({
          view,
          leftOpen,
          rightOpen,
          leftW,
          rightW,
          favorites,
          mode,
          lang,
        }),
      );
    } catch {}
  }, [
    view,
    leftOpen,
    rightOpen,
    leftW,
    rightW,
    favorites,
    mode,
    lang,
  ]);

  /* ---------- measurement (text-sized kinds) ---------- */
  const allItems = useMemo(() => {
    const map = new Map<string, Item>();
    for (const g of groups) for (const it of g.items) map.set(it.id, it);
    if (drag) map.set(drag.item.id, drag.item);
    return [...map.values()];
  }, [groups, drag]);

  useLayoutEffect(() => {
    const next: Record<string, number> = {};
    measureEls.current.forEach((el, id) => {
      next[id] = Math.ceil(el.getBoundingClientRect().width);
    });
    const keys = Object.keys(next);
    const changed =
      keys.length !== Object.keys(widthsRef.current).length ||
      keys.some((k) => widthsRef.current[k] !== next[k]);
    if (changed) setWidths(next);
  });

  useEffect(() => {
    document.fonts?.ready.then(() => setWidths({}));
  }, []);

  const sizeRef = useCallback((it: Item) => sizeOf(it, widthsRef.current), []);
  const alongRef = useCallback(
    (it: Item, axis: Axis) => (axis === "x" ? sizeRef(it).w : sizeRef(it).h),
    [sizeRef],
  );
  const prefixOf = useCallback(
    (g: Group, k: number) =>
      g.items.slice(0, k).reduce((s, it) => s + alongRef(it, g.axis) + GAP, 0),
    [alongRef],
  );

  /* ---------- coordinates ---------- */
  const canvasRect = () => canvasRef.current?.getBoundingClientRect();
  const toWorld = (clientX: number, clientY: number) => {
    const r = canvasRect();
    const v = viewRef.current;
    return {
      x: (clientX - (r?.left ?? 0) - v.x) / v.z,
      y: (clientY - (r?.top ?? 0) - v.y) / v.z,
    };
  };
  const inBin = (clientX: number) =>
    !mobileRef.current && leftOpenRef.current && clientX >= 0 && clientX <= leftWRef.current;

  const setZoomAt = useCallback((nz: number, cx?: number, cy?: number) => {
    const r = canvasRect();
    const v = viewRef.current;
    const z = clamp(nz, MIN_Z, MAX_Z);
    const px = cx === undefined ? (r?.width ?? 0) / 2 : cx - (r?.left ?? 0);
    const py = cy === undefined ? (r?.height ?? 0) / 2 : cy - (r?.top ?? 0);
    setView({
      x: px - ((px - v.x) * z) / v.z,
      y: py - ((py - v.y) * z) / v.z,
      z,
    });
  }, []);

  const fit = useCallback(() => {
    const r = canvasRect();
    if (!r) return;
    const gs = groupsRef.current;
    let x0 = -BEZEL;
    let y0 = -BEZEL - FRAME_LABEL_H;
    let x1 = PHONE_W + BEZEL;
    let y1 = PHONE_H + BEZEL;
    const fs = framesRef.current;
    if (frameRef.current === "phone" && fs.length > 0) {
      x0 = Math.min(...fs.map((f) => f.x)) - BEZEL;
      y0 = Math.min(...fs.map((f) => f.y)) - BEZEL - FRAME_LABEL_H;
      x1 = Math.max(...fs.map((f) => f.x)) + PHONE_W + BEZEL;
      y1 = Math.max(...fs.map((f) => f.y)) + PHONE_H + BEZEL;
    }
    if (frameRef.current === "blank") {
      if (gs.length === 0) {
        setView({ x: 48, y: 48, z: 1 });
        return;
      }
      x0 = Infinity;
      y0 = Infinity;
      x1 = -Infinity;
      y1 = -Infinity;
      for (const g of gs) {
        let off = 0;
        for (const it of g.items) {
          const sz = sizeOf(it, widthsRef.current);
          const l = g.axis === "x" ? g.x + off : g.x;
          const t = g.axis === "x" ? g.y : g.y + off;
          x0 = Math.min(x0, l);
          y0 = Math.min(y0, t);
          x1 = Math.max(x1, l + sz.w);
          y1 = Math.max(y1, t + sz.h);
          off += (g.axis === "x" ? sz.w : sz.h) + GAP;
        }
      }
    }
    const mobile = mobileRef.current;
    const pad = mobile ? 14 : 40;
    const top = mobile ? 96 : 84; // keep the floating toolbar clear of the frame
    const bottom = mobile ? 96 : pad;
    if (mobile) {
      // a phone zooms to the screen's width and starts at its top; the rest scrolls
      const z = clamp((r.width - pad * 2) / (x1 - x0), MIN_Z, MAX_Z);
      setView({ x: (r.width - (x1 - x0) * z) / 2 - x0 * z, y: top - y0 * z, z });
      return;
    }
    const z = clamp(
      Math.min(
        (r.width - pad * 2) / (x1 - x0),
        (r.height - top - bottom) / (y1 - y0),
        1,
      ),
      MIN_Z,
      MAX_Z,
    );
    setView({
      x: (r.width - (x1 - x0) * z) / 2 - x0 * z,
      y: top + (r.height - top - bottom - (y1 - y0) * z) / 2 - y0 * z,
      z,
    });
  }, []);
  const fitRef = useRef(fit);
  fitRef.current = fit;

  /* touch: two fingers pinch-zoom and pan, cancelling whatever one finger started */
  const onTouchCapture = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch") return;
    touchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touchesRef.current.size === 2) {
      const [a, b] = [...touchesRef.current.values()];
      const v = viewRef.current;
      pinchRef.current = {
        d0: Math.hypot(a.x - b.x, a.y - b.y),
        z0: v.z,
        mx: (a.x + b.x) / 2,
        my: (a.y + b.y) / 2,
        vx: v.x,
        vy: v.y,
      };
      dragRef.current = null;
      setDrag(null);
      setPressedId(null);
      gestureRef.current = null;
      setGesture(null);
    }
  };
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || !touchesRef.current.has(e.pointerId))
        return;
      touchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const pinch = pinchRef.current;
      if (!pinch || touchesRef.current.size < 2) return;
      const [a, b] = [...touchesRef.current.values()];
      const r = canvasRef.current?.getBoundingClientRect();
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const z = clamp((pinch.z0 * d) / Math.max(1, pinch.d0), MIN_Z, MAX_Z);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const px = pinch.mx - (r?.left ?? 0);
      const py = pinch.my - (r?.top ?? 0);
      setView({
        x: px - ((px - pinch.vx) * z) / pinch.z0 + (mx - pinch.mx),
        y: py - ((py - pinch.vy) * z) / pinch.z0 + (my - pinch.my),
        z,
      });
    };
    const up = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      touchesRef.current.delete(e.pointerId);
      if (touchesRef.current.size < 2) pinchRef.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  /* wheel: pan, or zoom with ctrl / pinch */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        setZoomAt(
          viewRef.current.z * Math.exp(-e.deltaY * 0.0022),
          e.clientX,
          e.clientY,
        );
      } else {
        setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setZoomAt]);

  /* ---------- rest positions and the magnet ---------- */
  const restPos = useCallback(
    (g: Group, k: number, sz: { w: number; h: number }) =>
      g.axis === "x"
        ? { left: k === 0 ? g.x - sz.w - GAP : g.x + prefixOf(g, k), top: g.y }
        : { left: g.x, top: k === 0 ? g.y - sz.h - GAP : g.y + prefixOf(g, k) },
    [prefixOf],
  );

  /** Nearest slot inside the magnetic field with an attraction that ramps
   *  from 0 at the edge to 1 on target. A part only fuses with its own kind. */
  const findSnap = useCallback(
    (item: Item, left: number, top: number): Snap | null => {
      const spec = connectSpecOf(item);
      if (!spec) return null;
      const sz = sizeRef(item);
      let best: Snap | null = null;
      let bestD = 1;
      for (const g of groupsRef.current) {
        if (g.axis !== spec.axis || !g.items[0] || !canJoin(g.items[0], item))
          continue;
        for (let k = 0; k <= g.items.length; k++) {
          const r = restPos(g, k, sz);
          const dx = left - r.left;
          const dy = top - r.top;
          const nMain = (spec.axis === "x" ? dx : dy) / SNAP_MAIN;
          const nCross = (spec.axis === "x" ? dy : dx) / SNAP_CROSS;
          if (Math.abs(nMain) >= 1 || Math.abs(nCross) >= 1) continue;
          const d = Math.hypot(nMain, nCross);
          if (d < bestD) {
            bestD = d;
            best = { groupId: g.id, index: k, pull: Math.pow(1 - d, PULL_EXP) };
          }
        }
      }
      return best;
    },
    [restPos, sizeRef],
  );

  const sx = useSpring(0, CARRY);
  const sy = useSpring(0, CARRY);

  /** Canva-style alignment: edges and centres of neighbours and of the frame
   *  pull the part gently into line and draw a guide while they do. */
  const findGuide = useCallback(
    (item: Item, left: number, top: number): Guide | null => {
      const sz = sizeRef(item);
      const tol = GUIDE_PX / viewRef.current.z;
      const xs: number[] = [];
      const ys: number[] = [];
      for (const g of groupsRef.current) {
        let off = 0;
        for (const it of g.items) {
          const s2 = sizeOf(it, widthsRef.current);
          const l = g.axis === "x" ? g.x + off : g.x;
          const tp = g.axis === "x" ? g.y : g.y + off;
          off += (g.axis === "x" ? s2.w : s2.h) + GAP;
          if (it.id === item.id) continue;
          xs.push(l, l + s2.w / 2, l + s2.w);
          ys.push(tp, tp + s2.h / 2, tp + s2.h);
        }
      }
      if (frameRef.current === "phone") {
        for (const f of framesRef.current) {
          xs.push(
            f.x + FRAME_MARGIN,
            f.x + PHONE_W / 2,
            f.x + PHONE_W - FRAME_MARGIN,
          );
          ys.push(
            f.y + FRAME_MARGIN,
            f.y + PHONE_H / 2,
            f.y + PHONE_H - FRAME_MARGIN,
          );
        }
      }
      const mine = (pos: number, len: number) => [
        pos,
        pos + len / 2,
        pos + len,
      ];
      let best: Guide = {};
      let bx = tol;
      for (const c of xs)
        for (const m of mine(left, sz.w)) {
          const d = Math.abs(c - m);
          if (d < bx) {
            bx = d;
            best = { ...best, x: left + (c - m), gx: c };
          }
        }
      let by = tol;
      for (const c of ys)
        for (const m of mine(top, sz.h)) {
          const d = Math.abs(c - m);
          if (d < by) {
            by = d;
            best = { ...best, y: top + (c - m), gy: c };
          }
        }
      return best.x === undefined && best.y === undefined ? null : best;
    },
    [sizeRef],
  );

  /* ---------- pointer: parts ---------- */
  const flushPending = useCallback(() => {
    const pend = pendingRef.current;
    if (!pend) return;
    clearTimeout(pend.timer);
    pendingRef.current = null;
    pend.commit();
  }, []);
  useEffect(() => () => flushPending(), [flushPending]);

  const startPan = (clientX: number, clientY: number) => {
    const g: Gesture = {
      kind: "pan",
      sx: clientX,
      sy: clientY,
      vx: viewRef.current.x,
      vy: viewRef.current.y,
    };
    gestureRef.current = g;
    setGesture(g);
  };

  const onItemPointerDown = (
    e: React.PointerEvent,
    g: Group,
    index: number,
    item: Item,
  ) => {
    if (e.button === 1 || modeRef.current === "hand" || spaceRef.current) {
      e.preventDefault();
      e.stopPropagation();
      startPan(e.clientX, e.clientY);
      return;
    }
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    flushPending();
    const pt = toWorld(e.clientX, e.clientY);
    const off = prefixOf(g, index);
    const left = g.axis === "x" ? g.x + off : g.x;
    const top = g.axis === "x" ? g.y : g.y + off;
    sx.jump(left);
    sy.jump(top);
    setSelectedIds((cur) =>
      e.shiftKey ? [...cur.filter((x) => x !== item.id), item.id] : [item.id],
    );
    setSelectedFrameId(null);
    setSelectedLinkId(null);
    setRightTab("edit");
    setPressedId(item.id);
    const d: DragState = {
      item,
      offX: pt.x - left,
      offY: pt.y - top,
      startX: pt.x,
      startY: pt.y,
      px: pt.x,
      py: pt.y,
      active: false,
      fromPalette: false,
      overBin: false,
      snap: null,
      settling: false,
      guide: null,
    };
    dragRef.current = d;
    setDrag({ ...d });
  };

  const onPartPointerDown = (e: React.PointerEvent, kind: Kind) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    flushPending();
    const item = makeItem(kind);
    const pt = toWorld(e.clientX, e.clientY);
    const sz = sizeOf(item, widthsRef.current);
    const offX = Math.min(sz.w / 2, 90);
    const offY = Math.min(sz.h / 2, 40);
    sx.jump(pt.x - offX);
    sy.jump(pt.y - offY);
    setSelectedIds([item.id]);
    setRightTab("edit");
    const d: DragState = {
      item,
      offX,
      offY,
      startX: pt.x,
      startY: pt.y,
      px: pt.x,
      py: pt.y,
      active: true,
      fromPalette: true,
      overBin: false,
      snap: null,
      settling: false,
      guide: null,
    };
    dragRef.current = d;
    setDrag({ ...d });
  };

  const isDragging = drag !== null;

  useEffect(() => {
    if (!isDragging) return;

    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const pt = toWorld(e.clientX, e.clientY);
      d.px = pt.x;
      d.py = pt.y;

      if (!d.active) {
        if (
          Math.hypot(pt.x - d.startX, pt.y - d.startY) * viewRef.current.z <
          5
        ) {
          setDrag({ ...d });
          return;
        }
        d.active = true;
        d.snap = null;
        const id = d.item.id;
        snapshot();
        setGroups((prev) => {
          const out: Group[] = [];
          for (const g of prev) {
            const idx = g.items.findIndex((it) => it.id === id);
            if (idx < 0) {
              out.push(g);
              continue;
            }
            const rest = g.items.filter((it) => it.id !== id);
            if (rest.length === 0) continue;
            const sz = sizeOf(g.items[idx], widthsRef.current);
            const back = idx === 0;
            // The anchor moves to the new first item; that jump must not animate,
            // otherwise the remaining run springs sideways for a frame.
            if (back) instantRef.current.add(g.id);
            out.push({
              ...g,
              x: back && g.axis === "x" ? g.x + sz.w + GAP : g.x,
              y: back && g.axis === "y" ? g.y + sz.h + GAP : g.y,
              items: rest,
            });
          }
          return out;
        });
        setPressedId(null);
        setDrag({ ...d });
        return;
      }

      d.overBin = inBin(e.clientX);
      d.snap = d.overBin
        ? null
        : findSnap(d.item, pt.x - d.offX, pt.y - d.offY);
      d.guide =
        d.overBin || d.snap
          ? null
          : findGuide(d.item, pt.x - d.offX, pt.y - d.offY);
      setDrag({ ...d });
    };

    const up = () => {
      const d = dragRef.current;
      dragRef.current = null;
      setPressedId(null);
      if (!d) return;
      if (!d.active) {
        setDrag(null);
        return;
      }

      const item = d.item;
      const sz = sizeRef(item);

      if (d.overBin) {
        setSelectedIds((cur) => cur.filter((x) => x !== item.id));
        setDrag(null);
        return;
      }

      if (d.snap) {
        const t = d.snap;
        setDrag({ ...d, snap: { ...t, pull: 1 }, settling: true });
        const commit = () => {
          setGroups((prev) => {
            if (prev.some((g) => g.items.some((it) => it.id === item.id)))
              return prev;
            return prev.map((g) => {
              if (g.id !== t.groupId) return g;
              const front = t.index === 0;
              return {
                ...g,
                x: front && g.axis === "x" ? g.x - sz.w - GAP : g.x,
                y: front && g.axis === "y" ? g.y - sz.h - GAP : g.y,
                items: [
                  ...g.items.slice(0, t.index),
                  item,
                  ...g.items.slice(t.index),
                ],
              };
            });
          });
          setDrag(null);
        };
        const timer = window.setTimeout(() => {
          pendingRef.current = null;
          commit();
        }, SETTLE_MS);
        pendingRef.current = { timer, commit };
        return;
      }

      const rect = canvasRect();
      const v = viewRef.current;
      const rawX = d.guide?.x ?? d.px - d.offX;
      const rawY = d.guide?.y ?? d.py - d.offY;
      const screenL = (rawX + sz.w) * v.z + v.x;
      const screenT = (rawY + sz.h) * v.z + v.y;
      const screenR = rawX * v.z + v.x;
      const screenB = rawY * v.z + v.y;
      const cw = rect?.width ?? 0;
      const ch = rect?.height ?? 0;
      if (
        d.fromPalette &&
        (screenL < 0 || screenT < 0 || screenR > cw || screenB > ch)
      ) {
        setSelectedIds((cur) => cur.filter((x) => x !== item.id));
        setDrag(null);
        return;
      }
      if (d.fromPalette) snapshot();
      const ng: Group = {
        id: uid(),
        x: Math.round(rawX),
        y: Math.round(rawY),
        axis: connectSpecOf(item)?.axis ?? "x",
        items: [item],
      };
      setGroups((prev) =>
        prev.some((g) => g.items.some((it) => it.id === item.id))
          ? prev
          : [...prev, ng],
      );
      setDrag(null);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    // handlers read live state through refs, so this binds once per drag
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  /* the overlay sits between the cursor and the slot, weighted by attraction */
  useEffect(() => {
    if (!drag?.active) return;
    const cursorL = drag.px - drag.offX;
    const cursorT = drag.py - drag.offY;
    if (drag.snap) {
      const g = groupsRef.current.find((x) => x.id === drag.snap!.groupId);
      if (g) {
        const r = restPos(g, drag.snap.index, sizeRef(drag.item));
        sx.set(lerp(cursorL, r.left, drag.snap.pull));
        sy.set(lerp(cursorT, r.top, drag.snap.pull));
        return;
      }
    }
    sx.set(drag.guide?.x ?? cursorL);
    sy.set(drag.guide?.y ?? cursorT);
  }, [drag, restPos, sizeRef, sx, sy]);

  /* ---------- pointer: canvas (pan / marquee) ---------- */
  const itemRects = useCallback(() => {
    const out: { id: string; l: number; t: number; r: number; b: number }[] =
      [];
    for (const g of groupsRef.current) {
      let off = 0;
      for (const it of g.items) {
        const sz = sizeOf(it, widthsRef.current);
        const l = g.axis === "x" ? g.x + off : g.x;
        const t = g.axis === "x" ? g.y : g.y + off;
        out.push({ id: it.id, l, t, r: l + sz.w, b: t + sz.h });
        off += (g.axis === "x" ? sz.w : sz.h) + GAP;
      }
    }
    return out;
  }, []);

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectedFrameId(null);
    setSelectedLinkId(null);
  };

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    if (mobileRef.current && e.pointerType === "touch") {
      e.preventDefault();
      clearSelection();
      startPan(e.clientX, e.clientY);
      return;
    }
    if (e.button === 1 || modeRef.current === "hand" || spaceRef.current) {
      e.preventDefault();
      startPan(e.clientX, e.clientY);
      return;
    }
    if (e.button !== 0) return;
    const pt = toWorld(e.clientX, e.clientY);
    const g: Gesture = {
      kind: "marquee",
      x0: pt.x,
      y0: pt.y,
      x1: pt.x,
      y1: pt.y,
      moved: false,
    };
    gestureRef.current = g;
    setGesture(g);
    if (!e.shiftKey) setSelectedIds([]);
    setSelectedFrameId(null);
    setSelectedLinkId(null);
  };

  /** grab a phone frame by its bezel or label: it carries everything on it;
   *  on a phone the screen stays put and a tap on it just clears the selection */
  const onFramePointerDown = (e: React.PointerEvent, f: Frame) => {
    if (mobileRef.current) {
      e.preventDefault();
      e.stopPropagation();
      clearSelection();
      startPan(e.clientX, e.clientY);
      return;
    }
    if (e.button === 1 || modeRef.current === "hand" || spaceRef.current) {
      e.preventDefault();
      e.stopPropagation();
      startPan(e.clientX, e.clientY);
      return;
    }
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedFrameId(f.id);
    setSelectedIds([]);
    setSelectedLinkId(null);
    setRightTab("edit");
    const carried = groupsRef.current
      .filter(
        (g) =>
          frameOfGroup(g, framesRef.current, widthsRef.current)?.id === f.id,
      )
      .map((g) => ({ id: g.id, x: g.x, y: g.y }));
    const g: Gesture = {
      kind: "frame",
      id: f.id,
      sx: e.clientX,
      sy: e.clientY,
      fx: f.x,
      fy: f.y,
      groups: carried,
      moved: false,
    };
    gestureRef.current = g;
    setGesture(g);
  };

  const isGesturing = gesture !== null;
  useEffect(() => {
    if (!isGesturing) return;
    const move = (e: PointerEvent) => {
      const g = gestureRef.current;
      if (!g) return;
      if (g.kind === "pan") {
        setView((v) => ({
          ...v,
          x: g.vx + (e.clientX - g.sx),
          y: g.vy + (e.clientY - g.sy),
        }));
        return;
      }
      if (g.kind === "frame") {
        const z = viewRef.current.z;
        const dx = (e.clientX - g.sx) / z;
        const dy = (e.clientY - g.sy) / z;
        if (!g.moved) {
          if (Math.hypot(dx, dy) * z < 4) return;
          g.moved = true;
          snapshot();
        }
        const ids = new Map(g.groups.map((o) => [o.id, o]));
        for (const o of g.groups) instantRef.current.add(o.id);
        setFrames((fs) =>
          fs.map((f) =>
            f.id === g.id
              ? { ...f, x: Math.round(g.fx + dx), y: Math.round(g.fy + dy) }
              : f,
          ),
        );
        setGroups((gs) =>
          gs.map((gr) => {
            const o = ids.get(gr.id);
            return o
              ? { ...gr, x: Math.round(o.x + dx), y: Math.round(o.y + dy) }
              : gr;
          }),
        );
        return;
      }
      const pt = toWorld(e.clientX, e.clientY);
      g.x1 = pt.x;
      g.y1 = pt.y;
      if (
        !g.moved &&
        Math.hypot(pt.x - g.x0, pt.y - g.y0) * viewRef.current.z > 4
      )
        g.moved = true;
      if (g.moved) {
        const l = Math.min(g.x0, g.x1);
        const r = Math.max(g.x0, g.x1);
        const t = Math.min(g.y0, g.y1);
        const b = Math.max(g.y0, g.y1);
        const hit = itemRects()
          .filter((it) => it.l < r && it.r > l && it.t < b && it.b > t)
          .map((it) => it.id);
        setSelectedIds(hit);
      }
      setGesture({ ...g });
    };
    const up = () => {
      gestureRef.current = null;
      setGesture(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGesturing]);

  /* ---------- panel resize ---------- */
  useEffect(() => {
    if (!resizing) return;
    const move = (e: PointerEvent) => {
      if (resizing === "left") setLeftW(clamp(e.clientX, 196, 400));
      else setRightW(clamp(window.innerWidth - e.clientX, 280, 480));
    };
    const up = () => setResizing(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [resizing]);

  /* ---------- editing ---------- */
  const primaryId = selectedIds[selectedIds.length - 1] ?? null;
  const selected = useMemo(() => {
    for (const g of groups) {
      const it = g.items.find((i) => i.id === primaryId);
      if (it) return it;
    }
    return drag?.item.id === primaryId ? (drag?.item ?? null) : null;
  }, [groups, primaryId, drag]);

  useEffect(() => {
    if (!selected && sheet === "edit") setSheet(null);
  }, [selected, sheet]);

  const patchSelected = (patch: Partial<Item>) => {
    if (!primaryId) return;
    const id = primaryId;
    snapshotFor(id + ":" + Object.keys(patch).join(","));
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      })),
    );
    if (dragRef.current?.item.id === id) {
      dragRef.current.item = { ...dragRef.current.item, ...patch };
    }
  };

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const ids = new Set(selectedIds);
    snapshot();
    setGroups((prev) =>
      prev
        .map((g) => {
          let x = g.x;
          let y = g.y;
          let items = g.items;
          while (items.length && ids.has(items[0].id)) {
            const sz = sizeOf(items[0], widthsRef.current);
            if (g.axis === "x") x += sz.w + GAP;
            else y += sz.h + GAP;
            items = items.slice(1);
          }
          if (x !== g.x || y !== g.y) instantRef.current.add(g.id);
          return { ...g, x, y, items: items.filter((it) => !ids.has(it.id)) };
        })
        .filter((g) => g.items.length > 0),
    );
    setSelectedIds([]);
  }, [selectedIds, snapshot]);

  const duplicateSelected = useCallback(() => {
    if (!selected) return;
    const rect = itemRects().find((r) => r.id === selected.id);
    if (!rect) return;
    const copy: Item = {
      ...selected,
      id: uid(),
      tabs: selected.tabs?.map((t) => ({ ...t })),
    };
    snapshot();
    setGroups((prev) => [
      ...prev,
      {
        id: uid(),
        x: rect.l + 24,
        y: rect.t + 24,
        axis: connectSpecOf(copy)?.axis ?? "x",
        items: [copy],
      },
    ]);
    setSelectedIds([copy.id]);
  }, [selected, itemRects, snapshot]);

  const nudge = useCallback(
    (dx: number, dy: number) => {
      if (selectedIds.length === 0 && selectedFrameId) {
        const f = framesRef.current.find((x) => x.id === selectedFrameId);
        if (!f) return;
        snapshotFor("nudge:frame:" + f.id);
        const carried = new Set(
          groupsRef.current
            .filter(
              (g) =>
                frameOfGroup(g, framesRef.current, widthsRef.current)?.id ===
                f.id,
            )
            .map((g) => g.id),
        );
        for (const id of carried) instantRef.current.add(id);
        setFrames((fs) =>
          fs.map((x) =>
            x.id === f.id ? { ...x, x: x.x + dx, y: x.y + dy } : x,
          ),
        );
        setGroups((gs) =>
          gs.map((g) =>
            carried.has(g.id) ? { ...g, x: g.x + dx, y: g.y + dy } : g,
          ),
        );
        return;
      }
      if (selectedIds.length === 0) return;
      const ids = new Set(selectedIds);
      snapshotFor("nudge:" + selectedIds.join(","));
      setGroups((prev) =>
        prev.map((g) =>
          g.items.some((it) => ids.has(it.id))
            ? { ...g, x: g.x + dx, y: g.y + dy }
            : g,
        ),
      );
    },
    [selectedIds, selectedFrameId, snapshotFor],
  );

  const clearAll = () => {
    if (groupsRef.current.length === 0 && framesRef.current.length === 0)
      return;
    snapshot();
    setGroups([]);
    setFrames([]);
    setSelectedIds([]);
    setSelectedFrameId(null);
  };

  const selectedFrame = useMemo(
    () => frames.find((f) => f.id === selectedFrameId) ?? null,
    [frames, selectedFrameId],
  );

  const nextFrameX = () =>
    framesRef.current.length
      ? Math.max(...framesRef.current.map((f) => f.x)) + PHONE_W + FRAME_GAP
      : 0;

  /** Entering phone mode with no frames wraps the existing parts in one. */
  const ensureFrame = () => {
    if (framesRef.current.length > 0) return;
    const gs = groupsRef.current;
    let x = 0;
    let y = 0;
    if (gs.length) {
      const bbs = gs.map((g) => groupBounds(g, widthsRef.current));
      const l = Math.min(...bbs.map((b) => b.l));
      const t = Math.min(...bbs.map((b) => b.t));
      const r = Math.max(...bbs.map((b) => b.r));
      x = Math.round(Math.max(l - 24, r - PHONE_W + 24 > l ? l : l - 24));
      y = Math.round(t - 72);
      x = Math.min(x, l);
      y = Math.min(y, t);
    }
    const f: Frame = { id: uid(), name: t("home"), x, y };
    setFrames([f]);
  };

  const ensureFrameRef = useRef(() => {});
  ensureFrameRef.current = ensureFrame;

  /** phone UI: the plus button drops a new button where the view is looking,
   *  kept inside the screen, and nudged down when that spot is already taken */
  const addButton = () => {
    const r = canvasRect();
    const v = viewRef.current;
    const item = makeItem("button");
    const sz = sizeOf(item, widthsRef.current);
    const f = framesRef.current[0];
    let x = ((r?.width ?? 0) / 2 - v.x) / v.z - sz.w / 2;
    let y = ((r?.height ?? 0) / 2 - v.y) / v.z - sz.h / 2;
    if (f) {
      x = clamp(x, f.x + FRAME_MARGIN, f.x + PHONE_W - FRAME_MARGIN - sz.w);
      y = clamp(y, f.y + FRAME_MARGIN, f.y + PHONE_H - FRAME_MARGIN - sz.h);
      const taken = (yy: number) =>
        itemRects().some((o) => o.l < x + sz.w && o.r > x && o.t < yy + sz.h && o.b > yy);
      let tries = 0;
      while (taken(y) && y + sz.h * 2 < f.y + PHONE_H && tries++ < 12) y += sz.h + 12;
    }
    snapshot();
    setGroups((gs) => [
      ...gs,
      {
        id: uid(),
        x: Math.round(x),
        y: Math.round(y),
        axis: "x",
        items: [item],
      },
    ]);
    setSelectedIds([item.id]);
    setSelectedFrameId(null);
    setSheet(null);
  };

  const changeFrame = (f: FrameMode) => {
    if (f === frame) return;
    snapshot();
    setFrame(f);
    frameRef.current = f;
    if (f === "phone") ensureFrame();
    setSelectedFrameId(null);
    setSelectedLinkId(null);
    queueMicrotask(() => fitRef.current());
  };

  const addFrame = () => {
    snapshot();
    const base = framesRef.current[0];
    const f: Frame = {
      id: uid(),
      name: `${t("screenN")} ${framesRef.current.length + 1}`,
      x: nextFrameX(),
      y: base?.y ?? 0,
    };
    setFrames((fs) => [...fs, f]);
    setSelectedFrameId(f.id);
    setSelectedIds([]);
    const r = canvasRect();
    if (r) {
      const z = viewRef.current.z;
      setView({
        x: r.width / 2 - (f.x + PHONE_W / 2) * z,
        y: r.height / 2 - (f.y + PHONE_H / 2) * z,
        z,
      });
    }
  };

  const patchFrame = (id: string, patch: Partial<Frame>) => {
    snapshotFor("frame:" + id + ":" + Object.keys(patch).join(","));
    setFrames((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const deleteFrame = useCallback(
    (id: string) => {
      snapshot();
      setFrames((fs) => fs.filter((f) => f.id !== id));
      setGroups((gs) =>
        gs.map((g) => ({
          ...g,
          items: g.items.map((it) =>
            it.action?.to === id ? { ...it, action: undefined } : it,
          ),
        })),
      );
      setSelectedFrameId(null);
    },
    [snapshot],
  );

  const duplicateFrame = (id: string) => {
    const f = framesRef.current.find((x) => x.id === id);
    if (!f) return;
    snapshot();
    const nf: Frame = {
      ...f,
      id: uid(),
      name: `${f.name}${t("copySuffix")}`,
      x: nextFrameX(),
    };
    const dx = nf.x - f.x;
    const copies = groupsRef.current
      .filter(
        (g) => frameOfGroup(g, framesRef.current, widthsRef.current)?.id === id,
      )
      .map((g) => ({
        ...g,
        id: uid(),
        x: g.x + dx,
        items: g.items.map((it) => ({
          ...it,
          id: uid(),
          tabs: it.tabs?.map((t) => ({ ...t })),
        })),
      }));
    setFrames((fs) => [...fs, nf]);
    setGroups((gs) => [...gs, ...copies]);
    setSelectedFrameId(nf.id);
  };

  const saveFrameImage = async (f: Frame) => {
    const el = document.querySelector<HTMLElement>(`[data-screen="${f.id}"]`);
    if (!el) return;
    setSelectedIds([]);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const url = await toPng(el, { pixelRatio: 2, cacheBust: true });
    const a = document.createElement("a");
    a.href = url;
    a.download = `${f.name || "screen"}.png`;
    a.click();
  };

  const openPreview = (startId?: string | null) => {
    if (frame !== "phone") {
      changeFrame("phone");
    }
    queueMicrotask(() =>
      setPreviewId(
        startId ?? selectedFrameId ?? framesRef.current[0]?.id ?? null,
      ),
    );
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
      if (typing) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
        return;
      }
      if (e.key === " " && !e.repeat) {
        e.preventDefault();
        setSpaceHeld(true);
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedIds.length === 0 && selectedFrameId)
          deleteFrame(selectedFrameId);
        else deleteSelected();
        return;
      }
      if (e.key === "Escape") {
        setSelectedIds([]);
        setSelectedFrameId(null);
        setSelectedLinkId(null);
        return;
      }
      if (e.key === "p" || e.key === "P") {
        openPreviewRef.current();
        return;
      }
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const s = e.shiftKey ? 10 : 1;
        nudge(
          e.key === "ArrowLeft" ? -s : e.key === "ArrowRight" ? s : 0,
          e.key === "ArrowUp" ? -s : e.key === "ArrowDown" ? s : 0,
        );
        return;
      }
      if (mod) return;
      if (e.key === "v" || e.key === "V") setMode("select");
      if (e.key === "h" || e.key === "H") setMode("hand");
      if (e.key === "=" || e.key === "+") setZoomAt(viewRef.current.z * 1.2);
      if (e.key === "-" || e.key === "_") setZoomAt(viewRef.current.z / 1.2);
      if (e.key === "0") fitRef.current();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    deleteSelected,
    duplicateSelected,
    nudge,
    redo,
    undo,
    setZoomAt,
    selectedIds,
    selectedFrameId,
    deleteFrame,
  ]);
  const openPreviewRef = useRef(openPreview);
  openPreviewRef.current = openPreview;

  /* ---------- render ---------- */
  const dragSize = drag ? sizeOf(drag.item, widths) : { w: 0, h: 0 };
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const doc: Doc = useMemo(
    () => ({ groups, frames, paletteKey, frame, title, brief }),
    [groups, frames, paletteKey, frame, title, brief],
  );

  /** arrows from tappable parts to the frames they open */
  const links = useMemo(() => {
    if (frame !== "phone") return [];
    const rects = itemRects();
    const out: {
      id: string;
      d: string;
      mx: number;
      my: number;
      tx: number;
      ty: number;
      ang: number;
      t: Transition;
    }[] = [];
    for (const g of groups) {
      for (const it of g.items) {
        if (!it.action) continue;
        const f = frames.find((x) => x.id === it.action!.to);
        const r = rects.find((x) => x.id === it.id);
        if (!f || !r) continue;
        const fr = frameRect(f);
        const rightward = fr.l + PHONE_W / 2 >= (r.l + r.r) / 2;
        const sx = rightward ? r.r : r.l;
        const sy = (r.t + r.b) / 2;
        const tx = rightward ? fr.l - BEZEL : fr.r + BEZEL;
        const ty = clamp(sy, fr.t + 40, fr.b - 40);
        const dx = Math.max(60, Math.abs(tx - sx) * 0.5);
        const c1x = sx + (rightward ? dx : -dx);
        const c2x = tx + (rightward ? -dx : dx);
        const d = `M${sx} ${sy} C${c1x} ${sy} ${c2x} ${ty} ${tx} ${ty}`;
        // midpoint of the cubic at t = 0.5
        const mx = 0.125 * sx + 0.375 * c1x + 0.375 * c2x + 0.125 * tx;
        const my = 0.125 * sy + 0.375 * sy + 0.375 * ty + 0.125 * ty;
        out.push({
          id: it.id,
          d,
          mx,
          my,
          tx,
          ty,
          ang: rightward ? 0 : 180,
          t: it.action.transition,
        });
      }
    }
    return out;
  }, [groups, frames, frame, itemRects, widths]);

  const setLinkTransition = (itemId: string, transition: Transition) => {
    snapshotFor("link:" + itemId);
    setGroups((gs) =>
      gs.map((g) => ({
        ...g,
        items: g.items.map((it) =>
          it.id === itemId && it.action
            ? { ...it, action: { ...it.action, transition } }
            : it,
        ),
      })),
    );
  };
  const removeLink = (itemId: string) => {
    snapshot();
    setGroups((gs) =>
      gs.map((g) => ({
        ...g,
        items: g.items.map((it) =>
          it.id === itemId ? { ...it, action: undefined } : it,
        ),
      })),
    );
    setSelectedLinkId(null);
  };

  const runRadii = (
    axis: Axis,
    first: boolean,
    last: boolean,
    prevPh: boolean,
    nextPh: boolean,
    pull: number,
    outer: number,
    inner: number,
  ): Radii => {
    const soft = lerp(outer, inner, pull);
    const s = first ? outer : prevPh ? soft : inner;
    const e = last ? outer : nextPh ? soft : inner;
    return axis === "x"
      ? { tl: s, bl: s, tr: e, br: e }
      : { tl: s, tr: s, bl: e, br: e };
  };

  /** which frame each run sits on (phone mode only) */
  const frameOf = useMemo(() => {
    const m = new Map<string, string>();
    if (frame !== "phone") return m;
    for (const g of groups) {
      const f = frameOfGroup(g, frames, widths);
      if (f) m.set(g.id, f.id);
    }
    return m;
  }, [groups, frames, frame, widths]);

  const renderGroup = (g: Group, ox: number, oy: number) => {
    const snap = drag?.active && drag.snap?.groupId === g.id ? drag.snap : null;
    const pull = snap?.pull ?? 0;
    const phMain = snap ? (g.axis === "x" ? dragSize.w : dragSize.h) * pull : 0;
    const shift = snap && snap.index === 0 ? -(phMain + GAP) : 0;
    const conn = g.items[0] ? connectSpecOf(g.items[0]) : undefined;

    type Cell = { ph: true } | { ph: false; item: Item; index: number };
    const cells: Cell[] = [];
    for (let i = 0; i <= g.items.length; i++) {
      if (snap && snap.index === i) cells.push({ ph: true });
      if (i < g.items.length)
        cells.push({ ph: false, item: g.items[i], index: i });
    }
    const m = cells.length;
    const instant = instantRef.current.has(g.id);

    return (
      <motion.div
        key={g.id}
        initial={false}
        animate={{
          x: g.x - ox + (g.axis === "x" ? shift : 0),
          y: g.y - oy + (g.axis === "y" ? shift : 0),
        }}
        transition={instant ? INSTANT : OPEN}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: g.axis === "x" ? "row" : "column",
          alignItems: g.axis === "x" ? "center" : "stretch",
          gap: GAP,
        }}
      >
        {cells.map((c, r) => {
          if (c.ph) {
            return (
              <motion.div
                key="__gap"
                initial={g.axis === "x" ? { width: 0 } : { height: 0 }}
                animate={
                  g.axis === "x" ? { width: phMain } : { height: phMain }
                }
                transition={OPEN}
                style={{
                  flex: "0 0 auto",
                  height: g.axis === "x" ? dragSize.h : undefined,
                  width: g.axis === "y" ? dragSize.w : undefined,
                }}
              />
            );
          }
          const ic = connectSpecOf(c.item);
          const radii =
            conn && ic
              ? runRadii(
                  g.axis,
                  r === 0,
                  r === m - 1,
                  r > 0 && cells[r - 1].ph,
                  r < m - 1 && cells[r + 1].ph,
                  pull,
                  ic.outer,
                  ic.inner,
                )
              : baseRadii(c.item);
          return (
            <M3Node
              key={c.item.id}
              item={c.item}
              palette={p}
              widths={widths}
              radii={radii}
              pressed={pressedId === c.item.id}
              selected={selectedSet.has(c.item.id)}
              interactive={!handMode}
              onPointerDown={(e) => onItemPointerDown(e, g, c.index, c.item)}
            />
          );
        })}
      </motion.div>
    );
  };

  const handMode = !isMobile && (mode === "hand" || spaceHeld);
  const panning = gesture?.kind === "pan";
  const marquee = gesture?.kind === "marquee" && gesture.moved ? gesture : null;
  const canvasBg = frame === "phone" ? p.surfaceContainerLow : "#ffffff";

  const panelStyle: React.CSSProperties = {
    background: p.surface,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    flex: "0 0 auto",
  };

  const showLeft = leftOpen && !isMobile;
  const showRight = rightOpen && !isMobile;
  const guide = drag?.active ? drag.guide : null;
  const visibleWorld = (() => {
    const r = canvasRef.current?.getBoundingClientRect();
    return {
      l: -view.x / view.z,
      t: -view.y / view.z,
      w: (r?.width ?? 0) / view.z,
      h: (r?.height ?? 0) / view.z,
    };
  })();

  return (
    <LangContext.Provider value={lang}>
      <div
        className="app-root"
        style={{
          display: "flex",
          overflow: "hidden",
          background: p.surfaceContainer,
          cursor: resizing ? "col-resize" : undefined,
          userSelect: resizing ? "none" : undefined,
          ["--sb" as string]: p.outlineVariant,
        }}
      >
        {/* hidden measuring layer for text-sized kinds */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            left: -99999,
            top: 0,
            visibility: "hidden",
            pointerEvents: "none",
          }}
        >
          {allItems
            .filter((it) => MEASURED.includes(it.kind))
            .map((it) => (
              <div
                key={it.id}
                ref={(el) => {
                  if (el) measureEls.current.set(it.id, el);
                  else measureEls.current.delete(it.id);
                }}
                style={{
                  display: "inline-flex",
                  boxSizing: "border-box",
                  border:
                    it.variant === "outlined" &&
                    (it.kind === "button" ||
                      it.kind === "chip" ||
                      it.kind === "extendedFab")
                      ? "1px solid transparent"
                      : "none",
                }}
              >
                <MeasuredContent item={it} p={p} />
              </div>
            ))}
        </div>

        {/* ---- left: parts ---- */}
        {showLeft && (
          <aside style={{ ...panelStyle, width: leftW }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 10px 0 14px",
              }}
            >
              <Logo size={32} color={p.primary} glyph={p.onPrimary} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: p.onSurface,
                  flex: 1,
                }}
              >
                M3E Canvas
              </span>
              <IconBtn
                icon="left_panel_close"
                p={p}
                onClick={() => setLeftOpen(false)}
                title={t("closePanel", lang)}
              />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <PartsPalette
                palette={p}
                paletteKey={paletteKey}
                onPalette={setPaletteKey}
                favorites={favorites}
                onToggleFavorite={(k) =>
                  setFavorites((f) =>
                    f.includes(k) ? f.filter((x) => x !== k) : [...f, k],
                  )
                }
                onPartPointerDown={onPartPointerDown}
                overBin={!!drag?.active && drag.overBin}
              />
            </div>
            <div
              onPointerDown={(e) => {
                e.preventDefault();
                setResizing("left");
              }}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: -3,
                width: 6,
                cursor: "col-resize",
                zIndex: 5,
              }}
            />
          </aside>
        )}

        {/* ---- canvas ---- */}
        <main
          style={{
            flex: 1,
            position: "relative",
            minWidth: 0,
            padding: isMobile ? 6 : 8,
          }}
        >
          <div
            ref={canvasRef}
            onPointerDown={onCanvasPointerDown}
            onPointerDownCapture={onTouchCapture}
            style={{
              position: "absolute",
              inset: isMobile ? 6 : 8,
              overflow: "hidden",
              borderRadius: 24,
              background: canvasBg,
              cursor: panning ? "grabbing" : handMode ? "grab" : "default",
              touchAction: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
                transformOrigin: "0 0",
                willChange: "transform",
              }}
            >
              {frame === "phone" &&
                frames.map((f) => {
                  const on = f.id === selectedFrameId;
                  const bg = p[f.bg ?? "surface"];
                  return (
                    <div
                      key={f.id}
                      data-frame={f.id}
                      style={{ position: "absolute", left: f.x, top: f.y }}
                    >
                      <div
                        onPointerDown={(e) => onFramePointerDown(e, f)}
                        style={{
                          position: "absolute",
                          left: -BEZEL,
                          top: -BEZEL - FRAME_LABEL_H,
                          height: FRAME_LABEL_H,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "0 8px",
                          fontSize: 17,
                          fontWeight: 600,
                          color: on ? p.primary : p.onSurfaceVariant,
                          cursor: handMode ? "grab" : "move",
                          userSelect: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Icon name="smartphone" size={20} />
                        {f.name || t("screen", lang)}
                      </div>
                      <div
                        onPointerDown={(e) => onFramePointerDown(e, f)}
                        style={{
                          position: "absolute",
                          left: -BEZEL,
                          top: -BEZEL,
                          width: PHONE_W + BEZEL * 2,
                          height: PHONE_H + BEZEL * 2,
                          borderRadius: PHONE_R + BEZEL,
                          background: p.inverseSurface,
                          boxShadow: on
                            ? `0 0 0 3px ${p.primary}, 0 18px 50px rgba(0,0,0,0.16)`
                            : "0 18px 50px rgba(0,0,0,0.14)",
                          cursor: handMode ? "grab" : "move",
                          transition: "box-shadow 120ms",
                        }}
                      >
                        <div
                          data-screen={f.id}
                          style={{
                            position: "absolute",
                            left: BEZEL,
                            top: BEZEL,
                            width: PHONE_W,
                            height: PHONE_H,
                            borderRadius: PHONE_R,
                            background: bg,
                            overflow: "hidden",
                          }}
                        >
                          {groups
                            .filter((g) => frameOf.get(g.id) === f.id)
                            .map((g) => renderGroup(g, f.x, f.y))}
                        </div>
                      </div>
                    </div>
                  );
                })}

              {groups
                .filter((g) => !frameOf.has(g.id))
                .map((g) => renderGroup(g, 0, 0))}

              {/* the part in flight */}
              {drag?.active && (
                <motion.div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    x: sx,
                    y: sy,
                    pointerEvents: "none",
                    zIndex: 50,
                  }}
                  animate={{
                    opacity: drag.overBin ? 0.4 : 1,
                    scale: drag.overBin ? 0.84 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 520,
                    damping: 34,
                    mass: 0.6,
                  }}
                >
                  <M3Node
                    item={drag.item}
                    palette={p}
                    widths={widths}
                    dragging
                    radii={(() => {
                      const conn = connectSpecOf(drag.item);
                      if (!conn || !drag.snap) return baseRadii(drag.item);
                      const g = groupsRef.current.find(
                        (x) => x.id === drag.snap!.groupId,
                      );
                      const mm = (g?.items.length ?? 0) + 1;
                      const k = drag.snap.index;
                      return runRadii(
                        conn.axis,
                        k === 0,
                        k === mm - 1,
                        k > 0,
                        k < mm - 1,
                        drag.snap.pull,
                        conn.outer,
                        conn.inner,
                      );
                    })()}
                  />
                </motion.div>
              )}

              {links.length > 0 && (
                <svg
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    overflow: "visible",
                    pointerEvents: "none",
                  }}
                  width={1}
                  height={1}
                >
                  <defs>
                    <marker
                      id="m3e-arrow"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="8"
                      markerHeight="8"
                      orient="auto"
                    >
                      <path d="M0 0 L10 5 L0 10 z" fill={p.primary} />
                    </marker>
                  </defs>
                  {links.map((l) => {
                    const on = l.id === selectedLinkId;
                    return (
                      <g key={l.id}>
                        <path
                          d={l.d}
                          fill="none"
                          stroke="transparent"
                          strokeWidth={18 / view.z}
                          style={{ pointerEvents: "stroke", cursor: "pointer" }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setSelectedLinkId(l.id);
                            setSelectedIds([]);
                            setSelectedFrameId(null);
                          }}
                        />
                        <path
                          d={l.d}
                          fill="none"
                          stroke={p.primary}
                          strokeWidth={on ? 3 : 2}
                          strokeDasharray={on ? undefined : "6 6"}
                          strokeLinecap="round"
                          markerEnd="url(#m3e-arrow)"
                          opacity={on ? 1 : 0.7}
                        />
                      </g>
                    );
                  })}
                </svg>
              )}

              {links
                .filter((l) => l.id === selectedLinkId)
                .map((l) => (
                  <div
                    key={l.id}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{
                      position: "absolute",
                      left: l.mx,
                      top: l.my,
                      transform: `translate(-50%, 14px) scale(${1 / view.z})`,
                      transformOrigin: "50% 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: 6,
                      borderRadius: 26,
                      background: p.surfaceContainerLow,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.16)",
                      zIndex: 60,
                    }}
                  >
                    <Segmented<Transition>
                      options={TRANSITIONS.map((t) => ({
                        key: t.key,
                        icon: t.icon,
                        title: t.label,
                      }))}
                      value={l.t}
                      onChange={(t) => setLinkTransition(l.id, t)}
                      p={p}
                      height={36}
                      grow={false}
                    />
                    <IconBtn
                      icon="link_off"
                      p={p}
                      danger
                      onClick={() => removeLink(l.id)}
                      title={t("removeLink", lang)}
                      size={36}
                    />
                  </div>
                ))}

              {guide?.gx !== undefined && (
                <div
                  style={{
                    position: "absolute",
                    left: guide.gx,
                    top: visibleWorld.t,
                    width: 1.5 / view.z,
                    height: visibleWorld.h,
                    background: p.primary,
                    pointerEvents: "none",
                  }}
                />
              )}
              {guide?.gy !== undefined && (
                <div
                  style={{
                    position: "absolute",
                    top: guide.gy,
                    left: visibleWorld.l,
                    height: 1.5 / view.z,
                    width: visibleWorld.w,
                    background: p.primary,
                    pointerEvents: "none",
                  }}
                />
              )}

              {marquee && (
                <div
                  style={{
                    position: "absolute",
                    left: Math.min(marquee.x0, marquee.x1),
                    top: Math.min(marquee.y0, marquee.y1),
                    width: Math.abs(marquee.x1 - marquee.x0),
                    height: Math.abs(marquee.y1 - marquee.y0),
                    border: `${1 / view.z}px solid ${p.primary}`,
                    background: `${p.primary}14`,
                    borderRadius: 4 / view.z,
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>

          <Toolbar
            p={p}
            mode={mode}
            onMode={setMode}
            frame={frame}
            onFrame={changeFrame}
            zoom={view.z}
            onZoom={(z) => setZoomAt(z)}
            onFit={fit}
            canUndo={pastRef.current.length > 0}
            canRedo={futureRef.current.length > 0}
            onUndo={undo}
            onRedo={redo}
            onClear={clearAll}
            onAddFrame={addFrame}
            onPreview={() => openPreview()}
            rightInset={showRight ? rightW : 0}
            lang={lang}
            onLang={setLang}
            mobile={isMobile}
            onSettings={() => setSheet(sheet === "settings" ? null : "settings")}
            onPrompt={async () => {
              try {
                await navigator.clipboard.writeText(buildPrompt(doc, widths, undefined, lang));
                setToast(t("copied", lang));
                window.setTimeout(() => setToast(null), 1400);
              } catch {}
            }}
          />

          {isMobile && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 80,
                textAlign: "center",
                fontSize: 11,
                lineHeight: 1.4,
                color: p.onSurfaceVariant,
                pointerEvents: "none",
                zIndex: 40,
              }}
            >
              {t("mobileNote", lang)}
            </div>
          )}

          {isMobile && sheet === null && (
            <button
              onClick={addButton}
              title={t("addButton", lang)}
              aria-label={t("addButton", lang)}
              className="m3-press"
              style={{
                position: "absolute",
                right: 16,
                bottom: "calc(16px + var(--bottom-ui, 0px) + env(safe-area-inset-bottom))",
                width: 64,
                height: 64,
                borderRadius: 20,
                border: "none",
                background: p.primary,
                color: p.onPrimary,
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                zIndex: 46,
                boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
              }}
            >
              <Icon name="add" size={32} />
            </button>
          )}

          {isMobile && selected && sheet === null && (
            <MobileActionBar
              p={p}
              onEdit={() => setSheet("edit")}
              onDuplicate={duplicateSelected}
              onDelete={deleteSelected}
            />
          )}

          <AnimatePresence>
            {isMobile && sheet === "edit" && selected && (
              <BottomSheet key="edit" p={p} onClose={() => setSheet(null)}>
                <MobileInspector
                  item={selected}
                  palette={p}
                  onChange={patchSelected}
                  onDelete={() => {
                    deleteSelected();
                    setSheet(null);
                  }}
                  onDuplicate={duplicateSelected}
                  onClose={() => setSheet(null)}
                />
              </BottomSheet>
            )}
            {isMobile && sheet === "settings" && (
              <BottomSheet key="settings" p={p} onClose={() => setSheet(null)}>
                <MobileSettings palette={p} paletteKey={paletteKey} onPalette={setPaletteKey} lang={lang} onLang={setLang} />
              </BottomSheet>
            )}
          </AnimatePresence>

          {toast && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: 96,
                transform: "translateX(-50%)",
                padding: "10px 18px",
                borderRadius: 20,
                background: p.inverseSurface,
                color: p.inverseOnSurface,
                fontSize: 13,
                fontWeight: 600,
                zIndex: 47,
                pointerEvents: "none",
              }}
            >
              {toast}
            </div>
          )}

          {!leftOpen && !isMobile && (
            <div
              style={{ position: "absolute", left: 20, top: 20, zIndex: 45 }}
            >
              <IconBtn
                icon="left_panel_open"
                p={p}
                on
                onClick={() => setLeftOpen(true)}
                title={t("parts", lang)}
                size={44}
              />
            </div>
          )}
          {!rightOpen && !isMobile && (
            <div
              style={{ position: "absolute", right: 20, top: 20, zIndex: 45 }}
            >
              <IconBtn
                icon="right_panel_open"
                p={p}
                on
                onClick={() => setRightOpen(true)}
                title={t("edit", lang)}
                size={44}
              />
            </div>
          )}
        </main>

        {/* ---- right: inspector / prompt ---- */}
        {showRight && (
          <aside style={{ ...panelStyle, width: rightW }}>
            <div
              onPointerDown={(e) => {
                e.preventDefault();
                setResizing("right");
              }}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: -3,
                width: 6,
                cursor: "col-resize",
                zIndex: 5,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 10px 6px 12px",
              }}
            >
              <div style={{ flex: 1 }}>
                <Segmented<"edit" | "prompt">
                  options={[
                    { key: "edit", icon: "tune", title: t("edit", lang) },
                    {
                      key: "prompt",
                      icon: "auto_awesome",
                      title: t("prompt", lang),
                    },
                  ]}
                  value={rightTab}
                  onChange={setRightTab}
                  p={p}
                  height={40}
                />
              </div>
              <IconBtn
                icon="right_panel_close"
                p={p}
                onClick={() => setRightOpen(false)}
                title={t("closePanel", lang)}
              />
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              {rightTab === "edit" && selectedFrame && !selected ? (
                <FrameInspector
                  frame={selectedFrame}
                  palette={p}
                  onChange={(patch) => patchFrame(selectedFrame.id, patch)}
                  onDelete={() => deleteFrame(selectedFrame.id)}
                  onDuplicate={() => duplicateFrame(selectedFrame.id)}
                  onPreview={() => openPreview(selectedFrame.id)}
                  prompt={buildPrompt(doc, widths, selectedFrame.id, lang)}
                  onSaveImage={() => saveFrameImage(selectedFrame)}
                />
              ) : rightTab === "edit" ? (
                <Inspector
                  item={selected}
                  palette={p}
                  frames={frame === "phone" ? frames : []}
                  onChange={patchSelected}
                  onDelete={deleteSelected}
                  onDuplicate={duplicateSelected}
                  multi={selectedIds.length}
                />
              ) : (
                <PromptPanel
                  doc={doc}
                  widths={widths}
                  palette={p}
                  onDoc={(patch) => {
                    if (patch.title !== undefined) setTitle(patch.title);
                    if (patch.brief !== undefined) setBrief(patch.brief);
                  }}
                />
              )}
            </div>
          </aside>
        )}

        {previewId !== null && frames.length > 0 && (
          <Preview
            doc={doc}
            widths={widths}
            palette={p}
            startId={previewId}
            onClose={() => setPreviewId(null)}
          />
        )}
      </div>
    </LangContext.Provider>
  );
}
