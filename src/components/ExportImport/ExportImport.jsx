import { DownloadCloud, FileDown, FileUp, Loader2, UploadCloud } from 'lucide-react';

import 'dexie-export-import';
import React, { useRef, useState } from 'react';

import { toast } from 'react-toastify';
import { GoogleAuth } from 'src/components/GoogleAuth/GoogleAuth.jsx';
import { useGoogleAuth } from 'src/contexts/GoogleAuthContext.jsx';
import db from 'src/db/db.js';
import { useSettings } from 'src/hooks/useSettings.js';

const SESSIONS_TEMPLATE_NAME = 'smart_cube_timer_solves';

const ExportImport = ({ classWrapper, onImport }) => {
  const { settingsRef } = useSettings();
  const { driveState, user } = useGoogleAuth();
  const [status, setStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDriveExporting, setIsDriveExporting] = useState(false);
  const [isDriveImporting, setIsDriveImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setStatus('Exporting...');

      const blob = await db.export({
        prettyJson: false,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${SESSIONS_TEMPLATE_NAME}-${new Date().toISOString()}.json`;
      a.click();

      URL.revokeObjectURL(url);
      setStatus('Export completed successfully!');
      toast.success('Export completed successfully!', { theme: settingsRef.current.theme });
    } catch (error) {
      setStatus(`Export failed: ${error.message}`);
      toast.error(`Export failed: ${error.message}`, { theme: settingsRef.current.theme });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const file = fileInputRef.current.files[0];
      if (!file) {
        setStatus('No file selected');
        return;
      }

      setIsImporting(true);
      setStatus('Importing...');

      await db.import(file, {
        clearTablesBeforeImport: true,
      });

      setStatus('Import completed successfully!');
      toast.success('Import completed successfully!', { theme: settingsRef.current.theme });
      fileInputRef.current.value = '';
      onImport?.();
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
      toast.error(`Import failed: ${error.message}`, { theme: settingsRef.current.theme });
    } finally {
      setIsImporting(false);
    }
  };

  const exportToGoogleDrive = async () => {
    try {
      if (!driveState.accessToken) {
        throw new Error('Please authenticate with Google Drive first');
      }

      setIsDriveExporting(true);
      setStatus('Exporting to Google Drive...');

      const blob = await db.export({ prettyJson: false });
      const filename = `${SESSIONS_TEMPLATE_NAME}-${new Date().toISOString()}.json`;

      const metadata = {
        name: filename,
        mimeType: 'application/json',
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
      }));
      formData.append('file', blob, filename);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${driveState.accessToken}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Google Drive upload failed');
      }

      const result = await response.json();
      toast.success(`Exported to Google Drive: ${result.name}`, { theme: settingsRef.current.theme });
      setStatus(`Exported to Google Drive: ${result.name}`);
    } catch (error) {
      console.error(error);
      setStatus(`Google Drive export failed: ${error.message}`);
      toast.error(`Google Drive export failed: ${error.message}`, { theme: settingsRef.current.theme });
    } finally {
      setIsDriveExporting(false);
    }
  };

  const importFromGoogleDrive = async () => {
    try {
      if (!driveState.accessToken) {
        throw new Error('Please authenticate with Google Drive first');
      }

      setIsDriveImporting(true);
      setStatus('Fetching from Google Drive...');

      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?' +
        'q=mimeType="application/json"' +
        '&orderBy=createdTime desc' +
        '&fields=files(id,name,createdTime,modifiedTime)',
        {
          headers: {
            'Authorization': `Bearer ${driveState.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
          `Failed to list Google Drive files (HTTP ${response.status})`,
        );
      }

      const { files } = await response.json();
      const matchingFiles = files.filter(file =>
        file.name && file.name.includes(SESSIONS_TEMPLATE_NAME),
      );

      if (matchingFiles.length === 0) {
        throw new Error(
          `No files matching "${SESSIONS_TEMPLATE_NAME}" found in Google Drive`,
        );
      }

      const latestFile = matchingFiles[0];
      const downloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${latestFile.id}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${driveState.accessToken}`,
          },
        },
      );

      if (!downloadResponse.ok) {
        throw new Error('Failed to download file from Google Drive');
      }

      const fileBlob = await downloadResponse.blob();
      setStatus('Importing from Google Drive...');
      await db.import(fileBlob, {
        clearTablesBeforeImport: true,
      });

      toast.success(`Successfully imported ${latestFile.name}`, { theme: settingsRef.current.theme });
      setStatus('Import completed successfully!');
      onImport?.();
    } catch (error) {
      toast.error(`Google Drive import failed: ${error.message}`, { theme: settingsRef.current.theme });
      setStatus(`Google Drive import failed: ${error.message}`);
    } finally {
      setIsDriveImporting(false);
    }
  };

  return (
    <div className={classWrapper}>
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 hover:text-green-500"
          title="Export data"
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FileUp className="w-5 h-5" />
          )}
          <span>Export</span>
        </button>

        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            className="hidden"
            onChange={handleImport}
            disabled={isImporting}
          />
          <button
            onClick={() => !isImporting && fileInputRef.current.click()}
            className="flex items-center gap-2 hover:text-green-500"
            title="Import data"
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileDown className="w-5 h-5" />
            )}
            <span>Import</span>
          </button>
        </div>
      </div>

      {/*<div className="flex items-center gap-3">*/}
      {/*  {user ? (*/}
      {/*    <div className="flex items-center gap-3">*/}
      {/*      <button*/}
      {/*        onClick={exportToGoogleDrive}*/}
      {/*        className="flex items-center gap-2 hover:text-blue-500"*/}
      {/*        title="to Google Drive"*/}
      {/*        disabled={!driveState.accessToken || isDriveExporting}*/}
      {/*      >*/}
      {/*        {isDriveExporting ? (*/}
      {/*          <Loader2 className="w-5 h-5 animate-spin" />*/}
      {/*        ) : (*/}
      {/*          <UploadCloud className="w-5 h-5" />*/}
      {/*        )}*/}
      {/*        <span>To Drive</span>*/}
      {/*      </button>*/}

      {/*      <button*/}
      {/*        onClick={importFromGoogleDrive}*/}
      {/*        className="flex items-center gap-2 hover:text-blue-500"*/}
      {/*        title="from Google Drive"*/}
      {/*        disabled={!driveState.accessToken || isDriveImporting}*/}
      {/*      >*/}
      {/*        {isDriveImporting ? (*/}
      {/*          <Loader2 className="w-5 h-5 animate-spin" />*/}
      {/*        ) : (*/}
      {/*          <DownloadCloud className="w-5 h-5" />*/}
      {/*        )}*/}
      {/*        <span>From Drive</span>*/}
      {/*      </button>*/}
      {/*    </div>*/}
      {/*  ) : (*/}
      {/*    <GoogleAuth className="-ml-2" />*/}
      {/*  )}*/}
      {/*</div>*/}

      {status && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 truncate">
          {status}
        </div>
      )}
    </div>
  );
};

export default ExportImport;