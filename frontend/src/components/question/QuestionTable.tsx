"use client";
import { useMemo, useState } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Tooltip,
    useDisclosure,
    Button,
    Chip,
    Link,
    SortDescriptor,
    getKeyValue,
    Pagination,
} from "@nextui-org/react";
import Question from "@/types/question";
import ModifyQuestionModal from "./ModifyQuestionModal";
import LambdaQuestionModal from "./LambdaQuestionModal";
import ComplexityChip from "./ComplexityChip";
import DeleteQuestion from "./DeleteQuestion";
import { CLIENT_ROUTES } from "@/common/constants";
import { Icons } from "@/components/common/Icons";
import { useAuthContext } from "@/contexts/auth";

export default function QuestionTable({ questions }: { questions: Question[] }) {
    const { user } = useAuthContext();
    const readonly = user.role != "ADMIN";

    const columns = [
        {
            key: "title",
            label: "Title",
            class: "w-3/6",
            sort: true,
        },
        {
            key: "complexity",
            label: "Complexity",
            class: "w-1/7",
            sort: true,
        },
        {
            key: "topics",
            label: "Topic",
            class: "w-2/6",
            sort: false,
        },
        ...(!readonly
            ? [
                  {
                      key: "actions",
                      label: "ACTIONS",
                      class: "",
                      sort: false,
                  },
              ]
            : []),
    ];

    // useDisclosure for creating question from scratch
    const {
        isOpen: isNormalOpen,
        onOpen: onNormalOpen,
        onOpenChange: onNormalOpenChange,
        onClose: onNormalClose,
    } = useDisclosure();

    // useDisclosure for creating question from lambda function
    const {
        isOpen: isLambdaOpen,
        onOpen: onLambdaOpen,
        onOpenChange: onLambdaOpenChange,
        onClose: onLambdaClose,
    } = useDisclosure();

    const [toEditQuestion, setToEditQuestion] = useState<Question>();

    function renderCell(item: any, columnKey: string, readonly: boolean) {
        const cellValue = item[columnKey as keyof Question];

        switch (columnKey) {
            case "id":
                return questions.findIndex((x) => x.id == cellValue) + 1;
            case "title":
                return (
                    <>
                        <Link
                            href={`${CLIENT_ROUTES.QUESTIONS}/${item.id}`}
                            color="foreground"
                            className="hover:text-yellow text-sm"
                        >
                            {cellValue as string}
                        </Link>
                    </>
                );
            case "complexity":
                return <ComplexityChip size="sm" complexity={cellValue as string}></ComplexityChip>;
            case "topics":
                return (
                    <>
                        <div className="flex flex-wrap gap-1 overflow-hidden ">
                            {(cellValue as string[]).map((topic) => (
                                <Tooltip
                                    key={topic}
                                    className="capitalize"
                                    content={topic.toLowerCase()}
                                >
                                    <Chip size="sm" className="truncate capitalize">
                                        {topic.toLowerCase()}
                                    </Chip>
                                </Tooltip>
                            ))}
                        </div>
                    </>
                );

            case "actions":
                if (readonly) {
                    return <></>;
                }
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Edit question" delay={1000}>
                            <span
                                className="text-lg text-default-400 cursor-pointer active:opacity-50 w-8 h-8 p-1.5"
                                onClick={(e) => openModal(item)}
                            >
                                <Icons.FiEdit />
                            </span>
                        </Tooltip>
                        <DeleteQuestion id={item["id"]}></DeleteQuestion>
                    </div>
                );
            default:
                return cellValue;
        }
    }

    function openModal(question?: Question) {
        if (question != undefined) {
            setToEditQuestion(question);
        } else {
            setToEditQuestion(undefined);
        }
        onNormalOpen();
    }

    const rowsPerPage = 15;
    const [page, setPage] = useState(1);
    const pages = Math.ceil(questions.length / rowsPerPage);
    const complexityOrder = ["EASY", "MEDIUM", "HARD"];
    const questionItems = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return questions
            .sort(
                (a, b) =>
                    complexityOrder.indexOf(a.complexity.toUpperCase()) -
                    complexityOrder.indexOf(b.complexity.toUpperCase())
            )
            .slice(start, end);
    }, [page, questions]);

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "complexity",
        direction: "ascending",
    });
    const sortedQuestionItems = useMemo(() => {
        const { column, direction } = sortDescriptor;

        if (!questionItems || questionItems.length === 0) {
            return [];
        }

        if (!column) {
            return questionItems;
        }

        switch (column) {
            case "complexity":
                if (direction === "ascending") {
                    return [...questionItems].sort(
                        (a, b) =>
                            complexityOrder.indexOf(a.complexity.toUpperCase()) -
                            complexityOrder.indexOf(b.complexity.toUpperCase())
                    );
                } else {
                    return [...questionItems].sort(
                        (a, b) =>
                            complexityOrder.indexOf(b.complexity.toUpperCase()) -
                            complexityOrder.indexOf(a.complexity.toUpperCase())
                    );
                }
            default:
                if (direction === "ascending") {
                    return [...questionItems].sort((a, b) =>
                        getKeyValue(a, column).localeCompare(getKeyValue(b, column))
                    );
                } else {
                    return [...questionItems].sort((a, b) =>
                        getKeyValue(b, column).localeCompare(getKeyValue(a, column))
                    );
                }
        }
    }, [questionItems, sortDescriptor]);

    return (
        <>
            <ModifyQuestionModal
                isOpen={isNormalOpen}
                onOpenChange={onNormalOpenChange}
                questionId={toEditQuestion?.id}
                closeCallback={onNormalClose}
            ></ModifyQuestionModal>

            <LambdaQuestionModal
                isOpen={isLambdaOpen}
                onOpenChange={onLambdaOpenChange}
                closeCallback={onLambdaClose}
            ></LambdaQuestionModal>

            <Table
                sortDescriptor={sortDescriptor}
                onSortChange={(sortDescriptor) => setSortDescriptor(sortDescriptor)}
                aria-label="table of questions"
                topContent={
                    !readonly && (
                        <div className="flex ">
                            <Button className=" flex-1 mx-2" onPress={(e) => openModal()}>
                                Create Question from Scratch
                            </Button>
                            <Button className=" flex-1 mx-2" onPress={(e) => onLambdaOpen()}>
                                Create Question by Link
                            </Button>
                        </div>
                    )
                }
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
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn
                            key={column.key}
                            align={column.key === "actions" ? "center" : "start"}
                            className={column.class}
                            allowsSorting={column.sort}
                            allowsResizing={true}
                        >
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={sortedQuestionItems} emptyContent={"No rows to display."}>
                    {(row) => (
                        <TableRow key={row.id}>
                            {(columnKey) => (
                                <TableCell key={columnKey}>
                                    {renderCell(row, columnKey as string, readonly)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
}
