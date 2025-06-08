import React, { useState, useEffect } from 'react';


import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ExternalLink, Plus, Share2, Trash2 } from 'lucide-react';
import ExportImport from 'src/components/ExportImport/ExportImport.jsx';
import AddModal from 'src/components/Modals/AddModal.jsx';
import DeleteSessionModal from 'src/components/Modals/DeleteSessionModal.jsx';
import DeleteSolveModal from 'src/components/Modals/DeleteSolveModal.jsx';
import FullScreenModal from 'src/components/Modals/FullScreenModal.jsx';
import ShareSolveLinkModal from 'src/components/Modals/ShareSolveLinkModal.jsx';
import SolveInfo from 'src/components/Solve/SolveInfo.jsx';
import { formatSolveData } from 'src/components/StatsDisplay/util';
import { sessionService } from 'src/db/sessionService.js';
import { useSettings } from 'src/hooks/useSettings.js';

function defineTimeColor(stats, item) {
  if(stats?.best?.time === item?.time)  return 'text-green-500';
  if(stats?.worst?.time === item?.time) return 'text-red-500';
  return '';
}

const TimesTable = ({
                      stats,
                      onImport,
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

  const [showSolveInfo, setShowSolveInfo] = useState(false);
  const [solveData, setSolveData] = useState({});
  const [actionSolveId, setActionSolveId] = useState(-1);

  const [currentPage, setCurrentPage] = useState(1);

  const sortedTimes = [...times].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const totalPages = Math.max(1, Math.ceil(sortedTimes.length / settings.solvesPerPage));
  const indexOfLastItemOnPage = currentPage * settings.solvesPerPage;
  const indexOfFirstItemOnPage = indexOfLastItemOnPage - settings.solvesPerPage;
  const currentItems = sortedTimes.slice(indexOfFirstItemOnPage, indexOfLastItemOnPage);

  useEffect(() => {
    const newTotalPages = Math.max(1, Math.ceil(times.length / settings.solvesPerPage));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    } else if (times.length > 0 && currentPage < 1) {
      setCurrentPage(1);
    } else if (times.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [times.length, currentPage]);


  const formatDate = (date) =>
    new Date(date).toLocaleDateString() +
    ' ' +
    new Date(date).toLocaleTimeString();

  const handleCellClick = async (id) => {
    try {
      const data = await sessionService.getSolveWithReconstructionBySolveId(id);
      setSolveData(data);
      setShowSolveInfo(true);
    } catch (error) {
      console.error('Error fetching solve details:', error);
    }
  };

  const handleClosePopup = () => {
    setPopupContent(null);
  };

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    });
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 1) return [];

    const delta = 1;
    const pageNumbers = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        if (l !== undefined) {
          if (i - l === 2) {
            pageNumbers.push(l + 1);
          } else if (i - l > 1) {
            pageNumbers.push('...');
          }
        }
        pageNumbers.push(i);
        l = i;
      }
    }
    return pageNumbers;
  };

  return (
    <>
      {showSolveInfo ? (
        <FullScreenModal>
          <SolveInfo
            solveData={solveData}
            onClose={() => setShowSolveInfo(false)}
          />
        </FullScreenModal>
      ) : (
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}
        >
          <ExportImport
            classWrapper={'pb-4'}
            onImport={onImport}
          />
          <div className="flex mb-4">
            <h3 className="text-2xl font-medium text-gray-900 dark:text-white">
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
                className="select select-xs h-8 w-32 ml-2 mt-1 border-0 focus:outline-none"
                onChange={(e) => {
                  updateSetting('selectedSessionId', e.target.value);
                  setCurrentPage(1); // Reset to first page on session change
                }}
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>

              <div className="text-sm">
                <button
                  onClick={() => setIsAddSessionModelOpen(true)}
                  className="p-1 rounded hover:text-green-500 dark:hover:text-red-400 transition-colors"
                  title="Add session"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="text-sm">
                <button
                  onClick={() => setIsDeleteSessionModelOpen(true)}
                  className="p-1 rounded hover:text-red-500"
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
                {/* Use currentItems for display, and calculate original index for numbering */}
                {currentItems.map((item, indexOnPage) => {
                  // Calculate the original index in the full sortedTimes list
                  // const originalIndexInSortedTimes = indexOfFirstItemOnPage + indexOnPage;
                  // Numbering: newest solve is total_solves, oldest is 1
                  const solveNumber = sortedTimes.length - (indexOfFirstItemOnPage + indexOnPage);
                  return (
                    <tr
                      key={item.id}
                      className={`
                          border-t border-gray-100 dark:border-gray-700
                          ${(indexOfFirstItemOnPage + indexOnPage) % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}
                          hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                        `}
                    >
                      <td
                        className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {solveNumber}
                      </td>
                      <td
                        onClick={async () => {
                          setActionSolveId(item.id);
                          await handleCellClick(item.id);
                        }}
                        className={
                          `px-4 py-3 cursor-pointer font-mono font-medium ${(defineTimeColor(stats, item))}`
                        }
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
                          className="p-1 rounded hover:text-red-500"
                          title="Delete time"
                        >
                          <Trash2 size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setSharedLinkModalOpen(true);
                            setActionSolveId(item.id);
                          }}
                          className="p-1 rounded hover:text-blue-500"
                          title="Share time"
                        >
                          <Share2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-4 py-2 text-gray-700 dark:text-gray-300">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="border rounded text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FirstPageIcon/>
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border rounded text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <NavigateBeforeIcon/>
                  </button>
                  {getPageNumbers().map((page, index) =>
                    typeof page === 'number' ? (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-2 sm:px-1 border rounded text-xs sm:text-sm ${
                          currentPage === page
                            ? 'bg-green-800 text-white dark:bg-green-600'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 sm:px-2 py-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {page}
                        </span>
                    ),
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border rounded text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <NavigateNextIcon />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="border rounded text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LastPageIcon/>
                  </button>
                </div>
              )}

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
                  <div className="modal-box relative">
                    <button
                      className="absolute top-5 right-4"
                      onClick={() => {
                        setShowSolveInfo(true);
                        handleClosePopup();
                      }}
                    >
                      <ExternalLink />
                    </button>

                    <textarea
                      defaultValue={formatSolveData(popupContent)}
                      onClick={() => handleCopy(formatSolveData(popupContent))}
                      className="w-full h-full bg-transparent focus:border-0 focus:outline-none focus:ring-0"
                      name="Text1" cols="10" rows={formatSolveData(popupContent).split('\n').length}
                      readOnly={true}
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
      )}
    </>
  );
};

export default TimesTable;
