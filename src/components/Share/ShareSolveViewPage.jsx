import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import FullScreenModal from 'src/components/Modals/FullScreenModal.jsx';
import SolveInfo from 'src/components/Solve/SolveInfo.jsx';
import { parseShareLink } from 'src/utils/solve-link.js';

const projectBaseUrl = import.meta.env.BASE_URL;

const ShareSolveViewPage = () => {
  const { encodedData } = useParams();
  const navigate = useNavigate();
  const [solveData, setSolveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSolveInfo, setShowSolveInfo] = useState(false)

  const onClose = () => {
    setShowSolveInfo(false);
    navigate(projectBaseUrl);
  };

  useEffect(() => {
    const decodeData = () => {
      try {
        const data = parseShareLink(encodedData);

        if (!data || !data.time || !data.scramble) {
          throw new Error('Invalid solve data');
        }

        setSolveData(data);
        setShowSolveInfo(true);
      } catch (err) {
        console.error('Decoding error:', err);
        setError('Invalid or corrupted share link');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    decodeData();
  }, [encodedData]);

  if (showSolveInfo) {
    return (
      <FullScreenModal onClose={onClose}>
        <SolveInfo
          solveData={solveData}
          loading={loading}
          navigate={navigate}
          error={error}
        />
      </FullScreenModal>
    );
  }
};

export default ShareSolveViewPage;
