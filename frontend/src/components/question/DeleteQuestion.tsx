import { deleteQuestion } from "@/helpers/question/question_api_wrappers";
import { CircularProgress, Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { Icons } from "../common/Icons";
import displayToast from "../common/Toast";
import { HTTP_METHODS, ToastType } from "@/types/enums";
import HttpStatusCode from "@/types/HttpStatusCode";
import { getLogger } from "@/helpers/logger";

export default function DeleteQuestion({ id }: { id: string }) {
  const [isConfirm, setIsConfirm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  async function handleDelete(id: string) {
    setIsLoading(true);
    try {
      let response = await deleteQuestion(id);
      
      if (response.status === HttpStatusCode.NO_CONTENT) {
        displayToast("Question deleted.", ToastType.SUCCESS);
      } else {
        setError(true);
        displayToast("Fail to delete question.", ToastType.ERROR);
      }
    } catch (error) {
      getLogger().error(error);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (isConfirm) {
      setTimeout(() => {
        setIsConfirm(false);
      }, 3000)
    }
  }, [isConfirm])

  return (
    <>
      {isConfirm && !isLoading && (
        <Tooltip content="Confirm delete?">
          <span
          className="text-lg text-warning cursor-pointer active:opacity-50 w-8 h-8 p-1.5"
          onClick={(e) => handleDelete(id)}
        >
          <Icons.FiCheck />
        </span>
        </Tooltip>
      )}
      {isLoading && <CircularProgress size="sm" aria-label="Loading..." color="primary"/>}
      {!isLoading && !isConfirm && (
        <Tooltip content="Delete question">
        <span
          className="text-lg text-danger cursor-pointer active:opacity-50 w-8 h-8 p-1.5"
          onClick={(e) => setIsConfirm(true)}
        >
          {!error && <Icons.FiTrash />}
          {error && <Icons.FiX />}
        </span>
        </Tooltip>
      )}
    </>
  );
}
