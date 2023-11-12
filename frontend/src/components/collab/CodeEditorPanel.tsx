import { useEffect, useRef, useState, FC } from "react";
import CodeEditorNavbar from "./CodeEditorNavbar";
import { Divider } from "@nextui-org/react";
import CodeEditor from "./CodeEditor";
import { getCodeTemplate } from "@/utils/defaultCodeUtils";
import { useCollabContext } from "@/contexts/collab";
import { notFound } from "next/navigation";

const CodeEditorPanel: FC = ({}) => {
  const { matchedLanguage, question, socketService } = useCollabContext();

  const questionTitle = question?.title;
  const [currentCode, setCurrentCode] = useState<string>(
    getCodeTemplate(matchedLanguage, questionTitle!)
  );
  const [isUserNotValid, setIsUserNotValid] = useState<boolean>(false);

  useEffect(() => {
    socketService?.receiveCodeUpdate(setCurrentCode);
    socketService?.receiveUserNotValid(setIsUserNotValid);
  }, [socketService]);

  useEffect(() => {
    if (isUserNotValid) {
      notFound();
    }
  }, [isUserNotValid]);

  const handleEditorChange = (currentContent: string | undefined) => {
    setCurrentCode(currentContent!);
    socketService?.sendCodeChange(currentContent!);
  };

  const handleResetToDefaultCode = () => {
    setCurrentCode(getCodeTemplate(matchedLanguage, questionTitle!));
    socketService!.sendCodeChange(
      getCodeTemplate(matchedLanguage, questionTitle!)
    );
  };

  return (
    <div className="h-[calc(100vh-60px)]">
      <CodeEditorNavbar handleResetToDefaultCode={handleResetToDefaultCode} />
      <Divider className="space-y-2" />
      <CodeEditor
        currentCode={currentCode}
        handleEditorChange={handleEditorChange}
      />
    </div>
  );
};

export default CodeEditorPanel;
