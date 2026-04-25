import re

with open('presentation.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Helper to move elements
def move_element(html_text, img_anchor, old_parent_anchor, new_parent_anchor):
    # Find the tag
    match = re.search(rf'<img src="[^"]+" class="mascot-sticker {img_anchor}">\n\s*', html_text)
    if match:
        img_tag = match.group(0)
        # Remove from old parent
        html_text = html_text.replace(img_tag, '')
        # Insert into new parent
        html_text = html_text.replace(new_parent_anchor, new_parent_anchor + '\n' + img_tag)
    return html_text

# Relocate m-2
html = move_element(html, 'm-2', '<div class="pain-diagram-wrap in d3">', '<div class="pain-bottom in d5">')

# Relocate m-3
html = move_element(html, 'm-3', '<div class="wf-step in d3">', '<div class="wf-legend in d5">')

# Relocate m-4
html = move_element(html, 'm-4', '<div class="cn-left-quote in d3"', '<div class="cn-bottom in d5">')

# Update the CSS block
old_css = """.m-1 { top: -12%; right: -8%; width: 140px; }
.m-2 { top: 15%; right: 10%; width: 130px; animation-delay: 1s; }
.m-3 { top: -45%; left: 50%; transform: translateX(-50%); width: 120px; animation-delay: 1.2s; }
.m-4 { bottom: -20px; right: 40px; width: 160px; animation-delay: 1.4s; }"""

new_css = """.m-1 { top: -6%; right: -6%; width: 140px; }
.m-2 { top: -110px; right: 2%; width: 130px; animation-delay: 1s; }
.m-3 { bottom: -10px; left: -140px; width: 140px; animation-delay: 1.2s; }
.m-4 { bottom: 10px; right: 260px; width: 160px; animation-delay: 1.4s; }"""

if old_css in html:
    html = html.replace(old_css, new_css)
else:
    # Fallback regex replace for CSS
    html = re.sub(r'\.m-1 \{.*?\n\.m-2 \{.*?\n\.m-3 \{.*?\n\.m-4 \{.*?\}', new_css, html, flags=re.DOTALL)

with open('presentation.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Layout fixed!")
