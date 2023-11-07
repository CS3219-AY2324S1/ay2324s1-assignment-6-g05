"use server";
import api, { apiLambda } from "@/helpers/endpoint";
import { getLogger } from "@/helpers/logger";
import { HTTP_METHODS, DOMAIN } from "@/types/enums";
import Question from "@/types/question";
import { revalidateTag } from "next/cache";
import Preference from "@/types/preference";
import HttpStatusCode from "@/types/HttpStatusCode";

const logger = getLogger("wrapper");
const domain = DOMAIN.QUESTION;
const resourceQuestion = "questions";
const scope = [DOMAIN.QUESTION];

type MongoQuestionList = {
    count: number;
    data: Question[];
};

/**
 * get: /api/questions
 * Retrieves a list of questions from the API.
 * @returns {Promise<Question[]>} - A list of questions.
 */
export async function getQuestionList(): Promise<Question[]> {
    let questions: Question[] = [];

    const response = await api({
        method: HTTP_METHODS.GET,
        domain: domain,
        path: resourceQuestion,
        tags: scope,
    });

    if (response.status === HttpStatusCode.OK) {
        let mongoRes = response.data as MongoQuestionList;
        questions = mongoRes.data;
        return questions;
    }

    return [];
}

/**
 * get: /api/questions/[id]
 * Retrieves a question by its ID from the API.
 * @param {string} id - The ID of the question to retrieve.
 * @returns {Promise<Question>} - The retrieved question.
 */
export async function getQuestionById(id: string, cache: RequestCache = "no-cache") {
    const response = await api({
        method: HTTP_METHODS.GET,
        domain: domain,
        path: `${resourceQuestion}/${id}`,
        tags: scope,
        cache: cache,
    });

    if (response.status === HttpStatusCode.OK) {
        let question = response.data as Question;
        return question;
    }

    return response;
}

/**
 * Get a question base on a set of preference
 * @param preference given preference | surprise me
 */
export async function getQuestionByPreference(
    preference: Preference | undefined,
    cache: RequestCache = "no-cache"
) {
    let questions = [];

    const complexityFilter = preference?.difficulties.map((d) => `complexity=${d}`).join(`&`);
    const topicFilter = preference?.topics.map((d) => `topic=${d}`).join(`&`);
    const queryPath = `?${topicFilter}&${complexityFilter}`;

    const response = await api({
        method: HTTP_METHODS.GET,
        domain: domain,
        path: `${resourceQuestion}/${queryPath}`,
        tags: scope,
        cache: cache,
    });

    if (response.status === HttpStatusCode.OK) {
        const mongoRes = response.data as MongoQuestionList;
        questions = mongoRes.data;
        return questions;
    }

    return [];
}

export async function getTopics() {
    const response = await api({
        method: HTTP_METHODS.GET,
        domain: domain,
        path: `topics`,
        tags: [`topics`],
    });

    if (response.status === HttpStatusCode.OK) {
        const topics = response.data["topics"] as string[];
        return topics;
    }

    return [];
}

/**
 * post: /api/questions
 * Posts a new question to the API.
 * @param {Question} question - The question object to post.
 */
export async function postQuestion(question: Question) {
    const response = await api({
        method: HTTP_METHODS.POST,
        domain: domain,
        body: question,
        path: resourceQuestion,
        tags: scope,
    });

    logger.debug(response, `[postQuestion]`);
    if (response.status === HttpStatusCode.CREATED) {
        revalidateTag(DOMAIN.QUESTION);
    }

    return response;
}

export async function postQuestionLambda(leetcodeUrl: string) {
    const response = await apiLambda(leetcodeUrl);

    return response;
}

/**
 * put: /api/questions/[id]
 * Updates an existing question on the API.
 * @param {string} id - The ID of the question to update.
 * @param {Question} question - The updated question object.
 */
export async function updateQuestion(id: string, question: Question) {
    const response = await api({
        method: HTTP_METHODS.PUT,
        domain: domain,
        path: `${resourceQuestion}/${id}`,
        body: question,
        tags: scope,
    });

    logger.debug(response, `[updateQuestion]`);
    if (response.status === HttpStatusCode.NO_CONTENT) {
        revalidateTag(DOMAIN.QUESTION);
    }

    return response;
}

/**
 * delete: /api/questions/[id]
 * Deletes a question from the API by its ID.
 * @param {string} id - The ID of the question to delete.
 */
export async function deleteQuestion(id: string) {
    const response = await api({
        method: HTTP_METHODS.DELETE,
        domain: domain,
        path: `${resourceQuestion}/${id}`,
        tags: scope,
    });

    logger.debug(response, `[deleteQuestion]`);
    if (response.status === HttpStatusCode.NO_CONTENT) {
        revalidateTag(DOMAIN.QUESTION);
    }

    return response;
}
