import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts } from "react-router";
import { renderToReadableStream } from "react-dom/server.browser";
import * as React from "react";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
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
  onPump
}) {
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
      showHousing && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
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
function BearingScene({ rpm, direction, isPlaying, loadForce = 0, showHousing = false, greaseLevel = 0, pumpStroke = 0 }) {
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
  const BALL_COUNT = 9;
  const BALL_ORBIT_R = 35;
  const cageAngleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [ballPositions, setBallPositions] = useState(
    () => Array.from({ length: BALL_COUNT }, (_, i) => {
      const a = i / BALL_COUNT * Math.PI * 2;
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
          Array.from({ length: BALL_COUNT }, (_, i) => {
            const a = i / BALL_COUNT * Math.PI * 2 + cageAngleRef.current;
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
  const BALL_DIAMETER = 7.938;
  const PITCH_DIAMETER = 38.5;
  const CONTACT_ANGLE = 0;
  const bdPd = BALL_DIAMETER / PITCH_DIAMETER;
  const cosAlpha = Math.cos(CONTACT_ANGLE * Math.PI / 180);
  const shaftFreq = rpm / 60;
  const bpfo = BALL_COUNT / 2 * shaftFreq * (1 - bdPd * cosAlpha);
  const bpfi = BALL_COUNT / 2 * shaftFreq * (1 + bdPd * cosAlpha);
  const bsf = PITCH_DIAMETER / (2 * BALL_DIAMETER) * shaftFreq * (1 - (bdPd * cosAlpha) ** 2);
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
      /* @__PURE__ */ jsxs("svg", { viewBox: "-10 -50 120 160", className: "w-[min(70vh,70vw)] h-[min(70vh,70vw)] max-w-[640px] max-h-[640px]", children: [
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
          /* @__PURE__ */ jsx("ellipse", { cx: "50", cy: "50", rx: outerRx2, ry: outerRy2, fill: showHousing ? "#0f1825" : "none", stroke: "#9db6cb", strokeWidth: "6" })
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
        /* @__PURE__ */ jsx("g", { transform: `translate(0, ${deflectY})`, children: ballShapes.map((b) => /* @__PURE__ */ jsx(
          "ellipse",
          {
            cx: b.x,
            cy: b.y,
            rx: b.rx,
            ry: b.ry,
            fill: b.inLoadZone ? "#ffd6d6" : "#f4fbff",
            stroke: b.inLoadZone ? "#e07070" : "#8ea8c5",
            strokeWidth: "0.8"
          },
          b.i
        )) }),
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
        showHousing && /* @__PURE__ */ jsxs("g", { children: [
          /* @__PURE__ */ jsx("rect", { x: "95", y: "-2", width: "5", height: "8", rx: "1.5", fill: "#5a5a6a", stroke: "#7a7a8a", strokeWidth: "0.6" }),
          /* @__PURE__ */ jsx("circle", { cx: "97.5", cy: "-2", r: "2", fill: "#6a6a7a", stroke: "#8a8a9a", strokeWidth: "0.5" }),
          /* @__PURE__ */ jsx("path", { d: "M 100,2 Q 112,2 114,10 Q 116,18 114,22", fill: "none", stroke: "#444", strokeWidth: "1.8", strokeLinecap: "round" }),
          /* @__PURE__ */ jsx("rect", { x: "108", y: "22", width: "12", height: "30", rx: "2", fill: "#3a3a4a", stroke: "#5a5a6a", strokeWidth: "0.8" }),
          /* @__PURE__ */ jsx("rect", { x: "109.5", y: 23 + (1 - Math.max(0, 1 - greaseLevel)) * 28, width: "9", height: Math.max(0, 1 - greaseLevel) * 28, rx: "1", fill: "#c4a832", opacity: "0.6" }),
          /* @__PURE__ */ jsx("rect", { x: "106", y: 22 - 12 + pumpStroke * 12, width: "16", height: "3", rx: "1", fill: "#6a6a7a", stroke: "#8a8a9a", strokeWidth: "0.5" }),
          /* @__PURE__ */ jsx("rect", { x: "110", y: 22 - 16 + pumpStroke * 12, width: "8", height: "5", rx: "1.5", fill: "#888", stroke: "#aaa", strokeWidth: "0.4" }),
          /* @__PURE__ */ jsx("rect", { x: "113", y: 22 - 12 + pumpStroke * 12, width: "2", height: 12 - pumpStroke * 10, fill: "#777" }),
          greaseLevel > 0 && pumpStroke > 0.3 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("circle", { cx: "97.5", cy: "3", r: "1.2", fill: "#c4a832", opacity: "0.8" }),
            /* @__PURE__ */ jsx("circle", { cx: "96", cy: "6", r: "0.9", fill: "#c4a832", opacity: "0.6" }),
            /* @__PURE__ */ jsx("circle", { cx: "99", cy: "6", r: "0.9", fill: "#c4a832", opacity: "0.6" })
          ] })
        ] }),
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
              /* @__PURE__ */ jsx("circle", { cx: "50", cy: "23", r: "1.8", fill: "#ff4fd8" })
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
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded px-3 py-2 text-[11px] font-mono text-gray-300 leading-relaxed select-none", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-gray-400 font-semibold mb-1 text-[10px] tracking-wider uppercase", children: [
          "6205 — ",
          BALL_COUNT,
          " balls · Ø",
          BALL_DIAMETER,
          " mm · PCD ",
          PITCH_DIAMETER,
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
  const [rpm, setRpm] = useState(0.1);
  const [direction, setDirection] = useState("cw");
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadForce, setLoadForce] = useState(1);
  const [showHousing, setShowHousing] = useState(false);
  const [greaseLevel, setGreaseLevel] = useState(0);
  const [pumpStroke, setPumpStroke] = useState(0);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const handleReset = () => {
    setIsPlaying(true);
    setRpm(0.1);
    setDirection("cw");
    setLoadForce(0);
    setShowHousing(false);
    setGreaseLevel(0);
    setPumpStroke(0);
  };
  const handlePump = () => {
    setGreaseLevel((prev) => prev + 0.15);
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
        className: "flex-1 bg-[#12121f]",
        children: isClient ? /* @__PURE__ */ jsx(BearingScene, {
          rpm,
          direction,
          isPlaying,
          loadForce,
          showHousing,
          greaseLevel,
          pumpStroke
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
          onPump: handlePump
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
const serverManifest = { "entry": { "module": "/spinning_bearing/assets/entry.client-CftM3kWu.js", "imports": ["/spinning_bearing/assets/chunk-B7RQU5TL-WGoqqZ8d.js", "/spinning_bearing/assets/index-ANSrf5OS.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/spinning_bearing/assets/root-Cq8FJvyd.js", "imports": ["/spinning_bearing/assets/chunk-B7RQU5TL-WGoqqZ8d.js", "/spinning_bearing/assets/index-ANSrf5OS.js"], "css": ["/spinning_bearing/assets/root-Hh2NKymc.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/spinning_bearing/assets/home-DRK-F3-X.js", "imports": ["/spinning_bearing/assets/chunk-B7RQU5TL-WGoqqZ8d.js", "/spinning_bearing/assets/index-ANSrf5OS.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/spinning_bearing/assets/manifest-0f9969fc.js", "version": "0f9969fc", "sri": void 0 };
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
