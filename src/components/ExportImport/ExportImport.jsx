import { FileDown, FileUp } from 'lucide-react';

import 'dexie-export-import';
import React, { useRef, useState } from 'react';

import db from 'src/db/db.js';

const ExportImport = ({ classWrapper, onExport, onImport }) => {
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
      a.download = `sessions-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();

      URL.revokeObjectURL(url);
      setStatus('Export completed successfully!');
      onExport();
    } catch (error) {
      setStatus(`Export failed: ${error.message}`);
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
      fileInputRef.current.value = '';
      onImport();
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
    }
  };

  return (
    <div className={classWrapper}>
      <div className="flex items-center gap-3">
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