import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided in the request' },
                { status: 400 }
            );
        }

        console.log('OCR API: Processing file:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        // Create new FormData to ensure proper formatting
        const apiFormData = new FormData();
        apiFormData.append('file', file);

        // Forward the request to the OCR API
        const response = await fetch('https://api2.porsi.me/ocr', {
            method: 'POST',
            body: apiFormData,
            // Don't set Content-Type - let it be set automatically with boundary
        });

        if (!response.ok) {
            // If the main endpoint fails, try alternative endpoints or provide helpful error
            console.error(`OCR API failed with status: ${response.status}`);
            return NextResponse.json(
                {
                    text: "OCR service temporarily unavailable. Please input scores manually.",
                    error: `API returned ${response.status}`
                },
                { status: 200 } // Return 200 so frontend can handle gracefully
            );
        }

        const result = await response.json();

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('OCR Proxy Error:', error);

        return NextResponse.json(
            {
                error: 'Failed to process OCR request',
                message: error.message
            },
            { status: 500 }
        );
    }
} 