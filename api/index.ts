import { createApp, initApp } from '../server/app.js';

let appPromise: any = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      await initApp();
      return createApp();
    })();
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  return app(req, res);
}
