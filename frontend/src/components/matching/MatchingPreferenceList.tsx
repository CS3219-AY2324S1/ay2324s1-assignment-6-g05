import { Tooltip } from "@nextui-org/react";
import Preference from "@/types/preference";
import ComplexityChip from "../question/ComplexityChip";

export default function MatchingPreferenceList(preference: Preference) {
    return (
        <div className="flex flex-col items-center gap-1 border-1 border-slate-600 rounded-md p-2 w-4/5">
          <div className="flex flex-row gap-2 text-sm">
            <span>Questions will be selected from:</span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <div>
              <Tooltip className="capitalize" content={preference?.languages.join(", ").toLowerCase()}>
                <span className="capitalize text-ellipsis line-clamp-1">{preference?.languages.join(", ").toLowerCase()}</span>
              </Tooltip>
            </div>
            <div className=" flex flex-col items-center gap-1">
              {preference?.difficulties.map(item => (
                <ComplexityChip key={item} complexity={item}></ComplexityChip>
              ))}
            </div>
            <div>
              <Tooltip className="capitalize" content={preference?.topics.join(", ").toLowerCase()}>
                <span className="capitalize text-ellipsis line-clamp-1">{preference?.topics.join(", ").toLowerCase()}</span>
              </Tooltip>
            </div>
          </div>
        </div>
    )
}