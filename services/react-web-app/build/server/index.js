import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts } from "react-router";
import { renderToReadableStream } from "react-dom/server.browser";
import * as React from "react";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
const ABORT_DELAY = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, routerContext) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ABORT_DELAY);
  const stream = await renderToReadableStream(
    /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
    {
      signal: controller.signal,
      onError(error) {
        if (!controller.signal.aborted) {
          console.error(error);
        }
        responseStatusCode = 500;
      }
    }
  );
  if (routerContext.isSpaMode) {
    await stream.allReady;
  }
  clearTimeout(timeoutId);
  responseHeaders.set("Content-Type", "text/html");
  return new Response(stream, {
    headers: responseHeaders,
    status: responseStatusCode
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {}), /* @__PURE__ */ jsx("script", {
        dangerouslySetInnerHTML: {
          __html: `
            (function() {
              // Apply theme based on system preference
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (prefersDark) {
                document.documentElement.classList.add('dark');
              }

              // Listen for theme changes
              window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (e.matches) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              });
            })();
          `
        }
      })]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}) {
  const _values = React.useMemo(
    () => Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max],
    [value, defaultValue, min, max]
  );
  return /* @__PURE__ */ jsxs(
    SliderPrimitive.Root,
    {
      "data-slot": "slider",
      defaultValue,
      value,
      min,
      max,
      className: cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx(
          SliderPrimitive.Track,
          {
            "data-slot": "slider-track",
            className: cn(
              "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
            ),
            children: /* @__PURE__ */ jsx(
              SliderPrimitive.Range,
              {
                "data-slot": "slider-range",
                className: cn(
                  "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
                )
              }
            )
          }
        ),
        Array.from({ length: _values.length }, (_, index) => /* @__PURE__ */ jsx(
          SliderPrimitive.Thumb,
          {
            "data-slot": "slider-thumb",
            className: "border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          },
          index
        ))
      ]
    }
  );
}
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("leading-none font-semibold", className),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6", className),
      ...props
    }
  );
}
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SeparatorPrimitive.Root,
    {
      "data-slot": "separator",
      decorative,
      orientation,
      className: cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      ),
      ...props
    }
  );
}
function ControlPanel({
  rpm,
  setRpm,
  direction,
  setDirection,
  isPlaying,
  setIsPlaying,
  onReset,
  loadForce,
  setLoadForce,
  showHousing,
  setShowHousing,
  greaseLevel,
  onPump,
  damage,
  setDamage
}) {
  const friction = greaseLevel >= 0.3 ? 0.1 : greaseLevel <= 0 ? 1 : 1 - greaseLevel / 0.3 * 0.9;
  return /* @__PURE__ */ jsxs(Card, { className: "w-72", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-4", children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center justify-between text-base", children: [
      "Controls",
      /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "font-mono text-xs", children: "6205" })
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Speed" }),
          /* @__PURE__ */ jsxs("span", { className: "font-mono font-medium", children: [
            rpm.toFixed(1),
            " RPM"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          Slider,
          {
            value: [rpm],
            onValueChange: ([v]) => setRpm(v),
            min: 0,
            max: 20,
            step: 0.1
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "0" }),
          /* @__PURE__ */ jsx("span", { children: "20" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Separator, {}),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Direction" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: direction === "cw" ? "default" : "outline",
              size: "sm",
              onClick: () => setDirection("cw"),
              className: "flex-1",
              children: "↻ CW"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: direction === "ccw" ? "default" : "outline",
              size: "sm",
              onClick: () => setDirection("ccw"),
              className: "flex-1",
              children: "↺ CCW"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(Separator, {}),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Radial Load" }),
          /* @__PURE__ */ jsxs("span", { className: "font-mono font-medium", children: [
            loadForce.toFixed(1),
            " kN"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          Slider,
          {
            value: [loadForce],
            onValueChange: ([v]) => setLoadForce(v),
            min: 0,
            max: 5,
            step: 0.1
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: "0" }),
          /* @__PURE__ */ jsx("span", { children: "5 kN" })
        ] }),
        loadForce > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Deflection:",
          " ",
          /* @__PURE__ */ jsxs("span", { className: "font-mono text-foreground", children: [
            (loadForce * 13).toFixed(1),
            " µm"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "ml-1", children: "(exaggerated in view)" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Separator, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => setIsPlaying(!isPlaying),
            className: "flex-1",
            variant: isPlaying ? "secondary" : "default",
            children: isPlaying ? "⏸ Pause" : "▶ Play"
          }
        ),
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: onReset, children: "Reset" })
      ] }),
      /* @__PURE__ */ jsx(Separator, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Housing" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: showHousing ? "default" : "outline",
            size: "sm",
            onClick: () => setShowHousing(!showHousing),
            children: showHousing ? "Visible" : "Hidden"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Grease Pump" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: onPump,
              className: "active:scale-95 transition-transform",
              children: "🛢️ Pump"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "Fill level" }),
            /* @__PURE__ */ jsxs("span", { className: "font-mono", children: [
              Math.round(greaseLevel * 100),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full rounded-full transition-all ${greaseLevel > 1 ? "bg-red-500" : greaseLevel > 0.8 ? "bg-yellow-500" : "bg-emerald-500"}`,
              style: { width: `${Math.min(greaseLevel * 100, 100)}%` }
            }
          ) }),
          greaseLevel > 0.8 && greaseLevel <= 1 && /* @__PURE__ */ jsx("p", { className: "text-xs text-yellow-500", children: "⚠ Near capacity" }),
          greaseLevel > 1 && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500", children: "💧 Overfilled — grease leaking!" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Friction" }),
          /* @__PURE__ */ jsxs("span", { className: `font-mono font-medium ${friction > 0.7 ? "text-red-500" : friction > 0.3 ? "text-yellow-500" : "text-emerald-500"}`, children: [
            (friction * 100).toFixed(0),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: `h-full rounded-full transition-all duration-500 ${friction > 0.7 ? "bg-red-500" : friction > 0.3 ? "bg-yellow-500" : "bg-emerald-500"}`,
            style: { width: `${friction * 100}%` }
          }
        ) }),
        friction > 0.7 && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500", children: "🔥 High friction — lubricate bearing!" }),
        friction > 0.3 && friction <= 0.7 && /* @__PURE__ */ jsx("p", { className: "text-xs text-yellow-500", children: "⚠ Friction rising — re-lubricate soon" })
      ] }),
      /* @__PURE__ */ jsx(Separator, {}),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Defect Simulation" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-1.5", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: damage === "none" ? "default" : "outline",
              size: "sm",
              onClick: () => setDamage("none"),
              className: "text-xs",
              children: "✓ Healthy"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: damage === "outer-spall" ? "destructive" : "outline",
              size: "sm",
              onClick: () => setDamage("outer-spall"),
              className: "text-xs",
              children: "Outer Spall"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: damage === "inner-spall" ? "destructive" : "outline",
              size: "sm",
              onClick: () => setDamage("inner-spall"),
              className: "text-xs",
              children: "Inner Spall"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: damage === "ball-defect" ? "destructive" : "outline",
              size: "sm",
              onClick: () => setDamage("ball-defect"),
              className: "text-xs",
              children: "Ball Defect"
            }
          )
        ] }),
        damage !== "none" && /* @__PURE__ */ jsxs("p", { className: "text-xs text-red-500", children: [
          "⚠ ",
          damage === "outer-spall" ? "Outer race spall — raised BPFO" : damage === "inner-spall" ? "Inner race spall — raised BPFI" : "Ball surface defect — raised BSF"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Separator, {}),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ jsx(Badge, { variant: isPlaying ? "default" : "secondary", children: isPlaying ? "Running" : "Stopped" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Bearing" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono", children: "25 × 52 × 15" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Balls" }),
          /* @__PURE__ */ jsx("span", { className: "font-mono", children: "9 × ⌀7.94" })
        ] })
      ] })
    ] })
  ] });
}
const BALL_COUNT = 9;
const BALL_DIAMETER = 7.938;
const PITCH_DIAMETER = 38.5;
const BD_PD = BALL_DIAMETER / PITCH_DIAMETER;
const BPFO_MULT = BALL_COUNT / 2 * (1 - BD_PD);
const BPFI_MULT = BALL_COUNT / 2 * (1 + BD_PD);
const BSF_MULT = PITCH_DIAMETER / (2 * BALL_DIAMETER) * (1 - BD_PD ** 2);
const FTF_MULT = 0.5 * (1 - BD_PD);
const W = 700;
const H_WAVE = 200;
const H_FFT = 220;
const H_TREND = 160;
const MARGIN = { left: 40, right: 14, top: 10, bottom: 20 };
const PLOT_W = W - MARGIN.left - MARGIN.right;
function VibrationChart({ rpm, isPlaying, loadForce, greaseLevel, damage }) {
  const shaftFreq = rpm / 60;
  const timeRef = useRef(0);
  const lastTsRef = useRef(0);
  const [tick, setTick] = useState(0);
  const TREND_MAX_POINTS = 120;
  const trendRef = useRef([]);
  const trendTimeRef = useRef(0);
  useEffect(() => {
    let frameId;
    const loop = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1e3;
      lastTsRef.current = ts;
      if (isPlaying && rpm > 0) {
        timeRef.current += dt;
        trendTimeRef.current += dt;
        if (trendTimeRef.current >= 3) {
          trendTimeRef.current = 0;
          const tau = Math.PI * 2;
          const sf = rpm / 60;
          const t = timeRef.current;
          let e = 0;
          e += Math.abs(Math.sin(tau * sf * t)) * 0.3;
          e += Math.abs(Math.sin(tau * sf * BPFO_MULT * t)) * 0.6;
          e += Math.abs(Math.sin(tau * sf * BPFI_MULT * t)) * 0.4;
          e += Math.abs(Math.sin(tau * sf * BSF_MULT * t)) * 0.3;
          const frictionMult = greaseLevel < 0.3 ? 1 + (1 - greaseLevel / 0.3) * 0.6 : 1;
          e *= frictionMult * (0.5 + loadForce * 0.3);
          if (damage === "outer-spall") e *= 2.5;
          else if (damage === "inner-spall") e *= 2.2;
          else if (damage === "ball-defect") e *= 2;
          e += (Math.random() - 0.5) * 0.05;
          e = Math.max(0, e);
          const arr = trendRef.current;
          arr.push({ t: timeRef.current, energy: e });
          if (arr.length > TREND_MAX_POINTS) arr.shift();
        }
      }
      setTick((t) => t + 1);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, rpm, greaseLevel, loadForce, damage]);
  const amps = useMemo(() => {
    const base = Math.min(loadForce * 0.6, 1);
    let bpfoAmp = base * 0.9 + 0.1;
    let bpfiAmp = base * 0.7 + 0.05;
    let bsfAmp = base * 0.4 + 0.05;
    let ftfAmp = base * 0.2 + 0.03;
    const shaftAmp = 0.3 + base * 0.2;
    let noiseLevel = greaseLevel < 0.3 ? 0.15 * (1 - greaseLevel / 0.3) : 0.02;
    const frictionMult = greaseLevel < 0.3 ? 1 + (1 - greaseLevel / 0.3) * 0.6 : 1;
    bpfoAmp *= frictionMult;
    bpfiAmp *= frictionMult;
    bsfAmp *= frictionMult;
    ftfAmp *= frictionMult;
    if (damage === "outer-spall") {
      bpfoAmp = Math.min(bpfoAmp * 3.5, 1);
      noiseLevel += 0.08;
    } else if (damage === "inner-spall") {
      bpfiAmp = Math.min(bpfiAmp * 3.5, 1);
      noiseLevel += 0.06;
    } else if (damage === "ball-defect") {
      bsfAmp = Math.min(bsfAmp * 4, 1);
      ftfAmp = Math.min(ftfAmp * 2, 0.6);
      noiseLevel += 0.05;
    }
    return { bpfoAmp, bpfiAmp, bsfAmp, ftfAmp, shaftAmp, noiseLevel };
  }, [loadForce, greaseLevel, damage]);
  const noiseRef = useRef([]);
  if (noiseRef.current.length === 0) {
    noiseRef.current = Array.from({ length: 512 }, () => (Math.random() - 0.5) * 2);
  }
  const waveformPath = useMemo(() => {
    if (shaftFreq <= 0) return "";
    const t0 = timeRef.current;
    const duration = 3 / shaftFreq;
    const N = 256;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const t = t0 + i / (N - 1) * duration;
      const tau = Math.PI * 2;
      let y = 0;
      y += amps.shaftAmp * Math.sin(tau * shaftFreq * t);
      y += amps.bpfoAmp * Math.sin(tau * shaftFreq * BPFO_MULT * t) * 0.6;
      y += amps.bpfiAmp * Math.sin(tau * shaftFreq * BPFI_MULT * t) * 0.5;
      y += amps.bsfAmp * Math.sin(tau * shaftFreq * BSF_MULT * t) * 0.4;
      y += amps.ftfAmp * Math.sin(tau * shaftFreq * FTF_MULT * t) * 0.3;
      y += amps.bpfoAmp * 0.3 * Math.sin(tau * shaftFreq * BPFO_MULT * 2 * t);
      y += amps.bpfiAmp * 0.2 * Math.sin(tau * shaftFreq * BPFI_MULT * 2 * t);
      if (damage === "outer-spall") {
        const phase = shaftFreq * BPFO_MULT * t % 1;
        if (phase < 0.08) y += amps.bpfoAmp * 1.5 * Math.exp(-phase * 40) * Math.sin(tau * shaftFreq * 12 * t);
      } else if (damage === "inner-spall") {
        const phase = shaftFreq * BPFI_MULT * t % 1;
        if (phase < 0.08) y += amps.bpfiAmp * 1.5 * Math.exp(-phase * 40) * Math.sin(tau * shaftFreq * 14 * t);
      } else if (damage === "ball-defect") {
        const phase = shaftFreq * BSF_MULT * t % 1;
        if (phase < 0.1) y += amps.bsfAmp * 1.8 * Math.exp(-phase * 30) * Math.sin(tau * shaftFreq * 10 * t);
      }
      y += amps.noiseLevel * noiseRef.current[i % noiseRef.current.length];
      const maxAmp = amps.shaftAmp + amps.bpfoAmp * 0.6 + amps.bpfiAmp * 0.5 + amps.bsfAmp * 0.4 + amps.ftfAmp * 0.3 + amps.bpfoAmp * 0.3 + amps.bpfiAmp * 0.2 + amps.noiseLevel + 0.1;
      const norm = y / maxAmp;
      const plotH = H_WAVE - MARGIN.top - MARGIN.bottom;
      const px = MARGIN.left + i / (N - 1) * PLOT_W;
      const py = MARGIN.top + plotH / 2 - norm * plotH * 0.45;
      pts.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [shaftFreq, amps, tick]);
  const fftData = useMemo(() => {
    if (shaftFreq <= 0) return { peaks: [], maxFreq: 10, yTicks: [] };
    const maxFreq = Math.max(shaftFreq * BPFI_MULT * 2.5, 10);
    const peaks = [
      { freq: shaftFreq, amp: amps.shaftAmp, label: "1×", color: "#9ca3af" },
      { freq: shaftFreq * FTF_MULT, amp: amps.ftfAmp, label: "FTF", color: "#4ade80" },
      { freq: shaftFreq * BSF_MULT, amp: amps.bsfAmp, label: "BSF", color: "#facc15" },
      { freq: shaftFreq * BPFO_MULT, amp: amps.bpfoAmp, label: "BPFO", color: "#60a5fa" },
      { freq: shaftFreq * BPFI_MULT, amp: amps.bpfiAmp, label: "BPFI", color: "#f87171" },
      // Harmonics
      { freq: shaftFreq * 2, amp: amps.shaftAmp * 0.3, label: "2×", color: "#6b7280" },
      { freq: shaftFreq * BPFO_MULT * 2, amp: amps.bpfoAmp * 0.3, label: "2×BPFO", color: "#3b82f6" },
      { freq: shaftFreq * BPFI_MULT * 2, amp: amps.bpfiAmp * 0.2, label: "2×BPFI", color: "#ef4444" },
      // 3rd harmonics for damaged components
      ...damage === "outer-spall" ? [
        { freq: shaftFreq * BPFO_MULT * 3, amp: amps.bpfoAmp * 0.2, label: "3×BPFO", color: "#3b82f6" },
        // Sidebands around BPFO (±1× shaft)
        { freq: shaftFreq * BPFO_MULT - shaftFreq, amp: amps.bpfoAmp * 0.25, label: "", color: "#60a5fa" },
        { freq: shaftFreq * BPFO_MULT + shaftFreq, amp: amps.bpfoAmp * 0.25, label: "", color: "#60a5fa" }
      ] : [],
      ...damage === "inner-spall" ? [
        { freq: shaftFreq * BPFI_MULT * 3, amp: amps.bpfiAmp * 0.15, label: "3×BPFI", color: "#ef4444" },
        // Sidebands around BPFI (±1× shaft)
        { freq: shaftFreq * BPFI_MULT - shaftFreq, amp: amps.bpfiAmp * 0.3, label: "", color: "#f87171" },
        { freq: shaftFreq * BPFI_MULT + shaftFreq, amp: amps.bpfiAmp * 0.3, label: "", color: "#f87171" }
      ] : [],
      ...damage === "ball-defect" ? [
        { freq: shaftFreq * BSF_MULT * 2, amp: amps.bsfAmp * 0.5, label: "2×BSF", color: "#facc15" },
        { freq: shaftFreq * BSF_MULT * 3, amp: amps.bsfAmp * 0.25, label: "3×BSF", color: "#facc15" },
        // Cage modulation sidebands
        { freq: shaftFreq * BSF_MULT - shaftFreq * FTF_MULT, amp: amps.bsfAmp * 0.2, label: "", color: "#facc15" },
        { freq: shaftFreq * BSF_MULT + shaftFreq * FTF_MULT, amp: amps.bsfAmp * 0.2, label: "", color: "#facc15" }
      ] : []
    ].filter((p) => p.freq > 0 && p.freq < maxFreq);
    return { peaks, maxFreq, yTicks: [] };
  }, [shaftFreq, amps]);
  const noiseFloorPath = useMemo(() => {
    if (shaftFreq <= 0) return "";
    const plotH = H_FFT - MARGIN.top - MARGIN.bottom;
    const N = 200;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const px = MARGIN.left + i / (N - 1) * PLOT_W;
      const noise = amps.noiseLevel * (0.5 + 0.5 * Math.abs(noiseRef.current[i * 2 % noiseRef.current.length]));
      const py = MARGIN.top + plotH - noise * plotH * 0.8;
      pts.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [shaftFreq, amps]);
  const freqTicks = useMemo(() => {
    if (fftData.maxFreq <= 0) return [];
    const step = fftData.maxFreq < 20 ? 2 : fftData.maxFreq < 50 ? 5 : fftData.maxFreq < 200 ? 20 : 50;
    const ticks = [];
    for (let f = 0; f <= fftData.maxFreq; f += step) {
      ticks.push(f);
    }
    return ticks;
  }, [fftData.maxFreq]);
  const plotHWave = H_WAVE - MARGIN.top - MARGIN.bottom;
  const plotHFft = H_FFT - MARGIN.top - MARGIN.bottom;
  const plotHTrend = H_TREND - MARGIN.top - MARGIN.bottom;
  const trendData = trendRef.current;
  const trendPath = useMemo(() => {
    if (trendData.length < 2) return "";
    const pts = [];
    const maxE = Math.max(1, ...trendData.map((d) => d.energy));
    for (let i = 0; i < trendData.length; i++) {
      const px = MARGIN.left + i / (TREND_MAX_POINTS - 1) * PLOT_W;
      const py = MARGIN.top + plotHTrend - trendData[i].energy / maxE * plotHTrend * 0.9;
      pts.push(`${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [trendData.length, tick, plotHTrend]);
  useMemo(() => {
    if (trendData.length < 2) return 0;
    return Math.max(1, ...trendData.map((d) => d.energy)) * 0.75;
  }, [trendData.length, tick]);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5 w-full select-none", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-0.5 px-0.5", children: "Vibration Signal" }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#0c0f1a] rounded border border-gray-800/60 overflow-hidden", children: /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H_WAVE}`, className: "w-full", preserveAspectRatio: "xMidYMid meet", children: [
        /* @__PURE__ */ jsx("line", { x1: MARGIN.left, y1: MARGIN.top + plotHWave / 2, x2: W - MARGIN.right, y2: MARGIN.top + plotHWave / 2, stroke: "#1e2940", strokeWidth: "0.5" }),
        /* @__PURE__ */ jsx("line", { x1: MARGIN.left, y1: MARGIN.top, x2: MARGIN.left, y2: MARGIN.top + plotHWave, stroke: "#1e2940", strokeWidth: "0.5" }),
        /* @__PURE__ */ jsx("text", { x: 4, y: MARGIN.top + plotHWave / 2, fill: "#6b7280", fontSize: "8", dominantBaseline: "middle", fontFamily: "monospace", children: "Accel" }),
        /* @__PURE__ */ jsx("text", { x: W - MARGIN.right, y: H_WAVE - 3, fill: "#6b7280", fontSize: "7", textAnchor: "end", fontFamily: "monospace", children: "Time" }),
        waveformPath && rpm > 0 && /* @__PURE__ */ jsx("path", { d: waveformPath, fill: "none", stroke: "#22d3ee", strokeWidth: "1.2", opacity: "0.9" }),
        rpm <= 0 && /* @__PURE__ */ jsx("text", { x: W / 2, y: H_WAVE / 2, fill: "#4b5563", fontSize: "10", textAnchor: "middle", fontFamily: "monospace", children: "No signal — set RPM > 0" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-0.5 px-0.5", children: "FFT Spectrum" }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#0c0f1a] rounded border border-gray-800/60 overflow-hidden", children: /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H_FFT}`, className: "w-full", preserveAspectRatio: "xMidYMid meet", children: [
        /* @__PURE__ */ jsx("line", { x1: MARGIN.left, y1: MARGIN.top + plotHFft, x2: W - MARGIN.right, y2: MARGIN.top + plotHFft, stroke: "#1e2940", strokeWidth: "0.5" }),
        /* @__PURE__ */ jsx("line", { x1: MARGIN.left, y1: MARGIN.top, x2: MARGIN.left, y2: MARGIN.top + plotHFft, stroke: "#1e2940", strokeWidth: "0.5" }),
        freqTicks.map((f) => {
          const x = MARGIN.left + f / fftData.maxFreq * PLOT_W;
          return /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("line", { x1: x, y1: MARGIN.top, x2: x, y2: MARGIN.top + plotHFft, stroke: "#1a2235", strokeWidth: "0.5" }),
            /* @__PURE__ */ jsx("text", { x, y: H_FFT - 3, fill: "#4b5563", fontSize: "7", textAnchor: "middle", fontFamily: "monospace", children: f })
          ] }, f);
        }),
        /* @__PURE__ */ jsx("text", { x: 4, y: MARGIN.top + plotHFft / 2, fill: "#6b7280", fontSize: "8", dominantBaseline: "middle", fontFamily: "monospace", children: "|FFT|" }),
        /* @__PURE__ */ jsx("text", { x: W / 2, y: H_FFT - 3, fill: "#6b7280", fontSize: "7", textAnchor: "middle", fontFamily: "monospace", children: "Frequency (Hz)" }),
        noiseFloorPath && /* @__PURE__ */ jsx("path", { d: noiseFloorPath, fill: "none", stroke: "#374151", strokeWidth: "0.8", opacity: "0.6" }),
        fftData.peaks.map((p, i) => {
          const x = MARGIN.left + p.freq / fftData.maxFreq * PLOT_W;
          const barH = p.amp * plotHFft * 0.85;
          const y = MARGIN.top + plotHFft - barH;
          return /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("line", { x1: x, y1: MARGIN.top + plotHFft, x2: x, y2: y, stroke: p.color, strokeWidth: "2", opacity: "0.85" }),
            /* @__PURE__ */ jsx("circle", { cx: x, cy: y, r: "2", fill: p.color, opacity: "0.9" }),
            !p.label.startsWith("2×") && /* @__PURE__ */ jsx("text", { x, y: y - 4, fill: p.color, fontSize: "6.5", textAnchor: "middle", fontFamily: "monospace", fontWeight: "bold", children: p.label })
          ] }, i);
        }),
        rpm <= 0 && /* @__PURE__ */ jsx("text", { x: W / 2, y: H_FFT / 2, fill: "#4b5563", fontSize: "10", textAnchor: "middle", fontFamily: "monospace", children: "No signal" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-0.5 px-0.5", children: "Impact Energy Trend" }),
      /* @__PURE__ */ jsx("div", { className: "bg-[#0c0f1a] rounded border border-gray-800/60 overflow-hidden", children: /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${W} ${H_TREND}`, className: "w-full", preserveAspectRatio: "xMidYMid meet", children: [
        /* @__PURE__ */ jsx("line", { x1: MARGIN.left, y1: MARGIN.top + plotHTrend, x2: W - MARGIN.right, y2: MARGIN.top + plotHTrend, stroke: "#1e2940", strokeWidth: "0.5" }),
        /* @__PURE__ */ jsx("line", { x1: MARGIN.left, y1: MARGIN.top, x2: MARGIN.left, y2: MARGIN.top + plotHTrend, stroke: "#1e2940", strokeWidth: "0.5" }),
        [0.25, 0.5, 0.75].map((f) => /* @__PURE__ */ jsx("line", { x1: MARGIN.left, y1: MARGIN.top + plotHTrend * (1 - f), x2: W - MARGIN.right, y2: MARGIN.top + plotHTrend * (1 - f), stroke: "#1a2235", strokeWidth: "0.3" }, f)),
        /* @__PURE__ */ jsx("text", { x: 4, y: MARGIN.top + plotHTrend / 2, fill: "#6b7280", fontSize: "8", dominantBaseline: "middle", fontFamily: "monospace", children: "kE" }),
        /* @__PURE__ */ jsx("text", { x: W - MARGIN.right, y: H_TREND - 3, fill: "#6b7280", fontSize: "7", textAnchor: "end", fontFamily: "monospace", children: "Time (30s window)" }),
        trendData.length >= 2 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("line", { x1: MARGIN.left, y1: MARGIN.top + plotHTrend * 0.25, x2: W - MARGIN.right, y2: MARGIN.top + plotHTrend * 0.25, stroke: "#ef4444", strokeWidth: "0.5", strokeDasharray: "4 3", opacity: "0.5" }),
          /* @__PURE__ */ jsx("text", { x: W - MARGIN.right - 2, y: MARGIN.top + plotHTrend * 0.25 - 3, fill: "#ef4444", fontSize: "6", textAnchor: "end", fontFamily: "monospace", opacity: "0.7", children: "ALARM" })
        ] }),
        trendPath && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("path", { d: `${trendPath} L${MARGIN.left + (trendData.length - 1) / (TREND_MAX_POINTS - 1) * PLOT_W},${MARGIN.top + plotHTrend} L${MARGIN.left},${MARGIN.top + plotHTrend} Z`, fill: "url(#trendGrad)", opacity: "0.3" }),
          /* @__PURE__ */ jsx("path", { d: trendPath, fill: "none", stroke: "#f59e0b", strokeWidth: "1.5", opacity: "0.9" })
        ] }),
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "trendGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#f59e0b", stopOpacity: "0.6" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#f59e0b", stopOpacity: "0.05" })
        ] }) }),
        trendData.length >= 2 && (() => {
          const last = trendData[trendData.length - 1];
          const maxE = Math.max(1, ...trendData.map((d) => d.energy));
          const px = MARGIN.left + (trendData.length - 1) / (TREND_MAX_POINTS - 1) * PLOT_W;
          const py = MARGIN.top + plotHTrend - last.energy / maxE * plotHTrend * 0.9;
          return /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("circle", { cx: px, cy: py, r: "3", fill: "#f59e0b", opacity: "0.9" }),
            /* @__PURE__ */ jsx("text", { x: px + 6, y: py + 3, fill: "#fbbf24", fontSize: "7", fontFamily: "monospace", fontWeight: "bold", children: last.energy.toFixed(2) })
          ] });
        })(),
        rpm <= 0 && /* @__PURE__ */ jsx("text", { x: W / 2, y: H_TREND / 2, fill: "#4b5563", fontSize: "10", textAnchor: "middle", fontFamily: "monospace", children: "No data" })
      ] }) })
    ] })
  ] });
}
function BearingScene({ rpm, direction, isPlaying, loadForce = 0, showHousing = false, greaseLevel = 0, pumpStroke = 0, damage = "none" }) {
  const ringDuration = useMemo(() => {
    if (!isPlaying || rpm <= 0) return "0s";
    const r = Math.max(0.1, rpm);
    return `${60 / r}s`;
  }, [isPlaying, rpm]);
  const cageDuration = useMemo(() => {
    if (!isPlaying || rpm <= 0) return "0s";
    const r = Math.max(0.1, rpm * 0.4);
    return `${60 / r}s`;
  }, [isPlaying, rpm]);
  const spinDirection = direction === "cw" ? "normal" : "reverse";
  const maxDeflect = 3;
  const deflectY = Math.min(loadForce * 1.5, maxDeflect);
  const ovalFactor = loadForce * 0.8;
  const outerR = 47;
  const outerR2 = 41;
  const outerRx = outerR + ovalFactor * 0.5;
  const outerRy = outerR - ovalFactor * 0.5;
  const outerRx2 = outerR2 + ovalFactor * 0.4;
  const outerRy2 = outerR2 - ovalFactor * 0.4;
  const BALL_COUNT2 = 9;
  const BALL_ORBIT_R = 35;
  const cageAngleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [ballPositions, setBallPositions] = useState(
    () => Array.from({ length: BALL_COUNT2 }, (_, i) => {
      const a = i / BALL_COUNT2 * Math.PI * 2;
      return { x: 50 + Math.cos(a) * BALL_ORBIT_R, y: 50 + Math.sin(a) * BALL_ORBIT_R, a };
    })
  );
  const GREASE_COUNT = 24;
  const GREASE_ORBIT_MIN = 30;
  const GREASE_ORBIT_MAX = 40;
  const greaseParticlesRef = useRef(
    Array.from({ length: GREASE_COUNT }, (_, i) => ({
      angle: i / GREASE_COUNT * Math.PI * 2,
      r: GREASE_ORBIT_MIN + Math.random() * (GREASE_ORBIT_MAX - GREASE_ORBIT_MIN),
      size: 1.2 + Math.random() * 1.8,
      speed: 0.7 + Math.random() * 0.6,
      opacity: 0.4 + Math.random() * 0.4
    }))
  );
  const [greasePositions, setGreasePositions] = useState([]);
  const leakDropsRef = useRef([]);
  const [leakDrops, setLeakDrops] = useState([]);
  const animateBalls = useCallback(
    (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1e3;
      lastTimeRef.current = time;
      if (isPlaying && rpm > 0) {
        const sign = direction === "cw" ? 1 : -1;
        const cageW = sign * (rpm / 60) * Math.PI * 2 * 0.4;
        cageAngleRef.current += cageW * delta;
        setBallPositions(
          Array.from({ length: BALL_COUNT2 }, (_, i) => {
            const a = i / BALL_COUNT2 * Math.PI * 2 + cageAngleRef.current;
            return {
              x: 50 + Math.cos(a) * BALL_ORBIT_R,
              y: 50 + Math.sin(a) * BALL_ORBIT_R,
              a
            };
          })
        );
      }
      const amount = Math.min(greaseLevel, 1);
      if (amount <= 0) {
        setGreasePositions([]);
      } else {
        const visibleCount = Math.floor(GREASE_COUNT * amount);
        const sign = direction === "cw" ? 1 : -1;
        const particles = greaseParticlesRef.current;
        const positions = [];
        for (let i = 0; i < visibleCount; i++) {
          const p = particles[i];
          if (isPlaying) {
            p.angle += sign * (rpm / 60) * Math.PI * 2 * 0.35 * p.speed * delta;
          }
          const wobble = Math.sin(p.angle * 3 + i) * 1.5;
          const r = p.r + wobble;
          positions.push({
            x: 50 + Math.cos(p.angle) * r,
            y: 50 + Math.sin(p.angle) * r,
            size: p.size * (0.8 + amount * 0.4),
            opacity: p.opacity * Math.min(amount * 1.5, 1)
          });
        }
        setGreasePositions(positions);
      }
      const drops = leakDropsRef.current;
      if (isPlaying && greaseLevel > 0.8 && showHousing) {
        if (Math.random() < (greaseLevel - 0.8) * 0.3) {
          drops.push({
            x: 30 + Math.random() * 40,
            y: 108,
            vy: 2 + Math.random() * 3,
            size: 1 + Math.random() * 1.5 * Math.min(greaseLevel - 0.8, 0.5) * 4,
            opacity: 0.7 + Math.random() * 0.3
          });
        }
      }
      if (isPlaying) {
        for (let i = drops.length - 1; i >= 0; i--) {
          drops[i].y += drops[i].vy * delta * 20;
          drops[i].opacity -= delta * 0.3;
          if (drops[i].opacity <= 0 || drops[i].y > 160) {
            drops.splice(i, 1);
          }
        }
      }
      setLeakDrops(drops.map((d) => ({ x: d.x, y: d.y, size: d.size, opacity: d.opacity })));
    },
    [isPlaying, rpm, direction, greaseLevel, showHousing, deflectY]
  );
  useEffect(() => {
    let frameId;
    const loop = (time) => {
      animateBalls(time);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [animateBalls]);
  const BALL_DIAMETER2 = 7.938;
  const PITCH_DIAMETER2 = 38.5;
  const CONTACT_ANGLE = 0;
  const bdPd = BALL_DIAMETER2 / PITCH_DIAMETER2;
  const cosAlpha = Math.cos(CONTACT_ANGLE * Math.PI / 180);
  const shaftFreq = rpm / 60;
  const bpfo = BALL_COUNT2 / 2 * shaftFreq * (1 - bdPd * cosAlpha);
  const bpfi = BALL_COUNT2 / 2 * shaftFreq * (1 + bdPd * cosAlpha);
  const bsf = PITCH_DIAMETER2 / (2 * BALL_DIAMETER2) * shaftFreq * (1 - (bdPd * cosAlpha) ** 2);
  const ftf = shaftFreq / 2 * (1 - bdPd * cosAlpha);
  const ballShapes = useMemo(() => {
    return ballPositions.map((b, i) => {
      const bottomProximity = Math.sin(b.a);
      const loadZone = Math.max(0, bottomProximity);
      const inLoadZone = loadZone > 0.3 && loadForce > 0;
      const squish = loadZone * loadForce * 0.12;
      const rx = 4.2 + squish * 1.5;
      const ry = Math.max(1.5, 4.2 - squish * 3);
      return { x: b.x, y: b.y, rx, ry, inLoadZone, i };
    });
  }, [ballPositions, loadForce]);
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full overflow-hidden", style: { background: "radial-gradient(circle at 50% 45%, #111936 0%, #0b1026 50%, #080b1b 100%)" }, children: [
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes bearingSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 grid place-items-center", children: [
      /* @__PURE__ */ jsxs("svg", { viewBox: "-30 -50 160 175", className: "w-[min(70vh,70vw)] h-[min(70vh,70vw)] max-w-[640px] max-h-[640px]", children: [
        showHousing && (() => {
          const sag = deflectY * 1.2;
          const outerPath = `
              M -8,-8
              L 108,-8
              L 108,${108 + sag}
              Q 50,${108 + sag * 1.3} -8,${108 + sag}
              Z
            `;
          const innerPath = `
              M -2,-2
              L 102,-2
              L 102,${102 + sag * 0.7}
              Q 50,${102 + sag * 1} -2,${102 + sag * 0.7}
              Z
            `;
          return /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("path", { d: outerPath, fill: "#1e2a3a", stroke: "#3a4f6a", strokeWidth: "2" }),
            /* @__PURE__ */ jsx("path", { d: innerPath, fill: "#162030", stroke: "#2a3f5a", strokeWidth: "1" }),
            /* @__PURE__ */ jsx("circle", { cx: "6", cy: "6", r: "3", fill: "#0e1620", stroke: "#3a4f6a", strokeWidth: "0.8" }),
            /* @__PURE__ */ jsx("circle", { cx: "94", cy: "6", r: "3", fill: "#0e1620", stroke: "#3a4f6a", strokeWidth: "0.8" }),
            /* @__PURE__ */ jsx("circle", { cx: "6", cy: 94 + sag * 0.8, r: "3", fill: "#0e1620", stroke: "#3a4f6a", strokeWidth: "0.8" }),
            /* @__PURE__ */ jsx("circle", { cx: "94", cy: 94 + sag * 0.8, r: "3", fill: "#0e1620", stroke: "#3a4f6a", strokeWidth: "0.8" })
          ] });
        })(),
        /* @__PURE__ */ jsxs("g", { children: [
          /* @__PURE__ */ jsx("ellipse", { cx: "50", cy: "50", rx: outerRx, ry: outerRy, fill: showHousing ? "#1a2840" : "none", stroke: "#5f7c9f", strokeWidth: "4" }),
          /* @__PURE__ */ jsx("ellipse", { cx: "50", cy: "50", rx: outerRx2, ry: outerRy2, fill: showHousing ? "#0f1825" : "none", stroke: "#9db6cb", strokeWidth: "6" }),
          damage === "outer-spall" && /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("ellipse", { cx: "82", cy: "68", rx: "5", ry: "2.5", fill: "#1a1a2a", stroke: "#ff4444", strokeWidth: "0.6", opacity: "0.9" }),
            /* @__PURE__ */ jsx("ellipse", { cx: "82", cy: "68", rx: "3.5", ry: "1.5", fill: "#2a0a0a" }),
            /* @__PURE__ */ jsx("path", { d: "M 78,67 Q 79,65.5 80.5,66.5 Q 82,65 83.5,66.5 Q 85,65.5 86,67", fill: "none", stroke: "#ff6666", strokeWidth: "0.5", opacity: "0.7" }),
            /* @__PURE__ */ jsx("circle", { cx: "79", cy: "63", r: "0.6", fill: "#888", opacity: "0.5" }),
            /* @__PURE__ */ jsx("circle", { cx: "84", cy: "64", r: "0.4", fill: "#888", opacity: "0.4" }),
            /* @__PURE__ */ jsx("circle", { cx: "81", cy: "62", r: "0.5", fill: "#999", opacity: "0.4" }),
            /* @__PURE__ */ jsx("text", { x: "88", y: "63", fill: "#ff4444", fontSize: "3", fontFamily: "monospace", fontWeight: "bold", children: "SPALL" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("g", { transform: `translate(0, ${deflectY})`, children: /* @__PURE__ */ jsx(
          "g",
          {
            style: {
              transformOrigin: "50px 50px",
              animation: isPlaying ? `bearingSpin ${ringDuration} linear infinite` : "none",
              animationDirection: spinDirection
            },
            children: /* @__PURE__ */ jsx("circle", { cx: "50", cy: "50", r: "33", fill: "none", stroke: "#c9a24a", strokeWidth: "2.2" })
          }
        ) }),
        /* @__PURE__ */ jsx("g", { transform: `translate(0, ${deflectY})`, children: ballShapes.map((b) => /* @__PURE__ */ jsxs("g", { children: [
          /* @__PURE__ */ jsx(
            "ellipse",
            {
              cx: b.x,
              cy: b.y,
              rx: b.rx,
              ry: b.ry,
              fill: b.inLoadZone ? "#ffd6d6" : "#f4fbff",
              stroke: b.inLoadZone ? "#e07070" : "#8ea8c5",
              strokeWidth: "0.8"
            }
          ),
          damage === "ball-defect" && b.i === 0 && /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("ellipse", { cx: b.x + 1, cy: b.y - 0.5, rx: "1.8", ry: "1.2", fill: "#2a0a0a", stroke: "#ff4444", strokeWidth: "0.4" }),
            /* @__PURE__ */ jsx("ellipse", { cx: b.x + 1, cy: b.y - 0.5, rx: "1", ry: "0.6", fill: "#1a0505" })
          ] })
        ] }, b.i)) }),
        greasePositions.length > 0 && /* @__PURE__ */ jsx("g", { transform: `translate(0, ${deflectY})`, children: greasePositions.map((g, i) => /* @__PURE__ */ jsx(
          "circle",
          {
            cx: g.x,
            cy: g.y,
            r: g.size,
            fill: "#c4a832",
            opacity: g.opacity
          },
          i
        )) }),
        (() => {
          const nippleX = showHousing ? 95 : 88;
          const nippleY = showHousing ? -2 : 15;
          const pumpOffX = showHousing ? 108 : 102;
          const pumpOffY = showHousing ? 22 : 32;
          const hosePath = showHousing ? `M ${nippleX + 5},${nippleY + 4} Q ${nippleX + 17},${nippleY + 4} ${nippleX + 19},${nippleY + 12} Q ${nippleX + 21},${nippleY + 20} ${nippleX + 19},${nippleY + 24}` : `M ${nippleX + 5},${nippleY + 4} Q ${nippleX + 12},${nippleY + 6} ${nippleX + 14},${nippleY + 14} Q ${nippleX + 15},${nippleY + 18} ${pumpOffX + 6},${pumpOffY}`;
          return /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("rect", { x: nippleX, y: nippleY, width: "5", height: "8", rx: "1.5", fill: "#5a5a6a", stroke: "#7a7a8a", strokeWidth: "0.6" }),
            /* @__PURE__ */ jsx("circle", { cx: nippleX + 2.5, cy: nippleY, r: "2", fill: "#6a6a7a", stroke: "#8a8a9a", strokeWidth: "0.5" }),
            /* @__PURE__ */ jsx("path", { d: hosePath, fill: "none", stroke: "#444", strokeWidth: "1.8", strokeLinecap: "round" }),
            /* @__PURE__ */ jsx("rect", { x: pumpOffX, y: pumpOffY, width: "12", height: "30", rx: "2", fill: "#3a3a4a", stroke: "#5a5a6a", strokeWidth: "0.8" }),
            /* @__PURE__ */ jsx("rect", { x: pumpOffX + 1.5, y: pumpOffY + 1 + (1 - Math.max(0, 1 - greaseLevel)) * 28, width: "9", height: Math.max(0, 1 - greaseLevel) * 28, rx: "1", fill: "#c4a832", opacity: "0.6" }),
            /* @__PURE__ */ jsx("rect", { x: pumpOffX - 2, y: pumpOffY - 12 + pumpStroke * 12, width: "16", height: "3", rx: "1", fill: "#6a6a7a", stroke: "#8a8a9a", strokeWidth: "0.5" }),
            /* @__PURE__ */ jsx("rect", { x: pumpOffX + 2, y: pumpOffY - 16 + pumpStroke * 12, width: "8", height: "5", rx: "1.5", fill: "#888", stroke: "#aaa", strokeWidth: "0.4" }),
            /* @__PURE__ */ jsx("rect", { x: pumpOffX + 5, y: pumpOffY - 12 + pumpStroke * 12, width: "2", height: 12 - pumpStroke * 10, fill: "#777" }),
            greaseLevel > 0 && pumpStroke > 0.3 && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("circle", { cx: nippleX + 2.5, cy: nippleY + 5, r: "1.2", fill: "#c4a832", opacity: "0.8" }),
              /* @__PURE__ */ jsx("circle", { cx: nippleX + 1, cy: nippleY + 8, r: "0.9", fill: "#c4a832", opacity: "0.6" }),
              /* @__PURE__ */ jsx("circle", { cx: nippleX + 4, cy: nippleY + 8, r: "0.9", fill: "#c4a832", opacity: "0.6" })
            ] })
          ] });
        })(),
        leakDrops.length > 0 && /* @__PURE__ */ jsxs("g", { children: [
          leakDrops.map((d, i) => /* @__PURE__ */ jsx(
            "ellipse",
            {
              cx: d.x,
              cy: d.y,
              rx: d.size * 0.8,
              ry: d.size * 1.3,
              fill: "#c4a832",
              opacity: d.opacity
            },
            i
          )),
          greaseLevel > 1 && /* @__PURE__ */ jsx("ellipse", { cx: "50", cy: 116, rx: 8 + (greaseLevel - 1) * 20, ry: 1.5 + (greaseLevel - 1) * 2, fill: "#c4a832", opacity: "0.5" })
        ] }),
        /* @__PURE__ */ jsx("g", { transform: `translate(0, ${deflectY})`, children: /* @__PURE__ */ jsxs(
          "g",
          {
            style: {
              transformOrigin: "50px 50px",
              animation: isPlaying ? `bearingSpin ${cageDuration} linear infinite` : "none",
              animationDirection: spinDirection
            },
            children: [
              /* @__PURE__ */ jsx("circle", { cx: "50", cy: "50", r: "27", fill: "none", stroke: "#d7e8f8", strokeWidth: "6" }),
              /* @__PURE__ */ jsx("circle", { cx: "50", cy: "23", r: "1.8", fill: "#ff4fd8" }),
              damage === "inner-spall" && /* @__PURE__ */ jsxs("g", { children: [
                /* @__PURE__ */ jsx("ellipse", { cx: "67", cy: "30", rx: "4", ry: "2", fill: "#1a1a2a", stroke: "#ff4444", strokeWidth: "0.5", opacity: "0.9" }),
                /* @__PURE__ */ jsx("ellipse", { cx: "67", cy: "30", rx: "2.5", ry: "1.2", fill: "#2a0a0a" }),
                /* @__PURE__ */ jsx("path", { d: "M 64,29.2 Q 65,27.8 66.5,28.8 Q 68,27.5 69.5,29", fill: "none", stroke: "#ff6666", strokeWidth: "0.4", opacity: "0.7" }),
                /* @__PURE__ */ jsx("text", { x: "64", y: "27", fill: "#ff4444", fontSize: "2.5", fontFamily: "monospace", fontWeight: "bold", children: "SPALL" })
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx("circle", { cx: "50", cy: 50 + deflectY, r: "2", fill: "#7fe3ff" }),
        loadForce > 0 && /* @__PURE__ */ jsxs("g", { children: [
          /* @__PURE__ */ jsx("line", { x1: "50", y1: 50 - 25, x2: "50", y2: 50 - 25 - loadForce * 8, stroke: "#ff4444", strokeWidth: "2.5" }),
          /* @__PURE__ */ jsx("polygon", { points: `46,${50 - 25} 54,${50 - 25} 50,${50 - 18}`, fill: "#ff4444" }),
          /* @__PURE__ */ jsxs("text", { x: "56", y: 50 - 25 - loadForce * 4, fill: "#ff6666", fontSize: "4.5", fontWeight: "bold", fontFamily: "monospace", children: [
            loadForce.toFixed(1),
            " kN ↓"
          ] })
        ] }),
        (() => {
          const sensorX = showHousing ? -18 : -12;
          const sensorY = showHousing ? 30 : 38;
          const gwX = sensorX - 4;
          const gwY = sensorY - 22;
          const cablePath = `M ${sensorX},${sensorY} Q ${sensorX - 4},${sensorY - 6} ${sensorX - 4},${sensorY - 12} Q ${sensorX - 3},${sensorY - 16} ${gwX + 9},${gwY + 12}`;
          const connX = gwX + 7;
          const connY = gwY + 10;
          const studX = sensorX + 6;
          const studY1 = sensorY + 8;
          const outerRingX = showHousing ? 3 : 6;
          const outerRingY = showHousing ? sensorY + 4 : sensorY + 4;
          return /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx("rect", { x: sensorX, y: sensorY, width: "12", height: "8", rx: "1.5", fill: "#2a3a50", stroke: "#4a90d9", strokeWidth: "0.8" }),
            /* @__PURE__ */ jsx("text", { x: sensorX + 6, y: sensorY + 5.5, fill: "#4a90d9", fontSize: "3.8", textAnchor: "middle", fontFamily: "monospace", fontWeight: "bold", children: "ACC" }),
            /* @__PURE__ */ jsx("circle", { cx: sensorX + 10, cy: sensorY + 1.8, r: "0.9", fill: isPlaying && rpm > 0 ? "#22d3ee" : "#1a2a3a", opacity: isPlaying && rpm > 0 ? 0.9 : 0.4, children: isPlaying && rpm > 0 && /* @__PURE__ */ jsx("animate", { attributeName: "opacity", values: "0.9;0.3;0.9", dur: "1.5s", repeatCount: "indefinite" }) }),
            /* @__PURE__ */ jsx("line", { x1: studX, y1: studY1, x2: outerRingX, y2: outerRingY, stroke: "#4a6a8a", strokeWidth: "1.8", strokeLinecap: "round" }),
            /* @__PURE__ */ jsx("path", { d: cablePath, fill: "none", stroke: "#2a5a8a", strokeWidth: "1.8", strokeLinecap: "round", opacity: "0.6" }),
            /* @__PURE__ */ jsx("path", { d: cablePath, fill: "none", stroke: "#22d3ee", strokeWidth: "1", opacity: isPlaying && rpm > 0 ? 0.6 : 0 }),
            isPlaying && rpm > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("circle", { r: "1.8", fill: "#22d3ee", opacity: "0.8", children: /* @__PURE__ */ jsx("animateMotion", { dur: "1s", repeatCount: "indefinite", path: cablePath }) }),
              /* @__PURE__ */ jsx("circle", { r: "1.2", fill: "#22d3ee", opacity: "0.5", children: /* @__PURE__ */ jsx("animateMotion", { dur: "1s", repeatCount: "indefinite", begin: "0.33s", path: cablePath }) }),
              /* @__PURE__ */ jsx("circle", { r: "0.8", fill: "#22d3ee", opacity: "0.3", children: /* @__PURE__ */ jsx("animateMotion", { dur: "1s", repeatCount: "indefinite", begin: "0.66s", path: cablePath }) })
            ] }),
            /* @__PURE__ */ jsx("rect", { x: connX, y: connY, width: "3", height: "4", rx: "0.8", fill: "#2a4a6a", stroke: "#4a90d9", strokeWidth: "0.5" }),
            /* @__PURE__ */ jsx("rect", { x: gwX, y: gwY, width: "18", height: "12", rx: "2", fill: "#1a2838", stroke: "#3a7abf", strokeWidth: "0.7" }),
            /* @__PURE__ */ jsx("text", { x: gwX + 9, y: gwY + 5, fill: "#5a9ad9", fontSize: "3", textAnchor: "middle", fontFamily: "monospace", fontWeight: "bold", children: "GW" }),
            /* @__PURE__ */ jsx("text", { x: gwX + 9, y: gwY + 9, fill: "#4a7aaa", fontSize: "2", textAnchor: "middle", fontFamily: "monospace", children: "IoT" }),
            /* @__PURE__ */ jsx("circle", { cx: gwX + 15.5, cy: gwY + 2.5, r: "0.8", fill: isPlaying && rpm > 0 ? "#4ade80" : "#334", opacity: isPlaying && rpm > 0 ? 0.9 : 0.4, children: isPlaying && rpm > 0 && /* @__PURE__ */ jsx("animate", { attributeName: "opacity", values: "0.9;0.4;0.9", dur: "2s", repeatCount: "indefinite" }) }),
            /* @__PURE__ */ jsx("line", { x1: gwX + 2, y1: gwY, x2: gwX + 2, y2: gwY - 6, stroke: "#5a8aba", strokeWidth: "0.8", strokeLinecap: "round" }),
            /* @__PURE__ */ jsx("circle", { cx: gwX + 2, cy: gwY - 6, r: "1", fill: "#5a8aba" }),
            isPlaying && rpm > 0 && /* @__PURE__ */ jsxs("g", { opacity: "0.7", children: [
              /* @__PURE__ */ jsx("path", { d: `M ${gwX + 9},${gwY} Q ${gwX + 6},${gwY - 12} ${gwX + 2},${gwY - 22}`, fill: "none", stroke: "#22d3ee", strokeWidth: "0.5", strokeDasharray: "2 2", children: /* @__PURE__ */ jsx("animate", { attributeName: "stroke-dashoffset", from: "0", to: "-8", dur: "1s", repeatCount: "indefinite" }) }),
              /* @__PURE__ */ jsx("path", { d: `M ${gwX + 12},${gwY} Q ${gwX + 14},${gwY - 10} ${gwX + 10},${gwY - 20}`, fill: "none", stroke: "#22d3ee", strokeWidth: "0.5", strokeDasharray: "2 2", children: /* @__PURE__ */ jsx("animate", { attributeName: "stroke-dashoffset", from: "0", to: "-8", dur: "1.2s", repeatCount: "indefinite" }) }),
              /* @__PURE__ */ jsx("path", { d: `M ${gwX - 1},${gwY - 8} Q ${gwX + 2},${gwY - 13} ${gwX + 5},${gwY - 8}`, fill: "none", stroke: "#22d3ee", strokeWidth: "0.4", opacity: "0.5", children: /* @__PURE__ */ jsx("animate", { attributeName: "opacity", values: "0.5;0.1;0.5", dur: "1.5s", repeatCount: "indefinite" }) }),
              /* @__PURE__ */ jsx("path", { d: `M ${gwX - 3},${gwY - 9} Q ${gwX + 2},${gwY - 16} ${gwX + 7},${gwY - 9}`, fill: "none", stroke: "#22d3ee", strokeWidth: "0.3", opacity: "0.3", children: /* @__PURE__ */ jsx("animate", { attributeName: "opacity", values: "0.3;0.05;0.3", dur: "1.5s", repeatCount: "indefinite", begin: "0.3s" }) })
            ] })
          ] });
        })()
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-3 py-2 text-[11px] font-mono text-gray-300 leading-relaxed select-none", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-gray-400 font-semibold mb-1 text-[10px] tracking-wider uppercase", children: [
          "6205 — ",
          BALL_COUNT2,
          " balls · Ø",
          BALL_DIAMETER2,
          " mm · PCD ",
          PITCH_DIAMETER2,
          " mm"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Shaft" }),
          /* @__PURE__ */ jsxs("span", { children: [
            shaftFreq.toFixed(2),
            " Hz (",
            rpm.toFixed(0),
            " RPM)"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-blue-400", children: "BPFO" }),
          /* @__PURE__ */ jsxs("span", { children: [
            bpfo.toFixed(2),
            " Hz"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "BPFI" }),
          /* @__PURE__ */ jsxs("span", { children: [
            bpfi.toFixed(2),
            " Hz"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-yellow-400", children: "BSF" }),
          /* @__PURE__ */ jsxs("span", { children: [
            bsf.toFixed(2),
            " Hz"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-green-400", children: "FTF" }),
          /* @__PURE__ */ jsxs("span", { children: [
            ftf.toFixed(2),
            " Hz"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "absolute top-0 right-1 bottom-0 w-[620px] max-w-[52%] flex flex-col justify-center opacity-95", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1 px-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${isPlaying && rpm > 0 ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]" : "bg-gray-600"}` }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-gray-400 uppercase tracking-wider", children: isPlaying && rpm > 0 ? "Accelerometer — Live" : "Accelerometer — Idle" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-gray-500 mx-1", children: "→" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 bg-slate-800/60 border border-slate-600/40 rounded px-2 py-0.5", children: [
            /* @__PURE__ */ jsx("svg", { width: "12", height: "9", viewBox: "0 0 16 11", className: "opacity-70", children: /* @__PURE__ */ jsx("path", { d: "M13 6.5a2.5 2.5 0 0 0-2.4-2.5 4 4 0 0 0-7.7 1A3 3 0 0 0 3 11h10a2.5 2.5 0 0 0 0-5z", fill: "none", stroke: "#60a5fa", strokeWidth: "1.2" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-blue-400 uppercase tracking-wider", children: "Cloud Analytics" }),
            isPlaying && rpm > 0 && /* @__PURE__ */ jsx("span", { className: "text-[8px] text-emerald-400 animate-pulse", children: "● LIVE" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(VibrationChart, { rpm, isPlaying, loadForce, greaseLevel, damage })
      ] })
    ] })
  ] });
}
function meta({}) {
  return [{
    title: "Bearing Spin Lab — 6205"
  }, {
    name: "description",
    content: "Interactive 3D visualization of a 6205 ball bearing"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  const [rpm, setRpm] = useState(5);
  const [direction, setDirection] = useState("cw");
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadForce, setLoadForce] = useState(1);
  const [showHousing, setShowHousing] = useState(false);
  const [greaseLevel, setGreaseLevel] = useState(0);
  const [pumpStroke, setPumpStroke] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [damage, setDamage] = useState("none");
  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    if (!isPlaying || rpm <= 0) return;
    const id = setInterval(() => {
      setGreaseLevel((prev) => {
        if (prev <= 0) return 0;
        return Math.max(0, prev - rpm * 4e-5);
      });
    }, 100);
    return () => clearInterval(id);
  }, [isPlaying, rpm]);
  const handleReset = () => {
    setIsPlaying(true);
    setRpm(0.1);
    setDirection("cw");
    setLoadForce(0);
    setShowHousing(false);
    setGreaseLevel(0);
    setPumpStroke(0);
    setDamage("none");
  };
  const handlePump = () => {
    setGreaseLevel((prev) => Math.min(prev + 0.15, 1.2));
    setPumpStroke(1);
    setTimeout(() => setPumpStroke(0.5), 100);
    setTimeout(() => setPumpStroke(0), 250);
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "h-screen flex flex-col bg-background text-foreground",
    children: [/* @__PURE__ */ jsxs("header", {
      className: "flex items-center justify-between px-6 py-3 border-b shrink-0",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex items-center gap-3",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-lg font-semibold tracking-tight",
          children: "Bearing Spin Lab"
        }), /* @__PURE__ */ jsx(Badge, {
          variant: "outline",
          className: "font-mono",
          children: "6205"
        })]
      }), /* @__PURE__ */ jsx("span", {
        className: "text-sm text-muted-foreground font-mono",
        children: "25 × 52 × 15 mm"
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex-1 flex min-h-0",
      children: [/* @__PURE__ */ jsx("div", {
        className: "flex-1 bg-[#12121f] min-h-0",
        children: isClient ? /* @__PURE__ */ jsx(BearingScene, {
          rpm,
          direction,
          isPlaying,
          loadForce,
          showHousing,
          greaseLevel,
          pumpStroke,
          damage
        }) : /* @__PURE__ */ jsx("div", {
          className: "h-full flex items-center justify-center text-muted-foreground",
          children: "Loading 3D scene…"
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "p-4 border-l shrink-0 overflow-y-auto",
        children: /* @__PURE__ */ jsx(ControlPanel, {
          rpm,
          setRpm,
          direction,
          setDirection,
          isPlaying,
          setIsPlaying,
          onReset: handleReset,
          loadForce,
          setLoadForce,
          showHousing,
          setShowHousing,
          greaseLevel,
          onPump: handlePump,
          damage,
          setDamage
        })
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/spinning_bearing/assets/entry.client-CftM3kWu.js", "imports": ["/spinning_bearing/assets/chunk-B7RQU5TL-WGoqqZ8d.js", "/spinning_bearing/assets/index-ANSrf5OS.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/spinning_bearing/assets/root-Bs_IAvJp.js", "imports": ["/spinning_bearing/assets/chunk-B7RQU5TL-WGoqqZ8d.js", "/spinning_bearing/assets/index-ANSrf5OS.js"], "css": ["/spinning_bearing/assets/root-K49Q2lK0.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/spinning_bearing/assets/home-D_BEryRW.js", "imports": ["/spinning_bearing/assets/chunk-B7RQU5TL-WGoqqZ8d.js", "/spinning_bearing/assets/index-ANSrf5OS.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/spinning_bearing/assets/manifest-fc567910.js", "version": "fc567910", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/spinning_bearing/";
const future = { "v8_middleware": false, "unstable_optimizeDeps": true, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = ["/"];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/spinning_bearing/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
