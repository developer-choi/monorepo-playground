// `.githooks/` 의 훅 스크립트를 git 설정 훅(git 2.54+)으로 등록한다. `package.json` 의
// `prepare` 가 부르므로 `npm install` 한 번이면 붙는다.
//
// 왜 husky(=`core.hooksPath`)가 아닌가 — `core.hooksPath` 는 각 워크트리 기준으로 풀리는
// 상대 경로인데, husky 가 가리키는 `.husky/_` 는 gitignore 된 로컬 산출물이라 새 워크트리에
// 안 딸려온다. 그러면 git 은 훅이 없는 자리를 가리킨 채 **경고 한 줄 없이 커밋을 통과시킨다.**
// 설정 훅은 `.git/config` 에 들어가고 그 파일은 모든 워크트리가 공유하므로, 레포당 한 번
// 등록하면 워크트리를 몇 개 만들든 훅이 발동한다.
import { spawnSync } from 'node:child_process';

const HOOKS_DIR = '.githooks';
// 설정 별칭 접두사. 우리가 넣은 것만 골라 지우려고 붙인다(사용자·다른 도구가 넣은 hook.* 보존).
const PREFIX = 'repo';
const MIN_GIT = { major: 2, minor: 54 };

function git(args, { allowFail = false } = {}) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0 && !allowFail) {
    throw new Error((result.stderr || `git ${args.join(' ')} 실패`).trim());
  }
  return result.status === 0 ? result.stdout.trim() : '';
}

function warn(message) {
  console.warn(`[git-hooks] ${message}`);
}

// git 2.54 미만은 hook.<별칭>.command 를 조용히 무시한다. 여기서 끊지 않고 경고만 남기는 이유 —
// 이 레포를 받는 사람(과제 평가자)은 커밋을 하지 않으므로 훅이 없어도 잃는 것이 없고,
// 그 사람의 `npm install` 을 실패시키는 쪽이 손해가 크다. 커밋하는 쪽은 버전을 맞추면 된다.
function gitSupportsConfigHooks() {
  const raw = spawnSync('git', ['--version'], { encoding: 'utf8' }).stdout || '';
  const matched = raw.match(/(\d+)\.(\d+)/);
  if (!matched) return false;

  const [major, minor] = [Number(matched[1]), Number(matched[2])];
  return major > MIN_GIT.major || (major === MIN_GIT.major && minor >= MIN_GIT.minor);
}

function listTrackedHooks() {
  return git(['ls-files', HOOKS_DIR], { allowFail: true })
    .split('\n')
    .filter(Boolean)
    .map((file) => file.slice(HOOKS_DIR.length + 1))
    .filter((name) => name && !name.includes('/'))
    .sort();
}

function listRegistered() {
  const lines = git(['config', '--get-regexp', `^hook\\.${PREFIX}-`], { allowFail: true });
  const entries = new Map();
  for (const line of lines.split('\n').filter(Boolean)) {
    const [key, ...rest] = line.split(' ');
    entries.set(key, rest.join(' '));
  }
  return entries;
}

function desiredEntries(hooks) {
  const entries = new Map();
  for (const name of hooks) {
    entries.set(`hook.${PREFIX}-${name}.command`, `sh ${HOOKS_DIR}/${name}`);
    entries.set(`hook.${PREFIX}-${name}.event`, name);
  }
  return entries;
}

function sameEntries(a, b) {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) if (b.get(key) !== value) return false;
  return true;
}

function main() {
  // 압축본 설치 등 git 레포가 아닌 자리에서 돌 수 있다. 그때 install 을 깨뜨리지 않는다.
  if (git(['rev-parse', '--is-inside-work-tree'], { allowFail: true }) !== 'true') {
    warn('git 레포가 아니라 훅 등록을 건너뜁니다.');
    return;
  }

  if (!gitSupportsConfigHooks()) {
    const version = (spawnSync('git', ['--version'], { encoding: 'utf8' }).stdout || '').trim();
    warn(`${version} 은 설정 훅을 지원하지 않아 훅을 등록하지 못했습니다.`);
    warn(`커밋 검사를 받으려면 git ${MIN_GIT.major}.${MIN_GIT.minor} 이상으로 올려주세요.`);
    return;
  }

  const hooks = listTrackedHooks();
  if (hooks.length === 0) {
    warn(`${HOOKS_DIR}/ 에 추적되는 훅이 없어 등록할 것이 없습니다.`);
    return;
  }

  // core.hooksPath 가 남아 있으면 파일 훅과 설정 훅이 **둘 다** 돈다(git 은 둘을 더한다).
  // husky 를 쓰던 레포에서 옮겨온 경우가 여기 걸린다 — 같은 검사가 두 번 도는 것을 막는다.
  const hadHooksPath = git(['config', '--get', 'core.hooksPath'], { allowFail: true }).length > 0;
  if (hadHooksPath) git(['config', '--unset', 'core.hooksPath'], { allowFail: true });

  const desired = desiredEntries(hooks);
  const current = listRegistered();
  if (!hadHooksPath && sameEntries(desired, current)) return;

  // 먼저 우리 것만 걷어낸다 — .githooks 에서 훅을 지웠을 때 설정만 남는 고아를 막는다.
  const sections = new Set([...current.keys()].map((key) => key.split('.').slice(0, 2).join('.')));
  for (const section of sections) git(['config', '--remove-section', section], { allowFail: true });

  for (const [key, value] of desired) git(['config', key, value]);

  console.log(`[git-hooks] 등록 완료: ${hooks.join(', ')}`);
}

main();
