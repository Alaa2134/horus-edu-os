#!/usr/bin/env python3
"""
HORUS Browser — the native web browser for HORUS OS.

A lightweight, tabbed browser built on GTK3 + WebKit2GTK, themed in the
HORUS cyber-Egyptian dark identity (gold on deep black). It doubles as the
app shell for HORUS web apps via `--app=URL` (chromeless single window).

Usage:
    horus-browser [URL]
    horus-browser --app=http://127.0.0.1:8420   # chromeless app window
    horus-browser --app=URL --title="Name"

Dependencies (installed by the OS image):
    python3-gi  gir1.2-gtk-3.0  gir1.2-webkit2-4.1 (or 4.0)
"""
from __future__ import annotations

import sys
import os
from pathlib import Path
from urllib.parse import quote, urlparse

import gi

gi.require_version("Gtk", "3.0")
# WebKit2GTK ships as 4.1 on newer Ubuntu, 4.0 on older — accept either.
try:
    gi.require_version("WebKit2", "4.1")
except ValueError:
    gi.require_version("WebKit2", "4.0")
from gi.repository import Gtk, Gdk, GLib, WebKit2  # noqa: E402

# ── Branding ────────────────────────────────────────────────────────────
GOLD = "#c9a227"
START_PAGE = f"file://{Path(__file__).parent / 'start.html'}"
SEARCH = "https://duckduckgo.com/?q={}"

CSS = b"""
window, .horus-toolbar { background-color: #0a0a0f; }
.horus-toolbar { border-bottom: 1px solid rgba(201,162,39,0.25); padding: 4px 6px; }
entry {
  background: #12121a; color: #e8e8f0; border: 1px solid rgba(201,162,39,0.30);
  border-radius: 9999px; padding: 6px 14px; caret-color: #00d4ff;
}
entry:focus { border-color: #c9a227; }
button {
  background: transparent; color: #c9a227; border: none;
  border-radius: 8px; padding: 4px 8px; margin: 0 1px;
}
button:hover { background: rgba(201,162,39,0.14); }
notebook header { background: #0a0a0f; border: none; }
notebook tab {
  background: #12121a; color: #aaaacc; padding: 4px 8px;
  border: 1px solid rgba(201,162,39,0.12);
}
notebook tab:checked { background: #1a1a27; color: #f5d060; border-color: rgba(201,162,39,0.4); }
"""


def normalise(text: str) -> str:
    """Turn raw address-bar text into a URL: navigate or search."""
    text = text.strip()
    if not text:
        return START_PAGE
    if text in ("horus:start", "about:home", "home"):
        return START_PAGE
    if text.startswith(("http://", "https://", "file://", "about:")):
        return text
    # Looks like a domain (has a dot, no spaces) → prepend https
    if " " not in text and "." in text and not text.startswith("."):
        return "https://" + text
    return SEARCH.format(quote(text))


class Tab(Gtk.Box):
    def __init__(self, browser: "HorusBrowser", url: str):
        super().__init__(orientation=Gtk.Orientation.VERTICAL)
        self.browser = browser
        self.webview = WebKit2.WebView()
        settings = self.webview.get_settings()
        settings.set_enable_developer_extras(True)
        settings.set_enable_smooth_scrolling(True)
        try:
            settings.set_user_agent_with_application_details("HORUS-Browser", "1.0")
        except Exception:
            pass
        self.webview.connect("notify::title", self._on_title)
        self.webview.connect("notify::uri", self._on_uri)
        self.webview.connect("load-changed", self._on_load)
        self.pack_start(self.webview, True, True, 0)
        self.show_all()
        self.webview.load_uri(url)

    def _on_title(self, *_):
        title = self.webview.get_title() or "HORUS"
        self.browser.set_tab_title(self, title)

    def _on_uri(self, *_):
        if self.browser.current_tab() is self:
            self.browser.address.set_text(self.webview.get_uri() or "")

    def _on_load(self, _wv, event):
        if self.browser.current_tab() is self:
            loading = event != WebKit2.LoadEvent.FINISHED
            self.browser.reload_btn.set_label("✕" if loading else "⟳")


class HorusBrowser(Gtk.Window):
    def __init__(self, start_url: str, app_mode: bool = False, app_title: str = "HORUS Browser"):
        super().__init__(title=app_title)
        self.set_default_size(1280, 820)
        self.set_icon_name("web-browser")
        self.app_mode = app_mode

        screen = Gdk.Screen.get_default()
        provider = Gtk.CssProvider()
        provider.load_from_data(CSS)
        Gtk.StyleContext.add_provider_for_screen(
            screen, provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
        )

        root = Gtk.Box(orientation=Gtk.Orientation.VERTICAL)
        self.add(root)

        if app_mode:
            # Chromeless: a single WebView, no chrome — used as the HORUS app shell.
            self.notebook = None
            self.address = Gtk.Entry()  # unused but referenced by Tab
            self.reload_btn = Gtk.Button()
            view = WebKit2.WebView()
            view.load_uri(start_url)
            view.connect("notify::title", lambda *_: self.set_title(view.get_title() or app_title))
            root.pack_start(view, True, True, 0)
        else:
            root.pack_start(self._build_toolbar(), False, False, 0)
            self.notebook = Gtk.Notebook()
            self.notebook.set_scrollable(True)
            self.notebook.connect("switch-page", self._on_switch)
            root.pack_start(self.notebook, True, True, 0)
            self.new_tab(start_url)

        self._install_shortcuts()
        self.connect("destroy", Gtk.main_quit)
        self.show_all()

    # ── UI construction ──────────────────────────────────────────────
    def _build_toolbar(self) -> Gtk.Box:
        bar = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=2)
        bar.get_style_context().add_class("horus-toolbar")

        def btn(label, cb, tooltip=""):
            b = Gtk.Button(label=label)
            b.set_tooltip_text(tooltip)
            b.connect("clicked", cb)
            bar.pack_start(b, False, False, 0)
            return b

        btn("‹", lambda _: self._nav("back"), "Back")
        btn("›", lambda _: self._nav("forward"), "Forward")
        self.reload_btn = btn("⟳", lambda _: self._nav("reload"), "Reload")
        btn("⌂", lambda _: self.load(START_PAGE), "Home")

        self.address = Gtk.Entry()
        self.address.set_placeholder_text("Search the web or enter an address — HORUS Browser")
        self.address.connect("activate", self._on_address)
        bar.pack_start(self.address, True, True, 6)

        btn("+", lambda _: self.new_tab(START_PAGE), "New tab")
        return bar

    # ── Tab management ───────────────────────────────────────────────
    def new_tab(self, url: str):
        tab = Tab(self, url)
        label = self._tab_label(tab, "New Tab")
        idx = self.notebook.append_page(tab, label)
        self.notebook.set_tab_reorderable(tab, True)
        self.notebook.show_all()
        self.notebook.set_current_page(idx)
        self.address.grab_focus()

    def _tab_label(self, tab: Tab, text: str) -> Gtk.Box:
        box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=4)
        lbl = Gtk.Label(label=text)
        lbl.set_ellipsize(3)  # PANGO_ELLIPSIZE_END
        lbl.set_max_width_chars(18)
        close = Gtk.Button(label="×")
        close.set_relief(Gtk.ReliefStyle.NONE)
        close.connect("clicked", lambda _b: self.close_tab(tab))
        box.pack_start(lbl, True, True, 0)
        box.pack_start(close, False, False, 0)
        box.show_all()
        tab._label = lbl
        return box

    def set_tab_title(self, tab: Tab, title: str):
        if getattr(tab, "_label", None):
            tab._label.set_text(title)
        if self.current_tab() is tab:
            self.set_title(f"{title} — HORUS Browser")

    def close_tab(self, tab: Tab):
        idx = self.notebook.page_num(tab)
        if idx != -1:
            self.notebook.remove_page(idx)
        if self.notebook.get_n_pages() == 0:
            Gtk.main_quit()

    def current_tab(self) -> Tab | None:
        if not self.notebook:
            return None
        idx = self.notebook.get_current_page()
        return self.notebook.get_nth_page(idx) if idx != -1 else None

    def _on_switch(self, _nb, page, _num):
        if isinstance(page, Tab):
            self.address.set_text(page.webview.get_uri() or "")

    # ── Navigation ───────────────────────────────────────────────────
    def _on_address(self, entry: Gtk.Entry):
        self.load(normalise(entry.get_text()))

    def load(self, url: str):
        tab = self.current_tab()
        if tab:
            tab.webview.load_uri(url)

    def _nav(self, action: str):
        tab = self.current_tab()
        if not tab:
            return
        wv = tab.webview
        if action == "back" and wv.can_go_back():
            wv.go_back()
        elif action == "forward" and wv.can_go_forward():
            wv.go_forward()
        elif action == "reload":
            wv.reload()

    # ── Shortcuts ────────────────────────────────────────────────────
    def _install_shortcuts(self):
        accel = Gtk.AccelGroup()
        self.add_accel_group(accel)

        def bind(key, mods, cb):
            accel.connect(Gdk.keyval_from_name(key), mods, 0, lambda *_: cb() or True)

        if not self.app_mode:
            bind("t", Gdk.ModifierType.CONTROL_MASK, lambda: self.new_tab(START_PAGE))
            bind("w", Gdk.ModifierType.CONTROL_MASK, lambda: self.close_tab(self.current_tab()))
            bind("l", Gdk.ModifierType.CONTROL_MASK, lambda: self.address.grab_focus())
            bind("r", Gdk.ModifierType.CONTROL_MASK, lambda: self._nav("reload"))
        bind("q", Gdk.ModifierType.CONTROL_MASK, Gtk.main_quit)


def main(argv: list[str]):
    start_url = START_PAGE
    app_mode = False
    app_title = "HORUS Browser"

    for arg in argv[1:]:
        if arg.startswith("--app="):
            app_mode = True
            start_url = arg.split("=", 1)[1]
        elif arg.startswith("--title="):
            app_title = arg.split("=", 1)[1]
        elif not arg.startswith("--"):
            start_url = normalise(arg)

    HorusBrowser(start_url, app_mode=app_mode, app_title=app_title)
    Gtk.main()


if __name__ == "__main__":
    main(sys.argv)
