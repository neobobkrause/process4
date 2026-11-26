import re,sys,html
src=open(sys.argv[1]).read()
a=src.index('## 7.'); b=src.index('## 9.')
md=src[a:b]
def inl(t):
    t=html.escape(t,quote=False)
    t=re.sub(r'`([^`]+)`',r'<code>\1</code>',t)
    t=re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',t)
    return t
out=[];lines=md.split('\n');i=0
while i<len(lines):
    l=lines[i]
    if l.startswith('## '): out.append(f'<h2>{inl(l[3:])}</h2>'); i+=1; continue
    if l.startswith('|'):
        rows=[]
        while i<len(lines) and lines[i].startswith('|'): rows.append(lines[i]); i+=1
        cells=lambda r:[c.strip() for c in r.strip('|').split('|')]
        h=cells(rows[0]); body=[cells(r) for r in rows[2:]]
        out.append('<table><thead><tr>'+''.join(f'<th>{inl(c)}</th>' for c in h)+'</tr></thead><tbody>'+''.join('<tr>'+''.join(f'<td>{inl(c)}</td>' for c in r)+'</tr>' for r in body)+'</tbody></table>'); continue
    if l.startswith('- '):
        items=[]
        while i<len(lines) and lines[i].startswith('- '): items.append(lines[i][2:]); i+=1
        out.append('<ul>'+''.join(f'<li>{inl(x)}</li>' for x in items)+'</ul>'); continue
    if re.match(r'\d+\. ',l):
        items=[]
        while i<len(lines) and re.match(r'\d+\. ',lines[i]): items.append(re.sub(r'^\d+\. ','',lines[i])); i+=1
        out.append('<ol>'+''.join(f'<li>{inl(x)}</li>' for x in items)+'</ol>'); continue
    if l.strip(): out.append(f'<p>{inl(l)}</p>')
    i+=1
body='\n'.join(out)
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Process4 Who Is Told</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=Inter:wght@400;600&display=swap">
<style>
:root{{--bg:#f7f8f6;--fg:#1d2420;--muted:#5b6660;--line:#d9dfdb;--accent:#1f6f54;--card:#ffffff;--display:"Source Serif 4",Georgia,serif;--body:Inter,system-ui,sans-serif}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#141816;--fg:#e6ebe8;--muted:#9aa6a0;--line:#2c3430;--accent:#5cc49c;--card:#1b201d;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#141816;--fg:#e6ebe8;--muted:#9aa6a0;--line:#2c3430;--accent:#5cc49c;--card:#1b201d;color-scheme:dark}}
body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 var(--body);padding:28px 16px 48px}}
main{{max-width:46rem;margin:0 auto}}
h1{{font:600 1.9rem/1.2 var(--display);margin:0 0 6px}}
h2{{font:600 1.35rem/1.3 var(--display);margin:32px 0 10px}}
.note{{color:var(--muted);font-size:.92rem;margin-bottom:8px}}
p{{margin:0 0 12px}} ul,ol{{margin:0 0 12px;padding-left:1.3rem}} li{{margin:0 0 8px}}
code{{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.86em;overflow-wrap:anywhere}}
.tw{{overflow-x:auto}} table{{border-collapse:collapse;margin:0 0 14px;font-size:.93rem;background:var(--card)}}
th,td{{border:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}} th{{background:var(--bg)}}
</style></head><body><main>
<h1>Who is told of a change</h1>
<p class="note">Process4 design, part 2, sections 7 and 8, as they stand on the branch <code>work/decision-c-design</code> ({sys.argv[2]}). Not yet in force: nothing is built from it until you have read it.</p>
{body.replace('<table>','<div class="tw"><table>').replace('</table>','</table></div>')}
</main></body></html>'''
open(sys.argv[3],'w').write(page)
