import re

with open('presentation.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Slide 1 (m-1) tweak
# Increase negative top to push it higher so the head fully pops out
html = html.replace('.m-1 { top: -20px; right: -50px;', '.m-1 { top: -90px; right: -30px;')

# 2. Slide 2 (m-2) delete
# Remove m-2 img tag entirely
html = re.sub(r'<img src="[^"]+" class="mascot-sticker m-2">\s*', '', html)
# Remove m-2 CSS
html = re.sub(r'\.m-2 \{.*?\n\s*', '', html)

# 3. Slide 5 (m-4) tweak
# Move m-4 position from top-left of the large block to directly behind the 65 min string
# Currently it's at:
# <div style="position:relative;">
#         <img src="..." class="mascot-sticker m-4">
#       <div class="cn-left-quote in d3" ...>
# Let's adjust the css of m-4 to shift it down exactly to the 65 min line
html = html.replace('.m-4 { top: -40px; left: -40px;', '.m-4 { top: 15px; left: 20px;')

with open('presentation.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Tweaks done")
