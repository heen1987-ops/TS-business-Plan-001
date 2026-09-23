import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// 프로젝트에 공용 패키지를 복제하지 않고 설치된 실행환경을 참조한다.
// 다른 PC에서는 CCK_NODE_MODULES에 사용할 node_modules 절대 경로를 지정한다.
const moduleRoots = process.env.CCK_NODE_MODULES
  ? [path.resolve(process.env.CCK_NODE_MODULES)]
  : [...new Set([
      path.resolve(path.dirname(process.execPath), '..', 'node_modules'),
      path.join(os.homedir(), '.cache', 'codex-runtimes',
        'codex-primary-runtime', 'dependencies', 'node', 'node_modules'),
    ])];
const require = createRequire(import.meta.url);

export function resolveDependency(name) {
  for (const moduleRoot of moduleRoots) {
    try {
      return require.resolve(name, { paths: [moduleRoot] });
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;
    }
  }
  throw new Error(`공용 패키지 ${name}을 찾지 못했습니다. CCK_NODE_MODULES에 설치 경로를 지정하세요.`);
}

export async function loadDependency(name) {
  const loaded = await import(pathToFileURL(resolveDependency(name)).href);
  // CommonJS는 default 객체에 API를 노출할 수 있다.
  return loaded.default ? { ...loaded.default, ...loaded } : loaded;
}
