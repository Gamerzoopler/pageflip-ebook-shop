
import { supabase } from "@/integrations/supabase/client";

export const createSamplePdf = (title: string, author: string, content: string): Blob => {
  // Create a simple PDF content using plain text
  const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
50 750 Td
(${title}) Tj
0 -50 Td
/F1 16 Tf
(by ${author}) Tj
0 -100 Td
/F1 12 Tf
(${content}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000301 00000 n 
0000000556 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
635
%%EOF`;

  return new Blob([pdfContent], { type: 'application/pdf' });
};

export const uploadPdfToStorage = async (fileName: string, pdfBlob: Blob) => {
  console.log(`Uploading PDF: ${fileName}`);
  
  const { data, error } = await supabase.storage
    .from('ebooks')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }

  console.log('PDF uploaded successfully:', data);
  return data;
};

export const generateAndUploadSamplePdfs = async () => {
  const books = [
    {
      fileName: 'the-digital-detective.pdf',
      title: 'The Digital Detective',
      author: 'Sarah Mitchell',
      content: 'A gripping mystery set in the digital age where Detective Morgan uses cutting-edge technology to solve complex crimes. Chapter 1: The Virtual Crime Scene...'
    },
    {
      fileName: 'hearts-in-bloom.pdf',
      title: 'Hearts in Bloom',
      author: 'Emily Rose',
      content: 'A heartwarming romance about love found in unexpected places. Chapter 1: The Flower Shop on Main Street - Lucy never expected that moving to a small town would change her life...'
    },
    {
      fileName: 'quantum-horizons.pdf',
      title: 'Quantum Horizons',
      author: 'Dr. Marcus Chen',
      content: 'An epic science fiction adventure exploring parallel universes and quantum physics. Chapter 1: The Quantum Gateway - Dr. Elena Vasquez stepped through the portal into a world where the laws of physics...'
    }
  ];

  for (const book of books) {
    const pdfBlob = createSamplePdf(book.title, book.author, book.content);
    await uploadPdfToStorage(book.fileName, pdfBlob);
  }
};
