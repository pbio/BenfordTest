import logo from "./logo.svg";
import "./App.css";
import React from "react";
//import Histogram from "./Histogram";

function App() {
  const [observedCount, setObservedCount] = React.useState();
  const [expectedCount, setExpectedCount] = React.useState();
  const [passesBenford, setPassesBenford] = React.useState(false);
  const [analysisStatus, setAnalysisStatus] = React.useState(0);

  const handleSubmit = async () => {
    const inputElement = document.getElementById("fileUpload");
    const inputFile = inputElement.files[0];
    const data = new FormData();
    data.append("file", inputFile);
    //send post with file to upload
    await fetch("/upload", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: data,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status === 422) {
          setAnalysisStatus(1);
          alert(json.message);
          return
        }
        setObservedCount(json.observedCounts);
        setExpectedCount(json.expectedCounts);
        setPassesBenford(json.passesBenford);
        setAnalysisStatus(2);
        return;
      })
      .catch((error) => {
        setAnalysisStatus(1);
        return;
      });
  };

  if (analysisStatus !== 2)
    //awaiting file
    return (
      <>
        {analysisStatus === 1 && <p>File Error: Please upload a valid File</p>}
        <h2>{"Upload file to test Benford's Law"}</h2>
        <input id='fileUpload' type='file' name='file' />
        <button onClick={(e) => handleSubmit(e)} type='submit' value='Submit'>
          Submit
        </button>
      </>
    );
  //received result
  return (
    <>
      <h2>{"Results of Bedford's Law"}</h2>
      <Histogram observed={observedCount} expected={expectedCount} />
      <div>
        <p style={{ color: "red" }}>Expected</p>
        <p style={{ color: "black" }}>Observed</p>
      </div>
      <h3>
        {passesBenford
          ? "Data Passes Benfords Law (at .05 significance level)"
          : "Data Fails to Pass Benfords Law  (at .05 significance level)"}
      </h3>
    </>
  );
}

export default App;

const Histogram = ({ expected, observed }) => {
  //constants for plot SVG
  const CONTAINER_HEIGHT = 800;
  const CONTAINER_WIDTH = 800;
  const HISTO_BARS_GAP = 5;
  const HISTO_PLOT_MARGIN = 30;
  const HISTO_PLOT_WIDTH = CONTAINER_WIDTH - 2 * HISTO_PLOT_MARGIN;
  const HISTO_PLOT_HEIGHT = CONTAINER_WIDTH - 2 * HISTO_PLOT_MARGIN;
  const NUM_BARS = 9;

  const numOccurences = Object.values(observed);
  const largestValue = Math.max(...numOccurences);

  //add X axis
  const startHorizAxisX = HISTO_PLOT_MARGIN;
  const startHorizAxisY = CONTAINER_HEIGHT - HISTO_PLOT_MARGIN;
  const endHorizAxisX = CONTAINER_WIDTH - HISTO_PLOT_MARGIN;
  const endHorizAxisY = CONTAINER_HEIGHT - HISTO_PLOT_MARGIN;

  //add Y axis
  const startVertAxisX = HISTO_PLOT_MARGIN;
  const startVertAxisY = HISTO_PLOT_MARGIN;
  const endVertAxisX = HISTO_PLOT_MARGIN;
  const endVertAxisY = CONTAINER_HEIGHT - HISTO_PLOT_MARGIN;

  return (
    <svg width='800px' height='800px'>
      <line
        x1={startHorizAxisX}
        y1={startHorizAxisY}
        x2={endHorizAxisX}
        y2={endHorizAxisY}
        style={{ strokeWidth: "1px", stroke: "rgb(0,0,0)" }}
      />
      <line
        x1={startVertAxisX}
        y1={startVertAxisY}
        x2={endVertAxisX}
        y2={endVertAxisY}
        style={{ strokeWidth: "1px", stroke: "rgb(0,0,0)" }}
      />
      {numOccurences.map((barValue, idx) => {
        //add bars

        const width = HISTO_PLOT_WIDTH / NUM_BARS - HISTO_BARS_GAP;
        const startBarX =
          (idx * HISTO_PLOT_WIDTH) / NUM_BARS + HISTO_PLOT_MARGIN;

        const height = (barValue / largestValue) * HISTO_PLOT_HEIGHT;
        const startBarY = CONTAINER_HEIGHT - height - HISTO_PLOT_MARGIN;

        return (
          <>
            <rect
              width={width}
              height={height}
              x={startBarX}
              y={startBarY}
              style={{ fill: "rgb(0,0,255)" }}
            />
            <text
              x={startBarX}
              y={startBarY + HISTO_PLOT_MARGIN}
              style={{ fill: "black" }}>
              {barValue}
            </text>
            <text x={startBarX} y={startBarY} style={{ fill: "rgb(255,0,0)" }}>
              {Math.round(expected[idx + 1])}
            </text>
          </>
        );
      })}
    </svg>
  );
};
