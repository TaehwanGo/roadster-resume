# Roadster Run

Tesla Roadster 컨셉의 차를 몰고 달리며 고태환의 경력과 프로젝트 15개 스테이지를 보는 3D 웹 게임입니다.

## 조작

| 키 | 동작 |
| --- | --- |
| ↑ / W | 가속 |
| ↓ / S | 브레이크 · 후진 |
| ← → / A D | 조향 (공중에서는 회전) |
| Shift | 로켓 스러스터 부스터 |
| Space | 점프 · 길게 누르면 최대 1초까지 더 높이 · 공중에서 한 번 더 누르면 백플립 |
| R | 첫 화면으로 |

모바일에서는 화면 터치 버튼으로 조작합니다.

## 개발

Next.js 16 (App Router, static export) · React 19 · Three.js · TypeScript

```bash
pnpm install      # husky 훅도 함께 설치됩니다
pnpm dev          # http://localhost:3000
pnpm run lint
pnpm run check-ts
pnpm build        # out/ 에 정적 파일 생성
```

- 이력서 내용: `lib/stages.ts`
- 주행·물리·3D 장면: `lib/engine.ts`
- 화면(HUD, 모달, 상세 패널): `components/`

커밋할 때 husky `pre-commit` 훅이 `lint`와 `check-ts`를 실행합니다. `main`에 push하면 GitHub Actions가 빌드해 GitHub Pages에 배포합니다.
