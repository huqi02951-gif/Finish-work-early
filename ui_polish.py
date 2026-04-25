import re

with open('presentation.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Advanced Font Rendering
if 'optimizeLegibility' not in html:
    html = html.replace('-webkit-font-smoothing: antialiased;',
                        '-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility;')

# 2. Refined Composite Shadows for Cards
# Searching for sc-card box-shadow addition
if 'box-shadow: 0 4px 12px' not in html:
    html = html.replace('cursor: default;\n}', 'cursor: default;\n  box-shadow: 0 2px 8px -2px rgba(31,28,24,0.03);\n}')
    html = html.replace('.sc-card:hover { transform: translateY(-6px); border-color: var(--accent-border, var(--vermillion)); }',
                        '.sc-card:hover { transform: translateY(-6px); border-color: var(--accent-border, var(--vermillion)); box-shadow: 0 24px 48px -12px rgba(31,28,24,0.1), 0 8px 16px -4px rgba(31,28,24,0.04); }')

# 3. Dynamic content max-widths
# Slide 2 Text adjustment
html = html.replace('max-width: 540px;', 'max-width: 600px;')

# 4. Enhance the navbar glassmorphism
html = html.replace('backdrop-filter: blur(20px);', 'backdrop-filter: saturate(180%) blur(24px);')
html = html.replace('-webkit-backdrop-filter: blur(20px);', '-webkit-backdrop-filter: saturate(180%) blur(24px);')
html = html.replace('background: rgba(243,236,222,0.85);', 'background: rgba(243,236,222,0.65); border: 1px solid rgba(216,207,187,0.5);')

# 5. Add a subtle slide entering animation for the main grids to reduce abruptness
# Replace direct grid appearance with a smooth staggered entrance
if 'gridAppear' not in html:
    css_to_add = """
@keyframes gridAppear {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
.slide.active .scenario-grid, .slide.active .pain-body, .slide.active .wf-body {
  animation: gridAppear 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
  opacity: 0;
}
</style>
"""
    html = html.replace('</style>', css_to_add)

# 6. Re-tweak the "XD.Hu" signature font rendering to make it truly blend
html = html.replace('color: var(--vermillion);\n  opacity: 0.12;', 'color: var(--vermillion);\n  opacity: 0.08; mix-blend-mode: multiply; transform: rotate(-3deg);')

with open('presentation.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("UI Polish Completed!")
