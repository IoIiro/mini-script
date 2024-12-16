const fs = require("fs");
const path = require("path");

function find_byte_sequence(buffer, sequence) {
  let result = [];
  let position = buffer.indexOf(sequence);

  while (position !== -1) {
    result.push(position);
    position = buffer.indexOf(sequence, position + sequence.length);
  }
  return result;
}

function search_in_binary(filePath, searchValue) {
  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    return;
  }

  const buffer = fs.readFileSync(filePath);
  const searchBuffer = Buffer.from(searchValue);

  console.log(`Searching for "${searchValue}" in the file...`);
  const positions = find_byte_sequence(buffer, searchBuffer);

  if (positions.length > 0) {
    console.log(
      `Found "${searchValue}" at offset(s): ${positions
        .map((pos) => `0x${pos.toString(16)}`)
        .join(", ")}`
    );
  } else {
    console.log(`"${searchValue}" not found in the file.`);
  }
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node search.js <FILE_PATH> <SEARCH_VALUE>");
  process.exit(1);
}

const [filePath, searchValue] = args;
search_in_binary(filePath, searchValue);
