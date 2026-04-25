import re

with open('presentation.html', 'r', encoding='utf-8') as f:
    html = f.read()

# CSS to inject
signature_css = """
/* Presenter Signature */
.presenter-box {
  margin-top: 54px;
  position: relative;
  display: inline-flex;
  flex-direction: column;
  animation: subtitleFade 1s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both;
}
.presenter-box::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 0%;
  background: var(--vermillion);
  animation: growLine 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s forwards;
}
@keyframes growLine {
  to { height: 100%; }
}
.presenter-cn {
  font-family: var(--font-cn);
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: 0.25em;
  z-index: 2;
  padding-left: 2px;
}
.presenter-en {
  position: absolute;
  top: -18px;
  left: -8px;
  font-family: var(--font-edit);
  font-style: italic;
  font-size: 56px;
  color: var(--vermillion);
  opacity: 0.12;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1;
  letter-spacing: -0.02em;
}
"""

if '.presenter-box' not in html:
    html = html.replace('/* ══════════════════════════════════════\n   SLIDES', signature_css + '\n/* ══════════════════════════════════════\n   SLIDES')

signature_html = """
      <div class="presenter-box">
        <div class="presenter-en">XD.Hu</div>
        <div class="presenter-cn">分享人：胡晓丹</div>
      </div>
"""

# Insert HTML after cover-sub
if '<div class="presenter-box">' not in html:
    html = html.replace('让隐性经验，成为团队的共享资产\n      </p>\n    </div>', '让隐性经验，成为团队的共享资产\n      </p>\n' + signature_html + '    </div>')

with open('presentation.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Added presenter signature!")
