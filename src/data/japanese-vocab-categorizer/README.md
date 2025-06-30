# Japanese Vocabulary Categorizer

This project is designed to categorize and organize Japanese vocabulary into distinct categories. It provides a structured approach to managing vocabulary entries, making it easier to study and reference.

## Project Structure

```
japanese-vocab-categorizer
├── src
│   ├── categories
│   │   └── index.ts          # Contains the function to get distinct categories
│   ├── data
│   │   └── vocabulary.ts      # Contains the vocabulary entries
│   ├── utils
│   │   └── categorize.ts       # Contains the function to categorize vocabulary
│   ├── app.ts                 # Entry point of the application
│   └── types
│       └── index.ts           # Contains type definitions for vocabulary and categories
├── package.json               # npm configuration file
├── tsconfig.json              # TypeScript configuration file
└── README.md                  # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd japanese-vocab-categorizer
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To run the application, use the following command:
```
npm start
```

This will execute the `app.ts` file, which categorizes the vocabulary and displays it according to the defined categories.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.