import Head from "next/head";
import { ChangeEvent, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkedSlider } from "@/components/ui/linkedslider";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_CHUNK_SIZE = 1024;
const DEFAULT_CHUNK_OVERLAP = 20;
const DEFAULT_TOP_K = 2;
const DEFAULT_TEMPERATURE = 0.1;
const DEFAULT_TOP_P = 1;

interface Character {
  name: string;
  description: string;
  personality: string;
}

export default function Home() {
  const sourceId = useId();
  const [text, setText] = useState("");
  const [needsNewIndex, setNeedsNewIndex] = useState(true);
  const [buildingIndex, setBuildingIndex] = useState(false);
  const [extractingCharacters, setExtractingCharacters] = useState(false);
  const [nodesWithEmbedding, setNodesWithEmbedding] = useState([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [message, setMessage] = useState("");

  // State variables for sliders
  const [chunkSize, setChunkSize] = useState(DEFAULT_CHUNK_SIZE.toString());
  const [chunkOverlap, setChunkOverlap] = useState(
    DEFAULT_CHUNK_OVERLAP.toString(),
  );
  const [topK, setTopK] = useState(DEFAULT_TOP_K.toString());
  const [temperature, setTemperature] = useState(
    DEFAULT_TEMPERATURE.toString(),
  );
  const [topP, setTopP] = useState(DEFAULT_TOP_P.toString());

  return (
    <>
      <Head>
        <title>Character Extraction with LlamaIndex</title>
      </Head>
      <main className="mx-2 flex h-full flex-col lg:mx-56">
        {/* File Upload Section */}
        <div className="my-2 flex h-3/4 flex-auto flex-col space-y-2">
          <Label htmlFor={sourceId}>Upload a .txt file:</Label>
          <Input
            id={sourceId}
            type="file"
            accept=".txt"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const fileContent = event.target?.result as string;
                  setText(fileContent);
                  setNeedsNewIndex(true);
                  setCharacters([]);
                };
                if (file.type !== "text/plain") {
                  console.error(`${file.type} parsing not implemented`);
                  setText("Error");
                } else {
                  reader.readAsText(file);
                }
              }
            }}
          />
          {/* Display uploaded text */}
          {text && (
            <Textarea
              value={text}
              readOnly
              placeholder="File contents will appear here"
              className="mt-2 flex-1"
            />
          )}
        </div>

        {/* Sliders for chunkSize and chunkOverlap */}
        <div className="space-y-2">
          <Label>Settings:</Label>
          <div>
            <LinkedSlider
              label="Chunk Size:"
              description={
                "The maximum size of the chunks we are searching over, in tokens. " +
                "The bigger the chunk, the more likely that the information you are looking " +
                "for is in the chunk, but also the more likely that the chunk will contain " +
                "irrelevant information."
              }
              min={1}
              max={3000}
              step={1}
              value={chunkSize}
              onChange={(value: string) => {
                setChunkSize(value);
                setNeedsNewIndex(true);
              }}
            />
          </div>
          <div>
            <LinkedSlider
              label="Chunk Overlap:"
              description={
                "The maximum amount of overlap between chunks, in tokens. " +
                "Overlap helps ensure that sufficient contextual information is retained."
              }
              min={1}
              max={600}
              step={1}
              value={chunkOverlap}
              onChange={(value: string) => {
                setChunkOverlap(value);
                setNeedsNewIndex(true);
              }}
            />
          </div>
        </div>

        {/* Build Index Button */}
        <Button
          disabled={!needsNewIndex || buildingIndex || extractingCharacters}
          onClick={async () => {
            setMessage("Building index...");
            setBuildingIndex(true);
            setNeedsNewIndex(false);
            const result = await fetch("/api/splitandembed", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                document: text,
                chunkSize: parseInt(chunkSize),
                chunkOverlap: parseInt(chunkOverlap),
              }),
            });
            const { error, payload } = await result.json();

            if (error) {
              setMessage(error);
            }

            if (payload) {
              setNodesWithEmbedding(payload.nodesWithEmbedding);
              setMessage("Index built!");
            }

            setBuildingIndex(false);
          }}
        >
          {buildingIndex ? "Building Index..." : "Build Index"}
        </Button>

        {!buildingIndex && !needsNewIndex && (
          <>
            {/* Sliders for topK, temperature, and topP */}
            <LinkedSlider
              className="my-2"
              label="Top K:"
              description={
                "The maximum number of chunks to return from the search. " +
                "It's called Top K because we are retrieving the K nearest neighbors of the query."
              }
              min={1}
              max={15}
              step={1}
              value={topK}
              onChange={(value: string) => {
                setTopK(value);
              }}
            />

            <LinkedSlider
              className="my-2"
              label="Temperature:"
              description={
                "Temperature controls the variability of model response. Adjust it " +
                "downwards to get more consistent responses, and upwards to get more diversity."
              }
              min={0}
              max={1}
              step={0.01}
              value={temperature}
              onChange={(value: string) => {
                setTemperature(value);
              }}
            />

            <LinkedSlider
              className="my-2"
              label="Top P:"
              description={
                "Top P is another way to control the variability of the model " +
                "response. It filters out low probability options for the model. It's " +
                "recommended by OpenAI to set temperature to 1 if you're adjusting " +
                "the top P."
              }
              min={0}
              max={1}
              step={0.01}
              value={topP}
              onChange={(value: string) => {
                setTopP(value);
              }}
            />

            {/* Extract Characters Button */}
            <Button
              className="my-2"
              disabled={extractingCharacters}
              onClick={async () => {
                setMessage("Extracting characters...");
                setExtractingCharacters(true);
                const result = await fetch("/api/extractcharacters", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    nodesWithEmbedding,
                    topK: parseInt(topK),
                    temperature: parseFloat(temperature),
                    topP: parseFloat(topP),
                  }),
                });
                const { error, payload } = await result.json();

                if (error) {
                  setMessage(error);
                }

                if (payload) {
                  setCharacters(payload.characters);
                  setMessage("Characters extracted!");
                }

                setExtractingCharacters(false);
              }}
            >
              {extractingCharacters
                ? "Extracting Characters..."
                : "Extract Characters"}
            </Button>

            {message && <p>{message}</p>}

            {/* Display results in JSON format */}
            {characters.length > 0 && (
              <>
                <Label>Results (JSON):</Label>
                <Textarea
                  className="flex-1"
                  readOnly
                  value={JSON.stringify(characters, null, 2)}
                />

                {/* Display characters in a table */}
                <table className="mt-4 w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">Personality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {characters.map((character, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{character.name}</td>
                        <td className="px-4 py-2">{character.description}</td>
                        <td className="px-4 py-2">{character.personality}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
