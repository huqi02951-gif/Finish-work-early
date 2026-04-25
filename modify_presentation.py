import re
import math

with open('/Users/daisy/gemini demo/finish work early/Finish-work-early/presentation.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Scale up font sizes
def scale_font(match):
    size = float(match.group(1))
    if size < 20:
        new_size = math.ceil(size * 1.5)
    elif size < 40:
        new_size = math.ceil(size * 1.4)
    elif size < 80:
        new_size = math.ceil(size * 1.3)
    else:
        new_size = size
    return f"font-size: {new_size}px"

html = re.sub(r'font-size:\s*(\d+(\.\d+)?)px', scale_font, html)

def scale_clamp(match):
    min_s = float(match.group(1))
    vw = float(match.group(3))
    max_s = float(match.group(5)) # fixed group index
    new_min = math.ceil(min_s * 1.4)
    new_max = math.ceil(max_s * 1.4)
    return f"clamp({new_min}px, {vw}vw, {new_max}px)"

html = re.sub(r'clamp\((\d+(\.\d+)?)px,\s*(\d+(\.\d+)?)vw,\s*(\d+(\.\d+)?)px\)', scale_clamp, html)

# 2. Remove animations and grain
html = re.sub(r'/\* Grain overlay \*/.*?\}\s*/\* Soft paper gradient wash \*/', '/* Soft paper gradient wash */', html, flags=re.DOTALL)
html = re.sub(r'#particles \{.*?\}', '', html, flags=re.DOTALL)
html = re.sub(r'<canvas id="particles"></canvas>\s*<div class="grain"></div>', '', html)
html = re.sub(r'/\* ═════════════ PARTICLE FIELD[^*]+═════════════ \*/\s*\(\(\) => \{.*?\}\)\(\);\s*', '', html, flags=re.DOTALL)

# 3. Inject Artwork CSS
artwork_css = """
.hero-image-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-40%, -50%) perspective(1200px) rotateY(-12deg) rotateX(4deg);
  width: 140%;
  max-width: 660px;
  border-radius: 20px;
  box-shadow: 
    0 40px 100px -20px rgba(220,75,44,0.25),
    inset 0 0 0 1.5px rgba(255,255,255,0.7),
    0 0 0 1px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.22,1,0.36,1);
}
.hero-image-wrap:hover {
  transform: translate(-45%, -50%) perspective(1200px) rotateY(-6deg) rotateX(2deg) scale(1.02);
  box-shadow: 
    0 50px 120px -10px rgba(220,75,44,0.35),
    inset 0 0 0 1.5px rgba(255,255,255,0.9),
    0 0 0 1px rgba(0,0,0,0.05);
}
.hero-image-wrap img {
  display: block;
  width: 100%;
  height: auto;
  opacity: 0;
  animation: imgRiseIn 1.4s cubic-bezier(0.22,1,0.36,1) 0.6s forwards;
}
@keyframes imgRiseIn {
  from { opacity: 0; transform: translateY(40px) scale(0.96); filter: blur(10px); }
  to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

.badge-1 { top: -6%; left: 6%; --r: -4deg; animation-delay: 0s; transform: translateZ(40px); z-index: 10; }
.badge-2 { bottom: 0%; right: 2%; --r: 3deg; animation-delay: -2s; transform: translateZ(60px); z-index: 10; }
.badge-3 { bottom: 20%; left: -6%; --r: 2deg; animation-delay: -4s; transform: translateZ(20px); z-index: 10; }
"""

html = re.sub(r'/\* Right conclusion list \*/', artwork_css + '\n/* Right conclusion list */', html)

artwork_html = """
      <div class="artwork" style="perspective: 1200px; transform-style: preserve-3d; display: flex;">
        <div class="hero-image-wrap">
          <img src="unnamed.png" alt="AI Tool Workflow">
        </div>

        <div class="badge badge-1"><span class="dot"></span>省 65 min / day</div>
        <div class="badge badge-2"><span class="dot"></span>3 × 角色转译</div>
        <div class="badge badge-3"><span class="dot"></span>-2 次补件</div>

        <div class="artwork-label" style="right: -20%; bottom: -15%; opacity: 0.1">ai</div>
      </div>
"""
html = re.sub(r'<div class="artwork">.*?(?=<div class="cover-footer">)', artwork_html + '\n    </div>\n\n    ', html, flags=re.DOTALL)

# Adjust slide spacing to accommodate larger fonts
html = re.sub(r'padding: 6vh 7vw 5vh;', 'padding: 4vh 6vw 4vh;', html)

with open('/Users/daisy/gemini demo/finish work early/Finish-work-early/presentation.html', 'w', encoding='utf-8') as f:
    f.write(html)
