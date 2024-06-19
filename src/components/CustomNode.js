import React from "react";
import { Handle } from "reactflow";

const CustomNode = ({ data }) => {
  const handleDropdownChange = (e) => {
    data.onDropdownChange(e.target.value);
  };

  const handleNumberChange = (e) => {
    if (data.onNumberChange) {
      data.onNumberChange(e.target.value, "temperature");
    }
  };

  const handleStringChange = (e, field) => {
    if (data.onStringChange) {
      data.onStringChange(e.target.value, field);
    }
  };

  const handleFileChange = (e) => {
    if (data.onFileChange) {
      data.onFileChange(e.target.files[0]);
    }
  };

  const renderNodeContent = () => {
    switch (data.label.split(" ")[0]) {
      case "Dataset":
        return (
          <>
            <div>{data.label}</div>
            <input
              type="text"
              value={data.url}
              onChange={(e) => handleStringChange(e, "url")}
              placeholder="Enter URL"
            />
            <button onClick={data.onCredChange}>Enter Credentials</button>
          </>
        );
      case "Upload":
        return (
          <>
            <div>{data.label}</div>
            <input type="file" onChange={handleFileChange} />
          </>
        );
      case "Preprocess":
        return (
          <>
            <div>{data.label}</div>
            <input
              type="text"
              value={data.prompt}
              onChange={(e) => handleStringChange(e, "prompt")}
              placeholder="Enter Prompt"
            />
          </>
        );
      case "Train":
        return (
          <>
            <div>{data.label}</div>
            <input
              type="number"
              value={data.temperature}
              onChange={handleNumberChange}
              placeholder="Enter Temperature"
            />
            <button onClick={data.onCredChange}>Enter Credentials</button>
          </>
        );
      // case "Test":
      //   return (
      //     <>
      //       <div>{data.label}</div>
      //       <input
      //         type="text"
      //         value={data.input}
      //         onChange={(e) => handleStringChange(e, "input")}
      //         placeholder="Enter Input"
      //       />
      //       <input
      //         type="text"
      //         value={data.output}
      //         onChange={(e) => handleStringChange(e, "output")}
      //         placeholder="Enter Output"
      //       />
      //     </>
      //   );
        // ... other cases
      case "Test":
        return (
          <>
            <div>{data.label}</div>
            <button onClick={data.onChatOpen}>Test</button>
          </>
        );

      case "Deploy":
        return (
          <>
            <div>{data.label}</div>
            <select
              value={data.typeValue}
              onChange={(e) => handleStringChange(e, "typeValue")}
            >
              <option value="">Select Type...</option>
              <option value="Batch">Batch</option>
              <option value="RTI">RTI</option>
            </select>
          </>
        );
      default:
        return <div>{data.label}</div>;
    }
  };

  return (
    <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 4 }}>
      {renderNodeContent()}
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
    </div>
  );
};

export default CustomNode;