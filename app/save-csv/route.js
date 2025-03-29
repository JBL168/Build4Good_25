import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fsPromises } from 'fs';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Define the CSV file path
    const csvFilePath = path.join(process.cwd(), 'output.csv');
    
    // Format the data as a CSV row
    
    const row = `"${data.startDate}","${data.endDate}","${data.task.replace(/"/g, '""')}","${data.purpose.replace(/"/g, '""')}"\n`;
    
    // Always create a new file with headers (wiping any existing content)
    await fsPromises.writeFile(csvFilePath,row);
    
    // Return success response
    return NextResponse.json({ success: true, message: 'Data saved to CSV (file was reset)' });
  } catch (error) {
    console.error('Error saving CSV data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save data', error: error.message },
      { status: 500 }
    );
  }
}
