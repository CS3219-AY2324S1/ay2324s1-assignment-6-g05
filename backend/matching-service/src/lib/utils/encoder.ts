import crypto from 'crypto';
import Preference from '../../models/types/preference';
import Complexity from '../enums/Complexity';
import Language from '../enums/Language';
import Topic from '../enums/Topic';

const languageLength = Object.keys(Language).length;
const difficultyLength = Object.keys(Complexity).length;
const topicLength = Object.keys(Topic).length;

function enumValues<T>(e: any): T[] {
  return Object.keys(e).map((key) => e[key]);
}

export function encodeEnum<E extends object>(enumObj: E, values: E[]): string {
  if (values.length === 0) {
    return "0".repeat(Object.keys(enumObj).length / 2);
  }

  let stringValues = values.map((x) => (x as String).toUpperCase());

  const binaryCode = enumValues(enumObj)
    .map((enumValue) =>
      stringValues.includes(enumValue as string) ? "1" : "0"
    )
    .join("");

  return binaryCode;
}

export function decodeEnum<E extends object>(enumObj: E, code: string): E[] {
    if (code.length !== Object.keys(enumObj).length) {
        return [];
    }

    let res: E[] = [];
    const enumIndexes = [...code]
    for (let i = 0; i < enumIndexes.length; i++) {
        if (enumIndexes[i] === "1") {
            res.push(Object.values(enumObj)[i]);
        }
    }

    return res;
}

export function binaryToHex(...input: string[]): string {
    var binaryString = input.join("");
    const decimalValue = parseInt(binaryString, 2);
    const hexString = decimalValue.toString(16); // Convert decimal to hexadecimal
    return hexString;
}

export function hexToBinary(input: string): string {
    const decimalValue = parseInt(input, 16);
    const binaryString = decimalValue.toString(2); // Convert decimal to binary
    return binaryString.padStart(languageLength + difficultyLength + topicLength, '0');
}

export function matchBinary(source: string, matching: string): string {
    if (source.length != matching.length) {
        throw new Error("Invalid matching binary indexes.");
    }

    let overlappingCode = "";
    let sourceCodes = source.match(/.{1,8}/g) || [];
    let matchingCodes = matching.match(/.{1,8}/g) || [];

    for (let i = 0; i < sourceCodes.length; i++) {
        var sourceAsDecimal = parseInt(sourceCodes[i], 2);
        var matchingAsDecimal = parseInt(matchingCodes[i], 2);
        overlappingCode += (sourceAsDecimal & matchingAsDecimal).toString(2).padStart(sourceCodes[i].length, "0");
    }

    return overlappingCode;
}

export function decodePreferences(preferenceCode: string) {
    // Ensure the string is of correct length
    if (preferenceCode.length != (languageLength + difficultyLength + topicLength)) {
        throw new Error("Invalid binary preference code.");
    }

    const languageCode = preferenceCode.slice(0, languageLength);
    const difficultyCode = preferenceCode.slice(languageLength, languageLength + difficultyLength);
    const topicCode = preferenceCode.slice(languageLength + difficultyLength);

    const decodedLanguage   = decodeEnum(Language, languageCode)
    const decodedDifficulty = decodeEnum(Complexity, difficultyCode)
    const decodedTopics     = decodeEnum(Topic, topicCode)

    return {
        languages: decodedLanguage,
        difficulties: decodedDifficulty,
        topics:decodedTopics,
        code: preferenceCode
    }
}

export function encodePreferences(preference: Preference) {
    const encodedLanguage = encodeEnum(Language, preference.languages);
    const encodedDifficulty = encodeEnum(Complexity, preference.difficulties);
    const encodedTopics = encodeEnum(Topic, preference.topics);
    return {
        languageCode: encodedLanguage,
        difficultyCode: encodedDifficulty,
        topicCode: encodedTopics,
        preferenceId: binaryToHex(encodedLanguage, encodedDifficulty, encodedTopics)
    };
}

export function ifPreferenceOverlapped(source: Preference, matching: Preference) {
    // Find overlapping languages
    if (source.languageCode && matching.languageCode) {
        var commonLanguage = matchBinary(source.languageCode, matching.languageCode);
        if (parseInt(commonLanguage, 2) === 0) {
            return false;
        }

        // Find overlapping difficulties
        if (source.difficultyCode && matching.difficultyCode) {
            var commonDifficulty = matchBinary(source.difficultyCode, matching.difficultyCode);
            if (parseInt(commonDifficulty, 2) === 0) {
                return false;
            }

            // Find overlapping topics
            if (source.topicCode && matching.topicCode) {
                var commonTopics = matchBinary(source.topicCode, matching.topicCode);
                if (parseInt(commonTopics, 2) === 0) {
                    return false;
                }
                return true;
            }
        }
    }
    return false;
}

export function getOverlappedPreferences(source: string, matching: string) {
    if (source && matching) {
        const overlappingPreferenceCode = matchBinary(hexToBinary(source), hexToBinary(matching));
        const overlappingPreference = decodePreferences(overlappingPreferenceCode);
        return overlappingPreference;
    }
    return decodePreferences(source);
}

export function generateRoomId(ownerId: string, partnerId: string, questionId: string, language: string): string {
    const inputString = ownerId + partnerId + questionId + language.toLowerCase();
    const hash = crypto.createHash('sha256');
    hash.update(inputString);
    return hash.digest('hex').slice(0, 20);
}
