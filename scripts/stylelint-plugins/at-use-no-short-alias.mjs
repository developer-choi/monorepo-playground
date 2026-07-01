import stylelint from 'stylelint';

const ruleName = 'monorepo-playground/at-use-no-short-alias';
const minLength = 4;

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (alias) =>
    `@use alias "${alias}"는 ${minLength}글자 이상이어야 합니다. default namespace를 사용하거나 의미 있는 이름으로 alias를 지정하세요.`,
});

const meta = {url: ''};

const rule = (primary) => (root, result) => {
  if (primary !== true) return;

  root.walkAtRules('use', (atRule) => {
    const match = atRule.params.match(/['"][^'"]+['"]\s+as\s+(\S+)/);
    if (!match) return;

    const alias = match[1];
    if (alias.length < minLength) {
      stylelint.utils.report({
        message: messages.rejected(alias),
        node: atRule,
        result,
        ruleName,
      });
    }
  });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

export default stylelint.createPlugin(ruleName, rule);
