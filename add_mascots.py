import re
import base64

with open('/Users/daisy/gemini demo/finish work early/Finish-work-early/presentation.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Base64 encode the GIFs
def get_b64(path):
    with open('/Users/daisy/gemini demo/finish work early/Finish-work-early/' + path, 'rb') as img:
        return 'data:image/gif;base64,' + base64.b64encode(img.read()).decode('utf-8')

g1 = get_b64('IMG_0532.GIF')
g2 = get_b64('IMG_0533.GIF')
g3 = get_b64('IMG_0534.GIF')
g4 = get_b64('IMG_0535.GIF')

# 2. Update the Title
old_title_regex = r'<h1 class="cover-title">.*?</h1>'
new_title = f"""<h1 class="cover-title" style="font-size: clamp(36px, 4.5vw, 66px); line-height: 1.25; margin-bottom: 32px; font-weight: 700;">
        <span class="cover-title-line"><span>自动化小工具在</span></span>
        <span class="cover-title-line"><span>对公客户经理日常工作中的</span></span>
        <span class="cover-title-line"><span class="key" style="font-style: italic; font-family: var(--font-disp);">减负提效应用分享</span></span>
      </h1>"""
html = re.sub(old_title_regex, new_title, html, flags=re.DOTALL)

# Update the top right meta slightly
html = html.replace('一线减负 · 提效应用分享', '一线减负 · 自动化小工具应用分享')

# 3. Add CSS for mascots
mascot_css = """
/* Mascot Styles */
.mascot-sticker {
  position: absolute;
  z-index: 100;
  filter: drop-shadow(0 14px 24px rgba(31,28,24,0.15));
  animation: mascotFloat 4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes mascotFloat {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-12px) rotate(2deg); }
}
.slide.active .mascot-sticker {
  opacity: 0;
  animation: mascotEntrance 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.8s forwards, mascotFloat 4s ease-in-out 1.6s infinite;
}
@keyframes mascotEntrance {
  0% { opacity: 0; transform: scale(0.4) translateY(40px) rotate(-15deg); }
  100% { opacity: 1; transform: scale(1) translateY(0) rotate(-2deg); }
}

.m-1 { top: -12%; right: -8%; width: 140px; }
.m-2 { top: 15%; right: 10%; width: 130px; animation-delay: 1s; }
.m-3 { top: -45%; left: 50%; transform: translateX(-50%); width: 120px; animation-delay: 1.2s; }
.m-4 { bottom: -20px; right: 40px; width: 160px; animation-delay: 1.4s; }
"""
html = html.replace('/* ══════════════════════════════════════\n   SLIDES', mascot_css + '\n/* ══════════════════════════════════════\n   SLIDES')

# 4. Inject mascots into the slides
# Mascot 1: On the cover slide's hero image
html = html.replace('<div class="hero-image-wrap">', f'<img src="{g1}" class="mascot-sticker m-1">\n        <div class="hero-image-wrap">')

# Mascot 2: On Slide 2 diagram
html = html.replace('<div class="pain-diagram-wrap in d3">', f'<div class="pain-diagram-wrap in d3">\n        <img src="{g2}" class="mascot-sticker m-2">')

# Mascot 3: On Slide 4 workflow step 3
html = html.replace('<div class="wf-step in d3">\n        <div class="step-disc c">3</div>', f'<div class="wf-step in d3">\n        <img src="{g3}" class="mascot-sticker m-3">\n        <div class="step-disc c">3</div>')

# Mascot 4: On Slide 5 near the quote
html = html.replace('<div class="cn-left-quote in d3"', f'<img src="{g4}" class="mascot-sticker m-4">\n      <div class="cn-left-quote in d3"')

# Write updated HTML
with open('/Users/daisy/gemini demo/finish work early/Finish-work-early/presentation.html', 'w', encoding='utf-8') as f:
    f.write(html)
