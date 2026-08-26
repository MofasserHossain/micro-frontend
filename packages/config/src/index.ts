export type AppName = "cart" | "checkout" | "home" | "product" | "shell";

type Env = Record<string, string | undefined>;

const appPortOffsets: Record<AppName, number> = {
  cart: 3,
  checkout: 4,
  home: 1,
  product: 2,
  shell: 0,
};

export function getPortBase(env: Env = process.env) {
  const rawPort = env.PORT_BASE ?? env.CONDUCTOR_PORT ?? "3000";
  const parsedPort = Number.parseInt(rawPort, 10);

  return Number.isFinite(parsedPort) ? parsedPort : 3000;
}

export function getAppPort(appName: AppName, env: Env = process.env) {
  return getPortBase(env) + appPortOffsets[appName];
}

export function getPreviewPort(appName: AppName, env: Env = process.env) {
  return getAppPort(appName, env) + 5;
}

export function getAppOrigin(appName: AppName, env: Env = process.env) {
  return `http://localhost:${getAppPort(appName, env)}`;
}

export function getRemoteManifest(appName: Exclude<AppName, "shell">, env: Env = process.env) {
  return `${appName}@${getAppOrigin(appName, env)}/mf-manifest.json`;
}
