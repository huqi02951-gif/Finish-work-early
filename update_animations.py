import re

with open('presentation.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Enhance animations for the cover slide
cover_css = """
@keyframes maskRiseUp {
  0% { transform: translateY(110%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes subtitleFade {
  0% { opacity: 0; transform: translateY(15px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.slide.active .cover-title-line {
  display: block;
  overflow: hidden;
}
.slide.active .cover-title-line span {
  display: inline-block;
  animation: maskRiseUp 1s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.slide.active .cover-title-line:nth-child(1) span { animation-delay: 0.1s; }
.slide.active .cover-title-line:nth-child(2) span { animation-delay: 0.25s; }
.slide.active .cover-title-line:nth-child(3) span { animation-delay: 0.4s; }

.slide.active .cover-sub {
  animation: subtitleFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
}
.slide.active .cover-chapter {
  animation: subtitleFade 1s cubic-bezier(0.16, 1, 0.3, 1) 0.0s both;
}
"""

# Insert cover_css into the <style> tag
html = html.replace('/* ══════════════════════════════════════\n   SLIDES', cover_css + '\n/* ══════════════════════════════════════\n   SLIDES')

# Update Cover title HTML to use the new masked lines
# Replace old cover-title
old_title = r"""<h1 class="cover-title in d2">
        <span class="display-ai">AI</span> 如何帮<br>
        对公客户经理<br>
        <span class="key">每天少返工一次</span>
      </h1>"""
new_title = """<h1 class="cover-title">
        <span class="cover-title-line"><span><span class="display-ai">AI</span> 如何帮</span></span>
        <span class="cover-title-line"><span>对公客户经理</span></span>
        <span class="cover-title-line"><span><span class="key">每天少返工一次</span></span></span>
      </h1>"""

html = html.replace(old_title, new_title)

# Update Cover chapter and sub to remove generic 'in' classes to use dedicated ones
html = html.replace('<div class="cover-chapter in d1">', '<div class="cover-chapter">')
html = html.replace('<p class="cover-sub in d3">', '<p class="cover-sub">')


# 2. Redesign the messy 65 on Slide 5
old_figure = r"""<div class="cn-left-figure in d3">
        <div class="cn-left-figure-num">65′</div>
        <div class="cn-left-figure-cap">
          <b>每天</b>
          SAVED PER DAY
        </div>
      </div>"""

# Replace it with an elegant quote block
new_figure = """<div class="cn-left-quote in d3" style="margin-top: 40px; padding-left: 20px; border-left: 2px solid var(--vermillion); opacity: 0; animation: subtitleFade 1s 0.6s forwards;">
        <div style="font-family: var(--font-sans); font-size: 14px; letter-spacing: 0.15em; color: var(--vermillion); text-transform: uppercase; margin-bottom: 8px;">Key Metric</div>
        <div style="font-family: var(--font-edit); font-size: 32px; font-style: italic; color: var(--ink); line-height: 1.2;">" ≈ 65 min saved per day "</div>
        <div style="font-family: var(--font-cn); font-size: 16px; color: var(--ink-soft); margin-top: 8px;">显著降低流程损耗，提升人效比。</div>
      </div>"""

if old_figure in html:
    html = html.replace(old_figure, new_figure)
else:
    # try regex approach because formatting might be slightly changed by previous script
    html = re.sub(r'<div class="cn-left-figure in d3">.*?</div>\s*</div>', new_figure, html, flags=re.DOTALL)


# Write updated HTML
with open('presentation.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated!")
