import {  CSSProperties } from "react";
import { ClipLoader, HashLoader } from "react-spinners";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function Loader() {
 

  return (
    <div className="flex justify-center items-center gap-4">
  

      <HashLoader
        color={"orange"}
        
        cssOverride={override}
        size={50}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
      <h3 className="text-xl">Loading ... </h3>
    </div>
  );
}

export default Loader;