import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  basename: "/spinning_bearing/",
  prerender: ["/"],
  future: {
    unstable_optimizeDeps: true,
  },
} satisfies Config;
