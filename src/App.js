// import React, { useCallback, useState, useEffect } from "react";
// import ReactFlow, {
//   MiniMap,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   addEdge,
// } from "reactflow";
// import "reactflow/dist/style.css";
// import CustomNode from "./components/CustomNode";
// import Popup from "./components/Popup";
// import Chatbot from "./components/Chatbot";
// import './App.css';

// const initialNodes = [];
// const initialEdges = [];

// const nodeTypes = {
//   customNode: CustomNode,
// };

// function FlowComponent() {
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
//   const [nextNodeId, setNextNodeId] = useState(3);
//   const [nodeType, setNodeType] = useState("");
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [popupValue, setPopupValue] = useState("");
//   const [selectedNode, setSelectedNode] = useState(null);
//   const [executionDone, setExecutionDone] = useState(false);
//   const [isChatbotOpen, setIsChatbotOpen] = useState(false);
//   const [chatInput, setChatInput] = useState("");
//   const [chatOutput, setChatOutput] = useState("");

//   const pollNodeStatus = useCallback(() => {
//     fetch('http://localhost:5000/status')
//       .then(response => response.json())
//       .then(statuses => {
//         setNodes(nds => nds.map(node => {
//           const status = statuses[node.id];
//           if (status === 'completed') {
//             return { ...node, style: { ...node.style, backgroundColor: 'green' } };
//           }
//           if (status === 'failed') {
//             return { ...node, style: { ...node.style, backgroundColor: 'red' } };
//           }
//           if (status === 'waiting_for_input') {
//             setSelectedNode(node.id);
//             setIsChatbotOpen(true);
//           }
//           return node;
//         }));
//         const allCompleted = Object.values(statuses).every(status => status === 'completed');
//         if (allCompleted && Object.keys(statuses).length > 0) {
//           setExecutionDone(true);
//         }
//       })
//       .catch(error => console.error('Error fetching node statuses:', error));
//   }, [setNodes]);

//   useEffect(() => {
//     const interval = setInterval(pollNodeStatus, 1000);
//     return () => clearInterval(interval);
//   }, [pollNodeStatus]);

//   const onConnect = useCallback(
//     (params) => setEdges((els) => addEdge(params, els)),
//     [setEdges]
//   );

//   const isValidConnection = (connection) => {
//     const sourceNode = nodes.find(node => node.id === connection.source);
//     const targetNode = nodes.find(node => node.id === connection.target);
//     if (!sourceNode || !targetNode) return false;

//     const sourceType = sourceNode.data.label.split(" ")[0];
//     const targetType = targetNode.data.label.split(" ")[0];

//     if (sourceType === "Dataset" && (targetType === "Preprocess" || targetType === "Train")) {
//       return true;
//     }
//     if (sourceType === "Preprocess" && targetType === "Train") {
//       return true;
//     }
//     if (sourceType === "Train" && targetType === "Test") {
//       return true;
//     }
//     if (sourceType === "Test" && targetType === "Deploy") {
//       return true;
//     }
//     return false;
//   };

//   const handleChatSubmit = async (input) => {
//     try {
//       const response = await fetch("http://localhost:5000/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ input }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       setChatOutput(data.output);
//     } catch (error) {
//       console.error('Error submitting chat:', error);
//       setChatOutput('Error submitting chat.');
//     }
//   };

//   const handleChatApprove = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/approve", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ node_id: selectedNode }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       if (data.status === 'success') {
//         setNodes((nds) =>
//           nds.map((node) =>
//             node.id === selectedNode
//               ? { ...node, style: { ...node.style, backgroundColor: 'green' } }
//               : node
//           )
//         );
//       } else {
//         throw new Error(data.message);
//       }
//     } catch (error) {
//       console.error('Error approving node:', error);
//     } finally {
//       setIsChatbotOpen(false);
//     }
//   };

//   const handleChatDisapprove = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/disapprove", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ node_id: selectedNode }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       if (data.status === 'success') {
//         setNodes((nds) =>
//           nds.map((node) =>
//             node.id === selectedNode
//               ? { ...node, style: { ...node.style, backgroundColor: 'red' } }
//               : node
//           )
//         );
//       } else {
//         throw new Error(data.message);
//       }
//     } catch (error) {
//       console.error('Error disapproving node:', error);
//     } finally {
//       setIsChatbotOpen(false);
//     }
//   };

//   const addNode = useCallback(() => {
//     if (!nodeType) return;
//     let newNode;
//     const commonCallbacks = {
//       onDropdownChange: () => {},
//       onNumberChange: (value, field) => {
//         setNodes((nds) =>
//           nds.map((node) =>
//             node.id === String(nextNodeId)
//               ? { ...node, data: { ...node.data, [field]: value } }
//               : node
//           )
//         );
//       },
//       onStringChange: (value, field) => {
//         setNodes((nds) =>
//           nds.map((node) =>
//             node.id === String(nextNodeId)
//               ? { ...node, data: { ...node.data, [field]: value } }
//               : node
//           )
//         );
//       },
//       onFileChange: () => {},
//     };
//     switch (nodeType) {
//       case "Dataset":
//         newNode = {
//           id: String(nextNodeId),
//           type: "customNode",
//           data: {
//             label: `${nodeType} Node ${nextNodeId}`,
//             url: "",
//             cred: "",
//             onCredChange: () => {
//               setSelectedNode(String(nextNodeId));
//               setIsPopupOpen(true);
//             },
//             ...commonCallbacks,
//           },
//           position: { x: 250, y: 5 },
//         };
//         break;
//       case "Upload Dataset":
//         newNode = {
//           id: String(nextNodeId),
//           type: "customNode",
//           data: {
//             label: `${nodeType} Node ${nextNodeId}`,
//             file: "",
//             ...commonCallbacks,
//             onFileChange: (file) => {
//               setNodes((nds) =>
//                 nds.map((node) =>
//                   node.id === String(nextNodeId)
//                     ? { ...node, data: { ...node.data, file } }
//                     : node
//                 )
//               );
//             },
//           },
//           position: { x: 250, y: 5 },
//         };
//         break;
//       case "Preprocess":
//         newNode = {
//           id: String(nextNodeId),
//           type: "customNode",
//           data: {
//             label: `${nodeType} Node ${nextNodeId}`,
//             prompt: "",
//             ...commonCallbacks,
//           },
//           position: { x: 250, y: 5 },
//         };
//         break;
//       case "Train":
//         newNode = {
//           id: String(nextNodeId),
//           type: "customNode",
//           data: {
//             label: `${nodeType} Node ${nextNodeId}`,
//             temperature: "",
//             cred: "",
//             onCredChange: () => {
//               setSelectedNode(String(nextNodeId));
//               setIsPopupOpen(true);
//             },
//             ...commonCallbacks,
//           },
//           position: { x: 250, y: 5 },
//         };
//         break;
//       case "Test":
//         newNode = {
//           id: String(nextNodeId),
//           type: "customNode",
//           data: {
//             label: `${nodeType} Node ${nextNodeId}`,
//             onChatOpen: () => {
//               setSelectedNode(String(nextNodeId));
//               setIsChatbotOpen(true);
//             },
//             ...commonCallbacks,
//           },
//           position: { x: 250, y: 5 },
//         };
//         break;
//       case "Deploy":
//         newNode = {
//           id: String(nextNodeId),
//           type: "customNode",
//           data: {
//             label: `${nodeType} Node ${nextNodeId}`,
//             typeValue: "",
//             ...commonCallbacks,
//           },
//           position: { x: 250, y: 5 },
//         };
//         break;
//       default:
//         break;
//     }

//     if (newNode) {
//       setNodes((nds) => nds.concat(newNode));
//       setNextNodeId(nextNodeId + 1);
//       setNodeType("");
//     }
//   }, [nodeType, nextNodeId, setNodes]);

//   const handlePopupSubmit = (value) => {
//     setNodes((nds) =>
//       nds.map((node) =>
//         node.id === selectedNode
//           ? { ...node, data: { ...node.data, cred: value } }
//           : node
//       )
//     );
//     setIsPopupOpen(false);
//     setPopupValue("");
//   };

//   const executeAction = useCallback(() => {
//     setExecutionDone(false);  // Reset execution done state
//     fetch('http://localhost:5000/execute', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ nodes, edges }),
//     })
//       .then(response => response.json())
//       .then(data => {
//         if (data.status === 'success') {
//           alert('Flow is valid!');
//         } else {
//           alert(`Error: ${data.message}`);
//         }
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//       });
//   }, [nodes, edges]);

//   return (
//     <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//         isValidConnection={isValidConnection}
//         nodeTypes={nodeTypes}
//         fitView
//         style={{ flexGrow: 1 }}
//       >
//         <MiniMap />
//         <Controls />
//         <Background color="#aaa" gap={16} />
//       </ReactFlow>
//       <div
//         style={{
//           position: "absolute",
//           right: "10px",
//           top: "10px",
//           zIndex: 1000,
//         }}
//       >
//         <select value={nodeType} onChange={(e) => setNodeType(e.target.value)}>
//           <option value="">Select Node Type...</option>
//           <option value="Dataset">Dataset</option>
//           <option value="Upload Dataset">Upload Dataset</option>
//           <option value="Preprocess">Preprocess</option>
//           <option value="Train">Train</option>
//           <option value="Test">Test</option>
//           <option value="Deploy">Deploy</option>
//         </select>
//         <button onClick={addNode}>Add Node</button>
//         <button onClick={executeAction}>Execute Action</button>
//       </div>
//       {isPopupOpen && (
//         <Popup value={popupValue} onChange={setPopupValue} onSubmit={handlePopupSubmit} />
//       )}
//       {isChatbotOpen && (
//         <Chatbot
//           input={chatInput}
//           output={chatOutput}
//           onInputChange={setChatInput}
//           onSubmit={handleChatSubmit}
//           onApprove={handleChatApprove}
//           onDisapprove={handleChatDisapprove}
//         />
//       )}
//     </div>
//   );
// }

// export default FlowComponent;


import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./components/CustomNode";
import Popup from "./components/Popup";
import Chatbot from "./components/Chatbot";
import './App.css';

const initialNodes = [];
const initialEdges = [];

const nodeTypes = {
  customNode: CustomNode,
};

function FlowComponent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nextNodeId, setNextNodeId] = useState(3);
  const [nodeType, setNodeType] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupValue, setPopupValue] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [executionDone, setExecutionDone] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatOutput, setChatOutput] = useState("");

  const pollNodeStatus = useCallback(() => {
    fetch('http://localhost:5000/status')
      .then(response => response.json())
      .then(statuses => {
        setNodes(nds => nds.map(node => {
          const status = statuses[node.id];
          if (status === 'completed') {
            return { ...node, style: { ...node.style, backgroundColor: 'green' } };
          }
          if (status === 'failed') {
            return { ...node, style: { ...node.style, backgroundColor: 'red' } };
          }
          if (status === 'waiting_for_input') {
            setSelectedNode(node.id);
            setIsChatbotOpen(true);
          }
          return node;
        }));
        const allCompleted = Object.values(statuses).every(status => status === 'completed');
        if (allCompleted && Object.keys(statuses).length > 0) {
          setExecutionDone(true);
        }
      })
      .catch(error => console.error('Error fetching node statuses:', error));
  }, [setNodes]);

  useEffect(() => {
    const interval = setInterval(pollNodeStatus, 1000);
    return () => clearInterval(interval);
  }, [pollNodeStatus]);

  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  const isValidConnection = (connection) => {
    const sourceNode = nodes.find(node => node.id === connection.source);
    const targetNode = nodes.find(node => node.id === connection.target);
    if (!sourceNode || !targetNode) return false;

    const sourceType = sourceNode.data.label.split(" ")[0];
    const targetType = targetNode.data.label.split(" ")[0];

    if (sourceType === "Dataset" && (targetType === "Preprocess" || targetType === "Train")) {
      return true;
    }
    if (sourceType === "Preprocess" && targetType === "Train") {
      return true;
    }
    if (sourceType === "Train" && targetType === "Test") {
      return true;
    }
    if (sourceType === "Test" && targetType === "Deploy") {
      return true;
    }
    return false;
  };

  const handleChatSubmit = async (input) => {
    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setChatOutput(data.output);
    } catch (error) {
      console.error('Error submitting chat:', error);
      setChatOutput('Error submitting chat.');
    }
  };

  const handleChatApprove = async () => {
    try {
      const response = await fetch("http://localhost:5000/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ node_id: selectedNode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === selectedNode
              ? { ...node, style: { ...node.style, backgroundColor: 'green' } }
              : node
          )
        );
        // Execute Deploy node after approval
        if (nodes.find(node => node.data.label.startsWith('Deploy'))) {
          const deployNode = nodes.find(node => node.data.label.startsWith('Deploy'));
          fetch('http://localhost:5000/execute', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nodes, edges }),
          })
            .then(response => response.json())
            .then(data => {
              if (data.status !== 'success') {
                throw new Error(data.message);
              }
            })
            .catch((error) => {
              console.error('Error:', error);
            });
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error approving node:', error);
    } finally {
      setIsChatbotOpen(false);
    }
  };

  const handleChatDisapprove = async () => {
    try {
      const response = await fetch("http://localhost:5000/disapprove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ node_id: selectedNode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === selectedNode
              ? { ...node, style: { ...node.style, backgroundColor: 'red' } }
              : node
          )
        );
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error disapproving node:', error);
    } finally {
      setIsChatbotOpen(false);
    }
  };

  const addNode = useCallback(() => {
    if (!nodeType) return;
    let newNode;
    const commonCallbacks = {
      onDropdownChange: () => {},
      onNumberChange: (value, field) => {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === String(nextNodeId)
              ? { ...node, data: { ...node.data, [field]: value } }
              : node
          )
        );
      },
      onStringChange: (value, field) => {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === String(nextNodeId)
              ? { ...node, data: { ...node.data, [field]: value } }
              : node
          )
        );
      },
      onFileChange: () => {},
    };
    switch (nodeType) {
      case "Dataset":
        newNode = {
          id: String(nextNodeId),
          type: "customNode",
          data: {
            label: `${nodeType} Node ${nextNodeId}`,
            url: "",
            cred: "",
            onCredChange: () => {
              setSelectedNode(String(nextNodeId));
              setIsPopupOpen(true);
            },
            ...commonCallbacks,
          },
          position: { x: 250, y: 5 },
        };
        break;
      case "Upload Dataset":
        newNode = {
          id: String(nextNodeId),
          type: "customNode",
          data: {
            label: `${nodeType} Node ${nextNodeId}`,
            file: "",
            ...commonCallbacks,
            onFileChange: (file) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === String(nextNodeId)
                    ? { ...node, data: { ...node.data, file } }
                    : node
                )
              );
            },
          },
          position: { x: 250, y: 5 },
        };
        break;
      case "Preprocess":
        newNode = {
          id: String(nextNodeId),
          type: "customNode",
          data: {
            label: `${nodeType} Node ${nextNodeId}`,
            prompt: "",
            ...commonCallbacks,
          },
          position: { x: 250, y: 5 },
        };
        break;
      case "Train":
        newNode = {
          id: String(nextNodeId),
          type: "customNode",
          data: {
            label: `${nodeType} Node ${nextNodeId}`,
            temperature: "",
            cred: "",
            onCredChange: () => {
              setSelectedNode(String(nextNodeId));
              setIsPopupOpen(true);
            },
            ...commonCallbacks,
          },
          position: { x: 250, y: 5 },
        };
        break;
      case "Test":
        newNode = {
          id: String(nextNodeId),
          type: "customNode",
          data: {
            label: `${nodeType} Node ${nextNodeId}`,
            onChatOpen: () => {
              setSelectedNode(String(nextNodeId));
              setIsChatbotOpen(true);
            },
            ...commonCallbacks,
          },
          position: { x: 250, y: 5 },
        };
        break;
      case "Deploy":
        newNode = {
          id: String(nextNodeId),
          type: "customNode",
          data: {
            label: `${nodeType} Node ${nextNodeId}`,
            typeValue: "",
            ...commonCallbacks,
          },
          position: { x: 250, y: 5 },
        };
        break;
      default:
        break;
    }

    if (newNode) {
      setNodes((nds) => nds.concat(newNode));
      setNextNodeId(nextNodeId + 1);
      setNodeType("");
    }
  }, [nodeType, nextNodeId, setNodes]);

  const handlePopupSubmit = (value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode
          ? { ...node, data: { ...node.data, cred: value } }
          : node
      )
    );
    setIsPopupOpen(false);
    setPopupValue("");
  };

  const executeAction = useCallback(() => {
    setExecutionDone(false);  // Reset execution done state
    fetch('http://localhost:5000/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nodes, edges }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          alert('Flow is valid!');
        } else {
          alert(`Error: ${data.message}`);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [nodes, edges]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        fitView
        style={{ flexGrow: 1 }}
      >
        <MiniMap />
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      <div
        style={{
          position: "absolute",
          right: "10px",
          top: "10px",
          zIndex: 1000,
        }}
      >
        <select value={nodeType} onChange={(e) => setNodeType(e.target.value)}>
          <option value="">Select Node Type...</option>
          <option value="Dataset">Dataset</option>
          <option value="Upload Dataset">Upload Dataset</option>
          <option value="Preprocess">Preprocess</option>
          <option value="Train">Train</option>
          <option value="Test">Test</option>
          <option value="Deploy">Deploy</option>
        </select>
        <button onClick={addNode}>Add Node</button>
        <button onClick={executeAction}>Execute Action</button>
      </div>
      {isPopupOpen && (
        <Popup value={popupValue} onChange={setPopupValue} onSubmit={handlePopupSubmit} />
      )}
      {isChatbotOpen && (
        <Chatbot
          input={chatInput}
          output={chatOutput}
          onInputChange={setChatInput}
          onSubmit={handleChatSubmit}
          onApprove={handleChatApprove}
          onDisapprove={handleChatDisapprove}
        />
      )}
    </div>
  );
}

export default FlowComponent;
