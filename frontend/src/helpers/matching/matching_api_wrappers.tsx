"use server";
import { DOMAIN } from "@/types/enums";
import { getSocketConfig } from "../endpoint";
import { getLogger } from "../logger";

const logger = getLogger("wrapper");

export async function getMatchingSocketConfig() {
  return await getSocketConfig(DOMAIN.MATCHING);
}
