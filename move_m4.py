import re

with open('presentation.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract m-4 img
match = re.search(r'<img src="[^"]+" class="mascot-sticker m-4">\s*', html)
if match:
    img4_tag = match.group(0).strip()
    html = html.replace(match.group(0), '')

# Remove the old relative wrapper if possible
# <div style="position:relative;">      <div class="cn-left-quote in d3"
html = html.replace('<div style="position:relative;">\n', '')
# And the extra closing div near the bottom
html = html.replace('显著降低流程损耗，提升人效比。</div>\n      </div>\n      </div>\n    </div>', '显著降低流程损耗，提升人效比。</div>\n      </div>\n    </div>')

# Find the target string and modify its div to relative inline-block, then inject img4
target_div = '<div style="font-family: var(--font-edit); font-size: 32px; font-style: italic; color: var(--ink); line-height: 1.2;">" ≈ 65 min saved per day "</div>'
new_div = f'<div style="font-family: var(--font-edit); font-size: 32px; font-style: italic; color: var(--ink); line-height: 1.2; position: relative; display: inline-block;">" ≈ 65 min saved per day "\n{img4_tag}</div>'

html = html.replace(target_div, new_div)

# Fix CSS
# .m-4 { top: 15px; left: 20px; width: 140px; animation-delay: 1.6s; z-index: -1; opacity: 0.9; }
html = re.sub(r'\.m-4 \{.*?\}', '.m-4 { top: -20px; right: -120px; width: 130px; animation-delay: 1.6s; z-index: 10; }', html)

with open('presentation.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Finished!")
