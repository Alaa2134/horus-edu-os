#!/bin/bash
# HORUS OS — project backup manager. Backs up ~/HorusProjects.
# Usage: horus-backup create | list | restore <file.tar.gz>
set -uo pipefail

GOLD='\033[38;2;201;162;39m'; CYAN='\033[38;2;0;212;255m'; NC='\033[0m'
SRC="$HOME/HorusProjects"
DEST="$HOME/HorusBackups"

case "${1:-help}" in
  create)
    [[ -d "$SRC" ]] || { echo "No ~/HorusProjects yet — make a project first."; exit 1; }
    mkdir -p "$DEST"
    ts=$(date +%Y%m%d-%H%M%S)
    out="$DEST/horus-projects-$ts.tar.gz"
    tar czf "$out" -C "$HOME" HorusProjects && \
      echo -e "${GOLD}Backup created:${NC} $out  ($(du -h "$out" | cut -f1))"
    ;;
  list)
    echo -e "${GOLD}Backups in $DEST:${NC}"
    ls -1t "$DEST"/*.tar.gz 2>/dev/null || echo "  (none yet — run: horus-backup create)"
    ;;
  restore)
    f="${2:-}"
    [[ -f "$f" ]] || { echo "Usage: horus-backup restore <file.tar.gz>"; exit 1; }
    tar xzf "$f" -C "$HOME" && echo -e "${CYAN}Restored from:${NC} $f"
    ;;
  *)
    echo -e "${GOLD}HORUS Backup${NC}"
    echo "  horus-backup create            Back up ~/HorusProjects"
    echo "  horus-backup list              List backups"
    echo "  horus-backup restore <file>    Restore a backup"
    ;;
esac
