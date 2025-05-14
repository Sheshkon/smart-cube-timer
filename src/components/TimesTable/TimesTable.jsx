import React, { useState } from 'react';

import { Plus, Trash2, Share2 } from 'lucide-react';
import AddModal from 'src/components/Modals/AddModal.jsx';
import DeleteSessionModal from 'src/components/Modals/DeleteSessionModal.jsx';
import DeleteSolveModal from 'src/components/Modals/DeleteSolveModal.jsx';
import ShareSolveLinkModal from 'src/components/Modals/ShareSolveLinkModal.jsx';
import { formatSolveData } from 'src/components/StatsDisplay/util';
import { sessionService } from 'src/db/sessionService.js';
import { useSettings } from 'src/hooks/useSettings.js';

const TimesTable = ({
                      sessions,
                      onDeleteTimes,
                      onDeleteSession,
                      onAddSession,
                      times,
                      onDeleteTime,
                      className = '',
                    }) => {
  const { settings, updateSetting } = useSettings();

  const [popupContent, setPopupContent] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const [isDeleteSessionModelOpen, setIsDeleteSessionModelOpen] = useState(false);
  const [isAddSessionModelOpen, setIsAddSessionModelOpen] = useState(false);

  const [isDeleteSolveModalOpen, setDeleteSolveModalOpen] = useState(false);

  const [isShareLinkModalOpen, setSharedLinkModalOpen] = useState(false);


  const [actionSolveId, setActionSolveId] = useState(-1);

  const sortedTimes = [...times].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const formatDate = (date) =>
    new Date(date).toLocaleDateString() +
    ' ' +
    new Date(date).toLocaleTimeString();

  const handleCellClick = async (id) => {
    const data = await sessionService.getSolveWithReconstructionBySolveId(id);
    setPopupContent(data);
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
          <DeleteSessionModal
            isOpen={isDeleteSessionModelOpen}
            onClose={() => setIsDeleteSessionModelOpen(false)}
            onDeleteSolves={() => onDeleteTimes(settings?.selectedSessionId)}
            onDeleteSession={() => onDeleteSession(settings?.selectedSessionId)}
          />

          <AddModal
            isOpen={isAddSessionModelOpen}
            onClose={() => setIsAddSessionModelOpen(false)}
            onAddSession={(name) => onAddSession(name)}
          />

          <select
            value={settings?.selectedSessionId}
            className="select select-xs w-32 ml-2"
            onChange={(e) => updateSetting('selectedSessionId', e.target.value)}
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}

          </select>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={() => setIsAddSessionModelOpen(true)}
              className="p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Add session"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={() => setIsDeleteSessionModelOpen(true)}
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
              <>
                <tr
                  key={item.index}
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
                    onClick={() => handleCellClick(item.id)}
                    className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white"
                  >
                    {item.time}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {formatDate(new Date(item.date))}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setDeleteSolveModalOpen(true);
                        setActionSolveId(item.id);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Delete time"
                    >
                      <Trash2 size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setSharedLinkModalOpen(true);
                        setActionSolveId(item.id);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Delete time"
                    >
                      <Share2 size={16} />
                    </button>
                  </td>
                </tr>
              </>
            ))}
            </tbody>
          </table>

          <ShareSolveLinkModal
            isOpen={isShareLinkModalOpen}
            onClose={() => setSharedLinkModalOpen(false)}
            solveId={actionSolveId}
          />

          <DeleteSolveModal
            isOpen={isDeleteSolveModalOpen}
            onClose={() => setDeleteSolveModalOpen(false)}
            onDeleteSolve={() => onDeleteTime(actionSolveId)}
          />

          {popupContent && (
            <dialog open className="modal">
              <div className="modal-box">

                <textarea
                  defaultValue={formatSolveData(popupContent)}
                  onClick={() => handleCopy(formatSolveData(popupContent))}
                  className="w-full h-full"
                  name="Text1" cols="10" rows={formatSolveData(popupContent).split('\n').length}
                />

                {isCopied && (
                  <div className="absolute center flex right-4">
                      <span className="copied-message text-green-800">
                        Copied!
                      </span>
                  </div>
                )}
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
