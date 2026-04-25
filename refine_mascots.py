import re

with open('presentation.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Helper to extract the img tag completely
def extract_img(html_text, cls):
    match = re.search(rf'<img src="[^"]+" class="mascot-sticker {cls}">\n*\s*', html_text)
    if match:
        img_tag = match.group(0)
        html_text = html_text.replace(img_tag, '')
        return html_text, img_tag.strip()
    return html_text, ""

html, img1 = extract_img(html, 'm-1')
html, img2 = extract_img(html, 'm-2')
html, img3 = extract_img(html, 'm-3')
html, img4 = extract_img(html, 'm-4')

# Re-inject them into precise natural DOM locations

# 1. M-1: Back to Slide 1, behind the hero image
# We place it inside .artwork, BEFORE .hero-image-wrap so it renders behind it in the DOM order
html = html.replace('<div class="hero-image-wrap">', img1 + '\n        <div class="hero-image-wrap">')

# 2. M-2: Slide 2, we will put it inside .pain-card d4 (综合), sitting gracefully on the top right
# We need to make sure pain-card is position: relative
if '.pain-card {' not in html:
    pass # we can just add position: relative to the css
html = html.replace('<div class="pain-card in d4">', '<div class="pain-card in d4" style="position:relative;">\n          ' + img2)

# 3. M-3: Slide 4, sitting ON TOP of the 65min box in wf-legend
html = html.replace('<div class="wf-legend-total">', '<div style="position:relative; display:inline-block;">\n        ' + img3 + '\n      <div class="wf-legend-total">')
# Close the wrapper div
html = html.replace('<b>65</b> min</div>\n    </div>', '<b>65</b> min</div>\n      </div>\n    </div>')

# 4. M-4: Slide 5, Peeking out from behind the quote box.
html = html.replace('<div class="cn-left-quote in d3"', '<div style="position:relative;">\n        ' + img4 + '\n      <div class="cn-left-quote in d3"')
# Close the wrapper div
html = html.replace('显著降低流程损耗，提升人效比。</div>\n      </div>\n    </div>', '显著降低流程损耗，提升人效比。</div>\n      </div>\n      </div>\n    </div>')

# Now update the CSS perfectly
old_css_regex = r'\.m-1 \{.*?\n\.m-2 \{.*?\n\.m-3 \{.*?\n\.m-4 \{.*?\}'

new_css = """.m-1 { top: -20px; right: -50px; width: 140px; transform: translateZ(-20px); z-index: -1; }
.m-2 { top: -50px; right: -20px; width: 110px; animation-delay: 1.2s; z-index: 10; }
.m-3 { top: -110px; right: -20px; width: 120px; animation-delay: 1.4s; z-index: 10; }
.m-4 { top: -40px; left: -40px; width: 140px; animation-delay: 1.6s; z-index: -1; opacity: 0.9; }"""

html = re.sub(old_css_regex, new_css, html, flags=re.DOTALL)

with open('presentation.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Mascots refined globally!")
