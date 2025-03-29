import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request) {
  try {
    const data = await request.json();
    
    // 1. Save to CSV file
    const csvFilePath = path.join(process.cwd(), 'output.csv');
    const row = `"${data.startDate}","${data.endDate}","${data.task.replace(/"/g, '""')}","${data.purpose.replace(/"/g, '""')}"\n`;
    await fsPromises.writeFile(csvFilePath,row);

    // Write headers if file doesn't exist
    try {
      await fsPromises.access(csvFilePath);
    } catch {
      await fsPromises.writeFile(csvFilePath, headers);
    }

    // 2. Execute python script
    const pythonScript = 'llm-parsing/gpt.py';
    const { stdout, stderr } = await execAsync(`python "${pythonScript}"`);
    
    if (stderr) {
      console.error('Python script error:', stderr);
      return NextResponse.json({ 
        csvSuccess: true,
        pythonSuccess: false,
        error: stderr 
      }, { status: 500 });
    }


    // Return success response
    return NextResponse.json({ 
      csvSuccess: true,
      pythonSuccess: true,
      pythonOutput: stdout,
      message: 'Data saved and Python script executed successfully'
    });
  } catch (error) {
    console.error('Operation failed:', error);
    return NextResponse.json(
      { 
        csvSuccess: false,
        pythonSuccess: false,
        message: 'Operation failed', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}