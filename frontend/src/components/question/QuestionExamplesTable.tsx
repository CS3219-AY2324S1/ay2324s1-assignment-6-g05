import { Example } from "@/types/question";
import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useState, useEffect } from "react";

export default function QuestionExamplesTable({
  value,
  onValueChange,
}: {
  value: Example[];
  onValueChange?: (value: Example[]) => void;
}) {
  const emptyExample = { input: "", output: "" };
  const [examples, setExamples] = useState<Example[]>([]);

  // Apply changes and pass back to parent
  const handleValue = <K extends keyof Example>(id: number, key: K, value: Example[K]) => {
    if (id >= 0) {
      examples[id] = {
        ...examples[id],
        [key]: value
      }

      onValueChange!(examples.filter(e => e.input + e.output !== ""));
    }
  };

  // Handle changes from parent
  useEffect(() => {
    setExamples([...value, emptyExample])
  }, [value]);

  return (
    <div onKeyDownCapture={e => {
      if (e.key === ' ') {
        e.key = '\u00a0';
      }
    }}>
      <Table
        aria-label="table of examples"
        removeWrapper
        topContent={<p className="text-small">Examples</p>}
        topContentPlacement="outside"
        classNames={{
          base: "gap-1",
          td: "p-1",
        }}
      >
        <TableHeader>
          <TableColumn>{ }</TableColumn>
          <TableColumn>Input</TableColumn>
          <TableColumn>Output</TableColumn>
        </TableHeader>
        <TableBody items={examples}>
          {examples.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{idx + 1}.</TableCell>
              <TableCell>
                <Input
                  type="text"
                  size="sm"
                  value={row.input}
                  onValueChange={v => handleValue(idx, "input", v)}
                ></Input>
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  size="sm"
                  value={row.output}
                  onValueChange={v => handleValue(idx, "output", v)}
                ></Input>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
