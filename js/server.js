// API endpoint for query processing
app.post("/api/query", async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res
                .status(400)
                .json({ status: "error", message: "Query is required" });
        }

        // 백엔드 API 호출
        const backendUrl = process.env.BACKEND_API_URL || "/api/query";
        try {
            const response = await fetch(backendUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            });
            
            if (!response.ok) {
                throw new Error(
                    `Backend API responded with status: ${response.status}`
                );
            }
            
            const responseData = await response.json();
            res.json(responseData);
        } catch (error) {
            console.error("Error calling backend API:", error);
            res
                .status(500)
                .json({ status: "error", message: "Failed to call backend API" });
        }
    } catch (error) {
        console.error("Error processing query:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});
