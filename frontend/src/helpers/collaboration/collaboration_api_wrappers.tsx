"use server";
import { DOMAIN } from "@/types/enums";
import { getSocketConfig } from "../endpoint";
import { getLogger } from "../logger";

const logger = getLogger("wrapper");

export async function getCollaborationSocketConfig() {
  const config = await getSocketConfig(DOMAIN.COLLABORATION);
  return config;
}
