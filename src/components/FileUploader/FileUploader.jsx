import { useState } from 'react';

import { useAuth } from 'src/contexts/AuthContext.jsx';

const FileUploader = () => {
  const { user, setAuthState, driveState, setDriveState } = useAuth();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const uploadToDrive = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      let driveToken = driveState.accessToken;
      if (!driveToken) {
        throw new Error('Not authenticated');
      }

      const metadata = {
        name: fileName,
        mimeType: file.type || 'application/octet-stream',
        fields: 'id,name,webViewLink',
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
      }));
      formData.append('file', file);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${driveToken}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
      }

      // console.log(stateRef.current);

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return await response.json();

    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUploading(true);
    setError(null);

    try {
      const uploadResult = await uploadToDrive(
        file,
        fileName || file.name,
      );
      setResult(uploadResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Custom Filename (optional)
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Leave blank to use original filename"
          />
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className={`w-full py-2 px-4 rounded text-white font-medium ${
            uploading || !file ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload to Google Drive'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-100 rounded">
          <p className="font-medium">Upload successful!</p>
          <p>File ID: {result.id}</p>
          {result.webViewLink && (
            <a
              href={result.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View in Google Drive
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;