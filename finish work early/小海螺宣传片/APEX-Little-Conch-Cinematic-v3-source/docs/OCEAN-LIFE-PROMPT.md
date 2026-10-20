# 原创海洋生物 Atlas · 生成方向

本轮用 imagegen 生成。透明背景开启；未附加参考站图像，也未复制其海洋生物资产。图像仅作为新的美术候选，仍需 GPT 视觉验收。

## Prompt

Create an original production-ready transparent PNG marine-life sprite atlas for the APEX Studio THE LITTLE CONCH cinematic underwater website. Exactly six separate marine organisms arranged in a strict 3-column by 2-row grid, each centered within its own square cell with generous transparent gutters and no overlap. Top row: a small orange-white clownfish in three-quarter side view, a graceful translucent lilac/pink jellyfish with flowing delicate tentacles, a young sea turtle with emerald and golden shell. Bottom row: a golden seahorse in profile, a compact vivid coral cluster in turquoise/pink/orange, a coral-orange starfish with realistic fine surface texture. Premium cinematic game art, charming but anatomically believable, vibrant jewel colors, credible tactile materials, soft warm key light from upper left and cool underwater rim light, coherent art direction and camera angle. Each subject is an isolated cutout with real transparent alpha all around it; retain semitransparent jellyfish anatomy. No background ocean, no rectangular backplates, no text, no labels, no border, no logos, no cartoon eyes or human expressions. Keep every subject wholly within its cell, all silhouettes separated, suitable for six individual WebGL billboard encounters. This atlas must be original artwork, not a reproduction of any referenced website assets.

## 成品

`assets/original/ocean-life-atlas-v1.png`，1536×1024 RGBA。3×2 六格；运行时只选择各格 UV，不对原始像素再编辑。真实浏览器截图见 `qa/growth-v1/`。
