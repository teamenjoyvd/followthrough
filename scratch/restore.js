const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Path to the log files
const LOG_PATHS = [
  'C:\\Users\\fefence\\.gemini\\antigravity\\brain\\ff2b00c0-ec59-4631-92a0-13c9eefd4943\\.system_generated\\logs\\transcript.jsonl'
];

async function parseLogs() {
  const edits = [];

  for (const logPath of LOG_PATHS) {
    if (!fs.existsSync(logPath)) {
      console.log(`Log file not found: ${logPath}`);
      continue;
    }

    console.log(`Parsing log: ${logPath}`);
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      if (!line.trim()) continue;
      const obj = JSON.parse(line);
      
      // We only care about successful tool calls from the model
      if (obj.source === 'MODEL' && obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (['write_to_file', 'replace_file_content', 'multi_replace_file_content'].includes(tc.name)) {
            // Helper to clean double-JSON escaped strings
            const getArg = (val) => {
              if (typeof val === 'string') {
                if (val.startsWith('"') && val.endsWith('"')) {
                  try { return JSON.parse(val); } catch { return val; }
                }
                return val;
              }
              return val;
            };

            const targetFile = getArg(tc.args.TargetFile);
            // Only replay edits to our workspace (skip brain plan/task artifacts)
            if (!targetFile.toLowerCase().includes('followthrough')) {
              continue;
            }

            edits.push({
              step_index: obj.step_index,
              tool: tc.name,
              targetFile: path.normalize(targetFile),
              args: tc.args,
              getArg
            });
          }
        }
      }
    }
  }

  console.log(`Found ${edits.length} total workspace edits in logs.`);
  return edits;
}

function applyReplace(content, targetContent, replacementContent) {
  // Normalize all newlines to \n to prevent Windows \r\n lookup issues
  const cleanStr = (s) => s.replace(/\r\n/g, '\n');
  
  const normContent = cleanStr(content);
  const normTarget = cleanStr(targetContent);
  const normReplacement = cleanStr(replacementContent);
  
  const index = normContent.indexOf(normTarget);
  if (index === -1) {
    throw new Error(`Target content not found in file.`);
  }
  return normContent.substring(0, index) + normReplacement + normContent.substring(index + normTarget.length);
}

async function run() {
  const edits = await parseLogs();
  
  for (const edit of edits) {
    const file = edit.targetFile;
    console.log(`Replaying step ${edit.step_index}: ${edit.tool} on ${file}`);

    if (edit.tool === 'write_to_file') {
      const codeContent = edit.getArg(edit.args.CodeContent);
      // Ensure parent directory exists
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, codeContent.replace(/\r\n/g, '\n'), 'utf8');
    } else if (edit.tool === 'replace_file_content') {
      if (!fs.existsSync(file)) {
        console.warn(`File does not exist (skipping): ${file}`);
        continue;
      }
      
      const targetContent = edit.getArg(edit.args.TargetContent);
      const replacementContent = edit.getArg(edit.args.ReplacementContent);
      
      let content = fs.readFileSync(file, 'utf8');
      try {
        content = applyReplace(content, targetContent, replacementContent);
        fs.writeFileSync(file, content, 'utf8');
      } catch (err) {
        console.error(`Failed replace at step ${edit.step_index} for ${file}: ${err.message}`);
      }
    } else if (edit.tool === 'multi_replace_file_content') {
      if (!fs.existsSync(file)) {
        console.warn(`File does not exist (skipping): ${file}`);
        continue;
      }

      const chunksVal = edit.args.ReplacementChunks;
      const chunks = typeof chunksVal === 'string' ? JSON.parse(chunksVal) : chunksVal;
      
      let content = fs.readFileSync(file, 'utf8');
      
      for (const chunk of chunks) {
        const targetContent = edit.getArg(chunk.TargetContent);
        const replacementContent = edit.getArg(chunk.ReplacementContent);
        try {
          content = applyReplace(content, targetContent, replacementContent);
        } catch (err) {
          console.error(`Failed multi-replace chunk at step ${edit.step_index} for ${file}: ${err.message}`);
        }
      }
      fs.writeFileSync(file, content, 'utf8');
    }
  }

  // Handle the files we know should be deleted (from dead weight cleanup)
  const deadFiles = [
    'app/(dashboard)/dashboard/components/WorkingListDesktopClient.tsx',
    'app/(dashboard)/dashboard/components/WorkingListMobileClient.tsx'
  ].map(f => path.normalize(path.join(__dirname, '..', f)));

  for (const dead of deadFiles) {
    if (fs.existsSync(dead)) {
      console.log(`Deleting dead file: ${dead}`);
      fs.unlinkSync(dead);
    }
  }

  console.log('Recovery completed successfully!');
}

run().catch(console.error);
