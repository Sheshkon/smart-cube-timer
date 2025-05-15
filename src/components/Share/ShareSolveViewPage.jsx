import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import SolveInfo from 'src/components/Solve/SolveInfo.jsx';
import { parseShareLink } from 'src/utils/solve-link.js';

const ShareSolveViewPage = () => {
  const { encodedData } = useParams();
  const navigate = useNavigate();
  const [solveData, setSolveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const decodeData = () => {
      try {
        const data = parseShareLink(encodedData);

        if (!data || !data.time || !data.scramble) {
          throw new Error('Invalid solve data');
        }

        setSolveData(data);
      } catch (err) {
        console.error('Decoding error:', err);
        setError('Invalid or corrupted share link');
      } finally {
        setLoading(false);
      }
    };

    decodeData();
  }, [encodedData]);


  return (
    <SolveInfo
      solveData={solveData}
      loading={loading}
      navigate={navigate}
      error={error}
    />
  );
};


export default ShareSolveViewPage;