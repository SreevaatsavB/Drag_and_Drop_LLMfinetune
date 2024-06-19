// import React from 'react';

// const Chatbot = ({ input, output, onInputChange, onSubmit, onApprove, onDisapprove }) => {
//   return (
//     <div className="chatbot">
//       <div className="chat-input">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => onInputChange(e.target.value)}
//           placeholder="Type your input..."
//         />
//         <button onClick={() => onSubmit(input)}>Submit</button>
//       </div>
//       <div className="chat-output">
//         {output && <p>{output}</p>}
//       </div>
//       <div className="chat-actions">
//         <button onClick={onApprove}>Approve</button>
//         <button onClick={onDisapprove}>Disapprove</button>
//       </div>
//     </div>
//   );
// };

// export default Chatbot;


import React from 'react';

const Chatbot = ({ input, output, onInputChange, onSubmit, onApprove, onDisapprove }) => {
  return (
    <div className="chatbot">
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Type your input..."
        />
        <button onClick={() => onSubmit(input)}>Submit</button>
      </div>
      <div className="chat-output">
        {output && <p>{output}</p>}
      </div>
      <div className="chat-actions">
        <button onClick={onApprove}>Approve</button>
        <button onClick={onDisapprove}>Disapprove</button>
      </div>
    </div>
  );
};

export default Chatbot;
