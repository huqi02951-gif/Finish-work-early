#!/usr/bin/env python3
"""Export the actual source copy for editorial review; never modifies runtime copy."""
from pathlib import Path
from html.parser import HTMLParser
from collections import OrderedDict
import csv, hashlib, json, re, subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/copy'
OUT.mkdir(parents=True, exist_ok=True)
rows = []
def add(ident, scene, position, current, status, source):
    rows.append(dict(id=ident, scene=scene, position=position, current=current,
                     status=status, source=source, replacement='', notes=''))

chapters = json.loads(subprocess.run(
    ['node', '--input-type=module', '-e', "import {CHAPTERS} from './src/StoryChapters.js'; console.log(JSON.stringify(CHAPTERS));"],
    cwd=ROOT, capture_output=True, text=True, check=True).stdout)
names = ['00 初识 · 小海螺醒来', '01 外部查询 · 小丑鱼', '02 受益所有人 · 水母',
         '03 财报转换 · 海龟', '04 股权穿透 · 海马', '05 技能协作 · 珊瑚', '06 行内部署 · 海星', '07 片尾前的短过渡']
for i, ch in enumerate(chapters):
    source = f'src/StoryChapters.js → CHAPTERS[{i}]'
    for key, position in [('title','英文主标题'), ('cn','中文主句'), ('desc','中文说明'), ('label','能力英文标签'), ('id','右上角任务状态')]:
        if ch[key]: add(f'SKILL-{i:02d}-{key}', names[i], position, ch[key], '当前展示' if i<7 else '极短过渡，最终片尾另见下方', f'{source}.{key}')
    kicker = ch['kicker'] if i in [0,7] else f"{i:02d} / 06 · {['','外部查询','受益所有人识别','财报转换','股权穿透','技能协作','行内部署'][i]}"
    add(f'SKILL-{i:02d}-kicker',names[i],'标题上方章节标识',kicker,'当前展示' if i<7 else '极短过渡',source+'.kicker / src/film.js changeChapter')
    if i not in [0,7]: add(f'OLD-{i:02d}-kicker',names[i],'原章节英文标识',ch['kicker'],'已被编号中文标识覆盖，当前不展示',source+'.kicker')
    for j, pair in enumerate(ch['holo']):
        for k, value in enumerate(pair):
            add(f'HOLO-{i:02d}-{j+1:02d}-{k+1}',names[i],'全息示例：'+('字段名' if k==0 else '内容'),value,'保留在源码；当前全息面板隐藏',f'{source}.holo[{j}][{k}]')

class TextNodes(HTMLParser):
    def __init__(self): super().__init__(); self.stack=[]; self.items=[]; self.attrs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='br': return
        item={'tag':tag,'id':a.get('id'),'class':a.get('class',''),'line':self.getpos()[0]}
        if tag not in ['meta','link','img','input','br','hr']: self.stack.append(item)
        for key in ['aria-label','title','alt']:
            if a.get(key): self.attrs.append((a[key],key,list(self.stack),self.getpos()[0]))
        if tag=='meta' and a.get('name')=='description': self.attrs.append((a['content'],'搜索引擎描述',[],self.getpos()[0]))
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i]['tag']==tag: self.stack=self.stack[:i]; return
    def handle_data(self,data):
        value=data.strip()
        if value and not any(x['tag'] in ['script','style'] for x in self.stack): self.items.append((value,list(self.stack),self.getpos()[0]))

parser=TextNodes();parser.feed((ROOT/'index.html').read_text())
reserved={'title-screen','flight-caption','flight-index','flight-line','flight-sub','chapter-copy','chapter-kicker','chapter-title','chapter-cn','chapter-desc','portal','holo'}
overwritten={'readout','readout-label','readout-unit','mission','guide-text','progress-label','progress-pct','speed','data-label','data-name'}
def location(stack):
    ids=[x['id'] for x in stack if x.get('id')]
    classes=[x['class'] for x in stack]
    if 'credits' in ids: return '片尾 · 创作团队与继续生长', '片尾文字', '当前展示'
    if any(x in ids for x in reserved): return '保留的初始/旧版文案', '初始化文字', '隐藏或被运行时覆盖，当前通常不展示'
    if any('hatch-inner' in x for x in classes): return '机舱 · 旧舱门 HTML', '旧门贴纸文字', 'WebGL 准备后隐藏；实际门贴纸见 CANVAS 项'
    if 'hatch' in ids: return '机舱 · 手动开门', '门把操作提示', '当前展示'
    if any(x in ids for x in overwritten): return '仪表与操作提示', '初始化标签 / 数字', '由运行时状态覆盖；实际状态另见 TXT 项'
    if any('skill-nav' in x for x in classes): return '水下 · 01–06 导航', '导航按钮 / 无障碍名称', '当前展示'
    if 'scene-status' in ids: return '载入与故障', '载入提示', '仅载入期间或故障时展示'
    if 'tap-continue' in ids: return '水下 · 保留的继续按钮', '按钮文案', '手机布局当前隐藏，仅保留在源码'
    if 'skip-intro' in ids: return '天空开场', '跳过按钮', '入水前展示'
    if any(x in ids for x in ['sound','sound-label','pause','pause-label']): return '全程 · 声音与暂停', '按钮标签 / 无障碍名称', '当前展示'
    if any(x['tag'] in ['head','title'] for x in stack): return '浏览器标题与搜索信息', '页面标题 / 摘要', '标签页或搜索信息'
    return '全程 · 品牌与仪表', '界面文字', '当前展示（部分标签在手机隐藏）'
for number,(value,stack,line) in enumerate(parser.items,1):
    scene,position,status=location(stack)
    if re.fullmatch(r'[\d.%↑↓↗↶✦✧◈Ⅱ—]+',value): position+='（数字 / 图形符号）'
    path=' '.join('#'+x['id'] if x.get('id') else x['tag']+('.'+x['class'].split()[0] if x['class'] else '') for x in stack[-3:])
    add(f'DOM-{number:03d}',scene,position,value,status,f'index.html:{line} · {path}')
for number,(value,key,stack,line) in enumerate(parser.attrs,1):
    scene,position,status=location(stack)
    add(f'A11Y-{number:03d}',scene,key,value,'无障碍 / 元信息',f'index.html:{line} · {key}')

class Plain(HTMLParser):
    def __init__(self): super().__init__();self.text=[]
    def handle_data(self,data):self.text.append(data)
    def handle_starttag(self,tag,attrs):
        if tag=='br':self.text.append('\n')

def plain(s):
    p=Plain();p.feed(s);return ''.join(p.text).strip()
files=['src/film.js','src/first-stage/FirstStageDirector.js','src/first-stage/QARecorder.js']
for filename in files:
    source=(ROOT/filename).read_text(); seen=set()
    pattern=r"'((?:\\.|[^'\\])*)'"
    for match in re.finditer(pattern,source):
        value=match.group(1).replace('\\n','\n').replace("\\'", "'")
        if not (re.search(r'[\u4e00-\u9fff]',value) or re.search(r'[A-Z]{2,}',value)):continue
        if value.startswith(('QA:','./')) or value=='ArrowDown': continue
        value=plain(value) if '<' in value else value
        if not value or value in seen or not re.search(r'[a-zA-Z\u4e00-\u9fff]',value):continue
        seen.add(value);line=source.count('\n',0,match.start())+1
        if value=='L · 框R · 闩' or filename.endswith('QARecorder.js') or (filename=='src/film.js' and source.find('function setupQA()') <= match.start() < source.find('function init()',source.find('function setupQA()'))):
            scene='开发验收工具';status='仅 ?qa=1，普通访客不展示'
        elif 'holo-' in match.group(1) or value in ['APEX SYSTEM // LIVE STORY DEMO','ILLUSTRATIVE DATA · NOT A LIVE BANKING SYSTEM']:
            scene='保留的全息面板';status='当前隐藏'
        elif '浏览器' in value or '场景素材' in value or '图形设备' in value:
            scene='载入与故障';status='异常或载入期间展示'
        else:scene='天空 / 水下 · 动态状态与操作';status='按状态展示（含部分初始化值）'
        if '镜头验收工具' in value or '镜头时间' in value or value in ['机舱','跃出','自由落体','近海','水前','水线','水后','穿水','水下','抵达','重置并播放','片尾验收','手部对齐图','隐藏工具 (H)','技能 ']:scene='开发验收工具';status='仅 ?qa=1，普通访客不展示'
        ident='TXT-'+hashlib.sha256((filename+'|'+value).encode()).hexdigest()[:8]
        add(ident,scene,'运行时文字 / 状态标签',value,status,f'{filename}:{line}')
# Literal canvas lettering lives in the 3D door texture rather than HTML.
source=(ROOT/'src/first-stage/AircraftDoor.js').read_text()
for i,m in enumerate(re.finditer(r"fillText\('([^']+)'",source),1):
    add(f'CANVAS-{i:02d}','机舱 · 3D 舱门贴纸','贴纸 / 铭牌',m.group(1),'当前展示在门板，修改后需重新绘制贴图',f'src/first-stage/AircraftDoor.js:{source.count(chr(10),0,m.start())+1}')

# Ensure identifiers are unique; runtime copy comes from the listed literal sources.
ids=[x['id'] for x in rows];assert len(ids)==len(set(ids))
(OUT/'小海螺_全文案映射.json').write_text(json.dumps({'version':'V3.2 / 手机上滑修复版','source':'现有工程源码，不主动改写内容','items':rows},ensure_ascii=False,indent=2))
with (OUT/'小海螺_文字修改表.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.writer(f,lineterminator='\n');writer.writerow(['编号','场景','位置','当前原文','展示状态','源码位置','新文案（留空保留；删除写【删除】）','修改说明'])
    for x in rows:writer.writerow([x[k] for k in ['id','scene','position','current','status','source','replacement','notes']])
intro='''# 小海螺 · 全站文案与修改对照

版本：V3.2 手机上滑修复版。由当前源码导出；不会修改网站内容。

你可以编辑同目录的 **小海螺_文字修改表.csv**：每行都有编号、场景、位置、原文、展示状态和源码位置。只填写“新文案”和“修改说明”，保留编号。新文案留空表示保留，删除请写【删除】。英文标题原有换行也已保留。

也可以直接发：`SKILL-01-cn：新文案……`，或 `SKILL-03-desc：新说明……`。同一句出现于多个位置时，可注明“全部同步替换”。

故事顺序：机舱手动开门 → 自动坠落 → 海面接近 → 穿水 / 身份切换 → 初识 → 外部查询（小丑鱼）→ 受益所有人（水母）→ 财报转换（海龟）→ 股权穿透（海马）→ 技能协作（珊瑚）→ 行内部署（海星）→ 片尾。

当前手机操作：手指从下向上滑动会下潜；反向滑动回看。鼠标滚轮仍向下推进。这里同时收录了隐藏旧稿、全息示例、无障碍标签和开发验收工具，它们的状态已经标明。开发工具不属于宣传文案，可跳过；数字深度、速度和百分比由程序计算，不建议当作固定文案修改。图片中无法辨识的纹理不作为文字臆写；门上的实际文字由 Canvas 绘制，已逐项收录。

## 优先修改：主叙事
'''
parts=[intro]
for i,name in enumerate(names):
    parts.append('\n### '+name+'\n')
    for row in rows:
        if row['id'].startswith(f'SKILL-{i:02d}-'):
            parts.append(f"\n**{row['id']} · {row['position']}**\n\n{row['current']}\n\n")
parts.append('''\n## 全部文字逐项映射

下面包含主叙事及其余所有文字，编号与 CSV/JSON 一致。先改“当前展示”的宣传文案，再按需处理仪表、贴纸和旧稿。
''')
for scene in OrderedDict.fromkeys(r['scene'] for r in rows):
    parts.append('\n### '+scene+'\n\n| 编号 | 位置 | 当前原文 | 展示状态 |\n| --- | --- | --- | --- |\n')
    for r in rows:
        if r['scene']==scene:
            def cell(s):return str(s).replace('|','\\|').replace('\n','<br>')
            parts.append('| '+' | '.join(cell(r[k]) for k in ['id','position','current','status'])+' |\n')
(OUT/'小海螺_全文案与修改对照.md').write_text(''.join(parts))
print(json.dumps({'entries':len(rows),'outputs':[p.name for p in OUT.iterdir()]},ensure_ascii=False))
