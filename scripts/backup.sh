#!/usr/bin/env bash
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Backing up database to $BACKUP_DIR..."
