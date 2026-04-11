#!/usr/bin/env bash
# staged된 SCSS 파일에 file-level stylelint-disable이 있으면 커밋을 차단한다.
# 개발자는 file-level disable을 제거하고 per-line disable로 전환해야 한다.

EXIT_CODE=0

# 최초 도입 커밋 시 STYLELINT_INIT=1로 스킵
if [ "$STYLELINT_INIT" = "1" ]; then exit 0; fi

for file in $(git diff --cached --name-only --diff-filter=ACM -- '*.scss'); do
  if head -5 "$file" | grep -q 'stylelint-disable '; then
    echo "❌ $file"
    echo "   file-level stylelint-disable 감지. 제거 후 per-line disable로 전환하세요."
    echo ""
    EXIT_CODE=1
  fi
done

if [ $EXIT_CODE -ne 0 ]; then
  echo "커밋 차단: file-level disable을 per-line disable로 전환한 뒤 다시 시도하세요."
fi

exit $EXIT_CODE
