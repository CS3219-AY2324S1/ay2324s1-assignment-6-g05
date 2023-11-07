import {
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function QuestionConstrainsTable({
  value,
  onValueChange,
}: {
  value: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
}) {
  const [constraints, setConstraints] = useState<string[]>([]);

  // Apply changes and pass back to parent
  const handleValue = (id: number, value: string) => {
    constraints[id] = value;
    onValueChange!(constraints.filter(x => x !== ""));
  };

  // Handle changes from parent
  useEffect(() => {
    setConstraints([...value, ""])
  }, [value])

  return (
    <div onKeyDownCapture={e => {
      if (e.key === ' ') {
        e.key = '\u00a0';
      }
    }}>
      <Table
        aria-label="table of constraints"
        removeWrapper
        topContent={<p className="text-small">Constraints</p>}
        topContentPlacement="outside"
        classNames={{
          base: "gap-1",
          td: "p-1",
        }}
      >
        <TableHeader>
          <TableColumn>{ }</TableColumn>
          <TableColumn>Values</TableColumn>
        </TableHeader>
        <TableBody>
          {constraints.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{idx + 1}.</TableCell>
              <TableCell>
                <Input
                  type="text"
                  size="sm"
                  value={row}
                  onValueChange={v => handleValue(idx, v)}
                ></Input>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
