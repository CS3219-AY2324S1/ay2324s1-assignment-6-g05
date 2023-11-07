import { useHistoryContext } from "@/contexts/history";
import { Editor } from "@monaco-editor/react";

const ReadOnlyCodeEditor = ({}) => {
  const { language, code } = useHistoryContext();
  return (
    <div className="mt-1 p-2">
      <Editor
        width="100%"
        height="84vh"
        theme="vs-dark"
        defaultLanguage={language}
        defaultValue={code}
        options={{
          minimap: { enabled: false },
          glyphMargin: false,
          scrollbar: {
            horizontal: "hidden", // Hide horizontal scrollbar
            vertical: "hidden", // Hide vertical scrollbar
          },
          readOnly: true,
          domReadOnly: true,
        }}
      />
    </div>
  );
};

export default ReadOnlyCodeEditor;
