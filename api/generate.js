/**
 * Vercel Serverless Function (Node.js)
 * 이 파일은 반드시 /api/generate.js 경로에 있어야 합니다.
 */

// module.exports를 사용하여 CommonJS 구문으로 작성합니다.
module.exports = async (request, response) => {
  try {
    // 1. POST 요청만 허용합니다.
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Vercel 서버에 설정된 환경 변수에서 API 키를 가져옵니다.
    //    process.env.GOOGLE_API_KEY
    const apiKey = process.env.GOOGLE_API_KEY;

    // 3. Vercel 서버에 API 키가 설정되어 있는지 확인합니다.
    if (!apiKey) {
      // Vercel 서버 로그에 오류를 남기고, 클라이언트에게는 일반 오류를 보냅니다.
      console.error('Server configuration error: GOOGLE_API_KEY is not set.');
      return response.status(500).json({ error: 'Server configuration error.' });
    }

    // 4. Google AI API 엔드포인트를 설정합니다.
    const genaiModel = "gemini-2.5-flash-preview-09-2025";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${genaiModel}:generateContent?key=${apiKey}`;

    // 5. 클라이언트(index.html)로부터 받은 요청 본문(request.body)을
    //    그대로 Google API로 전달합니다.
    const googleResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.body), // 클라이언트의 payload를 그대로 전달
    });

    // 6. Google API로부터 받은 응답을 파싱합니다.
    const data = await googleResponse.json();

    // 7. Google API가 오류를 반환한 경우, 해당 오류를 클라이언트에 전달합니다.
    if (!googleResponse.ok) {
      console.error('Google API Error:', data);
      return response.status(googleResponse.status).json(data);
    }

    // 8. 성공적인 응답을 클라이언트(index.html)에 다시 전달합니다.
    response.status(200).json(data);

  } catch (error) {
    // 9. 그 외 서버 측 오류 처리
    console.error('Internal Server Error:', error);
    response.status(500).json({ error: error.message });
  }
};
