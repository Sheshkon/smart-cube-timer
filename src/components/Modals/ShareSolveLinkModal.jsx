import { useEffect, useState } from 'react';

import { FiCopy, FiLink, FiX } from 'react-icons/fi';
import { generateShareLink } from 'src/utils/solve-link.js';

const projectBaseUrl = import.meta.env.BASE_URL;

const ShareSolveLinkModal = ({ isOpen, onClose, solveId }) => {
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateLink = async () => {
      if (isOpen && solveId) {
        setIsLoading(true);
        setError(null);
        try {
          const encodedData = await generateShareLink(solveId);
          const fullShareLink = `${window.location.origin}${projectBaseUrl}share/${encodedData}`;
          setGeneratedLink(fullShareLink);
        } catch (err) {
          console.error('Error generating share link:', err);
          setError('Failed to generate share link');
          setGeneratedLink('');
        } finally {
          setIsLoading(false);
        }
      }
    };

    generateLink();
    setIsCopied(false);
  }, [isOpen, solveId]);

  const handleCopy = () => {
    if (!generatedLink) return;

    navigator.clipboard.writeText(generatedLink)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setError('Failed to copy to clipboard');
      });
  };

  // Функция для сокращения ссылки
  const truncateLink = (link, maxLength = 30) => {
    if (!link) return '';
    if (link.length <= maxLength) return link;

    const partLength = Math.floor((maxLength - 3) / 2);
    return `${link.substring(0, partLength)}...${link.substring(link.length - partLength)}`;
  };

  return (
    <div>
      {isOpen && (
        <dialog open className="modal">
          <div className="modal-box relative border-primary/20 rounded-lg">
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              <FiX />
            </button>

            <div className="flex flex-col items-center">
              <div className="p-3 bg-primary/10 rounded-full mb-2">
                <FiLink className="text-primary text-2xl" />
              </div>

              <h3 className="font-bold text-lg mb-4">Share your solve</h3>

              {error && (
                <div className="text-red-500 mb-4 text-sm">{error}</div>
              )}

              <div className="w-full mb-4">
                <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border">
                  <FiLink className="text-gray-500 flex-shrink-`" />
                  <div className="truncate flex-1" title={generatedLink}>
                    {isLoading ? (
                      <span className="italic text-gray-500">Generating link...</span>
                    ) : (
                      truncateLink(generatedLink)
                    )}
                  </div>
                </div>
              </div>

              <button
                className={`btn btn-primary gap-2 ${isCopied ? 'btn-success' : ''}`}
                onClick={handleCopy}
                disabled={!generatedLink || isLoading}
              >
                <FiCopy />
                {isCopied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ShareSolveLinkModal;