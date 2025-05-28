import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Forward the request to the OCR API
        const response = await fetch('https://api.porsi.me', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            },
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