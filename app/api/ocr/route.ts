import { NextRequest, NextResponse } from 'next/server';

// Configure the API route for larger payloads and longer execution time
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for Vercel Pro, 10 seconds for hobby

export async function POST(request: NextRequest) {
    try {
        // Check content length before processing
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 413 }
            );
        }

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

        // Additional file size check
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 413 }
            );
        }

        // Create new FormData to ensure proper formatting
        const apiFormData = new FormData();
        apiFormData.append('file', file);

        // Forward the request to the OCR API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minute timeout

        try {
            const response = await fetch('https://api2.porsi.me/ocr', {
                method: 'POST',
                body: apiFormData,
                signal: controller.signal,
                // Don't set Content-Type - let it be set automatically with boundary
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                // Handle specific error codes
                if (response.status === 413) {
                    return NextResponse.json(
                        { error: 'File too large for OCR service. Please compress the image and try again.' },
                        { status: 413 }
                    );
                }

                console.error(`OCR API failed with status: ${response.status}`);
                const errorText = await response.text().catch(() => 'Unknown error');

                return NextResponse.json(
                    {
                        text: "OCR service temporarily unavailable. Please input scores manually.",
                        error: `API returned ${response.status}: ${errorText}`
                    },
                    { status: 200 } // Return 200 so frontend can handle gracefully
                );
            }

            const result = await response.json();
            return NextResponse.json(result);

        } catch (fetchError: any) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
                return NextResponse.json(
                    {
                        text: "OCR processing timed out. Please try with a smaller image or input scores manually.",
                        error: "Request timeout"
                    },
                    { status: 200 }
                );
            }

            throw fetchError;
        }

    } catch (error: any) {
        console.error('OCR Proxy Error:', error);

        // Handle specific error types
        if (error.message && error.message.includes('body size')) {
            return NextResponse.json(
                { error: 'Request body too large. Please compress the image and try again.' },
                { status: 413 }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to process OCR request',
                message: error.message
            },
            { status: 500 }
        );
    }
} 