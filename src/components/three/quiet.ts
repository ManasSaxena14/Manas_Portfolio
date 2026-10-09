// React Three Fiber 9 still constructs THREE.Clock, which three r186 marks as
// deprecated and warns about once per canvas. Drop exactly that message so the
// console stays clean; everything else passes through. Remove once R3F moves
// to THREE.Timer.
if (typeof window !== "undefined") {
  const warn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("THREE.Clock: This module has been deprecated")) return;
    warn(...args);
  };
}

export {};
