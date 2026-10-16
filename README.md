# Lucas Tolman Portfolio

Landing page: `index.html` with the Space Invaders hero (`space-invaders-hero.js`).
SELECT STAGE opens a menu with three stages:

| Page              | What it is                                                                |
| ----------------- | ------------------------------------------------------------------------- |
| `about.html`      | Player card: dithered portrait, player data, bio                          |
| `experience.html` | Mission log (one invader per job, like the attract-mode score table), training |
| `contact.html`    | Comms menu (LinkedIn, music page), location and live Boston clock         |

The copy on the stage pages is placeholder text drafted from the old portfolio. Edit the HTML
directly; the typing effect picks up whatever is there.

## How the stage pages work

- `stage.css` and `stage.js` are shared by all three pages.
- Any element with `data-tw` types itself out when it scrolls into view. Text keeps its place
  in the layout while it types (it's transparent until reached), so nothing jumps around, and
  screen readers get all of it straight away.
  - `data-speed="human|title|slow|out|fast"` sets how fast an element's text types.
    `class="cmd"` lines get a `> ` prompt and are typed like someone at a keyboard.
  - `data-pause="300"` waits before an element appears.
  - `data-leaders` on a `<dl>` (or the comms list) pads labels with dot leaders.
- STAGE SELECT (top left) is a dropdown: the three stages plus HOME, back to the landing page.
  Esc opens and closes it; Space / Enter or a click skips the typing.
  `prefers-reduced-motion` shows everything at once.
- Sprites come from the hero script (`spriteURL(name, ink, frame)`), so the art lives in one place.
  Clicking an invader or the passing UFO scores points. The hi-score is shared with the hero.

## Changing the portrait

`assets/portrait.js` is generated from `assets/portrait-source.jpeg`:

```
python tools/make_portrait.py [photo.jpg] [--crop L T R B] [--size W H]
```

Needs Pillow and numpy. It also writes `tools/portrait-preview.png` so you can check the result.
