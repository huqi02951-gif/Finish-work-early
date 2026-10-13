# 实际修改文件 · V3.2

相对于保留的 V3.1 工程基线 `a35d67d`，下列源码、资产、配置和交接文档发生了变化。截图另保存于 `qa/director-v1/` 与 `qa/growth-v1/`，不随生产站点发布。

- `.gitignore`
- `README.md`
- `assets/original/cloud-bank-v1.png`
- `assets/original/ocean-life-atlas-v1.png`
- `docs/ASSET-REQUESTS.md`
- `docs/CLOUD-BANK-PROMPT.md`
- `docs/DIRECTOR-V1-IMPLEMENTATION.md`
- `docs/FIRST-STAGE-ARCHITECTURE.md`
- `docs/GROWTH-V1-HANDOFF.md`
- `docs/OCEAN-LIFE-PROMPT.md`
- `docs/SCENE-COORDINATES.md`
- `index.html`
- `package-lock.json`
- `package.json`
- `src/StoryChapters.js`
- `src/film.js`
- `src/first-stage.css`
- `src/first-stage/AircraftCabin.js`
- `src/first-stage/AircraftDoor.js`
- `src/first-stage/Atmosphere.js`
- `src/first-stage/DiveNavigation.js`
- `src/first-stage/FirstPersonCamera.js`
- `src/first-stage/FirstStageDirector.js`
- `src/first-stage/FreefallSequence.js`
- `src/first-stage/HumanForeground.js`
- `src/first-stage/OceanSurface.js`
- `src/first-stage/SceneLayout.js`
- `src/first-stage/SeaLifeEncounters.js`
- `src/first-stage/UnderwaterPOV.js`
- `src/first-stage/WaterTransition.js`
- `src/first-stage/assetManifest.js`
- `tests/first-stage.test.js`

原六张 V3 素材与 `src/style.css` SHA-256 未变。父仓库暂存区 SHA-256 未变。

## 免费自动部署、手机手势和全文案交接

本轮修改：`src/film.js`、`src/first-stage/DiveNavigation.js`、`src/first-stage/FirstStageDirector.js`、`index.html`。新增：`src/first-stage/PixelDensity.js`、`tests/mobile-input.test.js`、`scripts/export-copy.py`、`docs/copy/` 三份全文案导出、`docs/MOBILE-INPUT-FIX.md`，以及父仓库 `.github/workflows/little-conch-pages.yml`（已推送，成功 CI 38151068229）。更新 README、部署记录，增加本轮实测截图/读数。主叙事 `StoryChapters.js`、正式素材占位和故事顺序未改变。

执行技能：engineering-change-discipline、diagnosing-bugs、cloudflare-deploy。


## 2026-10-13 当前版本

V3.3真实文档滚动与小海螺第一座岛润色已上线。完整修改清单、20项测试、三尺寸滚动/镜头实测、正式素材需求与回滚路径见 [NATIVE-SCROLL-ISLAND-V3.3.md](NATIVE-SCROLL-ISLAND-V3.3.md)；公网当前版本2bd3b6a2，CI38409865202成功。既有结果与备份保留。
