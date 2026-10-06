"""Renderiza um post da Rosa Buffet (carrossel.html → PNGs 1080x1350 + prancha).

Uso:  python render.py <pasta-do-post>      (ou "todos" para renderizar todas as pastas)
Confere: Playfair Display e Inter carregadas, nada vazando do slide, foto carregada.
A prancha vem do render.py da skill carrossel (mesmo formato dos posts da Ervexa).
"""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")
AQUI = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location("skill_render", AQUI.parents[5] / ".claude/skills/carrossel/render.py")
skill_render = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(skill_render)

CHECAGEM_JS = r"""
async () => {
  await document.fonts.ready;
  const fontes = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, ''));
  const erros = [];
  if (!fontes.includes('Playfair Display') || !fontes.includes('Inter')) erros.push('fontes não carregaram: ' + fontes.join(', '));
  // fotos de fundo carregadas; .placeholder = imagem do ChatGPT que o Saymon ainda vai salvar
  const avisos = [];
  for (const el of document.querySelectorAll('.foto, .moldura')) {
    const u = getComputedStyle(el).backgroundImage.match(/url\("?(.*?)"?\)/)?.[1];
    if (!u) continue;
    const ok = await new Promise(r => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = u; });
    if (ok) el.classList.add('tem-foto');
    else if (el.classList.contains('placeholder')) avisos.push('placeholder sem imagem ainda: ' + decodeURIComponent(u.split('/').pop()));
    else erros.push('foto não carregou: ' + u);
  }
  document.querySelectorAll('.slide').forEach((s, n) => {
    const r = s.getBoundingClientRect();
    for (const el of s.querySelectorAll('.miolo *, .topo *, .rodape *')) {
      const b = el.getBoundingClientRect();
      if (!b.width) continue;
      if (b.left < r.left - .5 || b.right > r.right + .5 || b.top < r.top - .5 || b.bottom > r.bottom + .5)
        erros.push(`slide ${n + 1}: vaza "${el.textContent.trim().slice(0, 40)}"`);
    }
    const miolo = s.querySelector('.miolo:not(.miolo--centro)'), topo = s.querySelector('.topo');
    if (miolo && topo && miolo.getBoundingClientRect().top < topo.getBoundingClientRect().bottom + 8)
      erros.push(`slide ${n + 1}: texto sobe até o logo`);
    const mold = s.querySelector('.moldura');
    if (miolo && mold && miolo.getBoundingClientRect().top < mold.getBoundingClientRect().bottom + 12)
      erros.push(`slide ${n + 1}: texto em cima da foto`);
  });
  return { erros, avisos };
}
"""


def render(pasta: Path) -> int:
    html = pasta / "carrossel.html"
    saida = pasta / "instagram"
    saida.mkdir(exist_ok=True)
    for velho in saida.glob("slide-*.png"):
        velho.unlink()
    with sync_playwright() as p:
        nav = p.chromium.launch()
        pag = nav.new_page(viewport={"width": 600, "height": 800}, device_scale_factor=2)
        pag.goto(html.as_uri(), wait_until="networkidle")
        res = pag.evaluate(CHECAGEM_JS)
        erros, avisos = res["erros"], res["avisos"]
        pag.wait_for_timeout(300)
        slides = pag.locator(".slide")
        pngs = []
        for i in range(slides.count()):
            arq = saida / f"slide-{i + 1:02d}.png"
            slides.nth(i).screenshot(path=str(arq))
            pngs.append(arq)
        nav.close()
    skill_render.prancha(pngs, pasta / "prancha.png")
    print(f"{pasta.name}: {len(pngs)} slides" + ("" if not erros else f" — {len(erros)} erro(s)"))
    for e in erros:
        print("   x", e)
    for a in avisos:
        print("   !", a)
    return len(erros)


if __name__ == "__main__":
    alvo = sys.argv[1] if len(sys.argv) > 1 else "todos"
    pastas = sorted(d for d in AQUI.iterdir() if (d / "carrossel.html").exists()) if alvo == "todos" else [Path(alvo).resolve()]
    sys.exit(1 if sum(render(d) for d in pastas) else 0)
