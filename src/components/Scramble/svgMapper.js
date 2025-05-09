import B_ from 'src/assets/B\'.svg?react';
import B from 'src/assets/B.svg?react';
import D_ from 'src/assets/D\'.svg?react';
import D from 'src/assets/D.svg?react';
import F_ from 'src/assets/F\'.svg?react';
import F from 'src/assets/F.svg?react';
import L_ from 'src/assets/L\'.svg?react';
import L from 'src/assets/L.svg?react';
import R_ from 'src/assets/R\'.svg?react';
import R from 'src/assets/R.svg?react';
import U_ from 'src/assets/U\'.svg?react';
import U from 'src/assets/U.svg?react';

const svgComponents = {
  R: R,
  'R\'': R_,
  L: L,
  'L\'': L_,
  F: F,
  'F\'': F_,
  D: D,
  'D\'': D_,
  B: B,
  'B\'': B_,
  U: U,
  'U\'': U_,
};

export const getMoveComponent = (move) => svgComponents[move];
