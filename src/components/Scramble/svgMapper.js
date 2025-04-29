import R from '../../assets/R.svg?react'
import R_ from "../../assets/R'.svg?react"
import L from '../../assets/L.svg?react'
import L_ from "../../assets/L'.svg?react"
import F from '../../assets/F.svg?react'
import F_ from "../../assets/F'.svg?react"
import D from '../../assets/D.svg?react'
import D_ from "../../assets/D'.svg?react"
import B from '../../assets/B.svg?react'
import B_ from "../../assets/B'.svg?react"
import U from '../../assets/U.svg?react'
import U_ from "../../assets/U'.svg?react"

const svgComponents = {
    "R": R,
    "R'": R_,
    "L": L,
    "L'": L_,
    "F": F,
    "F'": F_,
    "D": D,
    "D'": D_,
    "B": B,
    "B'": B_,
    "U": U,
    "U'": U_,
};

export const getMoveComponent = (move) => {
    return svgComponents[move]
};