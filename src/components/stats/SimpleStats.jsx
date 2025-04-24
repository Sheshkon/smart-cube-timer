import {useCubeState} from "../../contexts/CubeContext.jsx";
import React, {useEffect, useState} from "react";
// import {getAvg} from "src/component/stats/util.js";


const getResults = () => {
    const data = localStorage.getItem("session");
    return data ? JSON.parse(data) : [];
};


const SimpleStats = () => {
    const {
        results,
        setResults,
        connection
    } = useCubeState()

    const [popupContent, setPopupContent] = useState(null);

    const handleCellClick = (content) => {
        setPopupContent(content);
    };
    const handleClosePopup = () => {
        setPopupContent(null);
    };

    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (textToCopy) => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Hide "Copied" after 2 seconds
        });
    };

    useEffect(() => {
        setResults(getResults())
    }, []);

    useEffect(() => {
        localStorage.setItem("session", JSON.stringify(results));
    }, [results])

    return (
        // <> {connection &&
          <div style={{backgroundColor: 'white'}}>

              {results.map((entry, index) => {
                  {console.log(entry.time)}
                  <p>{entry.time}</p>
              }).time}
          </div>


        // </>
    )
}

export default SimpleStats;

//     <div className="stats-container">
//         <table>
//             <thead>
//             <tr>
//                 <th></th>
//                 <th>Time</th>
//                 <th>Avg5</th>
//                 <th>Avg12</th>
//             </tr>
//             </thead>
//             <tbody id="sessionTableBody" className="scrollbox">
//             {results.map((entry, index) => (<tr key={index}>
//                 <td>{results.length - index}.</td>
//                 <td onClick={() => handleCellClick(entry)}>{entry.time}</td>
//                 <td>{getAvg(results.slice(index, index+5), 5)}</td>
//                 <td>{getAvg(results.slice(index, index+12), 12)}</td>
//             </tr>))}
//             </tbody>
//         </table>
//         {popupContent && (<div className="popup">
//             <div className="popup-content" onClick={() => handleCopy(popupContent?.dir)}>
//                 <span className="close" onClick={handleClosePopup}>&times;</span>
//                 <p>
//                     <b>Time: </b><i>{popupContent.time}</i>
//                     {isCopied && <span className="copied-message">Copied!</span>}
//                 </p>
//                 <p>
//                     <b>Scramble: </b><i>{popupContent?.scramble}</i>
//                 </p>
//                 <p><b>Solution: </b> <i>{popupContent?.solution}</i></p>
//             </div>
//         </div>)}
//     </div>
// }