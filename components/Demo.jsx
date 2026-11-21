"use client";
import { useEffect } from "react";
import { startBoard } from "@/lib/board";
import { demoEnv } from "@/lib/demo";
import { SHELL } from "@/components/shell";

// Demo board: sample data in memory, no sign-in, nothing saved to Supabase.
export default function Demo() {
  useEffect(() => { startBoard(demoEnv()); }, []);
  return (
    <>
      <div style={{ height: "100%" }} dangerouslySetInnerHTML={{ __html: SHELL }} />
      <div className="demo-pill" role="status">Demo data</div>
    </>
  );
}
