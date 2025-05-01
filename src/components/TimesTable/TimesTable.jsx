import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import DeleteModal from 'src/components/Modals/DeleteModal';
import { formatSolveData } from 'src/components/StatsDisplay/util';

const TimesTable = ({ onDeleteTimes, times, onDeleteTime, className = '' }) => {
  const [popupContent, setPopupContent] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const sortedTimes = [...times].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const formatDate = (date) =>
    new Date(date).toLocaleDateString() +
    ' ' +
    new Date(date).toLocaleTimeString();

  const handleCellClick = (content) => {
    setPopupContent(content);
  };
  const handleClosePopup = () => {
    setPopupContent(null);
  };

  const handleCopy = (textToCopy) => {
    // const textToCopy = JSON.stringify(textToCopy)

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    });
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}
    >
      <div className="flex mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Session
        </h3>
        <div className="flex items-center">
          <DeleteModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onDelete={() => onDeleteTimes()}
          />

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={openModal}
              className="p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Delete all times"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {times.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No solves recorded yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 text-left">
              <th className="px-4 py-2 rounded-tl-md dark:text-white">#</th>
              <th className="px-4 py-2 dark:text-white">Time</th>
              <th className="px-4 py-2 dark:text-white">When</th>
              <th className="px-4 py-2 rounded-tr-md dark:text-white">
                Actions
              </th>
            </tr>
            </thead>
            <tbody>
            {sortedTimes.map((item, index) => (
              <tr
                key={item.id}
                className={`
                    border-t border-gray-100 dark:border-gray-700
                    ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}
                    hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                  `}
              >
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {sortedTimes.length - index}
                </td>
                <td
                  onClick={() => handleCellClick(item)}
                  className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white"
                >
                  {item.formattedTime}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {formatDate(item.date)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDeleteTime(item.id)}
                    className="p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Delete time"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
          {popupContent && (
            <dialog open className="modal">
              <div className="modal-box">
                <div onClick={() => handleCopy(formatSolveData(popupContent))}>
                  <div className="flex justify-between items-center gap-16">
                    <b>
                      <label htmlFor="Time">Time:</label>
                    </b>
                    <input
                      id="time"
                      type="text"
                      readOnly
                      value={popupContent.formattedTime}
                      className="bg-gray-200 dark:bg-gray-900 p-1 rounded flex-1 w-full"
                    />
                  </div>
                  <div className="flex justify-between gap-8">
                    <b>
                      <label htmlFor="Scramble">Scramble:</label>
                    </b>
                    <input
                      id="time"
                      type="text"
                      readOnly
                      value={popupContent?.scramble}
                      className="bg-gray-100 dark:bg-gray-800 p-1 rounded flex-1 w-full"
                    />
                  </div>
                  <div className="flex justify-between gap-16">
                    <b>
                      <label className="x" htmlFor="date">
                        Date:
                      </label>
                    </b>
                    <input
                      id="time"
                      type="text"
                      readOnly
                      value={popupContent?.date}
                      className="bg-gray-200 dark:bg-gray-900 p-1 rounded flex-1 w-full"
                    />
                  </div>
                  <div className="flex justify-between gap-1">
                    <b>
                      <label htmlFor="Moves count">Moves count:</label>
                    </b>
                    <input
                      id="time"
                      type="text"
                      readOnly
                      value={popupContent?.solution?.split(' ')?.length}
                      className="bg-gray-100 dark:bg-gray-800 p-1 rounded flex-1 w-full"
                    />
                  </div>
                  <div className="flex justify-between gap-9">
                    <b>
                      <label htmlFor="Solution">Solution: </label>
                    </b>
                    <input
                      id="time"
                      type="text"
                      readOnly
                      value={popupContent?.solution}
                      className="bg-gray-200 dark:bg-gray-900 p-1 rounded flex-1"
                    />
                  </div>
                  {isCopied && (
                    <div className="absolute center flex right-4">
                      <span className="copied-message text-green-800">
                        Copied!
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button onClick={handleClosePopup}>Close</button>
              </form>
            </dialog>
          )}
        </div>
      )}
    </div>
  );
};

export default TimesTable;
