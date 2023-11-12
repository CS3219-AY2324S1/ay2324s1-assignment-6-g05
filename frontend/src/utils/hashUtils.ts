import crypto from "crypto";

export function verifyRoomParamsIntegrity(
  roomId: string,
  userId: string,
  partnerId: string,
  questionId: string,
  language: string
): boolean {
  const hasher = crypto.createHash("sha256");
  hasher.update(userId + partnerId + questionId + language.toLowerCase());
  const isRoomHostHash = hasher.digest("hex").slice(0, 20);

  const newHaher = crypto.createHash("sha256");
  newHaher.update(partnerId + userId + questionId + language.toLowerCase());
  const isRoomPartnerHash = newHaher.digest("hex").slice(0, 20);

  // either the current user is the room host, or the partner
  return roomId === isRoomHostHash || roomId === isRoomPartnerHash;
}
