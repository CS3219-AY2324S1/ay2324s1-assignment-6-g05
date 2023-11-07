from leetscrape.GetQuestionInfo import GetQuestionInfo
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
import json
import os
import requests

def handler(event, context):
    # Set retry for app.
    maxRetries = 5  
    retryCount = 0 

    while retryCount < maxRetries:
        try:
            print(event)
            # Get required field from req
            body = json.loads(event.get("body", ""))
            print(body)
            leetcodeUrl = body.get("link", "")
            print(event.get("cookies", ""))
            cookieToken = event.get("cookies", "")[0]
            print(cookieToken)

            # Parse url link and retrieve question via leetscrape library
            urlParts = leetcodeUrl.split('/')
            questionSlug = urlParts[-2]
            elementText = GetQuestionInfo(questionSlug).scrape().Body

            # Use OpenAI to format to JSON.
            OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

            llm = OpenAI(
                openai_api_key=OPENAI_API_KEY)

            prompt = PromptTemplate.from_template('Given the following input of html, I want you to extract out a JSON format given the following types:'

                                                '1.title: string;'
                                                '2.description: string;'
                                                '3.topics: Topic[]; // enum'
                                                '4.complexity: Complexity; // enum'
                                                '// optional attributes'
                                                '5.examples?: Example[];'
                                                '6.constraints?: string[];'

                                                'For 5.examples, use the following type:'
                                                'type Example:'
                                                'input: string;'
                                                'output: string;'
                                                'explanation?: string;'

                                                'For 3.topics and 4.complexity, Use ONLY the following possible enums:'
                                                'enum Topic:'
                                                '"ARRAY",'
                                                '"STRING",'
                                                '"HASH TABLE",'
                                                '"MATH",'
                                                '"DYNAMIC PROGRAMMING",'
                                                '"SORTING",'
                                                '"GREEDY",'
                                                '"DEPTH-FIRST SEARCH",'
                                                '"BINARY SEARCH",'
                                                '"DATABASE",'
                                                '"BREADTH-FIRST SEARCH",'
                                                '"TREE",'
                                                '"MATRIX",'
                                                '"TWO POINTERS",'
                                                '"BINARY TREE",'
                                                '"BIT MANIPULATION",'
                                                '"HEAP (PRIORITY QUEUE)",'
                                                '"STACK",'
                                                '"PREFIX SUM",'
                                                '"GRAPH",'
                                                '"BACKTRACKING",'
                                                '"SLIDING WINDOW",'
                                                '"UNION FIND",'
                                                '"LINKED LIST",'
                                                '"TRIE",'
                                                '"RECURSION",'
                                                '"DIVIDE AND CONQUER",'
                                                '"QUEUE",'
                                                '"MEMOIZATION",'
                                                '"TOPOLOGICAL SORT",'
                                                '"QUICKSELECT",'
                                                '"BRAIN TEASER",'

                                                'enum Complexity:'
                                                '"EASY",'
                                                '"MEDIUM",'
                                                '"HARD",'

                                                'The input is: '
                                                '{question}?'

                                                'IMPORTANT: Only return the JSON with quotation marks around the keys. Make sure the JSON is properly formatted with proper closing brackets.'
                                                )

            firstPrompt = prompt.format(question=elementText)
            firstResult = llm.predict(firstPrompt)

            formatPrompt = PromptTemplate.from_template('Given the following JSON:'
                                                        '{json}'
                                                        'If it is not terminated properly, ensure that it is terminated and return the result in proper JSON format.'
                                                        'Only return the JSON format. Do not include other texts.')
            
            secondPrompt = formatPrompt.format(json=firstResult)
            secondResult = llm.predict(secondPrompt)

            data = json.loads(secondResult)  
            data["url"] = leetcodeUrl    

            print(data)    

            # POST request to insert question into database
            apiUrl = "https://1ht9alhibg.execute-api.ap-southeast-1.amazonaws.com/question/api/questions"

            headers = {
                "Content-Type": "application/json",  # Set the Content-Type header as an example
                "Authorization": "Bearer your_access_token",  # Set any other headers you need
                "Cookie": cookieToken
            }

            response = requests.post(url=apiUrl, json=data, headers=headers)

            if response.status_code == 201:
                return {
                "statusCode": 200,
                "body": "Lambda function ran successfully. Question is inserted into database."
            }
            else:
                return {
                "statusCode": 400,
                "body": "Lambda function ran successfully but question is not inserted into database. The following error occurred:\nstatus code: {}\ncontent: {}".format(str(response.status_code), response.content)
                }


        except Exception as e:
            print("Error. Current retry count: {}".format(str(retryCount)))
            print(e)
            retryCount += 1


    return {
        "statusCode": 408,
        "body": "Lambda function error"
    }

# if __name__ == "__main__":
#     asyncio.run(handler(event={"link" : "https://leetcode.com/problems/generate-parentheses/"}, context=""))