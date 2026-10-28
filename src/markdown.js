import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt({ html: false, linkify: true, breaks: false });
const linkOpen = parser.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

parser.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  let href = tokens[idx].attrGet('href') || '';
  if (!/^(https?:\/\/|#|\.\.?\/)/i.test(href)) return '';
  if (/^\.\.?\//.test(href)) {
    href = new URL(href, 'https://github.com/eternity4719/HowToLiveBetter/blob/main/book/').href;
    tokens[idx].attrSet('href', href);
  }
  tokens[idx].attrSet('target', '_blank');
  tokens[idx].attrSet('rel', 'noopener noreferrer');
  return linkOpen(tokens, idx, options, env, self);
};

export function renderMarkdown(source) {
  return parser.render((source || '').replace(/<!--[^]*?-->/g, ''));
}
