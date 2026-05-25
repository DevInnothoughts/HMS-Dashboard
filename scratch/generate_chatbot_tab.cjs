const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../src/pages/Utility/WebLeadsTab.jsx');
const targetFile = path.join(__dirname, '../src/pages/Utility/ChatbotLeadsTab.jsx');

let content = fs.readFileSync(sourceFile, 'utf8');

// Replacements for endpoints and states
content = content.replace(/WebLeadsTab/g, 'ChatbotLeadsTab');
content = content.replace(/webLeads/g, 'chatbotLeads');
content = content.replace(/setWebLeads/g, 'setChatbotLeads');
content = content.replace(/fetchWebLeads/g, 'fetchChatbotLeads');
content = content.replace(/\/V1\/webleads\/listWebleads/g, '/V1/chatbotleads/listChatbotLeads');
content = content.replace(/\/V1\/webleads\/searchWebleads/g, '/V1/chatbotleads/searchChatbotLeads');
content = content.replace(/\/V1\/webleads\/editNote/g, '/V1/chatbotleads/editNote');
content = content.replace(/web leads/gi, 'chatbot leads');
content = content.replace(/Website Contact Form Submissions/g, 'Chatbot Leads Submissions');
content = content.replace(/Search web leads/g, 'Search chatbot leads');
content = content.replace(/\["name", "phoneno", "email_id", "message", "note"\]/g, '["name", "phoneno", "disease", "message", "note"]');

// The source template for Web Leads
const sourceTemplateStr = `
  const sourceBodyTemplate = (rowData) => {
    const src = rowData.utmsource || "Direct Website";
    return (
      <span
        style={{
          backgroundColor: src.toLowerCase().includes("organic") ? "#e1f5fe" : "#efebe9",
          color: src.toLowerCase().includes("organic") ? "#0288d1" : "#5d4037",
          border: \`1px solid \${src.toLowerCase().includes("organic") ? "#29b6f6" : "#8d6e63"}\`,
          borderRadius: "4px",
          padding: "3px 6px",
          fontSize: "11px",
        }}
      >
        {src}
      </span>
    );
  };
`;

// Replacement template for Chatbot Status and Branch
const newTemplatesStr = `
  const statusBodyTemplate = (rowData) => {
    const status = rowData.status || "Pending";
    let bg = "#fff3e0"; let color = "#e65100"; let border = "#ffb74d";
    if(status.toLowerCase().includes("book") || status.toLowerCase().includes("success")) {
       bg = "#e8f5e9"; color = "#2e7d32"; border = "#81c784";
    } else if (status.toLowerCase().includes("closed")) {
       bg = "#ffebee"; color = "#c62828"; border = "#ef5350";
    }
    return (
      <span
        style={{
          backgroundColor: bg,
          color: color,
          border: \`1px solid \${border}\`,
          borderRadius: "4px",
          padding: "3px 6px",
          fontSize: "11px",
        }}
      >
        {status}
      </span>
    );
  };
`;
content = content.replace(sourceTemplateStr, newTemplatesStr);

// Replacing columns
const oldColumnsStr = `
              <Column
                field="email_id"
                header="Email"
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Column
                field="selected_area"
                header="Region"
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Column
                field="utmsource"
                header="Source"
                body={sourceBodyTemplate}
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "130px",
                  fontSize: "12px",
                }}
              />
`;

const newColumnsStr = `
              <Column
                field="disease"
                header="Disease"
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Column
                field="branch"
                header="Branch/Src"
                body={(rowData) => rowData.branch || rowData.chat_whatsapp_branch || "N/A"}
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Column
                field="status"
                header="Status"
                body={statusBodyTemplate}
                headerClassName="datatable-header-center"
                style={{
                  border: "1px solid #90caf9",
                  textAlign: "center",
                  padding: "0.75rem",
                  width: "130px",
                  fontSize: "12px",
                }}
              />
`;

content = content.replace(oldColumnsStr, newColumnsStr);

fs.writeFileSync(targetFile, content);
console.log("ChatbotLeadsTab.jsx has been created successfully.");
