"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BEZEL,
  Doc,
  Frame,
  GAP,
  Group,
  PHONE_H,
  PHONE_R,
  PHONE_W,
  Palette,
  Transition,
  baseRadii,
  connectSpecOf,
  groupsInFrame,
  uniformRadii,
} from "@/lib/tokens";
import { Icon, M3Node } from "./M3Node";
import { IconBtn } from "./ui";
import { t, useLang } from "@/lib/i18n";

const EASE = [0.2, 0, 0, 1] as const;

function variantsFor(t: Transition, back: boolean) {
  switch (t) {
    case "slide":
      return {
        initial: { x: back ? "-30%" : "100%", opacity: back ? 0.6 : 1 },
        animate: { x: 0, opacity: 1 },
        exit: { x: back ? "100%" : "-30%", opacity: back ? 1 : 0.6 },
        transition: { duration: 0.42, ease: EASE },
      };
    case "fade":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3, ease: EASE },
      };
    case "expand":
      return {
        initial: { scale: back ? 1.06 : 0.92, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: back ? 0.92 : 1.06, opacity: 0 },
        transition: { duration: 0.36, ease: EASE },
      };
    default:
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      };
  }
}

function Screen({
  frame,
  groups,
  widths,
  p,
  onTap,
}: {
  frame: Frame;
  groups: Group[];
  widths: Record<string, number>;
  p: Palette;
  onTap: (to: string, t: Transition) => void;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, background: p[frame.bg ?? "surface"], overflow: "hidden" }}>
      {groups.map((g) => (
        <div
          key={g.id}
          style={{
            position: "absolute",
            left: g.x - frame.x,
            top: g.y - frame.y,
            display: "flex",
            flexDirection: g.axis === "x" ? "row" : "column",
            alignItems: g.axis === "x" ? "center" : "stretch",
            gap: GAP,
          }}
        >
          {g.items.map((it, i) => {
            const conn = connectSpecOf(it);
            const n = g.items.length;
            const radii =
              conn && n > 1
                ? g.axis === "x"
                  ? {
                      tl: i === 0 ? conn.outer : conn.inner,
                      bl: i === 0 ? conn.outer : conn.inner,
                      tr: i === n - 1 ? conn.outer : conn.inner,
                      br: i === n - 1 ? conn.outer : conn.inner,
                    }
                  : {
                      tl: i === 0 ? conn.outer : conn.inner,
                      tr: i === 0 ? conn.outer : conn.inner,
                      bl: i === n - 1 ? conn.outer : conn.inner,
                      br: i === n - 1 ? conn.outer : conn.inner,
                    }
                : conn
                  ? uniformRadii(conn.outer)
                  : baseRadii(it);
            const act = it.action;
            return (
              <div
                key={it.id}
                onClick={() => act && onTap(act.to, act.transition)}
                style={{ cursor: act ? "pointer" : "default", display: "flex" }}
              >
                <M3Node item={it} palette={p} widths={widths} radii={radii} interactive={false} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function Preview({
  doc,
  widths,
  palette: p,
  startId,
  onClose,
}: {
  doc: Doc;
  widths: Record<string, number>;
  palette: Palette;
  startId: string | null;
  onClose: () => void;
}) {
  const lang = useLang();
  const frames = doc.frames;
  const [stack, setStack] = useState<string[]>(() => [startId ?? frames[0]?.id ?? ""]);
  const [anim, setAnim] = useState<{ t: Transition; back: boolean }>({ t: "none", back: false });
  const [scale, setScale] = useState(1);
  const pressed = useRef(false);

  const current = frames.find((f) => f.id === stack[stack.length - 1]) ?? frames[0];

  useEffect(() => {
    const fit = () =>
      setScale(
        Math.min(1.4, (window.innerHeight - 32) / (PHONE_H + BEZEL * 2), (window.innerWidth - (window.innerWidth < 720 ? 16 : 240)) / (PHONE_W + BEZEL * 2)),
      );
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const go = (to: string, t: Transition) => {
    if (pressed.current) return;
    if (!frames.some((f) => f.id === to)) return;
    setAnim({ t, back: false });
    setStack((s) => [...s, to]);
  };
  const back = () => {
    if (stack.length < 2) return;
    setAnim({ t: anim.t === "none" ? "slide" : anim.t, back: true });
    setStack((s) => s.slice(0, -1));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Backspace" || e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack, anim]);

  const groups = useMemo(
    () => (current ? groupsInFrame(doc.groups, current, frames, widths) : []),
    [doc.groups, current, frames, widths],
  );

  if (!current) {
    return null;
  }
  const v = variantsFor(anim.t, anim.back);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: p.surfaceContainer,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: (PHONE_W + BEZEL * 2) * scale,
          height: (PHONE_H + BEZEL * 2) * scale,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: PHONE_W + BEZEL * 2,
            height: PHONE_H + BEZEL * 2,
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
            borderRadius: PHONE_R + BEZEL,
            background: p.inverseSurface,
            boxShadow: "0 30px 80px rgba(0,0,0,0.22)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: BEZEL,
              top: BEZEL,
              width: PHONE_W,
              height: PHONE_H,
              borderRadius: PHONE_R,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={current.id}
                initial={v.initial}
                animate={v.animate}
                exit={v.exit}
                transition={v.transition}
                style={{ position: "absolute", inset: 0 }}
              >
                <Screen frame={current} groups={groups} widths={widths} p={p} onTap={go} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          right: 18,
          bottom: 18,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 4,
            padding: 6,
            borderRadius: 26,
            background: p.surface,
            boxShadow: "0 4px 18px rgba(0,0,0,0.14)",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <IconBtn icon="arrow_back" p={p} onClick={back} disabled={stack.length < 2} title={t("back", lang)} size={40} />
          {frames.map((f) => {
            const on = f.id === current.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  if (on) return;
                  setAnim({ t: "fade", back: false });
                  setStack([f.id]);
                }}
                className="m3-press"
                style={{
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 20,
                  border: "none",
                  background: on ? p.primary : "transparent",
                  color: on ? p.onPrimary : p.onSurfaceVariant,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {f.name || t("screen", lang)}
              </button>
            );
          })}
          <IconBtn icon="close" p={p} onClick={onClose} title={t("close", lang)} size={40} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 18, right: 22, color: p.outline }}>
        <Icon name="touch_app" size={22} />
      </div>
    </div>
  );
}
