import { COMPLEXITY } from "@/types/enums";
import { Chip } from "@nextui-org/react";

const variant = "solid";

function renderChip(complexity: string, size: "sm" | "md" | "lg") {
  switch (complexity.toUpperCase()) {
    case COMPLEXITY.EASY:
      return (
        <Chip
          classNames={{
            content: "font-semibold",
          }}
          color="success"
          variant={variant}
          size={size}
        >
          Easy
        </Chip>
      );
    case COMPLEXITY.MEDIUM:
      return (
        <Chip
          classNames={{
            content: "font-semibold",
          }}
          color="warning"
          variant={variant}
          size={size}
        >
          Medium
        </Chip>
      );
    case COMPLEXITY.HARD:
      return (
        <Chip
          classNames={{
            content: "font-semibold",
          }}
          color="danger"
          variant={variant}
          size={size}
        >
          Hard
        </Chip>
      );
    default:
      return <Chip>{complexity}</Chip>;
  }
}

export default function ComplexityChip({
  complexity,
  size = "sm",
}: {
  complexity: string;
  size?: "sm" | "md" | "lg";
}) {
  return renderChip(complexity, size);
}
