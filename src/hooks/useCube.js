import { useContext } from 'react';

import { CubeContext } from '../contexts/CubeContext';

export const useCube = () => useContext(CubeContext);
