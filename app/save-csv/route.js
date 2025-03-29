import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request) {
  try {
    // First ensure the request is valid
    const data = await request.json();
    
    // Save to CSV first
    const csvFilePath = path.join(process.cwd(), 'output.csv');
    const row = `"${data.startDate}","${data.endDate}","${data.task}","${data.purpose}"\n`;
    await fs.writeFile(csvFilePath, row);

    // Then execute Python script
    const pythonScript = path.join(process.cwd(), 'llm-parsing', 'gpt.py');
    const { stdout, stderr } = await execAsync(`python "${pythonScript}"`);
    
    if (stderr) {
      console.error('Python script error:', stderr);
      return NextResponse.json({ success: false, error: stderr });
    }

    // Parse Python script output
    try {
      const result = JSON.parse(stdout);
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('Failed to parse Python output:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid response from Python script' 
      });
    }
    
  } catch (error) {
    console.error('Operation failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}