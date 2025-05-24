import { DownloadCloud, FileDown, FileUp, UploadCloud } from 'lucide-react';

import 'dexie-export-import';
import React, { useRef, useState } from 'react';

import { toast } from 'react-toastify';
import { GoogleAuth } from 'src/components/GoogleAuth.jsx';
import { useAuth } from 'src/contexts/AuthContext.jsx';
import db from 'src/db/db.js';
import { useSettings } from 'src/hooks/useSettings.js';

const SESSIONS_TEMPLATE_NAME = 'smart_cube_timer_solves';

const ExportImport = ({ classWrapper, onExport, onImport }) => {
  const { settingsRef } = useSettings();
  const { driveState, user } = useAuth();
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    try {
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
      // onExport();
    } catch (error) {
      setStatus(`Export failed: ${error.message}`);
      toast.error(`Export failed: ${error.message}`, { theme: settingsRef.current.theme });
    }
  };

  const handleImport = async () => {
    try {
      const file = fileInputRef.current.files[0];
      if (!file) {
        setStatus('No file selected');
        return;
      }


      setStatus('Importing...');

      await db.import(file, {
        clearTablesBeforeImport: true,
      });

      setStatus('Import completed successfully!');
      toast.info('Import completed successfully!', { theme: settingsRef.current.theme });
      fileInputRef.current.value = '';
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
      toast.info(`Import failed: ${error.message}`, { theme: settingsRef.current.theme });

    }
  };

  const exportToGoogleDrive = async () => {
    try {
      if (!driveState.accessToken) {
        throw new Error('Please authenticate with Google Drive first');
      }

      setStatus('Exporting to Google Drive...');

      // 1. Create the backup file
      const blob = await db.export({ prettyJson: false });
      const filename = `${SESSIONS_TEMPLATE_NAME}-${new Date().toISOString()}.json`;

      // 2. Upload to Google Drive
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
      toast.info(`Exported to Google Drive: ${result.name}`, { theme: settingsRef.current.theme });
      setStatus(`Exported to Google Drive: ${result.name}`);
      // onExport();
    } catch (error) {
      console.log(error);
      setStatus(`Google Drive export failed: ${error.message}`);
    }
  };

  const importFromGoogleDrive = async () => {
    try {
      if (!driveState.accessToken) {
        throw new Error('Please authenticate with Google Drive first');
      }

      setStatus('Fetching from Google Drive...');

      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?' +
        'q=mimeType="application/json"' +
        '&orderBy=createdTime desc' +
        '&fields=files(id,name,createdTime,modifiedTime)',  // Only request needed fields
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

      if (!files || files.length === 0) {
        throw new Error('No JSON files found in Google Drive');
      }

      const matchingFiles = files.filter(file =>
        file.name &&
        file.name.includes(SESSIONS_TEMPLATE_NAME),
      );

      if (matchingFiles.length === 0) {
        throw new Error(
          `No files matching "${SESSIONS_TEMPLATE_NAME}" found in Google Drive. ` +
          `Found files: ${files.map(f => f.name).join(', ') || 'none'}`,
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

      setStatus(`Successfully imported ${latestFile.name}`);
      toast.info(`Successfully imported ${latestFile.name}`);

      setStatus('Import completed successfully!');
      onImport();
    } catch (error) {
      toast.error(`Google Drive import failed: ${error.message}`, { theme: settingsRef.current.theme });
      setStatus(`Google Drive import failed: ${error.message}`);
    }
  };

  return (
    <div className={classWrapper}>
      <div className="flex items-center gap-3 mb-3">
        {user ? (
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={exportToGoogleDrive}
              className="flex items-center gap-2 hover:text-blue-500"
              title="to Google Drive"
              disabled={!driveState.accessToken}
            >
              <UploadCloud className="w-5 h-5" />
              <span>To Drive</span>
            </button>

            <button
              onClick={importFromGoogleDrive}
              className="flex items-center gap-2 hover:text-blue-500"
              title="from Google Drive"
              disabled={!driveState.accessToken}
            >
              <DownloadCloud className="w-5 h-5" />
              <span>From Drive</span>
            </button>
          </div>
        ) : (
          <GoogleAuth />
        )}
      </div>

      <div className="flex items-center gap-3 mb-3"> {/* Added margin-bottom */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 hover:text-green-500"
          title="Export data"
        >
          <FileUp className="w-5 h-5" />
          <span>Export</span>
        </button>

        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 hover:text-green-500"
            title="Import data"
          >
            <FileDown className="w-5 h-5" />
            <span>Import</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportImport;