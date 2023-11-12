import { Tooltip } from "@nextui-org/react";
import { FC } from "react";

interface CodeEditorNavBarTooltipProps {
  content: string;
  children?: React.ReactNode;
}

const CodeEditorNavBarTooltip: FC<CodeEditorNavBarTooltipProps> = ({
  content,
  children,
}) => {
  return (
    <Tooltip
      placement="bottom"
      offset={-2}
      content={content}
      delay={100}
      className="text-xs font-medium"
    >
      {children}
    </Tooltip>
  );
};

export default CodeEditorNavBarTooltip;
