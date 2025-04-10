// 백엔드 API URL 설정
const BACKEND_API_URL = '/api/query'; // 상대 경로 사용

// 사용자 입력 처리 함수 수정
function handleUserQuery(userQuery) {
    if (!userQuery) return;
    
    const chatHistory = document.getElementById("chatHistory");
    const userMessageDiv = document.createElement("div");
    userMessageDiv.className = "user-message";
    userMessageDiv.innerHTML = `You: ${userQuery}`;
    chatHistory.appendChild(userMessageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    // 백엔드 API 호출
    fetch(BACKEND_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userQuery }),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        // text_response는 채팅 인터페이스에 표시
        if (data.text_response) {
            const textMessageDiv = document.createElement("div");
            textMessageDiv.className = "assistant-message";
            textMessageDiv.innerHTML = `Assistant: ${data.text_response}`;
            chatHistory.appendChild(textMessageDiv);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
        
        // talk_initial은 아바타가 말하도록 함
        if (data.talk_initial && data.talk_initial.initial_response) {
            speak(data.talk_initial.initial_response);
            
            // 추가 응답이 있는 경우 계속 처리
            if (!data.talk_initial.completed && 
                data.talk_initial.thread_id && 
                data.talk_initial.agent_id) {
                continueTalk(
                    data.talk_initial.thread_id,
                    data.talk_initial.agent_id,
                    1
                );
            }
        }
    })
    .catch((error) => {
        console.error("Error:", error);
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = `Error: ${error.message}`;
        chatHistory.appendChild(errorDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    });
}

// 추가 대화 응답을 가져오는 함수
function continueTalk(threadId, agentId, partNumber) {
    fetch("/api/continue_talk", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            thread_id: threadId,
            agent_id: agentId,
            part_number: partNumber,
        }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.status === "success" && data.response) {
            speak(data.response.response);
            
            if (!data.response.completed) {
                // 다음 부분 가져오기
                setTimeout(() => {
                    continueTalk(threadId, agentId, partNumber + 1);
                }, 1000); // 1초 후 다음 부분 요청
            }
        }
    })
    .catch((error) => console.error("Error continuing talk:", error));
}
    })
    .catch((error) => console.error("Error continuing talk:", error));
}
