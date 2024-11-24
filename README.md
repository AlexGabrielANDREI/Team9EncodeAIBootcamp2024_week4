# Character Extraction with LlamaIndex 📚

> An AI-powered web application that extracts character information from text documents using LlamaIndex and GPT-4.

## 🌟 Overview

This application helps you analyze text documents by automatically extracting character information using a Retrieval-Augmented Generation (RAG) pipeline. Simply upload a text file (like a book or script), and the system will identify and describe the characters within it.

### Key Features

- 📤 **File Upload**: Process any .txt file containing character-rich content
- ⚙️ **Customizable Parameters**: Fine-tune the extraction process
- 🔍 **Smart Indexing**: Efficient text processing using vector embeddings
- 🤖 **AI-Powered Analysis**: Character extraction using GPT-4
- 📊 **Dual Display**: View results in both JSON and table format

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- OpenAI API key

### Installation

1. Clone the repository

bash
git clone https://github.com/yourusername/character-extraction-llamaindex.git
cd character-extraction-llamaindex


2. Install dependencies

bash
npm install
```

3. Configure environment

bash
Create .env.local and add your OpenAI API key
echo "OPENAI_API_KEY=your-openai-api-key" > .env.local
```

4. Start the development server

bash
npm run dev
```

Visit `http://localhost:3000` to use the application.

## 💡 Usage Guide

### 1. Upload Text
- Select a .txt file using the file input
- Review the content in the preview area

### 2. Configure Settings (Optional)
| Parameter | Description |
|-----------|-------------|
| Chunk Size | Size of text segments for processing |
| Chunk Overlap | Overlap between consecutive chunks |
| Top K | Number of relevant chunks to retrieve |
| Temperature | Controls response creativity |
| Top P | Controls response probability filtering |

### 3. Process Text
1. Click "Build Index" to create the vector index
2. Click "Extract Characters" to analyze the text
3. View results in JSON format and table view

## 🛠 Technology Stack

- **Frontend**: Next.js + TypeScript
- **AI Processing**: LlamaIndex + OpenAI GPT-4
- **Data Processing**: Vector embeddings for efficient retrieval

## 📁 Project Structure

├── pages/
│ ├── index.tsx # Main application page
│ └── api/
│ ├── splitandembed.ts # Text processing endpoint
│ └── extractcharacters.ts # Character extraction endpoint
├── components/
│ └── ui/ # UI components
└── lib/ # Utility functions


## 🔧 API Endpoints

### POST `/api/splitandembed`
Processes text and generates embeddings.

### POST `/api/extractcharacters`
Extracts character information from processed text.

## ⚠️ Troubleshooting

- **API Key Issues**: Verify your OpenAI API key in `.env.local`
- **Model Access**: Ensure your API key has GPT-4 access
- **CORS Errors**: Check API route configuration
- **JSON Parsing**: Adjust model parameters if receiving malformed responses

## 📦 Dependencies

- llamaindex
- next
- react
- openai

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.