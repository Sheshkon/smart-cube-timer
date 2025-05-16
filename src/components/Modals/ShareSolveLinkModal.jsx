import { useEffect, useRef, useState } from 'react';

import QRCode from 'qrcode';
import { FiCopy, FiLink, FiX, FiDownload } from 'react-icons/fi';
import { MdOutlineQrCode2 } from 'react-icons/md';
import { generateShareLink } from 'src/utils/solve-link.js';

const ShareSolveLinkModal = ({ isOpen, onClose, solveId }) => {
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isCopiedQR, setIsCopiedQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const qrCodeRef = useRef(null);

  useEffect(() => {
    const generateLink = async () => {
      if (isOpen && solveId) {
        setIsLoading(true);
        setError(null);
        const relativeLink = await generateShareLink(solveId);
        const fullShareLink = `${window.location.origin}${relativeLink}`;
        try {
          setGeneratedLink(fullShareLink);

          const qrCode = await QRCode.toDataURL(fullShareLink, {
            errorCorrectionLevel: 'M',
            width: 900,
            margin: 2
          });
          setQrCodeDataUrl(qrCode);
        } catch (err) {
          console.error('Error generating share link:', err);
          setError('Failed to generate share QR Code');
          setGeneratedLink(fullShareLink);
          setQrCodeDataUrl('');
        } finally {
          setIsLoading(false);
        }
      }
    };

    generateLink();
    setIsCopiedLink(false);
  }, [isOpen, solveId]);

  const handleCopy = () => {
    if (!generatedLink) return;

    navigator.clipboard.writeText(generatedLink)
      .then(() => {
        setIsCopiedLink(true);
        setTimeout(() => setIsCopiedLink(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setError('Failed to copy to clipboard');
      });
  };

  const handleCopyQrCode = async () => {
    try {
      if (!qrCodeDataUrl) return;

      const canvas = await QRCode.toCanvas(generatedLink, {
        errorCorrectionLevel: 'M',
        width: 200
      });

      canvas.toBlob(async (blob) => {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setIsCopiedQR(true);
        setTimeout(() => setIsCopiedQR(false), 2000);
      });
    } catch (err) {
      console.error('Failed to copy QR code:', err);
      setError('Failed to copy QR code');
    }
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `cube-solve-${solveId}.png`;
    link.click();
  };

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
          <div className="modal-box relative rounded-lg max-w-md">
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
                  <FiLink className="text-gray-500 flex-shrink-0" />
                  <div className="truncate flex-1" title={generatedLink}>
                    {isLoading ? (
                      <span className="italic text-gray-500">Generating link...</span>
                    ) : (
                      truncateLink(generatedLink)
                    )}
                  </div>
                </div>
              </div>

              {/* QR Code Display */}
              {qrCodeDataUrl && (
                <div className="mb-6 flex flex-col items-center">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code for sharing"
                    className=" border border-gray-200 rounded-lg p-2 bg-white"
                    ref={qrCodeRef}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      className={`btn btn-sm gap-1 ${isCopiedQR ? 'btn-success' : 'btn-outline'}`}
                      onClick={handleCopyQrCode}
                    >
                      <MdOutlineQrCode2 size={16} />
                      {isCopiedQR ? 'Copied!' : 'Copy QR'}
                    </button>
                    <button
                      className="btn btn-sm btn-outline gap-1"
                      onClick={handleDownloadQrCode}
                    >
                      <FiDownload size={16} />
                      Download
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  className={`btn btn-primary gap-2 ${isCopiedLink ? 'btn-success' : ''}`}
                  onClick={handleCopy}
                  disabled={!generatedLink || isLoading}
                >
                  <FiCopy />
                  {isCopiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ShareSolveLinkModal;