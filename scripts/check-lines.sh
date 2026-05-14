#!/usr/bin/env bash

MAX_LINES=250
FAILED=0

while IFS= read -r file; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt "$MAX_LINES" ]; then
    echo "Too large: $file has $lines lines"
    FAILED=1
  fi
done < <(
  find . \
    -path "*/node_modules" -prune -o \
    -path "*/.next" -prune -o \
    -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -print
)

exit $FAILED
