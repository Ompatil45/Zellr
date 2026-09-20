import fs from "fs";
import path from "path";

export type DeploymentKind = "static" | "dynamic";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export interface FrameworkDetection {
  framework: string;
  kind: DeploymentKind;
  outputDirectory?: string;
  packageManager: PackageManager;
  buildCommand: string;
  confidence: "high" | "medium" | "low";
  signals: string[];
}

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

const exists = (root: string, file: string) => fs.existsSync(path.join(root, file));
const hasAny = (root: string, files: string[]) => files.some((file) => exists(root, file));

function readPackageJson(root: string): PackageJson | undefined {
  const packageJsonPath = path.join(root, "package.json");
  if (!fs.existsSync(packageJsonPath)) return undefined;

  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson;
  } catch {
    return undefined;
  }
}

function hasDependency(packageJson: PackageJson | undefined, name: string) {
  return Boolean(packageJson?.dependencies?.[name] || packageJson?.devDependencies?.[name]);
}

function packageManagerFor(root: string): PackageManager {
  if (exists(root, "pnpm-lock.yaml")) return "pnpm";
  if (exists(root, "yarn.lock")) return "yarn";
  if (hasAny(root, ["bun.lockb", "bun.lock"])) return "bun";
  return "npm";
}

function buildCommandFor(packageManager: PackageManager): string {
  return packageManager === "npm" ? "npm run build" : `${packageManager} run build`;
}

function result(
  packageManager: PackageManager,
  values: Omit<FrameworkDetection, "packageManager" | "buildCommand">,
): FrameworkDetection {
  return { ...values, packageManager, buildCommand: buildCommandFor(packageManager) };
}

/**
 * Inspects a repository root without executing its code. Detection is advisory:
 * callers can present this result to users before deciding how to deploy it.
 */
export function detectFramework(projectRoot: string): FrameworkDetection {
  const packageManager = packageManagerFor(projectRoot);
  const packageJson = readPackageJson(projectRoot);
  const scripts = packageJson?.scripts ?? {};

  if (exists(projectRoot, "Dockerfile")) {
    return result(packageManager, {
      framework: "Docker",
      kind: "dynamic",
      confidence: "high",
      signals: ["Dockerfile"],
    });
  }

  if (hasAny(projectRoot, ["next.config.js", "next.config.mjs", "next.config.ts"]) || hasDependency(packageJson, "next")) {
    const config = ["next.config.js", "next.config.mjs", "next.config.ts"].find((file) => exists(projectRoot, file));
    const configContents = config ? fs.readFileSync(path.join(projectRoot, config), "utf8") : "";
    const isStatic = /output\s*:\s*["']export["']/.test(configContents);
    return result(packageManager, {
      framework: "Next.js",
      kind: isStatic ? "static" : "dynamic",
      ...(isStatic ? { outputDirectory: "out" } : {}),
      confidence: config ? "high" : "medium",
      signals: [config ?? "next dependency", isStatic ? "output: export" : "output: export required for a static deployment"],
    });
  }

  if (hasAny(projectRoot, ["vite.config.js", "vite.config.mjs", "vite.config.ts"]) || hasDependency(packageJson, "vite")) {
    return result(packageManager, { framework: "Vite", kind: "static", outputDirectory: "dist", confidence: "high", signals: ["Vite config or dependency"] });
  }
  if (hasAny(projectRoot, ["astro.config.js", "astro.config.mjs", "astro.config.ts"]) || hasDependency(packageJson, "astro")) {
    return result(packageManager, { framework: "Astro", kind: "static", outputDirectory: "dist", confidence: "medium", signals: ["Astro config or dependency"] });
  }
  if (hasAny(projectRoot, ["gatsby-config.js", "gatsby-config.ts"]) || hasDependency(packageJson, "gatsby")) {
    return result(packageManager, { framework: "Gatsby", kind: "static", outputDirectory: "public", confidence: "high", signals: ["Gatsby config or dependency"] });
  }
  if (exists(projectRoot, "angular.json") || hasDependency(packageJson, "@angular/core")) {
    return result(packageManager, { framework: "Angular", kind: "static", outputDirectory: "dist", confidence: "medium", signals: ["angular.json or @angular/core"] });
  }
  if (hasAny(projectRoot, ["svelte.config.js", "svelte.config.ts"]) || hasDependency(packageJson, "@sveltejs/kit")) {
    const config = ["svelte.config.js", "svelte.config.ts"].find((file) => exists(projectRoot, file));
    const staticAdapter = config && /adapter-static/.test(fs.readFileSync(path.join(projectRoot, config), "utf8"));
    return result(packageManager, staticAdapter
      ? { framework: "SvelteKit", kind: "static", outputDirectory: "build", confidence: "high", signals: ["adapter-static"] }
      : { framework: "SvelteKit", kind: "dynamic", confidence: "medium", signals: ["SvelteKit config or dependency"] });
  }
  if (hasAny(projectRoot, ["nuxt.config.js", "nuxt.config.mjs", "nuxt.config.ts"]) || hasDependency(packageJson, "nuxt")) {
    const config = ["nuxt.config.js", "nuxt.config.mjs", "nuxt.config.ts"].find((file) => exists(projectRoot, file));
    const staticGenerate = config && /nitro\s*:\s*\{[\s\S]*preset\s*:\s*["']static/.test(fs.readFileSync(path.join(projectRoot, config), "utf8"));
    return result(packageManager, staticGenerate
      ? { framework: "Nuxt", kind: "static", outputDirectory: ".output/public", confidence: "medium", signals: ["Nuxt static nitro preset"] }
      : { framework: "Nuxt", kind: "dynamic", confidence: "medium", signals: ["Nuxt config or dependency"] });
  }
  if (hasDependency(packageJson, "react-scripts")) {
    return result(packageManager, { framework: "Create React App", kind: "static", outputDirectory: "build", confidence: "high", signals: ["react-scripts dependency"] });
  }
  if (["express", "fastify", "hono", "koa"].some((dependency) => hasDependency(packageJson, dependency)) || Boolean(scripts.start)) {
    return result(packageManager, { framework: "Node server", kind: "dynamic", confidence: "medium", signals: ["server dependency or start script"] });
  }

  return result(packageManager, {
    framework: "Static site",
    kind: "static",
    outputDirectory: "dist",
    confidence: "low",
    signals: ["no recognized framework; default dist/ output"],
  });
}
