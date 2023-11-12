import { useCollabContext } from "@/contexts/collab";
import { Editor, MonacoDiffEditor } from "@monaco-editor/react";
import { FC, use, useEffect, useState } from "react";
import { Position, Range } from "monaco-editor";
import { useRef } from "react";
import type monaco from 'monaco-editor';
import { UUID } from "crypto";
import { getCodeTemplate } from "@/utils/defaultCodeUtils";

interface CodeEditorProps {
  currentCode: string;
  handleEditorChange?: (currentContent: string | undefined) => void;
}

const CodeEditor: FC<CodeEditorProps> = ({
  currentCode,
  handleEditorChange,
}) => {
  const { matchedLanguage, socketService, partner, question } = useCollabContext();

  const language = matchedLanguage || "";
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorations = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);
  const isSocketEvent = useRef(false);
  const isHighlightingEvent = useRef(false);
  const [receivedEvents, setReceivedEvents] = useState<string[]>([]);
  const [partnerCursor, setPartnerCursor] = useState<Position>(new Position(1, 1));
  const [partnerConnected, setPartnerConnected] = useState<boolean>(false);
  const [partnerHighlight, setPartnerHighlight] = useState<Range>(new Range(1, 1, 1, 1));

  const handleContentChange = (event: string | null) => {
    if (!event) return;
    // Execute changes from other editor
    const convertedEvent = JSON.parse(event);
    isSocketEvent.current = true;
    if (editorRef.current) {
      editorRef.current.executeEdits("my-source", [convertedEvent]);
    }
  }

  const handlePartnerCursorChange = () => {
    if (!partner) return;

    let displayCursor = { 
      range: new Range(partnerCursor.lineNumber, partnerCursor.column, partnerCursor.lineNumber, partnerCursor.column + 1),
      options: {
          isWholeLine: false,
          beforeContentClassName: 'partner-cursor',
          hoverMessage: { value: partner.name }
      }
    };

    if (editorRef.current && decorations.current) {
      decorations.current.clear();
      decorations.current.set([displayCursor]);
    }
  }

  const handlePartnerHighlightChange = () => {
    isHighlightingEvent.current = true;
    if (!partner) return;

    let displayHighlight = {
      range: partnerHighlight,
      options: {
        className: 'partner-highlight',
        hoverMessage: { value: partner.name }
      }
    };

    if (editorRef.current && decorations.current) {
      decorations.current.set([displayHighlight]);
    }

    isHighlightingEvent.current = false;
  }
  
  // Subscribe to changes in events
  useEffect(() => {
    handleContentChange(receivedEvents[receivedEvents.length - 1]);
  }, [receivedEvents])
  // Subscribe to changes in partner cursor
  useEffect(() => {
    handlePartnerCursorChange();
  }, [partnerCursor])

  // Subscribe to changes in partner highlight
  useEffect(() => {
    handlePartnerHighlightChange();
  }, [partnerHighlight])

  // Clear decorations on disconnect
  useEffect(() => {
    if (!partnerConnected && editorRef.current && decorations.current) {
      decorations.current.clear();
    }
  }, [partnerConnected])

  useEffect(() => {
    if (!socketService) return;
    socketService.receiveCodeEvent(setReceivedEvents);
    socketService.receivePartnerCursor(setPartnerCursor);
    socketService.receivePartnerHighlight(setPartnerHighlight)
    socketService.receivePartnerConnection(setPartnerConnected);
    isSocketEvent.current = true;
  }, [socketService])

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor

    if (!editorRef.current) return;

    decorations.current = editorRef.current.createDecorationsCollection([]);

    let selectedRange: Range | null = null;

    // Subscribe to model changes
    editor.onDidChangeModelContent((event: monaco.editor.IModelContentChangedEvent) => {
      // Emitting changes only due to keypress and not due to socket service
      if (!isSocketEvent.current) {
        // Emitting changes: event.changes[0] is the change object that the other editor can execute  
        for (let i = 0; i < event.changes.length; i++) {
          // setEventQueue([...eventQueue, JSON.stringify(event.changes[i])]);
          if (socketService) 
            socketService.sendCodeEvent(JSON.stringify(event.changes[i]));
        }
      }
      isSocketEvent.current = false;
    })

    // Subscribe to highlight changes
    editor.onDidChangeCursorSelection((event: monaco.editor.ICursorSelectionChangedEvent) => {
      if (!socketService) return;
      const isColumnDiff = event.selection.startColumn != event.selection.endColumn;
      const isLineDiff = event.selection.startLineNumber != event.selection.endLineNumber;
      if ((isColumnDiff || isLineDiff)) {

        // Highlighting event

        selectedRange = new Range(
          event.selection.startLineNumber,
          event.selection.startColumn, 
          event.selection.endLineNumber, 
          event.selection.endColumn
        ); 


        socketService.sendPartnerHighlight(selectedRange);

      } else {

        // Cursor event
        const cursorPosition = {
          lineNumber: event.selection.startLineNumber,
          column: event.selection.startColumn
        }
        socketService.sendPartnerCursor(cursorPosition);
      }
    });
  }


  return (
    <div className="mt-1 p-2">
      <Editor
        width="100%"
        height="84vh"
        theme="vs-dark"
        defaultLanguage={language}
        value={currentCode}
        onChange={(currentContent: string | undefined) => {
          handleEditorChange!(currentContent);
        }}
        onMount={(editor, monaco) => {
          handleEditorMount(editor, monaco)
        }}
        options={{
          minimap: { enabled: false },
          glyphMargin: false,
          scrollbar: {
            horizontal: "hidden", // Hide horizontal scrollbar
            vertical: "hidden", // Hide vertical scrollbar
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;
