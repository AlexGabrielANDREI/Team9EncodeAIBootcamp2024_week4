import type { NextApiRequest, NextApiResponse } from "next";

import {
  IndexDict,
  OpenAI,
  RetrieverQueryEngine,
  TextNode,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

type Input = {
  nodesWithEmbedding: {
    text: string;
    embedding: number[];
  }[];
  topK?: number;
  temperature?: number;
  topP?: number;
};

type Output = {
  error?: string;
  payload?: {
    characters: {
      name: string;
      description: string;
      personality: string;
    }[];
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Output>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const {
    nodesWithEmbedding,
    topK = 2,
    temperature = 0.1,
    topP = 1,
  }: Input = req.body;

  const embeddingResults = nodesWithEmbedding.map((config) => {
    return new TextNode({ text: config.text, embedding: config.embedding });
  });

  const indexDict = new IndexDict();
  for (const node of embeddingResults) {
    indexDict.addNode(node);
  }

  const index = await VectorStoreIndex.init({
    indexStruct: indexDict,
    serviceContext: serviceContextFromDefaults({
      llm: new OpenAI({
        model: "gpt-4",
        temperature: temperature,
        topP: topP,
      }),
    }),
  });

  index.vectorStore.add(embeddingResults);
  if (!index.vectorStore.storesText) {
    await index.docStore.addDocuments(embeddingResults, true);
  }
  await index.indexStore?.addIndexStruct(indexDict);
  index.indexStruct = indexDict;

  const retriever = index.asRetriever();
  retriever.similarityTopK = topK;

  const queryEngine = new RetrieverQueryEngine(retriever);

  // Define the prompt to extract characters
  const prompt = `
    You are an expert in literary analysis. Extract all the characters from the provided text. 
    For each character, provide their name, a brief description, and their personality traits.
    Return the result as a JSON array of objects with the following keys: "name", "description", and "personality".
  `;

  const result = await queryEngine.query(prompt);

  // Parse the result.response into JSON
  let characters = [];
  try {
    characters = JSON.parse(result.response);
  } catch (e) {
    res.status(200).json({
      error:
        "Failed to parse AI response into JSON. Please ensure the AI response is in correct JSON format.",
    });
    return;
  }

  res.status(200).json({ payload: { characters } });
}
