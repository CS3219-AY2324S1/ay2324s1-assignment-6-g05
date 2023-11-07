import { CLIENT_ROUTES } from "@/common/constants";
import ComplexityChip from "@/components/question/ComplexityChip";
import { useHistoryContext } from "@/contexts/history";
import { QuestionHistory } from "@/types/history";
import { cn } from "@/utils/classNameUtils";
import { StringUtils } from "@/utils/stringUtils";
import {
  Chip,
  Link,
  Pagination,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  getKeyValue,
} from "@nextui-org/react";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useMemo, useState } from "react";

interface AttemptedQuestionTableProps {
  isFullPage?: boolean;
}

const AttemptedQuestionTable = ({
  isFullPage = false,
}: AttemptedQuestionTableProps) => {
  const { history } = useHistoryContext();

  let rowsPerPage = 4;
  let showTopics = false;

  // to distinguish whether the table is in the dashboard or in the history page
  if (isFullPage) {
    rowsPerPage = 12;
    showTopics = true;
  }

  // for table structure
  const tableColumns = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "complexity",
      label: "Complexity",
    },
    {
      key: "language",
      label: "Language",
    },
    ...(showTopics
      ? [
          {
            key: "topics",
            label: "Topics",
          },
        ]
      : []),
    {
      key: "submissionDate",
      label: "Submission Date",
    },
  ];

  const renderCell = useCallback((record: QuestionHistory, columnKey: any) => {
    if (!record) {
      return null;
    }

    switch (columnKey) {
      case "title":
        const completedAt = new Date(record.updatedAt).getTime();
        return (
          <Link
            href={`${CLIENT_ROUTES.QUESTIONS}/${record.questionId}/history/${
              record.id
            }?language=${encodeURIComponent(
              record.language
            )}&completedAt=${encodeURIComponent(completedAt)}`}
            color="foreground"
            size="sm"
            className="font-normal hover:text-yellow text-sm"
          >
            {record.title}
          </Link>
        );
      case "complexity":
        return <ComplexityChip complexity={record.complexity} size="sm" />;
      case "language":
        return (
          <Chip size="sm" variant="bordered" className="text-sm capitalize">
            {record.language.toLowerCase()}
          </Chip>
        );
      case "topics":
        return (
          <div className="flex flex-wrap gap-1 overflow-hidden ">
            {(record.topics as string[]).map((topic) => (
              <Tooltip
                key={topic}
                content={StringUtils.convertAllCapsToCamelCase(topic)}
              >
                <Chip size="sm" className="truncate">
                  {StringUtils.convertAllCapsToCamelCase(topic)}
                </Chip>
              </Tooltip>
            ))}
          </div>
        );
      case "submissionDate":
        return formatDistanceToNow(new Date(record.updatedAt), {
          addSuffix: true,
        });
      default:
        return getKeyValue(record, columnKey);
    }
  }, []);

  // for table pagination
  const [page, setPage] = useState(1);

  const pages = Math.ceil(history.length / rowsPerPage);

  const historyItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return history.slice(start, end);
  }, [page, history]);

  // for table sorting
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "submissionDate",
    direction: "descending",
  });

  const sortedHistoryItems = useMemo(() => {
    const { column, direction } = sortDescriptor;

    if (!historyItems || historyItems.length === 0) {
      return [];
    }

    if (!column) {
      return historyItems;
    }

    switch (column) {
      case "complexity":
        const complexityOrder = ["EASY", "MEDIUM", "HARD"];

        if (direction === "ascending") {
          return [...historyItems].sort(
            (a, b) =>
              complexityOrder.indexOf(a.complexity.toUpperCase()) -
              complexityOrder.indexOf(b.complexity.toUpperCase())
          );
        } else if (direction === "descending") {
          return [...historyItems].sort(
            (a, b) =>
              complexityOrder.indexOf(b.complexity.toUpperCase()) -
              complexityOrder.indexOf(a.complexity.toUpperCase())
          );
        }
        break;
      case "submissionDate":
        if (direction === "ascending") {
          return [...historyItems].sort(
            (a, b) =>
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        } else if (direction === "descending") {
          return [...historyItems].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }
        break;
      default:
        if (direction === "ascending") {
          return [...historyItems].sort((a, b) =>
            getKeyValue(a, column).localeCompare(getKeyValue(b, column))
          );
        } else if (direction === "descending") {
          return [...historyItems].sort((a, b) =>
            getKeyValue(b, column).localeCompare(getKeyValue(a, column))
          );
        }
        break;
    }

    return [];
  }, [historyItems, sortDescriptor]);

  return (
    <Table
      aria-label="Attempted Question Table"
      isStriped={true}
      bottomContent={
        pages > 1 ? (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="warning"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        ) : null
      }
      sortDescriptor={sortDescriptor}
      onSortChange={(sortDescriptor) => setSortDescriptor(sortDescriptor)}
    >
      <TableHeader columns={tableColumns}>
        {(column) => (
          <TableColumn
            key={column.key}
            className={cn({
              "w-3/5": column.key === "title" && !showTopics,
              "w-2/5": showTopics && column.key === "title",
              "w-1/8": showTopics && column.key === "complexity",
              "w-3/10": showTopics && column.key === "topics",
            })}
            allowsSorting={column.key !== "topics"}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        emptyContent={"No questions attempted yet, try matching with one!"}
      >
        {/* Must do array.map as NextUI table does not support rendering async dynamic state values */}
        {sortedHistoryItems.map((item) => {
          return (
            <TableRow key={item.id + item.language}>
              {tableColumns.map((column) => {
                return (
                  <TableCell key={column.key}>
                    {renderCell(item, column.key)}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default AttemptedQuestionTable;
