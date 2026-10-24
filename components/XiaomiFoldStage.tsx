"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Palette } from "@/lib/tokens";
import { Icon } from "./M3Node";

export type FoldMode = "unfolded" | "flex" | "folded";

export interface XiaomiFoldStageProps {
  folded: boolean;
  onToggleFold?: (nextFolded: boolean) => void;
  innerChildren: React.ReactNode;
  coverChildren?: React.ReactNode;
  palette: Palette;
  lang?: string;
  width?: number; // default 760
  height?: number; // default 860
  coverWidth?: number; // default 400
  radius?: number; // default 32
  bezel?: number; // default 10
  showControls?: boolean;
  interactive?: boolean;
}

export const XiaomiFoldStage: React.FC<XiaomiFoldStageProps> = ({
  folded,
  onToggleFold,
  innerChildren,
  coverChildren,
  palette: p,
  lang = "en",
  width = 760,
  height = 860,
  coverWidth = 400,
  radius = 32,
  bezel = 10,
  showControls = true,
  interactive = true,
}) => {
  // Support 3 postures: "unfolded" (180°), "flex" (105°), "folded" (0°)
  const [mode, setMode] = useState<FoldMode>(folded ? "folded" : "unfolded");

  useEffect(() => {
    setMode(folded ? "folded" : "unfolded");
  }, [folded]);

  const handleSelectMode = (nextMode: FoldMode) => {
    setMode(nextMode);
    if (onToggleFold) {
      onToggleFold(nextMode === "folded");
    }
  };

  // Dimensions
  const halfW = width / 2; // 380
  const outerH = height + bezel * 2;
  const unfoldedOuterW = width + bezel * 2;
  const coverOuterW = coverWidth; // 400

  // 3D Angles
  // unfolded: 0deg rotation for both wings (flat 180° open)
  // flex: left wing sits flat, right wing rotates -75deg (laptop / book flex mode)
  // folded: right wing rotates -180deg, folding completely flat onto the left wing!
  const rightRotateY = mode === "folded" ? -180 : mode === "flex" ? -75 : 0;
  const leftRotateY = mode === "flex" ? 15 : 0;

  // Dynamic shadow opacities based on fold angle
  const creaseShadowOpacity = mode === "folded" ? 0.35 : mode === "flex" ? 0.15 : 0;

  // Spring transition for authentic physical feel
  const foldTransition = {
    duration: 0.72,
    ease: [0.16, 1, 0.3, 1] as const, // fluid cubic bezier
  };

  return (
    <div
      className="xiaomi-fold-stage-root"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      {/* 3D Perspective Viewport */}
      <div
        style={{
          position: "relative",
          perspective: 1800,
          perspectiveOrigin: "50% 50%",
          width: mode === "folded" ? coverOuterW : unfoldedOuterW,
          height: outerH,
          transition: "width 0.72s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <motion.div
          style={{
            position: "relative",
            width: unfoldedOuterW,
            height: outerH,
            transformStyle: "preserve-3d",
          }}
          animate={{
            x: mode === "folded" ? -halfW / 2 : 0,
          }}
          transition={foldTransition}
        >
          {/* ======================================================== */}
          {/* LEFT WING (Base half of the phone)                       */}
          {/* ======================================================== */}
          <motion.div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: halfW + bezel,
              height: outerH,
              transformOrigin: "100% 50%",
              transformStyle: "preserve-3d",
              borderRadius: `${radius + bezel}px 0 0 ${radius + bezel}px`,
              backgroundColor: p.inverseSurface,
              border: `1px solid rgba(255,255,255,0.08)`,
              boxShadow:
                mode === "folded"
                  ? "0 22px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25)"
                  : "0 18px 50px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
            animate={{
              rotateY: leftRotateY,
            }}
            transition={foldTransition}
          >
            {/* Left Screen Display Area */}
            <div
              style={{
                position: "absolute",
                left: bezel,
                top: bezel,
                width: halfW,
                height,
                borderRadius: `${radius}px 0 0 ${radius}px`,
                overflow: "hidden",
                background: p.surface,
              }}
            >
              {/* Full Inner Screen rendered with left: 0 */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width,
                  height,
                  pointerEvents: mode === "folded" ? "none" : "auto",
                }}
              >
                {innerChildren}
              </div>

              {/* Dynamic Crease Shadow (Darkens as the device folds) */}
              <motion.div
                aria-hidden
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 48,
                  background:
                    "linear-gradient(to left, rgba(0,0,0,0.35) 0%, transparent 100%)",
                  pointerEvents: "none",
                  zIndex: 40,
                }}
                animate={{ opacity: creaseShadowOpacity }}
                transition={foldTransition}
              />
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* CENTER HINGE SPINE (Xiaomi Falcon Hinge)                 */}
          {/* ======================================================== */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: halfW + bezel - 3,
              top: bezel,
              width: 6,
              height,
              zIndex: 50,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Unfolded subtle screen crease */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to right, transparent, rgba(0,0,0,0.08) 35%, rgba(255,255,255,0.12) 50%, rgba(0,0,0,0.08) 65%, transparent)",
              }}
              animate={{ opacity: mode === "unfolded" ? 1 : 0 }}
              transition={foldTransition}
            />

            {/* Inner camera punch hole on the center crease at top */}
            {mode === "unfolded" && (
              <div
                style={{
                  position: "absolute",
                  top: 9,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#080808",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.6)",
                  zIndex: 55,
                }}
              />
            )}
          </div>

          {/* ======================================================== */}
          {/* RIGHT WING (3D Folding Leaf with Dual Faces)             */}
          {/* ======================================================== */}
          <motion.div
            style={{
              position: "absolute",
              left: halfW + bezel,
              top: 0,
              width: halfW + bezel,
              height: outerH,
              transformOrigin: "0% 50%", // pivots exactly on the hinge line!
              transformStyle: "preserve-3d",
              zIndex: mode === "folded" ? 60 : 30,
            }}
            animate={{
              rotateY: rightRotateY,
            }}
            transition={foldTransition}
          >
            {/* ---------------------------------------------------- */}
            {/* FACE A: Inner Right Screen Display (0 deg)            */}
            {/* ---------------------------------------------------- */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                borderRadius: `0 ${radius + bezel}px ${radius + bezel}px 0`,
                backgroundColor: p.inverseSurface,
                border: `1px solid rgba(255,255,255,0.08)`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: bezel,
                  width: halfW,
                  height,
                  borderRadius: `0 ${radius}px ${radius}px 0`,
                  overflow: "hidden",
                  background: p.surface,
                }}
              >
                {/* Full Inner Screen rendered with left: -halfW */}
                <div
                  style={{
                    position: "absolute",
                    left: -halfW,
                    top: 0,
                    width,
                    height,
                    pointerEvents: mode === "folded" ? "none" : "auto",
                  }}
                >
                  {innerChildren}
                </div>

                {/* Crease shadow on the right leaf */}
                <motion.div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 48,
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 40,
                  }}
                  animate={{ opacity: creaseShadowOpacity }}
                  transition={foldTransition}
                />
              </div>

              {/* Volume & Power rocker buttons on right bezel edge */}
              <div
                style={{
                  position: "absolute",
                  right: -2,
                  top: 130,
                  width: 3,
                  height: 54,
                  borderRadius: "0 2px 2px 0",
                  background: "#444",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: -2,
                  top: 200,
                  width: 3,
                  height: 38,
                  borderRadius: "0 2px 2px 0",
                  background: "#444",
                }}
              />
            </div>

            {/* ---------------------------------------------------- */}
            {/* FACE B: Xiaomi 18 Fold Cover Display (180 deg)        */}
            {/* ---------------------------------------------------- */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                borderRadius: `${radius + bezel}px`,
                backgroundColor: p.inverseSurface,
                border: "2px solid rgba(255,255,255,0.14)",
                boxShadow:
                  "0 24px 70px rgba(0,0,0,0.55), inset 0 0 2px rgba(255,255,255,0.25)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Outer Metallic Hinge Spine on the left edge */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 7,
                  background:
                    "linear-gradient(to right, #111, #444 35%, #777 60%, #2a2a2a 100%)",
                  boxShadow: "inset -1px 0 2px rgba(0,0,0,0.6)",
                  zIndex: 25,
                }}
              />

              {/* Cover Screen Active Display Area */}
              <div
                style={{
                  position: "absolute",
                  left: bezel + 4,
                  top: bezel,
                  right: bezel,
                  bottom: bezel,
                  borderRadius: `${radius - 2}px`,
                  background: p.surface,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Xiaomi Leica / HyperOS Top Punch Hole Camera */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 10,
                    transform: "translateX(-50%)",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#050505",
                    border: "1.2px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1)",
                    zIndex: 50,
                  }}
                />

                {/* Ear speaker mic slot */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 3,
                    transform: "translateX(-50%)",
                    width: 36,
                    height: 2,
                    borderRadius: 1,
                    background: "rgba(255,255,255,0.2)",
                    zIndex: 50,
                  }}
                />

                {/* If cover children provided, render them; otherwise render authentic HyperOS cover */}
                {coverChildren ? (
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    {coverChildren}
                  </div>
                ) : (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "24px 16px 18px",
                      color: p.onSurface,
                    }}
                  >
                    {/* HyperOS Cover Status Bar */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "0 6px",
                        opacity: 0.9,
                      }}
                    >
                      <span>10:09</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Icon name="wifi" size={14} />
                        <Icon name="network_cell" size={14} />
                        <span style={{ fontSize: 11 }}>98%</span>
                        <Icon name="battery_full" size={14} />
                      </div>
                    </div>

                    {/* Cover Lockscreen / Clock Display */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginTop: 28,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 54,
                          fontWeight: 800,
                          letterSpacing: -1,
                          lineHeight: 1,
                          color: p.primary,
                          fontFamily: "system-ui, sans-serif",
                        }}
                      >
                        10:09
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: p.onSurfaceVariant,
                          marginTop: 4,
                        }}
                      >
                        Thursday, October 24 · 24°C Sunny
                      </div>

                      {/* HyperOS Smart Widget Pill */}
                      <div
                        style={{
                          marginTop: 20,
                          padding: "8px 14px",
                          borderRadius: 20,
                          background: p.surfaceContainerHigh,
                          border: `1px solid ${p.outlineVariant}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 12,
                          color: p.onSurface,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                      >
                        <Icon name="wb_sunny" size={16} />
                        <span>Xiaomi 18 Fold · Cover Active</span>
                      </div>
                    </div>

                    {/* Bottom Quick Controls & Unfold Prompt */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        alignItems: "center",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectMode("unfolded")}
                        className="m3-press"
                        style={{
                          width: "100%",
                          height: 44,
                          borderRadius: 22,
                          border: "none",
                          background: p.primary,
                          color: p.onPrimary,
                          fontSize: 13,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          cursor: "pointer",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
                        }}
                      >
                        <Icon name="unfold_more" size={18} />
                        <span>Unfold Screen (180°)</span>
                      </button>

                      {/* Dock icons */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                          width: "100%",
                          padding: "4px 8px",
                        }}
                      >
                        {[
                          { icon: "call", bg: "#22c55e", color: "#fff" },
                          { icon: "chat", bg: "#3b82f6", color: "#fff" },
                          { icon: "photo_camera", bg: "#e11d48", color: "#fff" },
                          { icon: "settings", bg: "#64748b", color: "#fff" },
                        ].map((d, i) => (
                          <div
                            key={i}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              background: d.bg,
                              color: d.color,
                              display: "grid",
                              placeItems: "center",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            }}
                          >
                            <Icon name={d.icon} size={20} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Gorilla Glass Victus subtle reflection overlay */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, transparent 45%, rgba(255,255,255,0.03) 100%)",
                    pointerEvents: "none",
                    zIndex: 45,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 3D Fold State Interactive Control Bar */}
      {showControls && interactive && (
        <div
          style={{
            marginTop: 16,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 8px",
            borderRadius: 24,
            background: p.surfaceContainerHigh,
            border: `1px solid ${p.outlineVariant}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            zIndex: 70,
          }}
        >
          <button
            type="button"
            onClick={() => handleSelectMode("folded")}
            className="m3-press"
            style={{
              height: 32,
              padding: "0 12px",
              borderRadius: 16,
              border: "none",
              background: mode === "folded" ? p.primary : "transparent",
              color: mode === "folded" ? p.onPrimary : p.onSurfaceVariant,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            <Icon name="devices_fold" size={16} />
            <span>0° Folded</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode("flex")}
            className="m3-press"
            style={{
              height: 32,
              padding: "0 12px",
              borderRadius: 16,
              border: "none",
              background: mode === "flex" ? p.primary : "transparent",
              color: mode === "flex" ? p.onPrimary : p.onSurfaceVariant,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            <Icon name="laptop_chromebook" size={16} />
            <span>105° Flex</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode("unfolded")}
            className="m3-press"
            style={{
              height: 32,
              padding: "0 12px",
              borderRadius: 16,
              border: "none",
              background: mode === "unfolded" ? p.primary : "transparent",
              color: mode === "unfolded" ? p.onPrimary : p.onSurfaceVariant,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            <Icon name="unfold_more" size={16} />
            <span>180° Unfolded</span>
          </button>
        </div>
      )}
    </div>
  );
};
