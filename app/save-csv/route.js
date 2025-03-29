import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Define the CSV file path
    const csvFilePath = path.join(process.cwd(), 'output.csv');
    
    // Check if file exists to determine if we need to add headers
    let fileExists = false;
    try {
      await fsPromises.access(csvFilePath);
      fileExists = true;
    } catch (error) {
      // File doesn't exist, we'll create it
    }
    
    // Format the data as a CSV row
    const headers = 'task,startDate,endDate,purpose\n';
    const row = `"${data.task.replace(/"/g, '""')}","${data.startDate}","${data.endDate}","${data.purpose.replace(/"/g, '""')}"\n`;
    
    // Write to the file (create or append)
    if (!fileExists) {
      // Create new file with headers
      await fsPromises.writeFile(csvFilePath, headers + row);
    } else {
      // Append to existing file
      await fsPromises.appendFile(csvFilePath, row);
    }
    
    // Return success response
    return NextResponse.json({ success: true, message: 'Data saved to CSV' });
  } catch (error) {
    console.error('Error saving CSV data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save data', error: error.message },
      { status: 500 }
    );
  }
}