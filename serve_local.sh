#!/usr/bin/env bash
set -e
PORT=${PORT:-8080}
echo "Starting local server at http://localhost:${PORT}/ (Ctrl+C to stop)"
python3 "$(dirname "$0")/serve_local.py"