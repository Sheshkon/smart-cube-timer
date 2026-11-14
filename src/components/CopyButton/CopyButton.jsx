import { useState } from 'react';

import { Check, Copy } from 'lucide-react';
import PropTypes from 'prop-types';
import { copyTextToClipboard } from 'src/utils/copy-to-clipboard.js';

const COPY_FEEDBACK_MS = 1500;

export default function CopyButton({ text, ariaLabel = 'Copy to clipboard', className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyTextToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      type='button'
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : ariaLabel}
      title={copied ? 'Copied!' : 'Copy'}
      className={`app-btn inline-flex shrink-0 items-center justify-center rounded p-1 ${className}`}
    >
      {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
    </button>
  );
}

CopyButton.propTypes = {
  text: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
};
